/**
 * API Route: Verify email subscription
 * GET /api/verify?token=...
 */
import { NextRequest, NextResponse } from 'next/server';
import { loadSubscriptions, saveSubscriptions } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      );
    }

    const subscriptions = await loadSubscriptions();
    let verified = false;

    // Find matching subscription
    for (const [subKey, sub] of Object.entries(subscriptions)) {
      if (sub.token === token) {
        sub.verified = true;
        subscriptions[subKey] = sub;
        await saveSubscriptions(subscriptions);
        verified = true;
        break;
      }
    }

    if (verified) {
      return NextResponse.json({
        success: true,
        message: 'Email verified! You will now receive stock alerts.',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification token.',
          tip: 'Make sure you\'re using the exact link from your verification email.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in verify route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
