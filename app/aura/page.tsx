'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Inbox,
  Star,
  Send,
  FileText,
  Archive,
  Trash2,
  Search,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip,
  ChevronRight,
  Menu,
  X,
  Check,
} from 'lucide-react';

/* =========================================================================
   SHARED PRIMITIVES
   ========================================================================= */

const AppleLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 384 512"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 256 256"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
  </svg>
);

interface AppleButtonProps {
  label?: string;
  full?: boolean;
  className?: string;
}

const AppleButton: React.FC<AppleButtonProps> = ({
  label = 'Download Aura',
  full = false,
  className = '',
}) => (
  <a
    href="#download"
    className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98] ${
      full ? 'w-full' : ''
    } ${className}`}
  >
    <AppleLogo className="w-4 h-4 flex-shrink-0" />
    <span>{label}</span>
    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-[1px]" />
  </a>
);

interface SectionEyebrowProps {
  label: string;
  tag?: string;
  className?: string;
}

const SectionEyebrow: React.FC<SectionEyebrowProps> = ({
  label,
  tag,
  className = '',
}) => (
  <div className={`inline-flex items-center gap-2 text-xs font-medium text-white/70 ${className}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-white" />
    <span>{label}</span>
    {tag && (
      <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-[11px]">
        {tag}
      </span>
    )}
  </div>
);

const gradientStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise)',
};

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  tag: string;
  avatarColor: string;
  summary: string;
  content: string[];
  attachment?: string;
}

const EMAILS: EmailItem[] = [
  {
    id: 'linear',
    sender: 'Linear',
    subject: 'Weekly product digest',
    preview: 'Your team shipped 23 issues this week...',
    time: '9:41 AM',
    unread: true,
    tag: 'Work',
    avatarColor: 'from-[#00d2ff] to-[#0B2551]',
    summary:
      'Your team closed 23 issues, merged 14 PRs, and shipped 2 features. Top contributor: Marcus. No action needed.',
    content: [
      'Hi team,',
      'Here is your weekly digest of everything happening across your projects. This was a strong week with significant progress on the Q3 roadmap.',
      'Twenty-three issues were closed, fourteen pull requests were merged, and two customer-facing features went out. The velocity trend continues to climb.',
      'Let me know if you would like a deeper breakdown by project or contributor.',
      '— The Linear team',
    ],
    attachment: 'digest-may-6.pdf',
  },
  {
    id: 'sophia',
    sender: 'Sophia Chen',
    subject: 'Re: Q3 roadmap review',
    preview: 'Thanks for sending the deck over. I had a few thoughts...',
    time: '8:12 AM',
    unread: true,
    tag: 'Work',
    avatarColor: 'from-[#9333ea] to-[#3b82f6]',
    summary:
      'Sophia reviewed the Q3 roadmap slides. She requests tightening the AI triage rollout timeline and scheduling a 15-min sync.',
    content: [
      'Hey Marcus,',
      'Thanks for sending the deck over. I had a few thoughts on the infrastructure milestones.',
      'Overall the scope looks tight. Can we align on whether the triage agent runs client-side or through the cloud gateway?',
      'Let’s sync for 15 minutes before tomorrow’s leadership meeting.',
      '— Sophia',
    ],
  },
  {
    id: 'figma',
    sender: 'Figma',
    subject: 'Marcus commented on your file',
    preview: 'Love the new direction on the landing hero.',
    time: 'Yesterday',
    unread: false,
    tag: 'Personal',
    avatarColor: 'from-[#ec4899] to-[#8b5cf6]',
    summary:
      'Design feedback on Aura landing page: Approved dark glassy styling and 3D mac mockup.',
    content: [
      'Marcus left 3 comments on Aura Landing V4:',
      '"Love the new direction on the landing hero. The liquid-glass border mask gives it a very tactile depth."',
      'Check out the updated frames when you get a chance.',
    ],
  },
  {
    id: 'stripe',
    sender: 'Stripe',
    subject: 'Payout of $12,480.00 sent',
    preview: 'Your payout is on its way to your bank...',
    time: 'Yesterday',
    unread: false,
    tag: 'Finance',
    avatarColor: 'from-[#6366f1] to-[#06b6d4]',
    summary:
      'Automatic scheduled payout of $12,480.00 deposited into Silicon Valley Bank checking ending in •••• 4209.',
    content: [
      'Your payout of $12,480.00 is on its way to your bank account.',
      'Funds are typically available within 1-2 business days depending on your institution.',
    ],
    attachment: 'payout-statement-may.pdf',
  },
  {
    id: 'vercel',
    sender: 'Vercel',
    subject: 'Deployment ready for aura-web',
    preview: 'Preview is live at aura-web-g3f.vercel.app',
    time: 'Mon',
    unread: false,
    tag: 'Work',
    avatarColor: 'from-[#ffffff] to-[#333333]',
    summary:
      'Production preview built in 14.2s. Edge network caches warmed across all 18 global edge points.',
    content: [
      'Preview deployment is ready:',
      'https://aura-web-g3f.vercel.app',
      'Commit 8f192b0: Implement liquid-glass card treatment and motion transitions.',
    ],
  },
  {
    id: 'github',
    sender: 'GitHub',
    subject: '[aura/core] PR #482 approved',
    preview: 'david-lim approved your pull request.',
    time: 'Mon',
    unread: false,
    tag: 'Work',
    avatarColor: 'from-[#22c55e] to-[#0f172a]',
    summary:
      'PR #482 passed 84 CI checks and has been approved by David Lim. Auto-merge scheduled upon review window closure.',
    content: [
      'david-lim approved your pull request #482: feat(ai): stream structured triage summaries.',
      'All automated status checks passed.',
    ],
  },
];

export default function AuraPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem>(EMAILS[0]);
  const [activeFolder, setActiveFolder] = useState('Inbox');
  const [yearlyPricing, setYearlyPricing] = useState(false);

  const navLinks = ['Solutions', 'Pricing', 'Blog', 'Documentation', 'Careers'];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white selection:bg-[#3D81E3]/30">
      {/* GLOBAL BACKGROUND VIDEO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
      </div>

      {/* FIXED VERTICAL GUIDE LINES */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

      {/* ROOT SVG NOISE FILTER */}
      <svg className="fixed w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="c3-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"
            />
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* SECTION 1 — NAVBAR */}
      <header className="relative z-20 pt-6">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-6xl mx-auto px-6 flex items-center justify-between"
        >
          <a href="#" className="text-white hover:opacity-80 transition-opacity">
            <LogoMark className="w-8 h-8" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, idx) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
                className="text-white/70 text-sm font-medium hover:text-white transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </div>

          <div className="hidden md:block">
            <AppleButton />
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mx-6 mt-4 p-5 liquid-glass rounded-2xl flex flex-col gap-4 border border-white/10"
            >
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/80 text-sm font-medium py-1 hover:text-white"
                >
                  {link}
                </a>
              ))}
              <div className="pt-2">
                <AppleButton full />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SECTION 2 — HERO */}
      <section className="relative z-10 pt-16 md:pt-28 pb-20 text-center flex flex-col items-center max-w-6xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[0.9]"
        >
          <span className="block text-white">Your email.</span>
          <span className="block animate-shiny mt-2" style={gradientStyle}>
            Revitalized
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mt-8 text-white/60 max-w-md text-base leading-[1.5]"
        >
          Aura is the premier inbox platform for the current era. It leverages powerful AI to organize, prioritize, and refine your messages into total clarity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="mt-8 flex flex-col items-center gap-3"
          id="download"
        >
          <AppleButton />
          <span className="text-xs text-white/40">
            Download for Intel / Apple Silicon
          </span>
        </motion.div>
      </section>

      {/* SECTION 3 — MACOS MENU BAR STRIP */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
        className="w-full h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10 relative z-10"
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-4 sm:gap-6">
            <AppleLogo className="w-3.5 h-3.5 text-white" />
            <span className="font-bold text-white">Aura</span>
            <div className="flex items-center gap-4">
              {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map((item, idx) => (
                <span
                  key={item}
                  className={`hover:text-white cursor-default transition-colors ${
                    idx > 3 ? 'hidden md:inline' : idx > 2 ? 'hidden sm:inline' : 'inline'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-white/60">
            <Search className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
            <span className="tracking-tight">Wed May 6 1:09 PM</span>
          </div>
        </div>
      </motion.div>

      {/* SECTION 4 — INBOX MOCKUP */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24" id="solutions">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl shadow-black/80"
        >
          {/* Title Bar */}
          <div className="h-10 border-b border-white/10 px-4 flex items-center justify-between bg-black/50">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e] inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#28c840] inline-block shadow-sm" />
            </div>
            <span className="text-xs text-white/50 font-medium">Aura — Inbox</span>
            <div className="w-12" />
          </div>

          {/* Body */}
          <div className="grid grid-cols-12 min-h-[520px] max-h-[580px]">
            {/* Sidebar */}
            <div className="col-span-12 sm:col-span-3 border-b sm:border-b-0 sm:border-r border-white/10 bg-black/30 p-4 flex flex-col justify-between">
              <div>
                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2 hover:bg-white/90 transition-all shadow-sm active:scale-[0.98]">
                  <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>Compose with Aura</span>
                </button>

                <div className="mt-5 space-y-1">
                  {[
                    { label: 'Inbox', icon: Inbox, count: 12 },
                    { label: 'Starred', icon: Star, count: 3 },
                    { label: 'Sent', icon: Send },
                    { label: 'Drafts', icon: FileText, count: 2 },
                    { label: 'Archive', icon: Archive },
                    { label: 'Trash', icon: Trash2 },
                  ].map((folder) => {
                    const Icon = folder.icon;
                    const isActive = activeFolder === folder.label;
                    return (
                      <button
                        key={folder.label}
                        onClick={() => setActiveFolder(folder.label)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{folder.label}</span>
                        </div>
                        {folder.count && (
                          <span
                            className={`text-[11px] px-1.5 py-0.2 rounded ${
                              isActive ? 'bg-white/20 text-white' : 'text-white/40'
                            }`}
                          >
                            {folder.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 block px-3 mb-2">
                    Labels
                  </span>
                  <div className="space-y-1">
                    {[
                      { name: 'Work', color: '#00d2ff' },
                      { name: 'Personal', color: '#A4F4FD' },
                      { name: 'Travel', color: '#f59e0b' },
                      { name: 'Finance', color: '#10b981' },
                    ].map((label) => (
                      <div
                        key={label.name}
                        className="flex items-center gap-2.5 px-3 py-1 text-xs text-white/60 hover:text-white cursor-pointer transition-colors"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span>{label.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Synced
                </span>
                <span>v1.4.2</span>
              </div>
            </div>

            {/* Message List */}
            <div className="col-span-12 sm:col-span-4 border-b sm:border-b-0 sm:border-r border-white/10 flex flex-col bg-[#0b0c0e]/80">
              <div className="p-3 border-b border-white/10 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search mail"
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-white/30 w-full"
                />
              </div>

              <div className="overflow-y-auto divide-y divide-white/5 flex-1">
                {EMAILS.map((email) => {
                  const isSelected = selectedEmail.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-white/10' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span
                          className={`font-semibold truncate ${
                            isSelected ? 'text-white' : 'text-white/90'
                          }`}
                        >
                          {email.sender}
                        </span>
                        <span className="text-[10px] text-white/40 flex-shrink-0 ml-2">
                          {email.time}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-white/80 truncate mb-1 flex items-center gap-1.5">
                        {email.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] flex-shrink-0" />
                        )}
                        <span className="truncate">{email.subject}</span>
                      </div>
                      <p className="text-[11px] text-white/45 truncate leading-relaxed">
                        {email.preview}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reader */}
            <div className="col-span-12 sm:col-span-5 flex flex-col bg-[#0e1014] overflow-y-auto">
              <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between text-white/60">
                <div className="flex items-center gap-1">
                  {[Reply, Forward, Archive, Trash2].map((Icon, idx) => (
                    <button
                      key={idx}
                      className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center transition-colors text-white/70 hover:text-white"
                      aria-label="Action"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                <button className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center transition-colors text-white/70 hover:text-white">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 border-b border-white/10">
                <h3 className="text-sm md:text-base font-semibold text-white tracking-tight">
                  {selectedEmail.subject}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${selectedEmail.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0`}
                    >
                      {selectedEmail.sender[0]}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">
                        {selectedEmail.sender}
                      </div>
                      <div className="text-[10px] text-white/40">
                        to me · {selectedEmail.time}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/70">
                    {selectedEmail.tag}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs leading-relaxed text-white/75 flex-1">
                <div className="liquid-glass rounded-xl p-3.5 border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#A4F4FD] mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#A4F4FD]" />
                    <span>Summary by Aura</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/80">
                    {selectedEmail.summary}
                  </p>
                </div>

                <div className="space-y-3 pt-1 text-white/70 text-xs">
                  {selectedEmail.content.map((p, idx) => (
                    <p
                      key={idx}
                      className={
                        idx === selectedEmail.content.length - 1
                          ? 'text-white/50 pt-1'
                          : ''
                      }
                    >
                      {p}
                    </p>
                  ))}
                </div>

                {selectedEmail.attachment && (
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] text-white/80 hover:bg-white/10 cursor-pointer transition-colors">
                      <Paperclip className="w-3 h-3 text-[#00d2ff]" />
                      <span>{selectedEmail.attachment}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 5 — FEATURE TRIAGE */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <SectionEyebrow label="Triage" tag="AI-native" />
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
              Clear your inbox <br />
              in a single pass.
            </h2>
            <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
              Aura reads every message, understands intent, and routes the noise away from the signal. Focus on what moves your day forward — the rest handles itself.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                'Auto-categorize',
                'Snooze for later',
                'Silent newsletters',
                'One-tap unsubscribe',
              ].map((chip) => (
                <span
                  key={chip}
                  className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="liquid-glass rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-medium text-white/80">
                Today · 42 messages triaged
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Agent
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="liquid-glass rounded-lg p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#ffffff] mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Priority
                  </span>
                  <span className="text-[11px] font-mono text-white/70">4</span>
                </div>
                <div className="space-y-1 text-xs text-white/70">
                  <div className="py-0.5">• Sophia Chen — Q3 review</div>
                  <div className="py-0.5">• David Lim — contract signoff</div>
                </div>
              </div>

              <div className="liquid-glass rounded-lg p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#e5e5e5] mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
                    Follow-up
                  </span>
                  <span className="text-[11px] font-mono text-white/70">7</span>
                </div>
                <div className="space-y-1 text-xs text-white/70">
                  <div className="py-0.5">• Marcus — design review</div>
                  <div className="py-0.5">• Figma — comment thread</div>
                </div>
              </div>

              <div className="liquid-glass rounded-lg p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#a3a3a3] mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a3a3a3]" />
                    Updates
                  </span>
                  <span className="text-[11px] font-mono text-white/70">18</span>
                </div>
                <div className="space-y-1 text-xs text-white/70">
                  <div className="py-0.5">• Vercel — deploy ready</div>
                  <div className="py-0.5">• GitHub — PR #482 merged</div>
                </div>
              </div>

              <div className="liquid-glass rounded-lg p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#737373] mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#525252]" />
                    Archived
                  </span>
                  <span className="text-[11px] font-mono text-white/50">13</span>
                </div>
                <div className="text-xs text-white/50 py-0.5">
                  • Stripe payout · Newsletter · Receipts
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6 — LOGO CLOUD */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
        <p className="text-center text-xs uppercase tracking-widest text-white/40 font-medium">
          Trusted by the world's most thoughtful teams
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
          {['Linear', 'Vercel', 'Figma', 'Stripe', 'Ramp', 'Notion', 'Loom', 'Arc'].map(
            (brand, idx) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="flex items-center justify-center p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-default"
              >
                <span className="text-sm font-semibold tracking-tight text-white/50 hover:text-white transition-colors">
                  {brand}
                </span>
              </motion.div>
            )
          )}
        </div>
      </section>

      {/* SECTION 7 — TESTIMONIALS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10">
        <div className="grid md:grid-cols-3 gap-6">
          <motion.figure
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="liquid-glass rounded-2xl p-6 flex flex-col justify-between"
          >
            <blockquote className="text-sm text-white/80 leading-[1.6]">
              “Aura gave our leadership team four hours of their week back. It reads like email from the future.”
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10">
              <div className="text-sm font-semibold text-white">Parker Wilf</div>
              <div className="text-xs text-white/50">Group Product Manager</div>
              <div className="mt-1 text-xs text-white font-semibold tracking-wide uppercase">
                MERCURY
              </div>
            </figcaption>
          </motion.figure>

          <motion.figure
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="liquid-glass rounded-2xl p-6 flex flex-col justify-between"
          >
            <blockquote className="text-sm text-white/80 leading-[1.6]">
              “The command palette alone has changed how I process messages. I can't imagine going back to a traditional client.”
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10">
              <div className="text-sm font-semibold text-white">Andrew von Rosenbach</div>
              <div className="text-xs text-white/50">Senior Engineering Program Manager</div>
              <div className="mt-1 text-xs text-white font-semibold tracking-wide uppercase">
                COHERE
              </div>
            </figcaption>
          </motion.figure>

          <motion.figure
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="liquid-glass rounded-2xl p-6 flex flex-col justify-between"
          >
            <blockquote className="text-sm text-white/80 leading-[1.6]">
              “Triage that actually understands context. Our team stopped dreading Monday morning inboxes.”
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10">
              <div className="text-sm font-semibold text-white">Mathies Christensen</div>
              <div className="text-xs text-white/50">Engineering Manager</div>
              <div className="mt-1 text-xs text-white font-semibold tracking-wide uppercase">
                LUNAR
              </div>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* SECTION 8 — PRICING */}
      <section className="c3-pricing-section" id="pricing">
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            <filter id="c3-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.5"
                numOctaves="2"
                stitchTiles="stitch"
              />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.075" />
              </feComponentTransfer>
              <feComposite in2="SourceGraphic" operator="in" result="noise" />
              <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
            </filter>
          </defs>
        </svg>

        <div className="c3-watermark-container">
          <div className="c3-watermark-main">
            <span className="c3-watermark-line-1">Your email.</span>
            <span className="c3-watermark-line-2">Revitalized</span>
          </div>
        </div>

        <div className="c3-grid">
          {/* Free */}
          <div className="c3-card">
            <div className="c3-tier-small">Free</div>
            <div className="c3-tier-large">Free</div>
            <div className="c3-desc">
              For creators taking their first steps with Forma.
            </div>
            <ul className="c3-list">
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Up to 3 projects in the cloud</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Image export up to 1080p</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Basic editing tools</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Free templates and icons</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Access via web and mobile app</span>
              </li>
            </ul>
            <button className="c3-btn">Choose Plan</button>
          </div>

          {/* Standard */}
          <div className="c3-card">
            <div className="c3-tier-small">Standard</div>
            <div className="c3-tier-large">
              {yearlyPricing ? '$99,99/y' : '$9,99/m'}
            </div>
            <div className="c3-desc">
              For freelancers and small teams who need more freedom and flexibility.
            </div>
            <ul className="c3-list">
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Up to 50 projects in the cloud</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Export up to 4K</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Advanced editing toolkit</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Team collaboration (up to 5 members)</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Access to premium template library</span>
              </li>
            </ul>
            <button className="c3-btn">Choose Plan</button>
          </div>

          {/* Pro */}
          <div className="c3-card c3-card-pro">
            <div className="c3-tier-small">Pro</div>
            <div className="c3-tier-large">
              {yearlyPricing ? '$199,99/y' : '$19,99/m'}
            </div>
            <div className="c3-desc">
              For studios, agencies, and professional creators working with brands.
            </div>
            <ul className="c3-list">
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Unlimited projects</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Export up to 8K + animations</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>AI-powered content generation tools</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Unlimited team members</span>
              </li>
              <li>
                <span className="c3-check">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span>Brand customization</span>
              </li>
            </ul>
            <button className="c3-btn">Choose Plan</button>
          </div>
        </div>

        <div className="c3-toggle-wrap">
          <span className="text-xs text-white/70 font-medium">Yearly</span>
          <button
            type="button"
            className={`c3-toggle ${yearlyPricing ? 'active' : ''}`}
            onClick={() => setYearlyPricing(!yearlyPricing)}
            aria-label="Toggle yearly billing"
          >
            <div className="c3-toggle-knob" />
          </button>
        </div>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center border border-white/10"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)',
              opacity: 0.3,
            }}
          />

          <h2 className="relative z-10 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02] text-white">
            Close the tabs. <br />
            Open your day.
          </h2>

          <p className="relative z-10 mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
            Join thousands of builders, founders, and operators who treat email like a tool — not an obligation.
          </p>

          <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <AppleButton label="Download Aura" />
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-colors"
            >
              <span>Talk to sales</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
        <div className="flex items-center gap-3">
          <LogoMark className="w-5 h-5 text-white/70" />
          <span>© 2026 Aura Technologies Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
          <a href="#" className="hover:text-white transition-colors">Status</a>
        </div>
      </footer>
    </div>
  );
}
