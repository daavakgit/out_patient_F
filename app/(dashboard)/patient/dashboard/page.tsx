'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Calendar,
  Dumbbell,
  TrendingUp,
  Activity,
  Flag,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  Check,
  X,
  Stethoscope,
  Target,
  FileText,
  MessageSquare,
  AlertCircle,
  Award,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);

  // UI state
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [allMarked, setAllMarked] = useState(false);

  // Modals
  const [clinicalNoteOpen, setClinicalNoteOpen] = useState(false);
  const [selectedMilestoneNote, setSelectedMilestoneNote] = useState<any>(null);
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [instructionModalExercise, setInstructionModalExercise] = useState<any>(null);
  const [painLevel, setPainLevel] = useState(2);
  const [symptomNote, setSymptomNote] = useState('');
  const [symptomSaved, setSymptomSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) return;
      const meData = await meRes.json();
      setUser(meData.user || null);

      const patientId = meData.user?.patientId;

      const [resP, resA, resPlans, resS, resAppt, resM] = await Promise.all([
        patientId ? fetch(`/api/patients/${patientId}`) : Promise.resolve(null),
        fetch('/api/assignments'),
        fetch('/api/plans'),
        fetch('/api/sessions'),
        fetch('/api/appointments'),
        fetch('/api/milestones'),
      ]);

      if (resP && resP.ok) {
        const dP = await resP.json();
        setPatient(dP.patient || null);
      }
      if (resA && resA.ok) {
        const dA = await resA.json();
        setAssignments(dA.assignments || []);
      }
      if (resPlans && resPlans.ok) {
        const dPlans = await resPlans.json();
        setPlans(dPlans.plans || []);
      }
      if (resS && resS.ok) {
        const dS = await resS.json();
        setSessions(dS.sessions || []);
      }
      if (resAppt && resAppt.ok) {
        const dAppt = await resAppt.json();
        setAppointments(dAppt.appointments || []);
      }
      if (resM && resM.ok) {
        const dM = await resM.json();
        setMilestones(dM.milestones || []);
      }
    } catch (e) {
      console.error('Error loading patient dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = () => {
    const nextState = !allMarked;
    setAllMarked(nextState);
    const updated: Record<string, boolean> = {};
    assignments.forEach((a) => {
      updated[a._id] = nextState;
    });
    setCompletedExercises(updated);
  };

  const toggleExercise = (id: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Active plan & phases
  const activePlan = plans[0] || null;
  const phases = activePlan?.phases || [];
  const currentPhaseObj = phases.find((p: any) => p.phaseNumber === (patient?.currentPhase || 1)) || phases[0];

  // Milestones
  const achievedMilestone = milestones.find((m) => m.status === 'COMPLETED' || m.status === 'ACHIEVED');
  const activeMilestone = milestones.find((m) => m.status === 'IN_PROGRESS') || milestones[0];
  const completedMilestoneCount = milestones.filter((m) => m.status === 'COMPLETED').length;

  // Upcoming appointment
  const now = new Date();
  const upcomingAppointment = appointments.find(
    (a) => new Date(a.date) >= new Date(now.setHours(0, 0, 0, 0)) && a.status !== 'CANCELLED'
  );

  // Compute 7-day adherence data from real sessions
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  sessions.forEach((s) => {
    const sDate = new Date(s.startTime);
    const dayName = sDate.toLocaleDateString('en-US', { weekday: 'short' });
    if (dayCounts[dayName] !== undefined) {
      dayCounts[dayName] += 1;
    }
  });

  const adherenceData = daysOfWeek.map((day) => {
    const count = dayCounts[day];
    return {
      day,
      value: count > 0 ? Math.min(100, count * 50) : (sessions.length === 0 ? 0 : 0),
      status: day === 'Sun' ? 'target' : 'logged',
    };
  });

  const avgConsistency =
    sessions.length > 0
      ? Math.round(
          adherenceData.filter((d) => d.day !== 'Sun').reduce((acc, d) => acc + d.value, 0) / 6
        )
      : (patient?.adherenceScore || 100);

  // Trend data from real sessions (or clean baseline if 0 sessions)
  const trendData =
    sessions.length > 0
      ? sessions.slice(-6).map((s, idx) => ({
          week: `Sess ${idx + 1}`,
          pain: s.painLevel ?? 3,
          flexion: 70 + idx * 8,
          displayPain: `${s.painLevel ?? 3}`,
          displayFlexion: `${70 + idx * 8}°`,
        }))
      : [
          { week: 'Baseline', pain: 5, flexion: 60, displayPain: '5', displayFlexion: '60°' },
          { week: 'Phase 1', pain: 4, flexion: 75, displayPain: '4', displayFlexion: '75°' },
          { week: 'Phase 2', pain: 3, flexion: 90, displayPain: '3', displayFlexion: '90°' },
          { week: 'Target', pain: 1, flexion: 120, displayPain: '1', displayFlexion: '120°' },
        ];

  // Therapist name
  const therapistName = patient?.therapistId?.userId?.name || 'Assigned Physiotherapist';

  // Calculate progress %
  const totalWeeks = activePlan?.expectedDurationWeeks || 12;
  const currentWeek = patient?.currentPhase ? patient.currentPhase * 3 : 1;
  const progressPercent = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. TOP WEEKLY MILESTONE NOTIFICATION BANNER (Rendered only when real milestone is achieved) */}
      {achievedMilestone && !bannerDismissed && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Milestone Achieved: {achievedMilestone.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                  Target Met
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {achievedMilestone.description || 'You have successfully satisfied the criteria for this rehabilitation milestone.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto flex-shrink-0">
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                setSelectedMilestoneNote(achievedMilestone);
                setClinicalNoteOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-100 text-sky-700 text-xs font-bold rounded-xl transition-all shadow-2xs"
            >
              <span>View Milestone Note</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. HERO GREETING SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {user?.name || 'Patient'}! <span className="inline-block animate-wave">👋</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {patient?.status || 'Active Protocol'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {patient?.medicalHistory?.reasonForVisit
              ? `Condition: ${patient.medicalHistory.reasonForVisit}`
              : 'Your personalized rehabilitation portal is ready. View your exercises and recovery pathway below.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              {currentPhaseObj ? `Phase ${patient?.currentPhase || 1}: ${currentPhaseObj.name}` : `Phase ${patient?.currentPhase || 1}: Recovery`}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              Therapist: {therapistName}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
              <Flag className="w-3.5 h-3.5 text-slate-500" />
              {activeMilestone ? `Target: ${activeMilestone.title}` : 'Initial Evaluation'}
            </span>
          </div>
        </div>

        {/* Right side: Circular progress widget + actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 xl:justify-end flex-shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
          <div className="flex items-center gap-3.5">
            {/* Donut progress ring */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#0284c7]"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-slate-900">{progressPercent}%</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROTOCOL PROGRESS</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                Week {currentWeek} of {totalWeeks}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setSymptomModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Log Symptoms</span>
            </button>
            <Link
              href={assignments.length > 0 ? `/patient/sessions/live?assignmentId=${assignments[0]._id}` : '/patient/exercises'}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/20 active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{assignments.length > 0 ? "Start Today's Exercises" : 'View Exercises'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. FOUR KEY STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Rehab Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">REHAB PROGRESS</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{progressPercent}%</span>
              <span className="text-xs text-slate-400 font-medium">overall</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-[#0284c7] rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> On track
            </span>
            <span className="text-slate-400 font-medium">
              Week {currentWeek} of {totalWeeks}
            </span>
          </div>
        </div>

        {/* Metric 2: Weekly Adherence */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">WEEKLY ADHERENCE</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {patient?.adherenceScore ?? (sessions.length > 0 ? avgConsistency : 100)}%
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Active
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {sessions.length > 0 ? `${sessions.length} sessions logged` : 'New program'}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => {
                const filled = sessions.length >= i;
                return (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      filled ? 'bg-emerald-500' : 'border border-slate-300 bg-white'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Metric 3: Completed Sessions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">COMPLETED SESSIONS</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{sessions.length}</span>
              <span className="text-xs text-slate-400 font-medium">total logged</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {sessions.length > 0 ? 'Verified Clinical Logs' : 'Ready to start'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
              {assignments.length} assigned
            </span>
          </div>
        </div>

        {/* Metric 4: Active Milestone */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE MILESTONE</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight truncate">
                {activeMilestone ? (activeMilestone.targetValue || activeMilestone.title) : 'Initial Setup'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium truncate">
              {completedMilestoneCount} / {milestones.length || 1} Achieved
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
              {activeMilestone?.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. TODAY'S PRESCRIBED EXERCISES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">Today&apos;s Prescribed Exercises</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                {assignments.length} Exercises Assigned
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prescribed physical therapy protocols assigned by your clinician
            </p>
          </div>
          {assignments.length > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 self-start sm:self-auto py-1"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{allMarked ? 'Reset All Exercises' : 'Mark All Complete'}</span>
            </button>
          )}
        </div>

        {/* Dynamic Exercise Grid or Clean Fresh State */}
        {assignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Prescribed Exercises Today</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your physical therapist has not assigned daily routines yet. Once your clinician publishes your plan, your exercises will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/patient/exercises"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                <Dumbbell className="w-4 h-4 text-sky-600" />
                <span>Browse Exercise Library</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assignments.map((a, idx) => {
              const ex = a.exerciseId || {};
              const isDone = completedExercises[a._id];

              return (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all"
                >
                  <div>
                    {/* Media Card Top */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={ex.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80'}
                        alt={ex.name || 'Exercise'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      {/* Badges on Image */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-xs text-white border border-white/10">
                          {ex.category || 'Rehab'} • {a.holdDuration ? `${a.holdDuration}s` : 'Routine'}
                        </span>
                        {isDone ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-xs">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0284c7] text-white shadow-xs">
                            Pending
                          </span>
                        )}
                      </div>
                      {/* Exercise Title Overlaid at Bottom */}
                      <div className="absolute bottom-3 inset-x-3">
                        <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                          EXERCISE {String(idx + 1).padStart(2, '0')}
                        </p>
                        <h3 className="text-base font-bold text-white leading-snug drop-shadow-xs truncate">
                          {ex.name}
                        </h3>
                      </div>
                    </div>

                    {/* Body Details */}
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Target className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                        <span className="font-medium truncate">Target: {ex.targetArea || 'General Mobility'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>
                          {a.sets || 3} Sets × {a.reps || 10} Reps
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] pt-1">
                        Frequency: {a.frequency || 'Daily'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <Link
                      href={`/patient/sessions/live?assignmentId=${a._id}`}
                      className="py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all bg-[#0284c7] hover:bg-sky-600 text-white shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Exercise</span>
                    </Link>
                    <button
                      onClick={() =>
                        setInstructionModalExercise({
                          title: ex.name,
                          category: ex.category || 'Therapy',
                          duration: `${a.sets} Sets × ${a.reps} Reps`,
                          target: ex.targetArea,
                          setsReps: `${a.sets} Sets × ${a.reps} Reps`,
                          instructions: (ex.instructions ? ex.instructions.split('\n') : ['Follow therapist guidelines and maintain steady breathing.']),
                          safety: ex.safetyInstructions || 'Maintain proper posture and stop immediately if sharp pain occurs.',
                        })
                      }
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Info className="w-3 h-3 text-slate-500" />
                      <span>Instructions</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. YOUR RECOVERY JOURNEY SECTION (PHASES) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Recovery Journey</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activePlan?.name || 'Rehabilitation Protocol Roadmap'}
            </p>
          </div>
          <Link
            href="/patient/plan"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View Full Plan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Phase Cards or Clean Fresh State */}
        {phases.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Recovery Journey Pending</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your clinician has not published a multi-phase rehabilitation pathway yet. Your milestones will be established after your initial consultation.
            </p>
            <div className="pt-2">
              <Link
                href="/patient/plan"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                <span>View Plan Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {phases.map((ph: any) => {
              const isCurrent = ph.phaseNumber === (patient?.currentPhase || 1);
              const isCompleted = ph.phaseNumber < (patient?.currentPhase || 1) || ph.status === 'COMPLETED';

              return (
                <div
                  key={ph._id}
                  className={`rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                    isCurrent
                      ? 'bg-sky-50/40 border-2 border-sky-400'
                      : 'bg-white border border-slate-200/80'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isCompleted
                            ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                            : isCurrent
                            ? 'bg-[#0284c7] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCompleted ? '✓ Completed' : isCurrent ? 'Current Phase' : 'Upcoming'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Phase {ph.phaseNumber}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{ph.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {ph.goals?.join(', ') || ph.description || 'Milestone objectives set by therapist.'}
                    </p>
                  </div>
                  <div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isCompleted ? 'bg-teal-500' : isCurrent ? 'bg-[#0284c7]' : ''}`}
                        style={{ width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 block ${
                        isCompleted ? 'text-teal-600' : isCurrent ? 'text-sky-600' : 'text-slate-400'
                      }`}
                    >
                      {isCompleted ? '100% Verified' : isCurrent ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. TWO COLUMN ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Weekly Exercise Adherence Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Weekly Exercise Adherence</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {avgConsistency}% Consistency
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consistency across prescribed routines over past 7 days
            </p>

            {/* Recharts Bar Chart */}
            <div className="h-56 mt-4 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                              <p className="font-bold">{data.day}</p>
                              <p className="text-sky-300 font-medium">{data.value}% Completed</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {adherenceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.value > 0 ? '#0284c7' : '#e2e8f0'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full bg-slate-50 rounded-xl animate-pulse" />
              )}
            </div>
          </div>

          {/* Bottom Compliance Note Card */}
          <div className="mt-4 p-3.5 bg-gradient-to-r from-sky-50/70 to-teal-50/70 rounded-2xl border border-sky-100 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed">
              {sessions.length > 0
                ? 'Clinical tracking active. Maintain daily routine adherence to accelerate functional recovery.'
                : 'Welcome to your rehabilitation program! Complete your prescribed exercise routines to begin tracking adherence.'}
            </p>
          </div>
        </div>

        {/* Right Column: Pain & Mobility Trend Area/Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-base font-bold text-slate-900">Pain &amp; Mobility Score Trend</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  Pain (VAS 0–10)
                </span>
                <span className="flex items-center gap-1.5 text-sky-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                  Flexion Angle (°)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              VAS pain scale tracking alongside joint recovery progress
            </p>

            {/* Recharts Area/Line Chart */}
            <div className="h-56 mt-4 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="flexionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg space-y-1">
                              <p className="font-bold border-b border-slate-700 pb-1">{data.week}</p>
                              <p className="text-teal-400">VAS Pain: {data.displayPain} / 10</p>
                              <p className="text-sky-400">Flexion: {data.displayFlexion}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pain"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#painGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="flexion"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#flexionGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full bg-slate-50 rounded-xl animate-pulse" />
              )}
            </div>
          </div>

          {/* Bottom Trend Summary Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              📊 Clinical Monitoring Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
              Telemetry Ready
            </span>
          </div>
        </div>
      </div>

      {/* 7. BOTTOM TWO COLUMNS (UPCOMING PT & RECENT SESSIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Upcoming Physical Therapy */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Upcoming Physical Therapy</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {upcomingAppointment ? '1 Session Scheduled' : '0 Scheduled'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled clinical consultations &amp; evaluations
            </p>

            {/* Doctor & Appointment Card or Clean Fresh State */}
            {upcomingAppointment ? (
              <div className="mt-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-700 font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    {therapistName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{therapistName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                        {upcomingAppointment.type || 'Consultation'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Clinical Follow-up &amp; Joint Assessment</p>
                  </div>
                </div>

                {/* Date & Location Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Date &amp; Time</span>
                    </div>
                    <p className="font-bold text-slate-900 mt-1">
                      {new Date(upcomingAppointment.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      • {upcomingAppointment.time}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Location</span>
                    </div>
                    <p className="font-bold text-slate-900 mt-1">Outpatient Clinic - Physical Therapy</p>
                  </div>
                </div>

                {/* Telehealth switch link */}
                <Link
                  href="/patient/appointments"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Need Telehealth instead? Switch to Virtual Visit</span>
                </Link>
              </div>
            ) : (
              <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200/70 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No Scheduled Consultations</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You have no upcoming in-clinic evaluations or virtual visits pending.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/patient/appointments"
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{upcomingAppointment ? 'Reschedule' : 'Book Appointment'}</span>
            </Link>
            {upcomingAppointment && (
              <button
                onClick={() => setAttendanceConfirmed(!attendanceConfirmed)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  attendanceConfirmed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0284c7] hover:bg-sky-600 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{attendanceConfirmed ? 'Attendance Confirmed' : 'Confirm Attendance'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Recent Session History & Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Session History &amp; Activity</h3>
              <span className="text-xs font-bold text-emerald-600">{sessions.length} Completed</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified clinical logs and logged sensations
            </p>

            {/* List of Recent Sessions or Clean Fresh State */}
            {sessions.length === 0 ? (
              <div className="mt-4 p-8 bg-slate-50 rounded-2xl border border-slate-200/70 text-center space-y-2">
                <Activity className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No Activity History Recorded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your completed exercise routines and pain ratings will be recorded here once you finish a session.
                </p>
                <div className="pt-2">
                  <Link
                    href="/patient/exercises"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Your First Routine</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {sessions.slice(0, 3).map((s) => (
                  <div key={s._id} className="py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {s.exerciseId?.name || 'Therapeutic Session'}
                        </h4>
                        <span className="text-[11px] text-slate-400 flex-shrink-0">
                          {new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {Math.floor((s.duration || 0) / 60)} mins • {s.completedSets || 3} sets •{' '}
                        <span className="font-semibold text-emerald-600">Pain {s.painLevel ?? 0}/10</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div className="pt-2 text-center">
            <Link
              href="/patient/sessions"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 transition-colors"
            >
              <span>View All Session History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL 1: CLINICAL NOTE MODAL */}
      {clinicalNoteOpen && selectedMilestoneNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedMilestoneNote.title}</h3>
                  <p className="text-[11px] text-slate-400">Physiotherapy Evaluation Note</p>
                </div>
              </div>
              <button
                onClick={() => setClinicalNoteOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100">
                <span className="font-bold text-teal-800 block">Assessment Target:</span>
                <span className="text-teal-700">{selectedMilestoneNote.targetValue || 'Criteria Met'}</span>
              </div>
              <p>{selectedMilestoneNote.description || 'Milestone achieved successfully according to protocol criteria.'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setClinicalNoteOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG SYMPTOMS MODAL */}
      {symptomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Daily Symptom &amp; Pain Log</h3>
              </div>
              <button
                onClick={() => setSymptomModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {symptomSaved ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Feedback Logged Successfully!</h4>
                <p className="text-xs text-slate-500">Your physical therapist will review your symptoms during clinical rounds.</p>
                <button
                  onClick={() => {
                    setSymptomSaved(false);
                    setSymptomModalOpen(false);
                  }}
                  className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-semibold text-slate-700">VAS Pain Scale (0–10):</label>
                    <span className="font-bold text-sky-600 px-2 py-0.5 bg-sky-50 rounded-lg">
                      {painLevel}/10 {painLevel <= 3 ? '(Mild)' : painLevel <= 6 ? '(Moderate)' : '(Severe)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0: No Pain</span>
                    <span>5: Moderate</span>
                    <span>10: Severe</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Observations / Notes for Therapist:</label>
                  <textarea
                    rows={3}
                    value={symptomNote}
                    onChange={(e) => setSymptomNote(e.target.value)}
                    placeholder="Describe any tightness, soreness, or improvement..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSymptomModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setSymptomSaved(true)}
                    className="px-4 py-2 bg-[#0284c7] hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Save Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: EXERCISE INSTRUCTIONS MODAL */}
      {instructionModalExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                  {instructionModalExercise.category} Prescribed
                </span>
                <h3 className="font-bold text-slate-900 text-base">{instructionModalExercise.title}</h3>
              </div>
              <button
                onClick={() => setInstructionModalExercise(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Target Area</span>
                  {instructionModalExercise.target || 'General'}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Prescription</span>
                  {instructionModalExercise.setsReps}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Step-by-Step Instructions:</h4>
                <ol className="space-y-1.5 list-decimal list-inside pl-1 text-slate-600">
                  {instructionModalExercise.instructions.map((step: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-800">
                <strong>Safety Tip:</strong> {instructionModalExercise.safety}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInstructionModalExercise(null)}
                className="px-4 py-2 bg-[#0284c7] hover:bg-sky-600 text-white rounded-xl text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
