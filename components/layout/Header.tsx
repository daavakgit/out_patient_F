'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  Stethoscope,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Calendar,
  MessageSquare,
  FileText,
  Activity,
  ArrowRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: 'ADMIN' | 'THERAPIST' | 'PATIENT';
    avatar?: string;
    patientId?: string;
    therapistId?: string;
  } | null;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export default function Header({
  user,
  onToggleSidebar,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Profile menu dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Therapist info
  const [therapistDesignation, setTherapistDesignation] = useState<string>('Clinical Physiotherapist');

  useEffect(() => {
    if (user) {
      fetchNotifications();
      if (user.role === 'THERAPIST' && user.therapistId) {
        fetch(`/api/therapists/${user.therapistId}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.therapist?.position) {
              setTherapistDesignation(data.therapist.position);
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search effect for global search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/patients?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults((data.patients || []).slice(0, 5));
          setShowSearchDropdown(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // silent
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-role': user?.role || '',
        },
        body: JSON.stringify({ role: user?.role }),
      });
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('rehabpulse_active_portal');
      }
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      fetchNotifications();
    } catch (e) {}
  };

  // Helper to determine page title for breadcrumb
  const getBreadcrumbTitle = () => {
    if (pathname.includes('/therapist/dashboard')) return 'Clinical Dashboard';
    if (pathname.includes('/therapist/patients')) return 'Patient Roster';
    if (pathname.includes('/therapist/plans')) return 'Rehab Plans';
    if (pathname.includes('/therapist/exercises')) return 'Exercise Management';
    if (pathname.includes('/therapist/sessions')) return 'Live Session Monitor';
    if (pathname.includes('/therapist/analytics')) return 'Progress Analytics';
    if (pathname.includes('/therapist/milestones')) return 'Milestone Manager';
    if (pathname.includes('/therapist/appointments')) return 'Appointments';
    if (pathname.includes('/therapist/messages')) return 'Messages';
    if (pathname.includes('/therapist/notifications')) return 'Notifications';
    if (pathname.includes('/therapist/profile')) return 'Profile';
    return 'Overview';
  };

  const isTherapist = user?.role === 'THERAPIST';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[60px] px-4 md:px-6 bg-white border-b border-[#DFE8EA] shadow-[0_1px_2px_0_rgba(23,45,53,0.03)]">
      {/* Left: Mobile Toggle + Desktop Collapse + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-[#647780] hover:text-[#1D3038] hover:bg-[#F4F7F8] rounded-lg lg:hidden transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        {onToggleSidebarCollapse && (
          <button
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex p-1.5 text-[#647780] hover:text-[#1D3038] hover:bg-[#F4F7F8] rounded-lg transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <span className="text-[#647780] font-medium hidden sm:inline">
            {isTherapist ? 'Therapist Portal' : user?.role === 'ADMIN' ? 'Admin Portal' : 'Patient Portal'}
          </span>
          <span className="text-[#DFE8EA] hidden sm:inline">/</span>
          <span className="text-[#1D3038] font-bold tracking-tight">
            {getBreadcrumbTitle()}
          </span>
        </nav>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#647780]" />
          <input
            type="text"
            placeholder="Search patients, MRN, conditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowSearchDropdown(true);
            }}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F4F7F8] border border-[#DFE8EA] rounded-xl text-[#1D3038] placeholder-[#647780] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#087F8C] focus:border-[#087F8C] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#647780] hover:text-[#1D3038]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#DFE8EA] rounded-xl shadow-lg py-2 z-50 animate-fade-in text-xs max-h-80 overflow-y-auto">
            <div className="px-3 py-1 text-[11px] font-bold text-[#647780] uppercase tracking-wider border-b border-[#DFE8EA]/60 flex items-center justify-between">
              <span>Matching Patients</span>
              {isSearching && <span className="text-[10px] text-[#087F8C]">Searching...</span>}
            </div>
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-[#647780] text-xs">
                No matching patients found.
              </div>
            ) : (
              <div className="divide-y divide-[#DFE8EA]/40">
                {searchResults.map((p) => (
                  <Link
                    key={p._id}
                    href={`/therapist/patients/${p._id}`}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-[#F4F7F8] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#087F8C] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {p.userId?.name?.substring(0, 2).toUpperCase() || 'PT'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#1D3038] truncate group-hover:text-[#087F8C]">
                          {p.userId?.name}
                        </div>
                        <div className="text-[11px] text-[#647780] truncate font-mono">
                          {p.patientCode} • {p.medicalHistory?.reasonForVisit || 'Rehabilitation'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#647780] group-hover:text-[#087F8C] shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Notification + Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <div ref={notifMenuRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#647780] hover:text-[#1D3038] rounded-lg hover:bg-[#F4F7F8] transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C94F50] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-[#DFE8EA] py-2 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#DFE8EA]">
                <h4 className="font-bold text-xs text-[#1D3038]">Clinical Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#087F8C] hover:underline font-semibold">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#DFE8EA]/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#647780]">No notifications available.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 text-xs transition-colors hover:bg-[#F4F7F8] ${
                        !n.read ? 'bg-[#EDF7F8]/60 font-medium' : ''
                      }`}
                    >
                      <div className="font-bold text-[#1D3038]">{n.title}</div>
                      <div className="text-[#647780] mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-[#647780] mt-1 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Therapist Profile Menu */}
        {user && (
          <div ref={profileMenuRef} className="relative pl-2 border-l border-[#DFE8EA]">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F4F7F8] transition-colors focus:outline-none"
              aria-label="Open profile menu"
            >
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=087F8C&color=fff`
                }
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-[#DFE8EA]"
              />

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#1D3038] leading-tight truncate max-w-[140px]">
                  {user.name}
                </span>
                <span className="text-[10.5px] text-[#647780] truncate max-w-[140px]">
                  {isTherapist ? therapistDesignation : user.role}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-[#647780] hidden sm:block" />
            </button>

            {/* Profile Menu Popover */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#DFE8EA] py-2 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2.5 border-b border-[#DFE8EA] bg-[#F4F7F8]/50">
                  <p className="font-bold text-[#1D3038]">{user.name}</p>
                  <p className="text-[11px] text-[#647780] truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#087F8C]/10 text-[#087F8C] border border-[#087F8C]/20">
                    {isTherapist ? therapistDesignation : user.role}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href={isTherapist ? '/therapist/profile' : `/${user.role.toLowerCase()}/profile`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#1D3038] hover:bg-[#F4F7F8] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#647780]" />
                    <span>Clinical Profile</span>
                  </Link>

                  {isTherapist && (
                    <>
                      <Link
                        href="/therapist/appointments"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#1D3038] hover:bg-[#F4F7F8] transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-[#647780]" />
                        <span>Scheduled Appointments</span>
                      </Link>
                      <Link
                        href="/therapist/messages"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#1D3038] hover:bg-[#F4F7F8] transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-[#647780]" />
                        <span>Patient Messages</span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="border-t border-[#DFE8EA] pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[#C94F50] hover:bg-[#C94F50]/10 transition-colors text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
