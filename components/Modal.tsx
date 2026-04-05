'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  descriptionId?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  descriptionId,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-md card p-5 sm:p-6 shadow-2xl shadow-black/40"
      >
        <h2 id="modal-title" className="text-lg font-semibold text-white tracking-tight">
          {title}
        </h2>
        <div className="mt-4 text-sm text-neutral-300 leading-relaxed">{children}</div>
        {footer ? (
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
