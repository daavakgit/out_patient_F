'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, User, Award, ArrowRight, ShieldCheck, Dumbbell } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientRehabPlanPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const json = await res.json();
        setPlans(json.plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CardSkeleton />;

  const activePlan = plans[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Rehabilitation Plan</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Your customized physical recovery protocol designed and monitored by your physiotherapist.
          </p>
        </div>
        <Link
          href="/patient/exercises"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all self-start md:self-auto"
        >
          <Dumbbell className="w-4 h-4" /> Go to Today&apos;s Exercises
        </Link>
      </div>

      {!activePlan ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
          No active rehabilitation plan found. Your assigned therapist will publish your customized pathway shortly.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Plan Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                  Active Clinical Prescription
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">{activePlan.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Therapist:{' '}
                    <strong className="text-slate-800">
                      {activePlan.therapistId?.userId?.name || 'Clinical Care Team'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>Duration: <strong>{activePlan.expectedDurationWeeks} Weeks</strong></span>
                  <span>•</span>
                  <span>Started: <strong>{new Date(activePlan.startDate).toLocaleDateString()}</strong></span>
                </div>
              </div>
              <Badge variant="success">IN ACTIVE RECOVERY</Badge>
            </div>

            {/* Visual 4-Phase Progression Journey */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Phased Rehabilitation Pathway
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(activePlan.phases || []).map((ph: any) => {
                  const isCurrent = ph.phaseNumber === activePlan.currentPhase;
                  const isCompleted = ph.phaseNumber < activePlan.currentPhase || ph.status === 'COMPLETED';

                  return (
                    <div
                      key={ph._id}
                      className={`rounded-2xl p-5 border transition-all ${
                        isCurrent
                          ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/30 shadow-md'
                          : isCompleted
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            isCurrent
                              ? 'bg-sky-600 text-white'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          Phase {ph.phaseNumber}
                        </span>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 mt-2">{ph.name}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ph.description}</p>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-500">Duration: ~{ph.durationWeeks} wks</span>
                        <span
                          className={
                            isCurrent ? 'text-sky-700 font-bold' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                          }
                        >
                          {isCurrent ? 'Current Focus' : isCompleted ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Goals & Directives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider block">
                  Rehabilitation Milestones & Goals
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(activePlan.goals || []).map((g: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider block">
                  Therapist Clinical Directives
                </span>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  {activePlan.therapistNotes || 'No specific directives recorded.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
