'use client';

import { useState } from 'react';
import SubscriptionList from '@/components/SubscriptionList';

export default function SubscriptionsPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="animate-fade-in">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          My Subscriptions
        </h1>
        <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed max-w-lg">
          View and manage your active stock alerts.
        </p>
      </div>

      <div className="card p-5 sm:p-6">
        <label htmlFor="email" className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input-field"
        />

        {email && email.includes('@') && (
          <div className="mt-6 pt-6 border-t border-neutral-800/60">
            <SubscriptionList email={email} />
          </div>
        )}
      </div>
    </div>
  );
}
