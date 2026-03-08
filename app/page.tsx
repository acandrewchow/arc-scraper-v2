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
    <>
      <h1 className="text-3xl font-bold mb-2">Subscribe for Stock Alerts</h1>
      <p className="text-neutral-400 mb-6">
        Get notified when Arc&apos;teryx products come back in stock!
      </p>

      {verificationStatus && (
        <div
          className={`mb-6 p-4 rounded-md text-sm ${
            verificationStatus.success
              ? 'bg-green-900/40 text-green-300 border border-green-700'
              : 'bg-red-900/40 text-red-300 border border-red-700'
          }`}
        >
          {verificationStatus.message}
        </div>
      )}

      <div className="bg-blue-900/30 border border-blue-800 rounded-md p-4 mb-8 text-sm text-blue-200">
        <strong>How it works:</strong> Subscribe with your email below. We'll automatically
        check stock every 15 minutes and email you when items come back in stock.
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <SubscriptionForm />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-neutral-400 text-center py-12">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
