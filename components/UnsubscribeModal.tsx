'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';

export type UnsubscribeTarget = {
  id: string;
  token: string;
  product_url: string;
};

type UnsubscribeModalProps = {
  open: boolean;
  target: UnsubscribeTarget | null;
  onClose: () => void;
  onUnsubscribed: () => void;
};

type Phase = 'confirm' | 'loading' | 'result';

export default function UnsubscribeModal({
  open,
  target,
  onClose,
  onUnsubscribed,
}: UnsubscribeModalProps) {
  const [phase, setPhase] = useState<Phase>('confirm');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('confirm');
      setResult(null);
    }
  }, [open, target?.id]);

  const runUnsubscribe = async () => {
    if (!target) return;
    setPhase('loading');
    try {
      const response = await fetch(
        `/api/subscriptions?id=${target.id}&token=${encodeURIComponent(target.token)}`,
        { method: 'DELETE' }
      );
      const data = await response.json();

      if (response.ok) {
        setResult({ ok: true, message: data.message || 'You will no longer receive alerts for this product.' });
        setPhase('result');
      } else {
        setResult({ ok: false, message: data.error || 'Failed to unsubscribe.' });
        setPhase('result');
      }
    } catch {
      setResult({ ok: false, message: 'Something went wrong. Please try again.' });
      setPhase('result');
    }
  };

  if (!target) return null;

  const confirmFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-300 bg-neutral-800/80 hover:bg-neutral-800 ring-1 ring-neutral-700/80 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={runUnsubscribe}
        className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors"
      >
        Unsubscribe
      </button>
    </>
  );

  const handleDone = () => {
    if (result?.ok) {
      onUnsubscribed();
    }
    onClose();
  };

  const resultFooter = (
    <button
      type="button"
      onClick={handleDone}
      className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
    >
      Done
    </button>
  );

  const title =
    phase === 'result'
      ? result?.ok
        ? 'Unsubscribed'
        : 'Could not unsubscribe'
      : 'Unsubscribe from alerts';

  const body =
    phase === 'loading' ? (
      <div className="flex items-center gap-3 py-2">
        <div className="w-5 h-5 border-2 border-neutral-600 border-t-blue-500 rounded-full animate-spin shrink-0" />
        <span className="text-neutral-400">Removing this subscription…</span>
      </div>
    ) : phase === 'result' && result ? (
      <p id="unsubscribe-modal-desc" className={result.ok ? 'text-neutral-300' : 'text-red-400'}>
        {result.message}
      </p>
    ) : (
      <>
        <p id="unsubscribe-modal-desc" className="text-neutral-400 mb-3">
          You will stop receiving stock alerts for:
        </p>
        <p className="text-neutral-100 font-medium break-all text-[13px] leading-snug">{target.product_url}</p>
      </>
    );

  return (
    <Modal
      open={open}
      onClose={phase === 'loading' ? () => {} : onClose}
      title={title}
      descriptionId={phase === 'confirm' || phase === 'result' ? 'unsubscribe-modal-desc' : undefined}
      footer={
        phase === 'loading' ? undefined : phase === 'result' ? resultFooter : confirmFooter
      }
    >
      {body}
    </Modal>
  );
}
