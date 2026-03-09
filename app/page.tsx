'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SubscriptionForm from '@/components/SubscriptionForm';

function HomeContent() {
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/verify?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationStatus({
          success: true,
          message: data.message,
        });
      } else {
        setVerificationStatus({
          success: false,
          message: data.error || 'Verification failed',
        });
      }
    } catch (error) {
      setVerificationStatus({
        success: false,
        message: 'Failed to verify email',
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Subscribe for Stock Alerts
        </h1>
        <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed max-w-lg">
          Get notified when Arc&apos;teryx products come back in stock.
          We check inventory every 15 minutes.
        </p>
      </div>

      {verificationStatus && (
        <div
          className={`mb-6 p-3.5 rounded-xl text-sm font-medium animate-fade-in ${
            verificationStatus.success
              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
              : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
          }`}
        >
          {verificationStatus.message}
        </div>
      )}

      <div className="card p-5 sm:p-6">
        <SubscriptionForm />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-neutral-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
