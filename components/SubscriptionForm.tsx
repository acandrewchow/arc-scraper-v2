'use client';

import { useState } from 'react';

interface SubscriptionFormProps {
  onSuccess?: () => void;
}

export default function SubscriptionForm({ onSuccess }: SubscriptionFormProps) {
  const [email, setEmail] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, productUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setEmail('');
        setProductUrl('');
        if (onSuccess) onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'An error occurred' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="productUrl" className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
          Product URL
        </label>
        <input
          type="url"
          id="productUrl"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://arcteryx.com/ca/en/shop/..."
          required
          className="input-field"
        />
        <p className="mt-2 text-xs text-neutral-500">
          Paste the full URL from the Arc&apos;teryx product page
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-sm font-medium animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
              : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Subscribing...
          </span>
        ) : (
          'Subscribe'
        )}
      </button>
    </form>
  );
}
