'use client';

export default function TutorialPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">How to Subscribe</h1>
      <p className="text-neutral-400 mb-6">
        Learn how to subscribe to Arc&apos;teryx stock alerts in just a few simple steps.
      </p>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Step 1: Enter Your Email Address</h3>
          <p className="text-neutral-400 mb-3">
            Start by entering your email address where you&apos;d like to receive stock notifications.
          </p>
          <div className="bg-neutral-800 p-4 rounded-md">
            <input
              type="email"
              value="your.email@example.com"
              disabled
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-300"
            />
            <p className="text-green-400 text-sm mt-2">Email entered</p>
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            <strong>Tip:</strong> Use an email address you check regularly so you don&apos;t miss
            stock alerts.
          </p>
        </div>

        <div className="border-t border-neutral-800 pt-8">
          <h3 className="text-lg font-semibold text-white mb-2">Step 2: Enter Product URL</h3>
          <p className="text-neutral-400 mb-3">
            Copy and paste the full URL of the Arc&apos;teryx product page you want to monitor.
          </p>
          <div className="bg-neutral-800 p-4 rounded-md">
            <input
              type="url"
              value="https://arcteryx.com/ca/en/shop/bird-head-toque"
              disabled
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-300"
            />
            <p className="text-green-400 text-sm mt-2">URL entered</p>
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            <strong>Tip:</strong> Make sure you&apos;re on the product page (not the category page)
            and copy the full URL from your browser&apos;s address bar.
          </p>
        </div>

        <div className="border-t border-neutral-800 pt-8">
          <h3 className="text-lg font-semibold text-white mb-2">Step 3: Click the Subscribe Button</h3>
          <p className="text-neutral-400 mb-3">
            Once you&apos;ve entered both your email and product URL, click the Subscribe button.
          </p>
          <div className="bg-neutral-800 p-4 rounded-md">
            <button
              disabled
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md opacity-50 cursor-not-allowed"
            >
              Subscribe
            </button>
            <p className="text-green-400 text-sm mt-2">Subscription request sent!</p>
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            <strong>What happens:</strong> The system will check if you&apos;re already subscribed
            and verify your email address.
          </p>
        </div>

        <div className="border-t border-neutral-800 pt-8">
          <h3 className="text-lg font-semibold text-white mb-2">Step 4: Check Your Email for Verification</h3>
          <p className="text-neutral-400 mb-3">
            After clicking Subscribe, you&apos;ll receive a verification email. Click the link in the
            email to activate your subscription.
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            <strong>Tip:</strong> The verification link expires after some time. If it doesn&apos;t
            work, you can request a new verification email.
          </p>
        </div>

        <div className="border-t border-neutral-800 pt-8">
          <h3 className="text-lg font-semibold text-white mb-2">Step 5: Click the Verification Link</h3>
          <p className="text-neutral-400">
            Click the verification link in your email to activate your subscription. Once verified,
            you&apos;ll start receiving stock alerts.
          </p>
        </div>
      </div>
    </>
  );
}
