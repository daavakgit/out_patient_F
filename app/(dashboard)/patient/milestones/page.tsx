'use client';

import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Clock, Circle, Target, Check } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientMilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/milestones');
      if (res.ok) {
        const json = await res.json();
        setMilestones(json.milestones || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CardSkeleton />;

  const completed = milestones.filter((m) => m.status === 'COMPLETED');
  const inProgress = milestones.filter((m) => m.status === 'IN_PROGRESS');
  const notStarted = milestones.filter((m) => m.status === 'NOT_STARTED' || m.status === 'ON_HOLD');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Rehabilitation Milestones</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clinical recovery objectives and functional criteria set by your physical therapist.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600">
            Progress: <strong className="text-emerald-600">{completed.length}</strong> / {milestones.length} Achieved
          </span>
        </div>
      </div>

      {/* Visual Milestone Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-600" /> Milestone Progression Pathway
        </h3>

        <div className="relative pl-6 md:pl-8 border-l-2 border-slate-200 space-y-8 my-4">
          {milestones.length === 0 ? (
            <p className="text-xs text-slate-400">No milestones assigned yet.</p>
          ) : (
            milestones.map((m, idx) => {
              const isDone = m.status === 'COMPLETED';
              const isInProgress = m.status === 'IN_PROGRESS';

              return (
                <div key={m._id} className="relative group">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-[35px] md:-left-[43px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : isInProgress
                        ? 'bg-sky-600 border-sky-600 text-white ring-4 ring-sky-500/20 animate-pulse'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isInProgress ? (
                      <Target className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  {/* Card Content */}
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isInProgress
                        ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-500/20'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Phase {m.phaseNumber} Milestone
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">{m.name}</h4>
                      </div>
                      <Badge
                        variant={isDone ? 'success' : isInProgress ? 'info' : 'neutral'}
                      >
                        {m.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.description}</p>

                    {m.criteria && (
                      <div className="mt-3 p-3 bg-white/80 rounded-xl border border-slate-200/60 text-xs text-slate-700">
                        <strong className="text-slate-900">Success Criteria:</strong> {m.criteria}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>
                        {isDone && m.completedDate
                          ? `Achieved on ${new Date(m.completedDate).toLocaleDateString()}`
                          : isInProgress
                          ? 'Active Target in Progress'
                          : 'Upcoming Target'}
                      </span>
                      {m.notes && <span className="italic text-slate-500">Therapist note: {m.notes}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
