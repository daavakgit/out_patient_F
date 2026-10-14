import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'teal' | 'accent';
  className?: string;
  dot?: boolean;
}

export default function Badge({ children, variant = 'default', className = '', dot = false }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#087F8C]/10 text-[#087F8C] border-[#087F8C]/20',
    teal: 'bg-[#087F8C]/10 text-[#087F8C] border-[#087F8C]/20',
    accent: 'bg-[#12A89D]/10 text-[#0e8077] border-[#12A89D]/25',
    success: 'bg-[#13866D]/10 text-[#13866D] border-[#13866D]/20',
    warning: 'bg-[#D9972F]/10 text-[#b57a1f] border-[#D9972F]/25',
    danger: 'bg-[#C94F50]/10 text-[#C94F50] border-[#C94F50]/20',
    info: 'bg-[#087F8C]/10 text-[#087F8C] border-[#087F8C]/20',
    neutral: 'bg-[#DFE8EA]/50 text-[#647780] border-[#DFE8EA]',
  };

  const dotColors = {
    default: 'bg-[#087F8C]',
    teal: 'bg-[#087F8C]',
    accent: 'bg-[#12A89D]',
    success: 'bg-[#13866D]',
    warning: 'bg-[#D9972F]',
    danger: 'bg-[#C94F50]',
    info: 'bg-[#087F8C]',
    neutral: 'bg-[#647780]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-colors ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
