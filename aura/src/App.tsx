import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Projects', href: '#projects' },
  { name: 'Studio', href: '#studio' },
  { name: 'Reach Us', href: '#reach-us' },
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        {/* Left side: Logo text followed by desktop nav links */}
        <div className="flex items-center gap-8 lg:gap-12">
          <a
            href="#home"
            className="text-lg font-semibold tracking-tight text-white sm:text-xl"
          >
            Foldcraft
          </a>
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Right side (desktop): Login button */}
        <div className="hidden md:block">
          <a
            href="/login"
            className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black hover:scale-105 transition-transform inline-flex items-center justify-center"
          >
            Login
          </a>
        </div>

        {/* Right side (mobile): hamburger toggle button (40x40, z-50) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="relative z-50 flex h-10 w-10 items-center justify-center text-white active:scale-90 transition-transform md:hidden"
        >
          <Menu
            size={24}
            className={`absolute h-6 w-6 transition-all duration-300 ${
              mobileMenuOpen
                ? 'rotate-90 opacity-0 scale-75'
                : 'rotate-0 opacity-100 scale-100'
            }`}
          />
          <X
            size={24}
            className={`absolute h-6 w-6 transition-all duration-300 ${
              mobileMenuOpen
                ? 'rotate-0 opacity-100 scale-100'
                : '-rotate-90 opacity-0 scale-75'
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu (z-20) */}
      <div
        className={`absolute inset-x-0 top-0 z-20 overflow-hidden bg-black/98 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen
            ? 'h-screen opacity-100 pointer-events-auto'
            : 'h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`flex h-full flex-col justify-center px-8 transition-all duration-500 delay-100 ${
            mobileMenuOpen
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl font-medium text-white/90 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div>
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 inline-flex rounded-full bg-white px-8 py-3.5 text-base font-medium text-black hover:scale-105 transition-transform items-center justify-center"
            >
              Login
            </a>
          </div>
        </div>
      </div>

      {/* Hero Content (z-10) */}
      <div className="relative z-10 flex h-[calc(100vh-80px)] flex-col justify-between px-6 pb-10 pt-12 sm:pb-12 sm:pt-16 md:px-12 md:pb-16 md:pt-20 lg:px-16">
        {/* Top Section (max-w-3xl) */}
        <div className="max-w-3xl">
          <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-white/90 animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
            Brand & Visual Storytelling
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight text-white animate-[fadeSlideUp_0.8s_ease_0.4s_both]">
            Shaping visual <br />
            narratives, <br />
            one pixel at a time.
          </h1>
        </div>

        {/* Bottom Section */}
        <div>
          <p className="mb-5 sm:mb-6 max-w-sm sm:max-w-lg text-sm sm:text-base md:text-lg leading-relaxed text-white/60 animate-[fadeSlideUp_0.8s_ease_0.7s_both]">
            Turning vision into reality through craft, motion, and an endless pursuit of beauty.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-medium text-black hover:scale-105 transition-transform animate-[fadeSlideUp_0.8s_ease_0.9s_both]"
          >
            Explore Work
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
