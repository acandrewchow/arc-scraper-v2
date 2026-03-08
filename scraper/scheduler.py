#!/usr/bin/env python3
"""
Arc'teryx Stock Monitor - Background Scheduler
Runs periodically to check stock for all verified subscriptions and send notifications
Can be run as a standalone script or as a background service
"""

import json
import os
import sys
import time
import hashlib
from datetime import datetime
from typing import Dict, List, Set, Tuple, Optional, Iterable
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scraper import check_stock_status

load_dotenv()

from db import load_subscriptions, save_subscriptions, load_state, save_state, save_stock_history


def send_stock_notification(email: str, product_name: str, product_url: str,
                           back_in_stock: List, out_of_stock: List):
    """Send stock notification email."""
    try:
        sender = os.getenv('SENDER_EMAIL')
        password = os.getenv('SENDER_PASSWORD')
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        
        if not all([sender, password]):
            print(f"Error: Email credentials not configured", file=sys.stderr)
            return False
        
        body = f"Arc'teryx {product_name} - Stock Status Update\n\n"
        
        if back_in_stock:
            body += "🎉 BACK IN STOCK:\n"
            for item in back_in_stock:
                if isinstance(item, tuple) and len(item) == 2:
                    color, size = item
                    if size:
                        body += f"  ✅ {color} - Size {size}\n"
                    else:
                        body += f"  ✅ {color}\n"
            body += "\n"
        
        if out_of_stock:
            body += "❌ NOW OUT OF STOCK:\n"
            for item in out_of_stock:
                if isinstance(item, tuple) and len(item) == 2:
                    color, size = item
                    if size:
                        body += f"  ❌ {color} - Size {size}\n"
                    else:
                        body += f"  ❌ {color}\n"
        
        body += f"\nProduct URL: {product_url}\n"
        body += f"Checked at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        
        if back_in_stock:
            body += "\nHurry and get yours before it sells out again!\n"
        
        msg = MIMEText(body, 'plain')
        msg['From'] = sender
        msg['To'] = email
        msg['Subject'] = f"🎉 Arc'teryx {product_name} Stock Alert!"
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender, password)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Notification sent to {email} for {product_name}")
        return True
    except Exception as e:
        print(f"❌ Error sending notification to {email}: {e}", file=sys.stderr)
        return False


def check_all_subscriptions():
    """Check stock for all verified subscriptions and send notifications."""
    subscriptions = load_subscriptions()
    
    active_subs = {
        key: sub for key, sub in subscriptions.items()
        if sub.get('verified', False) and sub.get('active', True)
    }
    
    if not active_subs:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] No active subscriptions to check")
        return
    
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking {len(active_subs)} active subscription(s)...")
    
    products = {}
    for sub_key, sub in active_subs.items():
        product_url = sub['product_url']
        if product_url not in products:
            products[product_url] = []
        products[product_url].append(sub)
    
    print(f"Found {len(products)} unique product(s) to check")
    
    for product_url, subs in products.items():
        print(f"\n📦 Checking: {product_url}")
        print(f"   Subscribers: {len(subs)}")
        
        try:
            stock_data, has_sizes, product_name = check_stock_status(product_url, headless=True)
            
            if stock_data is None:
                print(f"   ⚠️  Could not check stock status")
                continue
            
            product_name = product_name or subs[0].get('product_name', 'Product')
            previous_state = load_state(product_url)
            
            back_in_stock = []
            out_of_stock = []
            
            if has_sizes:
                previous = previous_state.get('color_size_stock', {})
                for color, sizes_stock in stock_data.items():
                    prev_sizes = previous.get(color, {})
                    for size, is_in_stock in sizes_stock.items():
                        was_in_stock = prev_sizes.get(size)
                        if was_in_stock is not None:
                            if not was_in_stock and is_in_stock:
                                back_in_stock.append((color, size))
                                try:
                                    save_stock_history(product_url, product_name, color, size)
                                except Exception as e:
                                    print(f"   ⚠️  Error saving stock history: {e}", file=sys.stderr)
                            elif was_in_stock and not is_in_stock:
                                out_of_stock.append((color, size))
                
                save_state(product_url, color_size_stock=stock_data, 
                          has_sizes=True, product_name=product_name)
            else:
                previous = previous_state.get('color_stock', {})
                for color, is_in_stock in stock_data.items():
                    was_in_stock = previous.get(color)
                    if was_in_stock is not None:
                        if not was_in_stock and is_in_stock:
                            back_in_stock.append((color, None))
                            try:
                                save_stock_history(product_url, product_name, color, None)
                            except Exception as e:
                                print(f"   ⚠️  Error saving stock history: {e}", file=sys.stderr)
                        elif was_in_stock and not is_in_stock:
                            out_of_stock.append((color, None))
                
                save_state(product_url, color_stock=stock_data, 
                          has_sizes=False, product_name=product_name)
            
            if back_in_stock or out_of_stock:
                print(f"   📧 Stock changes detected! Sending notifications...")
                for sub in subs:
                    send_stock_notification(
                        sub['email'],
                        product_name,
                        product_url,
                        back_in_stock,
                        out_of_stock
                    )
                    sub['last_notified'] = datetime.now().isoformat()
                    subscriptions[get_subscription_key(sub['email'], product_url)] = sub
                
                save_subscriptions(subscriptions)
                print(f"   ✅ Notifications sent to {len(subs)} subscriber(s)")
            else:
                print(f"   ℹ️  No stock changes detected")
            
        except Exception as e:
            print(f"   ❌ Error checking product: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            continue
    
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Check complete!")


def get_subscription_key(email: str, product_url: str) -> str:
    """Generate a unique key for a subscription."""
    return hashlib.md5(f"{email}:{product_url}".encode()).hexdigest()


def run_continuous(interval_minutes: int = 15):
    """Run checks continuously at specified interval."""
    print(f"🚀 Starting continuous stock monitor (checking every {interval_minutes} minutes)")
    print(f"Press Ctrl+C to stop\n")
    
    try:
        while True:
            check_all_subscriptions()
            print(f"\n⏳ Waiting {interval_minutes} minutes until next check...\n")
            time.sleep(interval_minutes * 60)
    except KeyboardInterrupt:
        print("\n\n👋 Stopping stock monitor. Goodbye!")


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Arc\'teryx Stock Monitor Scheduler')
    parser.add_argument('--once', action='store_true', 
                       help='Run once and exit (for cron jobs)')
    parser.add_argument('--interval', type=int, default=15,
                       help='Check interval in minutes (default: 15)')
    
    args = parser.parse_args()
    
    if args.once:
        check_all_subscriptions()
    else:
        run_continuous(args.interval)


if __name__ == "__main__":
    main()
