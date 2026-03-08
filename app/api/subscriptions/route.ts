/**
 * API Route: Get or delete subscriptions
 * GET /api/subscriptions?email=...
 * DELETE /api/subscriptions?id=...&token=...
 */
import { NextRequest, NextResponse } from 'next/server';
import { loadSubscriptions, deleteSubscription } from '@/lib/db';
import { getSubscriptionKey } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const subscriptions = await loadSubscriptions();
    const userSubs = Object.entries(subscriptions)
      .filter(([_, sub]) => sub.email === email)
      .map(([subId, sub]) => ({
        id: subId,
        email: sub.email,
        product_url: sub.product_url,
        token: sub.token,
        verified: sub.verified,
        created_at: sub.created_at,
        last_notified: sub.last_notified,
      }));

    return NextResponse.json({ subscriptions: userSubs });
  } catch (error) {
    console.error('Error in subscriptions GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('id');
    const token = searchParams.get('token');

    if (!subscriptionId || !token) {
      return NextResponse.json(
        { error: 'Missing subscription ID or token' },
        { status: 400 }
      );
    }

    // Verify token matches subscription
    const subscriptions = await loadSubscriptions();
    const sub = subscriptions[subscriptionId];

    if (!sub) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (sub.token !== token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      );
    }

    await deleteSubscription(subscriptionId);

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully!',
    });
  } catch (error) {
    console.error('Error in subscriptions DELETE route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
