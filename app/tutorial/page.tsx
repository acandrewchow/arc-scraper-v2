'use client';

const steps = [
  {
    title: 'Enter Your Email',
    description: "Provide the email address where you'd like to receive stock notifications.",
    tip: 'Use an email you check regularly so you don\'t miss alerts.',
    demo: 'email',
  },
  {
    title: 'Paste a Product URL',
    description: "Copy the full URL from the Arc'teryx product page you want to monitor.",
    tip: "Make sure you're on the product page, not a category or search results page.",
    demo: 'url',
  },
  {
    title: 'Hit Subscribe',
    description: "Click Subscribe and we'll create your alert. You'll receive a verification email.",
    tip: 'The system checks if you\'re already subscribed to avoid duplicates.',
    demo: 'button',
  },
  {
    title: 'Verify Your Email',
    description: 'Check your inbox and click the verification link to activate your subscription.',
    tip: "Check spam if you don't see the email. The link expires after some time.",
    demo: null,
  },
  {
    title: 'Get Notified',
    description: "Once verified, you'll automatically receive an email when the item is back in stock.",
    tip: null,
    demo: null,
  },
];

function StepDemo({ type }: { type: string | null }) {
  if (!type) return null;

  return (
    <div className="mt-3 bg-neutral-900 rounded-lg p-3 sm:p-4 ring-1 ring-neutral-800/60">
      {type === 'email' && (
        <input
          type="email"
          value="your.email@example.com"
          disabled
          className="input-field opacity-60 cursor-default"
        />
      )}
      {type === 'url' && (
        <input
          type="url"
          value="arcteryx.com/ca/en/shop/bird-head-toque"
          disabled
          className="input-field opacity-60 cursor-default text-sm truncate"
        />
      )}
      {type === 'button' && (
        <button disabled className="btn-primary opacity-50 cursor-default">
          Subscribe
        </button>
      )}
    </div>
  );
}

export default function TutorialPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          How It Works
        </h1>
        <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed max-w-lg">
          Get set up in under a minute. Here&apos;s how to start receiving stock alerts.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="card p-4 sm:p-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600/15 text-blue-400 flex items-center justify-center text-sm font-semibold ring-1 ring-blue-500/20">
                  {i + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
                <StepDemo type={step.demo} />
                {step.tip && (
                  <p className="mt-3 text-xs text-neutral-500">
                    <span className="text-neutral-400 font-medium">Tip:</span> {step.tip}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
