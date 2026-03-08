/**
 * API Route: Subscribe to stock alerts
 * POST /api/subscribe
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  loadSubscriptions,
  saveSubscriptions,
  Subscription,
} from '@/lib/db';
import { checkRateLimit, recordRateLimitAttempt } from '@/lib/rateLimiter';
import { sendVerificationEmail } from '@/lib/email';
import { getSubscriptionKey, getSessionIdFromRequest } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productUrl } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (!productUrl || !productUrl.includes('arcteryx.com')) {
      return NextResponse.json(
        { error: 'Please enter a valid Arc\'teryx product URL' },
        { status: 400 }
      );
    }

    // Get session ID
    const sessionId = getSessionIdFromRequest(request);

    // Check rate limits
    const rateLimitCheck = await checkRateLimit(email, sessionId);
    if (!rateLimitCheck.allowed) {
      await recordRateLimitAttempt(email, sessionId, false);
      return NextResponse.json(
        { error: rateLimitCheck.errorMessage },
        { status: 429 }
      );
    }

    // Load subscriptions
    const subscriptions = await loadSubscriptions();
    const subKey = getSubscriptionKey(email, productUrl);

    if (subKey in subscriptions) {
      const sub = subscriptions[subKey];
      if (sub.verified) {
        return NextResponse.json(
          { error: 'You are already subscribed to this product!' },
          { status: 400 }
        );
      } else {
        // Resend verification
        await recordRateLimitAttempt(email, sessionId, true);
        const sent = await sendVerificationEmail(email, sub.token, productUrl);
        if (sent) {
          return NextResponse.json({
            message: 'Verification email resent! Please check your inbox.',
          });
        } else {
          return NextResponse.json(
            { error: 'Failed to send verification email. Please check your email configuration.' },
            { status: 500 }
          );
        }
      }
    } else {
      // Create new subscription
      await recordRateLimitAttempt(email, sessionId, true);
      const token = crypto.randomBytes(32).toString('base64url');

      subscriptions[subKey] = {
        email,
        product_url: productUrl,
        token,
        verified: false,
        created_at: new Date().toISOString(),
      };

      await saveSubscriptions(subscriptions);

      const sent = await sendVerificationEmail(email, token, productUrl);
      if (sent) {
        return NextResponse.json({
          message: 'Subscription created! Please check your email to verify your subscription.',
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to send verification email. Please check your email configuration.' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in subscribe route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
