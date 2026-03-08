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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
          Your Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="productUrl" className="block text-sm font-medium text-neutral-300 mb-2">
          Product URL
        </label>
        <input
          type="url"
          id="productUrl"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://arcteryx.com/ca/en/shop/..."
          required
          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-neutral-500">
          Enter the full URL of the Arc&apos;teryx product page
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-900/40 text-green-300 border border-green-700'
              : 'bg-red-900/40 text-red-300 border border-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
