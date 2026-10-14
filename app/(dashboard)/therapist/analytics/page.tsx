'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Activity,
  HeartPulse,
  Users,
  AlertTriangle,
  Award,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [resAnalytics, resPatients] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/patients'),
      ]);

      if (resAnalytics.ok) {
        const json = await resAnalytics.json();
        setData(json);
      }
      if (resPatients.ok) {
        const json = await resPatients.json();
        setPatients(json.patients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CardSkeleton />;

  const painTrend = data?.painTrend || [];
  const adherenceDist = data?.adherenceDist || [];
  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444'];

  const attentionPatients = patients.filter(
    (p) => p.status === 'NEEDS_ATTENTION' || p.adherenceScore < 80 || (p.initialAssessment?.initialPainScore || 0) >= 6
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Therapeutic Progress & Adherence Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated cohort telemetry across exercise completion rates, pain trajectories, and clinical milestones.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Cohort Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Patient Caseload</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{patients.length}</h3>
            <span className="text-[11px] text-sky-600 font-semibold">Authorized roster</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recorded Sessions</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{data?.totalSessionsLogged || 0}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Completed sessions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requires Clinical Attention</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{attentionPatients.length}</h3>
            <span className="text-[11px] text-rose-500 font-semibold">High pain or low compliance</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cohort Avg Adherence</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {patients.length > 0
                ? Math.round(patients.reduce((acc, p) => acc + (p.adherenceScore || 100), 0) / patients.length)
                : 100}
              %
            </h3>
            <span className="text-[11px] text-teal-600 font-semibold">Prescription compliance</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pain Trajectory Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" /> Patient Pain Progression (0-10 Scale)
            </h3>
            <span className="text-[11px] text-slate-400">Recent completed sessions</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={painTrend}>
                <defs>
                  <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="pain"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#painGradient)"
                  name="Pain Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Decreasing trajectory indicates therapeutic improvement and tissue adaptation.
          </p>
        </div>

        {/* Adherence Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Patient Adherence Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Active roster breakdown</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[8, 8, 0, 0]} name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs">
            {adherenceDist.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">{item.name}:</span>
                <span className="font-extrabold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patients Requiring Attention Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Clinical Attention List
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Condition</th>
                <th className="pb-3">Current Phase</th>
                <th className="pb-3">Adherence</th>
                <th className="pb-3">Initial Pain</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attentionPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    All patients are currently on track with optimal adherence.
                  </td>
                </tr>
              ) : (
                attentionPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3 font-extrabold text-slate-900">{p.userId?.name}</td>
                    <td className="py-3 text-slate-600">{p.medicalHistory?.reasonForVisit}</td>
                    <td className="py-3 font-semibold text-sky-700">Phase {p.currentPhase || 1}</td>
                    <td className="py-3 font-extrabold text-slate-900">{p.adherenceScore || 100}%</td>
                    <td className="py-3 font-extrabold text-rose-600">
                      {p.initialAssessment?.initialPainScore || 0}/10
                    </td>
                    <td className="py-3">
                      <Badge variant={p.status === 'NEEDS_ATTENTION' ? 'danger' : 'info'}>{p.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href={`/therapist/patients/${p._id}`}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800"
                      >
                        Open Workspace →
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
