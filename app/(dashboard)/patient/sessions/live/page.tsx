'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Award,
  Check,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

export default function LiveExerciseSessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = searchParams.get('assignmentId');

  const [assignment, setAssignment] = useState<any>(null);
  const [sessionRecord, setSessionRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Timer & Session state
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pauseSeconds, setPauseSeconds] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [completedReps, setCompletedReps] = useState(0);

  // Hold Timer & Rest Timer
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [holdTimer, setHoldTimer] = useState<number | null>(null);

  // Post Session Survey Modal
  const [showSurvey, setShowSurvey] = useState(false);
  const [painLevel, setPainLevel] = useState(3);
  const [difficulty, setDifficulty] = useState('Moderate');
  const [patientNotes, setPatientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Timer Ref
  const timerRef = useRef<any>(null);

  useEffect(() => {
    initSession();
    return () => clearInterval(timerRef.current);
  }, [assignmentId]);

  // Main session clock interval
  useEffect(() => {
    if (!isPaused && sessionRecord && !showSurvey && !submitSuccess) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, sessionRecord, showSurvey, submitSuccess]);

  // Rest timer countdown
  useEffect(() => {
    let restInterval: any = null;
    if (restTimer !== null && restTimer > 0) {
      restInterval = setInterval(() => {
        setRestTimer((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(restInterval);
  }, [restTimer]);

  const initSession = async () => {
    try {
      if (!assignmentId) return;

      const resA = await fetch('/api/assignments');
      if (resA.ok) {
        const dA = await resA.json();
        const found = (dA.assignments || []).find((a: any) => a._id === assignmentId);
        if (found) {
          setAssignment(found);

          // Start server session
          const resS = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exerciseId: found.exerciseId?._id || found.exerciseId,
              exerciseAssignmentId: found._id,
              rehabilitationPlanId: found.rehabilitationPlanId?._id || found.rehabilitationPlanId,
              targetSets: found.sets,
              targetRepetitions: found.reps,
            }),
          });

          if (resS.ok) {
            const dS = await resS.json();
            setSessionRecord(dS.session);
          }
        }
      }
    } catch (e) {
      console.error('Session initialization error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async () => {
    if (!sessionRecord) return;
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);

    try {
      await fetch(`/api/sessions/${sessionRecord._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newPausedState ? 'PAUSE' : 'RESUME' }),
      });
    } catch (e) {}
  };

  const handleLogRep = () => {
    const targetReps = assignment?.reps || 10;
    const nextReps = completedReps + 1;
    setCompletedReps(nextReps);

    // Trigger hold duration visual if present
    if (assignment?.holdDuration > 0) {
      setHoldTimer(assignment.holdDuration);
      setTimeout(() => setHoldTimer(null), assignment.holdDuration * 1000);
    }

    // Auto complete set if reps reach target
    if (nextReps >= targetReps) {
      handleCompleteSet();
    }
  };

  const handleCompleteSet = () => {
    const targetSets = assignment?.sets || 3;
    const nextSet = completedSets + 1;
    setCompletedSets(nextSet);
    setCompletedReps(0);

    if (nextSet >= targetSets) {
      // All sets completed, show post-session survey
      setShowSurvey(true);
    } else {
      // Start rest timer
      setRestTimer(assignment?.restDuration || 30);
    }
  };

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      let activeSessionId = sessionRecord?._id || sessionRecord?.sessionId;

      // Fallback: If sessionRecord wasn't initialized on mount, create it now
      if (!activeSessionId && assignment) {
        const createRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: assignment.exerciseId?._id || assignment.exerciseId,
            exerciseAssignmentId: assignment._id,
            rehabilitationPlanId: assignment.rehabilitationPlanId?._id || assignment.rehabilitationPlanId,
            targetSets: assignment.sets || 3,
            targetRepetitions: assignment.reps || 10,
          }),
        });
        if (createRes.ok) {
          const createData = await createRes.json();
          activeSessionId = createData.session?._id;
          setSessionRecord(createData.session);
        }
      }

      if (!activeSessionId) {
        throw new Error('Unable to locate or initialize active session. Please try again.');
      }

      const totalTargetReps = assignment?.reps || 10;
      const totalRepsCalculated = completedReps + completedSets * totalTargetReps;

      const payload = {
        action: 'SUBMIT',
        sessionId: activeSessionId,
        completedSets: Number(completedSets) || 1,
        completedRepetitions: Math.max(1, Number(totalRepsCalculated)),
        duration: Math.max(1, Number(elapsedSeconds) || 60),
        pauseDuration: Number(pauseSeconds) || 0,
        painLevel: Number(painLevel),
        difficulty: String(difficulty),
        notes: String(patientNotes || ''),
      };

      const res = await fetch(`/api/sessions/${activeSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit exercise session.');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 1200);
    } catch (err: any) {
      console.error('Session submission failed:', err);
      setSubmitError(err.message || 'Error submitting session log. Please check connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-600">
        <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-xs text-slate-500">Initializing Live Exercise Session...</span>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-extrabold text-base text-slate-900">Exercise Assignment Not Found</h3>
        <p className="text-xs text-slate-500">This exercise assignment may have been completed or removed.</p>
        <button
          onClick={() => router.push('/patient/exercises')}
          className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow"
        >
          Return to Exercises
        </button>
      </div>
    );
  }

  const exercise = assignment.exerciseId || {};
  const targetSets = assignment.sets || 3;
  const targetReps = assignment.reps || 10;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const difficultyOptions = ['Easy', 'Moderate', 'Challenging', 'Extreme'];

  const getPainDescription = (val: number) => {
    if (val === 0) return 'No Pain (0)';
    if (val <= 3) return 'Mild Discomfort (1-3)';
    if (val <= 6) return 'Moderate Pain (4-6)';
    if (val <= 8) return 'Significant Pain (7-8)';
    return 'Severe Pain (9-10)';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Session
        </button>
        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Exercise Player
        </span>
      </div>

      {/* Main Exercise Card Player */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-md sm:shadow-xl overflow-hidden">
        <div className="relative h-60 sm:h-72 md:h-96 w-full bg-slate-900">
          <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sky-400">
              {exercise.category} • {exercise.targetArea}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-1 tracking-tight leading-tight">
              {exercise.name}
            </h1>
          </div>
        </div>

        {/* Live Metrics Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Elapsed Time</span>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-sky-400 mt-0.5">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Sets</span>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              {completedSets} <span className="text-xs text-slate-400 font-normal">/ {targetSets}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Reps</span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5">
              {completedReps} <span className="text-xs text-slate-400 font-normal">/ {targetReps}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Session Status</span>
            <div className="mt-1">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isPaused ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Rest Overlay Notice */}
          {restTimer !== null && (
            <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between animate-pulse">
              <div>
                <span className="font-bold text-amber-900 text-xs sm:text-sm block">
                  Rest Period Active: {restTimer}s remaining
                </span>
                <p className="text-[11px] text-amber-700">Take a breath before your next set.</p>
              </div>
              <button
                onClick={() => setRestTimer(null)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Skip Rest
              </button>
            </div>
          )}

          {/* Hold Overlay */}
          {holdTimer !== null && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-center text-sky-800 font-bold text-xs">
              Holding Position ({holdTimer}s)... Stay steady!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <button
              onClick={handleLogRep}
              disabled={isPaused || completedSets >= targetSets}
              className="py-3.5 sm:py-4 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold shadow-md sm:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              + Log Repetition ({completedReps + 1}/{targetReps})
            </button>

            <button
              onClick={handleCompleteSet}
              disabled={isPaused || completedSets >= targetSets}
              className="py-3.5 sm:py-4 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold shadow-md sm:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Complete Set ({completedSets + 1}/{targetSets})</span>
            </button>

            <button
              onClick={handlePauseResume}
              className="py-3.5 sm:py-4 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow transition-all flex items-center justify-center gap-2"
            >
              {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
              <span>{isPaused ? 'Resume Session' : 'Pause Session'}</span>
            </button>
          </div>

          {/* Early End / Trigger Survey Button */}
          <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
            <span className="text-slate-500">Finished your sets early?</span>
            <button
              onClick={() => setShowSurvey(true)}
              className="font-bold text-sky-600 hover:text-sky-800 hover:underline"
            >
              Finish & Submit Session →
            </button>
          </div>

          {/* Instructions */}
          <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Therapist Instructions</h4>
            <p className="text-slate-700 leading-relaxed">{exercise.instructions || 'Perform movement slowly and controlled.'}</p>
            {assignment.therapistNotes && (
              <p className="text-sky-700 font-semibold italic mt-1">Prescription Note: {assignment.therapistNotes}</p>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POST-SESSION FEEDBACK SURVEY MODAL (FULLY RESPONSIVE) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        title="🎉 Session Completed — Post-Exercise Survey"
        subtitle="Log your clinical feedback and pain response for your physiotherapist"
        customWidth="min(560px, calc(100vw - 24px))"
        maxHeight="calc(100dvh - 24px)"
      >
        <form onSubmit={handleSubmitSession} className="space-y-4 sm:space-y-5 text-xs">
          {/* Submission Feedback Banner */}
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold flex items-center gap-2 text-xs animate-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <div className="flex-1 min-w-0">{submitError}</div>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 text-xs animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Exercise session submitted successfully! Returning to dashboard...</span>
            </div>
          )}

          {/* Celebration Header */}
          <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
            <Award className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm sm:text-base text-emerald-950">Great Job!</h4>
            <p className="text-emerald-800 text-xs">
              You completed <strong className="text-emerald-950">{completedSets} sets</strong> of{' '}
              <strong className="text-emerald-950">{exercise.name || 'your routine'}</strong>.
            </p>
          </div>

          {/* PAIN LEVEL SELECTOR (Visual & Responsive) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">
                Current Pain Level Experienced (0 = No Pain, 10 = Severe Pain):
              </label>
              <span
                className={`font-extrabold text-xs px-2 py-0.5 rounded-md border ${
                  painLevel <= 3
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : painLevel <= 6
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {painLevel} / 10
              </span>
            </div>

            {/* Pain Number Pills - Touch Friendly on Mobile */}
            <div className="grid grid-cols-11 gap-1 sm:gap-1.5 py-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = painLevel === num;
                const isMild = num <= 3;
                const isMod = num > 3 && num <= 6;

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPainLevel(num)}
                    className={`py-1.5 rounded-lg text-center font-bold text-xs transition-all ${
                      isSelected
                        ? isMild
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-1 scale-105'
                          : isMod
                          ? 'bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-1 scale-105'
                          : 'bg-rose-600 text-white ring-2 ring-rose-600 ring-offset-1 scale-105'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={0}
              max={10}
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600 touch-pan-x"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 (No Pain)</span>
              <span>5 (Moderate)</span>
              <span>10 (Severe)</span>
            </div>
          </div>

          {/* PERCEIVED DIFFICULTY SELECTOR */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">Perceived Exercise Difficulty</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {difficultyOptions.map((opt) => {
                const isSelected = difficulty === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDifficulty(opt)}
                    className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-sky-50 text-sky-700 border-sky-400 ring-1 ring-sky-400 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEEDBACK / NOTES FOR THERAPIST */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs">Feedback / Notes for Therapist</label>
            <textarea
              rows={3}
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="e.g. Mild tight sensation during last 2 reps..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* SUBMIT BUTTON CONTAINER */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Exercise Session...</span>
                </>
              ) : submitSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submitted Successfully!</span>
                </>
              ) : (
                <span>Submit Exercise Session</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowSurvey(false)}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-[11px] font-semibold text-center"
            >
              Review Session Details
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
