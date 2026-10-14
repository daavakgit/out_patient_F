'use client';

import React, { useEffect, useState } from 'react';
import { PlayCircle, Clock, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Session Monitor & Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor completed and in-progress exercise sessions performed by your assigned patients.
        </p>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Exercise Name</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Sets Logged</th>
                  <th className="p-4">Pain Score</th>
                  <th className="p-4">Session Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">
                      {s.patientId?.userId?.name || 'Patient'}
                    </td>
                    <td className="p-4 font-bold text-slate-800">{s.exerciseId?.name || 'Exercise'}</td>
                    <td className="p-4 text-slate-600">
                      {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-mono">
                      {Math.floor(s.duration / 60)}m {s.duration % 60}s
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {s.completedSets} / {s.targetSets} Sets
                    </td>
                    <td className="p-4">
                      <span className={`font-extrabold ${s.painLevel >= 7 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {s.painLevel || 0} / 10
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={s.status === 'COMPLETED' ? 'success' : s.status === 'STARTED' ? 'info' : 'warning'}>
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
