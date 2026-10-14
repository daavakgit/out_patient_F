'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  noBodyPadding?: boolean;
  customWidth?: string;
  maxHeight?: string;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
  subtitle,
  footer,
  noBodyPadding = false,
  customWidth,
  maxHeight = 'calc(100vh - 48px)',
  className = '',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${customWidth ? '' : maxWidth} my-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col ${className}`}
        style={{
          boxSizing: 'border-box',
          width: customWidth || undefined,
          maxWidth: customWidth ? '100%' : undefined,
          maxHeight: maxHeight || 'calc(100vh - 40px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Stays visible at top, shrink-0 */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {noBodyPadding ? (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden" style={{ boxSizing: 'border-box' }}>
            {children}
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0" style={{ boxSizing: 'border-box' }}>
            {children}
          </div>
        )}

        {/* Optional Footer */}
        {footer && (
          <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.03)] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

