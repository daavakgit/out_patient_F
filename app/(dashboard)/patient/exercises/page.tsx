'use client';

import React, { useEffect, useState } from 'react';
import { Dumbbell, PlayCircle, Clock } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientExercisesPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Rehabilitation Exercises</h1>
        <p className="text-xs text-slate-500 mt-1">
          Your personal prescribed physical therapy protocols assigned by your therapist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <Dumbbell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-slate-800">No Prescribed Exercises Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your physical therapist has not assigned active rehabilitation exercises to your plan yet. Your protocols will appear here once prescribed.
            </p>
          </div>
        ) : (
          assignments.map((a) => {
            const ex = a.exerciseId || {};
            return (
              <div key={a._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative h-44 w-full bg-slate-100">
                    <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-1">
                      <Badge variant="info">{ex.category}</Badge>
                      <Badge variant="success">{a.frequency}</Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-base">{ex.name}</h3>
                    <p className="text-xs text-sky-700 font-bold uppercase">Target: {ex.targetArea}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{ex.description}</p>

                    <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-700">
                      <span>Prescribed: <strong className="text-slate-900">{a.sets} Sets</strong></span>
                      <span>×</span>
                      <span><strong className="text-slate-900">{a.reps} Reps</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <a
                    href={`/patient/sessions/live?assignmentId=${a._id}`}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <PlayCircle className="w-4 h-4" /> Start Exercise Session
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
