'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';

interface FoldcraftHeroProps {
  initialLoginOpen?: boolean;
}

export default function FoldcraftHero({ initialLoginOpen = false }: FoldcraftHeroProps) {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(initialLoginOpen);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'therapist' | 'patient' | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay video reliably
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Listen for browser popstate or login query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('login') === 'true') {
        setIsLoginOpen(true);
      }

      const handlePopState = () => {
        if (window.location.pathname === '/login' || window.location.search.includes('login=true')) {
          setIsLoginOpen(true);
        } else {
          setIsLoginOpen(false);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const openLogin = () => {
    setIsLoginOpen(true);
    setError('');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.pushState({ login: true }, '', '/login');
    }
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
    setError('');
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      window.history.pushState({}, '', '/');
    }
  };

  const fillCredentials = (role: 'admin' | 'therapist' | 'patient', eMail: string, pass: string = 'password123') => {
    setSelectedRole(role);
    setEmail(eMail);
    setPassword(pass);
    setError('');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('rehabpulse_active_portal', data.user.role);
        if (data.token) {
          sessionStorage.setItem('rehabpulse_tab_token', data.token);
        }
      }

      const role = data.user.role;
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'THERAPIST') router.push('/therapist/dashboard');
      else if (role === 'PATIENT') router.push('/patient/dashboard');
      else router.push('/');

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#070b0e] font-geist select-none">
      {/* 1. The Fish Video Panel (Transitions to left 56% when login is open) */}
      <div
        className={`absolute top-0 bottom-0 left-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isLoginOpen
            ? 'w-full md:w-[56%] z-10'
            : 'w-full z-0'
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 h-full w-full object-cover pointer-events-none video-fish ${
            isLoginOpen ? 'login-active' : ''
          }`}
          style={{
            objectPosition: isLoginOpen ? undefined : '70% center',
          }}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4"
        />

        <style jsx>{`
          .video-fish {
            transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), object-position 0.75s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: center center;
          }
          .video-fish.login-active {
            object-position: 100% center;
            transform: scale(1.18) translateX(-8.5%) translateY(5.5%);
          }
          @media (max-width: 768px) {
            .video-fish.login-active {
              object-position: 90% center;
              transform: scale(1.10) translateX(-3%) translateY(3%);
            }
          }
        `}</style>

        {/* Floating Button in Bottom Left to Go Back to Landing Page */}
        <div
          className={`absolute bottom-6 left-6 z-20 transition-all duration-500 ${
            isLoginOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={closeLogin}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-white/40 text-xs font-medium text-white transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer"
            aria-label="Back to landing page"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <path d="M15 10H5M10 15l-5-5 5-5" />
            </svg>
            <span>Back to Landing Page</span>
          </button>
        </div>
      </div>

      {/* 2. Landing Page Hero Overlay (Fullscreen, fades out when login is open) */}
      <div
        className={`absolute inset-0 z-20 flex flex-col justify-between transition-all duration-700 ${
          isLoginOpen
            ? 'opacity-0 -translate-x-12 pointer-events-none'
            : 'opacity-100 translate-x-0 pointer-events-auto'
        }`}
      >
        {/* Navbar */}
        <nav className="relative z-30 flex items-center justify-between px-6 py-5 md:px-12 lg:px-16">
          <div className="flex items-center">
            <span className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-white uppercase">
              REHABILITATION &amp; RECOVERY
            </span>
          </div>

          <div>
            <button
              type="button"
              onClick={openLogin}
              className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black hover:scale-105 active:scale-95 transition-transform inline-flex items-center justify-center shadow-sm cursor-pointer"
            >
              Login
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex h-[calc(100vh-80px)] flex-col justify-between px-6 pb-10 pt-12 sm:pb-12 sm:pt-16 md:px-12 md:pb-16 md:pt-20 lg:px-16">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.12] tracking-tight text-white animate-[fadeSlideUp_0.8s_ease_0.3s_both]">
              Progress you can see. <br />
              Recovery that matters.
            </h1>
          </div>

          <div>
            <p className="mb-5 sm:mb-6 max-w-sm sm:max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-white/75 animate-[fadeSlideUp_0.8s_ease_0.6s_both]">
              Bringing patients, therapists, and recovery goals together through smarter rehabilitation tracking.
            </p>
            <button
              type="button"
              onClick={openLogin}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-medium text-black hover:scale-105 active:scale-95 transition-transform animate-[fadeSlideUp_0.8s_ease_0.8s_both] cursor-pointer shadow-lg"
            >
              Explore Work
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. The Login Card Panel (Elevates & slides in from right when login is open) */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-full md:w-[44%] z-30 bg-[#f8fafc] flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-8 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-text ${
          isLoginOpen
            ? 'translate-x-0 opacity-100 shadow-2xl pointer-events-auto'
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Close Button in Top-Right */}
        <button
          type="button"
          onClick={closeLogin}
          aria-label="Close login"
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X size={22} />
        </button>

        {/* Login Form Container */}
        <div className="w-full max-w-md mx-auto my-auto">
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172D35] mb-2">
              Welcome Back!
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              <b className="text-[#087F8C] font-semibold">Log in</b> to continue monitoring your signals.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium text-center animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                autoComplete="email"
                aria-label="Email address"
                placeholder="Eg. johndoe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-14 px-4 rounded-xl bg-white border border-[#e2e8f0] text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-all focus:border-[#087F8C] focus:ring-4 focus:ring-[#087F8C]/15 shadow-sm"
              />
            </div>

            <div>
              <input
                type="password"
                autoComplete="current-password"
                aria-label="Password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-14 px-4 rounded-xl bg-white border border-[#e2e8f0] text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-all focus:border-[#087F8C] focus:ring-4 focus:ring-[#087F8C]/15 shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full bg-gradient-to-r from-[#172D35] to-[#087F8C] text-white font-medium text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[#087F8C]/25 disabled:opacity-75 cursor-pointer"
            >
              <span>{loading ? 'Logging in...' : 'Login'}</span>
              <svg viewBox="0 0 22 22" className="w-4 h-4 flex-shrink-0" stroke="currentColor" fill="none">
                <path d="M3 11h15.4M11 3.3l7.7 7.7-7.7 7.7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>

          {/* Redesigned Demo Quick Access Section */}
          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Demo Quick Access
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin@rehabpulse.com')}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#172D35] border-[#172D35] text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full absolute top-2 right-2 bg-[#8b5cf6]" />
                <span className="text-xs sm:text-sm font-semibold">Admin</span>
                <span className={`text-[10px] mt-0.5 ${selectedRole === 'admin' ? 'text-white/70' : 'text-slate-500'}`}>
                  Full System
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('therapist', 'therapist@rehabpulse.com')}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'therapist'
                    ? 'bg-[#172D35] border-[#172D35] text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full absolute top-2 right-2 bg-[#087f8c]" />
                <span className="text-xs sm:text-sm font-semibold">Therapist</span>
                <span className={`text-[10px] mt-0.5 ${selectedRole === 'therapist' ? 'text-white/70' : 'text-slate-500'}`}>
                  Clinical Portal
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('patient', 'patient@rehabpulse.com')}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'patient'
                    ? 'bg-[#172D35] border-[#172D35] text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full absolute top-2 right-2 bg-[#10b981]" />
                <span className="text-xs sm:text-sm font-semibold">Patient</span>
                <span className={`text-[10px] mt-0.5 ${selectedRole === 'patient' ? 'text-white/70' : 'text-slate-500'}`}>
                  Recovery Track
                </span>
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              Select a role to populate credentials, then click <b className="text-slate-600">Login</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
