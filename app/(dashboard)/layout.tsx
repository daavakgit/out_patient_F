'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  useEffect(() => {
    const portalRole = pathname.startsWith('/therapist')
      ? 'THERAPIST'
      : pathname.startsWith('/patient')
      ? 'PATIENT'
      : pathname.startsWith('/admin')
      ? 'ADMIN'
      : '';

    if (!portalRole || typeof window === 'undefined') return;

    try {
      sessionStorage.setItem('rehabpulse_active_portal', portalRole);
    } catch (e) {
      // sessionStorage might be restricted
    }

    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      try {
        const urlStr =
          typeof input === 'string'
            ? input
            : input instanceof URL
            ? input.toString()
            : (input as Request).url || '';

        if (urlStr.startsWith('/api') || urlStr.includes('/api/')) {
          const headers = new Headers(
            init?.headers ||
              (typeof input === 'object' && 'headers' in input ? (input as any).headers : {})
          );
          if (!headers.has('x-portal-role')) {
            headers.set('x-portal-role', portalRole);
          }
          return originalFetch(input, { ...init, headers });
        }
      } catch (err) {
        // fallback to original fetch if url parsing fails
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [pathname]);

  const fetchSession = async () => {
    try {
      const portalRole = pathname.startsWith('/therapist')
        ? 'THERAPIST'
        : pathname.startsWith('/patient')
        ? 'PATIENT'
        : pathname.startsWith('/admin')
        ? 'ADMIN'
        : '';

      const res = await fetch(`/api/auth/me?portal=${portalRole.toLowerCase()}`, {
        headers: portalRole ? { 'x-portal-role': portalRole } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);

          // Route Protection Check (Section 6)
          const role = data.user.role;
          if (pathname.startsWith('/admin') && role !== 'ADMIN') {
            router.push(role === 'THERAPIST' ? '/therapist/dashboard' : '/patient/dashboard');
          } else if (pathname.startsWith('/therapist') && role !== 'THERAPIST') {
            router.push(role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard');
          } else if (pathname.startsWith('/patient') && role !== 'PATIENT') {
            router.push(role === 'ADMIN' ? '/admin/dashboard' : '/therapist/dashboard');
          }
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (e) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#172D35] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-10 h-10 border-3 border-[#087F8C] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium tracking-wider text-[#DFE8EA]">Loading RehabPulse Portal...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isTherapist = user.role === 'THERAPIST';

  return (
    <div className={`min-h-screen ${isTherapist ? 'bg-[#F4F7F8] text-[#1D3038]' : 'bg-slate-50 text-slate-900'} flex transition-colors`}>
      {/* Sidebar */}
      <Sidebar
        userRole={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
