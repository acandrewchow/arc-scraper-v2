'use client';

import { useState } from 'react';
import SubscriptionList from '@/components/SubscriptionList';

export default function SubscriptionsPage() {
  const [email, setEmail] = useState('');

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">My Subscriptions</h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
            Enter your email to view subscriptions
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {email && email.includes('@') && <SubscriptionList email={email} />}
      </div>
    </>
  );
}
