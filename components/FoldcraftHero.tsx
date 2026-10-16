'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FoldcraftHero() {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black font-geist">
      {/* Video Background sits behind all content (no z-index or z-0) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover [object-position:70%_center] pointer-events-none"
        style={{ objectPosition: '70% center' }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4"
      />

      {/* Navbar (z-30) */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-5 md:px-12 lg:px-16">
        {/* Left side: Brand Logo / Title */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-white uppercase hover:text-white/90 transition-colors"
          >
            REHABILITATION &amp; RECOVERY
          </Link>
        </div>

        {/* Right side: Login button */}
        <div>
          <Link
            href="/login"
            className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black hover:scale-105 active:scale-95 transition-transform inline-flex items-center justify-center shadow-sm"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Content (z-10) */}
      <div className="relative z-10 flex h-[calc(100vh-80px)] flex-col justify-between px-6 pb-10 pt-12 sm:pb-12 sm:pt-16 md:px-12 md:pb-16 md:pt-20 lg:px-16">
        {/* Top Section (max-w-4xl) */}
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.12] tracking-tight text-white animate-[fadeSlideUp_0.8s_ease_0.3s_both]">
            Progress you can see. <br />
            Recovery that matters.
          </h1>
        </div>

        {/* Bottom Section */}
        <div>
          <p className="mb-5 sm:mb-6 max-w-sm sm:max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-white/75 animate-[fadeSlideUp_0.8s_ease_0.6s_both]">
            Bringing patients, therapists, and recovery goals together through smarter rehabilitation tracking.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-medium text-black hover:scale-105 active:scale-95 transition-transform animate-[fadeSlideUp_0.8s_ease_0.8s_both]"
          >
            Explore Work
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
