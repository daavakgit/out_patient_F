'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  Dumbbell,
  Activity,
  Award,
  Calendar,
  MessageSquare,
  Bell,
  User,
  Settings,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  X,
  HeartPulse,
  History,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  userRole?: 'ADMIN' | 'THERAPIST' | 'PATIENT';
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  userRole = 'PATIENT',
  isOpen = true,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const adminNav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Patient Directory', href: '/admin/patients', icon: UserCheck },
    { label: 'Therapist Directory', href: '/admin/therapists', icon: Stethoscope },
    { label: 'Global Exercises', href: '/admin/exercises', icon: Dumbbell },
    { label: 'System Info', href: '/admin/system', icon: ShieldAlert },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Profile', href: '/admin/profile', icon: User },
  ];

  const therapistNav = [
    { label: 'Dashboard', href: '/therapist/dashboard', icon: LayoutDashboard },
    { label: 'Patient Roster', href: '/therapist/patients', icon: Users },
    { label: 'Rehab Plans', href: '/therapist/plans', icon: FileText },
    { label: 'Exercise Management', href: '/therapist/exercises', icon: Dumbbell },
    { label: 'Live Session Monitor', href: '/therapist/sessions', icon: Activity },
    { label: 'Progress Analytics', href: '/therapist/analytics', icon: TrendingUp },
    { label: 'Milestone Manager', href: '/therapist/milestones', icon: Award },
    { label: 'Appointments', href: '/therapist/appointments', icon: Calendar },
    { label: 'Messages', href: '/therapist/messages', icon: MessageSquare },
    { label: 'Notifications', href: '/therapist/notifications', icon: Bell },
    { label: 'Profile', href: '/therapist/profile', icon: User },
  ];

  const isPatient = userRole === 'PATIENT';
  const isTherapist = userRole === 'THERAPIST';
  const [therapistInfo, setTherapistInfo] = React.useState<{ name: string; position: string; initials: string } | null>(null);

  React.useEffect(() => {
    if (isPatient) {
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((data) => {
          if (data.user?.patientId) {
            fetch(`/api/patients/${data.user.patientId}`)
              .then((pr) => pr.json())
              .then((pData) => {
                const tName = pData.patient?.therapistId?.userId?.name;
                if (tName) {
                  const parts = tName.split(' ');
                  const initials = parts.map((p: string) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
                  setTherapistInfo({
                    name: tName,
                    position: 'Assigned Physiotherapist',
                    initials: initials || 'PT',
                  });
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [isPatient]);

  const patientMainMenu = [
    { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'My Rehab Plan', href: '/patient/plan', icon: FileText },
    { label: 'Exercise Library', href: '/patient/exercises', icon: Dumbbell },
    { label: 'Session History', href: '/patient/sessions', icon: History },
    { label: 'Progress Analytics', href: '/patient/analytics', icon: TrendingUp },
    { label: 'Milestones', href: '/patient/milestones', icon: Award },
    { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Messages', href: '/patient/messages', icon: MessageSquare },
  ];

  const patientSystemMenu = [
    { label: 'Notifications', href: '/patient/notifications', icon: Bell },
    { label: 'Profile', href: '/patient/profile', icon: User },
    { label: 'Settings', href: '/patient/settings', icon: Settings },
  ];

  const currentNav = isTherapist ? therapistNav : userRole === 'ADMIN' ? adminNav : [];

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#172D35]/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isPatient
            ? 'w-64 bg-white text-slate-700 border-r border-[#DFE8EA] shadow-xs'
            : isTherapist
            ? 'w-64 bg-[#172D35] text-[#DFE8EA] border-r border-[#24414D] shadow-lg'
            : 'w-64 bg-slate-900 text-slate-100'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header Branding */}
        <div
          className={`flex items-center justify-between h-[60px] px-4 border-b ${
            isPatient
              ? 'bg-white border-[#DFE8EA]'
              : isTherapist
              ? 'bg-[#13262D] border-[#24414D]'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <Link
            href={`/${userRole.toLowerCase()}/dashboard`}
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'lg:justify-center lg:w-full' : ''}`}
            title="RehabPulse Clinical System"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#087F8C] to-[#12A89D] flex items-center justify-center text-white shrink-0 shadow-sm">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            {(!isCollapsed || !isTherapist) && (
              <div className="min-w-0 flex-1">
                <span
                  className={`text-base font-bold tracking-tight block leading-none truncate ${
                    isPatient ? 'text-[#1D3038]' : 'text-white'
                  }`}
                >
                  RehabPulse
                </span>
                <span
                  className={`text-[9.5px] font-bold tracking-wider uppercase mt-1 block truncate ${
                    isTherapist ? 'text-[#12A89D]' : 'text-sky-600'
                  }`}
                >
                  {isPatient ? 'PATIENT PORTAL' : `${userRole} PORTAL`}
                </span>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-1">
            {/* Collapse toggle for desktop */}
            {onToggleCollapse && !isPatient && (
              <button
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className="hidden lg:flex p-1.5 rounded-lg text-[#8FA6B0] hover:text-white hover:bg-[#1F3943] transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg lg:hidden ${
                isPatient ? 'text-slate-400 hover:text-slate-700' : 'text-[#8FA6B0] hover:text-white'
              }`}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar">
          {isPatient ? (
            <>
              {/* Patient Menu */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  MAIN MENU
                </div>
                {patientMainMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/patient/dashboard' && pathname?.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#087F8C] text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  SYSTEM
                </div>
                {patientSystemMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#087F8C] text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#8FA6B0] uppercase flex items-center justify-between">
                  <span>{userRole} PORTAL</span>
                  {isTherapist && <span className="text-[9px] text-[#12A89D] font-mono">11 MODULES</span>}
                </div>
              )}
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/therapist/dashboard' && pathname?.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? isTherapist
                          ? 'bg-[#087F8C] text-white shadow-xs font-semibold'
                          : 'bg-sky-600 text-white shadow-md font-semibold'
                        : isTherapist
                        ? 'text-[#8FA6B0] hover:text-white hover:bg-[#1F3943]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : isTherapist
                            ? 'text-[#8FA6B0] group-hover:text-[#12A89D]'
                            : 'text-slate-400 group-hover:text-sky-400'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />
                    )}

                    {/* Subtle active left bar indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#12A89D]" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        {isPatient ? (
          <div className="p-3 border-t border-[#DFE8EA] bg-slate-50/70">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-[#087F8C] font-extrabold text-xs flex items-center justify-center shrink-0">
                  {therapistInfo?.initials || 'PT'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {therapistInfo?.name || 'Clinical Care Team'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {therapistInfo?.position || 'Staff Physiotherapy'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : isTherapist ? (
          <div className="p-3 border-t border-[#24414D] bg-[#13262D] text-xs text-[#8FA6B0]">
            {!isCollapsed ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#DFE8EA]">Clinical EHR Security</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#13866D] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#13866D] animate-pulse" />
                    HIPAA Active
                  </span>
                </div>
                <p className="text-[10px] text-[#647780]">Isolated Therapist Caseload • v2.4</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-1" title="Clinical Care System Online">
                <span className="w-2 h-2 rounded-full bg-[#13866D] animate-pulse" />
                <span className="text-[9px] font-mono text-[#8FA6B0]">v2.4</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">System Status</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}