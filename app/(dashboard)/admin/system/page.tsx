'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, Database, Activity, RefreshCw, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function AdminSystemInfoPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CardSkeleton />;

  const system = data?.system || {};
  const db = data?.database || {};
  const counts = data?.counts || {};
  const security = data?.security || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">System Telemetry & Infrastructure</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time server diagnostics, database connection health, and security configuration.
          </p>
        </div>
        <button
          onClick={fetchSystemInfo}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Run Health Check
        </button>
      </div>

      {/* Status Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Application Status</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {system.status || 'OPERATIONAL'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-mono">Uptime: {system.serverUptime}s • v{system.appVersion}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Database Cluster</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
              {db.status || 'Connected'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-mono">Latency: {db.latencyMs}ms ({db.engine})</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Environment</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 capitalize">{system.environment || 'production'}</h3>
            <p className="text-xs text-slate-500 mt-2 font-mono">Platform: Next.js 14 App Router</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Database Record Counts */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600" /> Database Collection Inventory
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-slate-900">{counts.totalUsers}</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Users</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-slate-900">{counts.totalPatients}</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Patients</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-slate-900">{counts.totalTherapists}</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Therapists</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-slate-900">{counts.totalExercises}</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Exercises</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-slate-900">{counts.totalPlans}</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Rehab Plans</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-slate-900">{counts.totalSessions}</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Sessions</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-extrabold text-slate-900">{counts.totalAppointments}</div>
            <div className="text-[11px] text-slate-500 font-bold uppercase mt-1">Appointments</div>
          </div>
        </div>
      </div>

      {/* Security Architecture Specifications */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-600" /> Security Controls & Compliance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
            <span className="font-bold text-purple-900 block mb-1">Session Management</span>
            <p className="text-slate-600 leading-relaxed">{security.authStrategy}</p>
          </div>
          <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
            <span className="font-bold text-sky-900 block mb-1">Role-Based Access Control</span>
            <p className="text-slate-600 leading-relaxed">{security.roleAuthorization}</p>
          </div>
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <span className="font-bold text-emerald-900 block mb-1">Data Isolation Guard</span>
            <p className="text-slate-600 leading-relaxed">{security.dataIsolation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
