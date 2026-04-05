'use client';

import { useState, useEffect, useCallback } from 'react';
import UnsubscribeModal, { type UnsubscribeTarget } from '@/components/UnsubscribeModal';

interface Subscription {
  id: string;
  email: string;
  product_url: string;
  token: string;
  verified: boolean;
  created_at?: string;
  last_notified?: string;
}

interface SubscriptionListProps {
  email: string;
}

export default function SubscriptionList({ email }: SubscriptionListProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribeTarget, setUnsubscribeTarget] = useState<UnsubscribeTarget | null>(null);

  const fetchSubscriptions = useCallback(async (options?: { quiet?: boolean }) => {
    const quiet = options?.quiet ?? false;
    if (!quiet) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(`/api/subscriptions?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok) {
        setSubscriptions(data.subscriptions || []);
      } else if (!quiet) {
        setError(data.error || 'Failed to load subscriptions');
      }
    } catch (err) {
      if (!quiet) {
        setError('Failed to load subscriptions');
      }
    } finally {
      if (!quiet) {
        setLoading(false);
      }
    }
  }, [email]);

  useEffect(() => {
    if (email && email.includes('@')) {
      fetchSubscriptions();
    }
  }, [email, fetchSubscriptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-neutral-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
        {error}
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-neutral-500">No subscriptions found for this email.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <UnsubscribeModal
        open={unsubscribeTarget !== null}
        target={unsubscribeTarget}
        onClose={() => setUnsubscribeTarget(null)}
        onUnsubscribed={() => fetchSubscriptions({ quiet: true })}
      />

      <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-3">
        {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
      </p>

      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          className="rounded-xl bg-neutral-900/50 ring-1 ring-neutral-800/60 p-4 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <a
                href={sub.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 break-all transition-colors leading-relaxed"
              >
                {sub.product_url}
              </a>
            </div>
            <span
              className={`badge flex-shrink-0 ${
                sub.verified
                  ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
              }`}
            >
              {sub.verified ? 'Verified' : 'Pending'}
            </span>
          </div>

          {sub.verified && (
            <button
              type="button"
              onClick={() =>
                setUnsubscribeTarget({
                  id: sub.id,
                  token: sub.token,
                  product_url: sub.product_url,
                })
              }
              className="text-xs font-medium text-neutral-500 hover:text-red-400 transition-colors"
            >
              Unsubscribe
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
