'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (email && email.includes('@')) {
      fetchSubscriptions();
    }
  }, [email]);

  const fetchSubscriptions = async () => {
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
  };

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
    return <div className="text-neutral-400 text-center py-4">Loading subscriptions...</div>;
  }

  if (error) {
    return <div className="text-red-400 py-4">{error}</div>;
  }

  if (subscriptions.length === 0) {
    return <div className="text-neutral-500 py-4">No subscriptions found for this email.</div>;
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          className="border border-neutral-700 rounded-md p-4 space-y-2"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-400 mb-1">Product:</p>
              <a
                href={sub.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all text-sm"
              >
                {sub.product_url}
              </a>
            </div>
            <div className="ml-4 text-right flex-shrink-0">
              <span
                className={`text-sm font-medium ${
                  sub.verified ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                {sub.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>

          {sub.verified && (
            <button
              onClick={() => handleUnsubscribe(sub.id, sub.token)}
              className="mt-2 px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
            >
              Unsubscribe
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
