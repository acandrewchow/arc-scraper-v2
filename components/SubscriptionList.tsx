'use client';

import { useState, useEffect, useCallback } from 'react';

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

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/subscriptions?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok) {
        setSubscriptions(data.subscriptions || []);
      } else {
        setError(data.error || 'Failed to load subscriptions');
      }
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (email && email.includes('@')) {
      fetchSubscriptions();
    }
  }, [email, fetchSubscriptions]);

  const handleUnsubscribe = async (subscriptionId: string, token: string) => {
    if (!confirm('Are you sure you want to unsubscribe?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/subscriptions?id=${subscriptionId}&token=${encodeURIComponent(token)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        fetchSubscriptions();
        alert('Unsubscribed successfully!');
      } else {
        alert(data.error || 'Failed to unsubscribe');
      }
    } catch (err) {
      alert('Failed to unsubscribe');
    }
  };

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
              onClick={() => handleUnsubscribe(sub.id, sub.token)}
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
