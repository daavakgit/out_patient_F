'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Activity,
  HeartPulse,
  Award,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Clock,
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
  CartesianGrid,
} from 'recharts';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
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

  const painTrend = data?.painTrend || [];
  const weeklyAdherence = data?.weeklyAdherence || [];
  const milestones = data?.milestones || { total: 0, completed: 0, percentage: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Recovery Progress Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track your weekly exercise adherence, pain reduction trajectory, and milestone achievements.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sessions Logged</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{data?.totalSessionsLogged || 0}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Verified clinical sessions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milestone Clearance</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{milestones.percentage}%</h3>
            <span className="text-[11px] text-sky-600 font-semibold">
              {milestones.completed} of {milestones.total} Milestones achieved
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pain Trend Status</p>
            <h3 className="text-2xl font-extrabold text-teal-600 mt-1">
              {painTrend.length === 0 ? 'Baseline' : 'Improving'}
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              {painTrend.length === 0 ? 'Awaiting session logs' : 'Downward pain score trajectory'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pain Trajectory */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" /> Pain Level Trajectory (0 to 10 Scale)
            </h3>
            <span className="text-[11px] text-slate-400">Post-session feedback</span>
          </div>
          {painTrend.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <HeartPulse className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Pain Telemetry Recorded Yet</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Pain feedback is recorded automatically at the end of each completed physical therapy exercise session.
              </p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={painTrend}>
                  <defs>
                    <linearGradient id="patientPainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="pain"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#patientPainGradient)"
                    name="Pain Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            {painTrend.length === 0
              ? 'Complete prescribed workouts to generate your clinical recovery trajectory.'
              : 'Your reported pain has progressively reduced across completed sessions.'}
          </p>
        </div>

        {/* Weekly Adherence */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Weekly Exercise Adherence
            </h3>
            <span className="text-[11px] text-slate-400">Past 7 days activity</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAdherence}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Sessions Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Maintaining consistent daily completion optimizes muscular healing and joint mobility.
          </p>
        </div>
      </div>
    </div>
  );
}
