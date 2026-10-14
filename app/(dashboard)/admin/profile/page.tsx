'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, ShieldCheck, Key, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Profile & Credentials</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized administrator credentials and platform privileges.
          </p>
        </div>
        <Badge variant="warning">ADMIN PRIVILEGED</Badge>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
            <p className="text-xs font-semibold text-purple-700 mt-0.5">Platform Chief Administrator</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                ID: {user?.id}
              </span>
            </div>
          </div>
        </div>

        {/* Credentials and Role Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Assigned System Role</span>
            <p className="text-sm font-extrabold text-slate-900">{user?.role}</p>
            <p className="text-slate-500 text-[11px]">Unrestricted administrative access to all system entities.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Account Security Status</span>
            <p className="text-sm font-extrabold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> ACTIVE & ENFORCED
            </p>
            <p className="text-slate-500 text-[11px]">Protected by HMAC-SHA256 HttpOnly session cookies.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Patient Records Access</span>
            <p className="text-sm font-extrabold text-slate-900">System-Wide Audit Clearance</p>
            <p className="text-slate-500 text-[11px]">Can audit patient records and re-assign clinical therapists.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Session Authorization</span>
            <p className="text-sm font-extrabold text-slate-900">7-Day Rolling JWT</p>
            <p className="text-slate-500 text-[11px]">Automatic timeout and rotation on key changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
