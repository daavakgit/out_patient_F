'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, PlayCircle, Clock, Calendar, CheckCircle2, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientSessionHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const json = await res.json();
        setSessions(json.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Exercise Session History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete historical log of all completed therapeutic sessions, pain feedback, and adherence duration.
          </p>
        </div>
        <Link
          href="/patient/exercises"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all self-start md:self-auto"
        >
          <PlayCircle className="w-4 h-4" /> Start Today&apos;s Exercise
        </Link>
      </div>

      {/* Sessions Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Exercise Name</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Sets</th>
                  <th className="p-4">Repetitions</th>
                  <th className="p-4">Pain Score</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No exercise sessions completed yet. Start your first session from the exercises page.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">
                          {new Date(s.startTime).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {s.exerciseId?.name || 'Therapeutic Exercise'}
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-700">
                        {Math.floor(s.duration / 60)}m {s.duration % 60}s
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">
                          {s.completedSets} / {s.targetSets}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">
                          {s.completedRepetitions} / {s.targetRepetitions * s.targetSets}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-black ${
                            (s.painLevel || 0) >= 6
                              ? 'text-rose-600'
                              : (s.painLevel || 0) >= 4
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {s.painLevel ?? 0} / 10
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="info">{s.difficulty || 'Moderate'}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={s.status === 'COMPLETED' ? 'success' : 'warning'}>{s.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
