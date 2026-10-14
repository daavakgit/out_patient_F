'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Filter, CheckCircle2, ChevronRight, User, Calendar, ArrowRight, Award } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistRehabPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);

  const [form, setForm] = useState({
    patientId: '',
    name: '',
    expectedDurationWeeks: 12,
    goals: '',
    currentPhase: 1,
    therapistNotes: '',
  });

  const [phasePromotion, setPhasePromotion] = useState(2);

  useEffect(() => {
    fetchPlans();
    fetchPatients();
  }, []);

  const fetchPlans = async () => {
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

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const json = await res.json();
        setPatients(json.patients || []);
      }
    } catch (e) {}
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: form.patientId,
          name: form.name,
          expectedDurationWeeks: Number(form.expectedDurationWeeks),
          goals: form.goals.split('\n').filter((g) => g.trim().length > 0),
          currentPhase: Number(form.currentPhase),
          therapistNotes: form.therapistNotes,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setForm({
          patientId: '',
          name: '',
          expectedDurationWeeks: 12,
          goals: '',
          currentPhase: 1,
          therapistNotes: '',
        });
        fetchPlans();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create plan');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handlePromotePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    try {
      const res = await fetch(`/api/plans/${selectedPlan._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPhase: Number(phasePromotion),
        }),
      });

      if (res.ok) {
        setShowPhaseModal(false);
        fetchPlans();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = plans.filter((p) => {
    const pName = p.patientId?.userId?.name?.toLowerCase() || '';
    const planName = p.name?.toLowerCase() || '';
    const q = search.toLowerCase();
    return pName.includes(q) || planName.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Rehabilitation Journey Plans</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clinical phased pathways from acute pain management to full discharge and normal activity.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Rehabilitation Plan
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search plans by patient name or plan title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              No rehabilitation plans found. Click &quot;Create Rehabilitation Plan&quot; to begin.
            </div>
          ) : (
            filtered.map((plan) => (
              <div
                key={plan._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-5"
              >
                {/* Plan Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-lg">
                      {plan.patientId?.userId?.name?.substring(0, 2).toUpperCase() || 'PT'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900">{plan.name}</h3>
                        <Badge variant="success">{plan.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Patient: <strong className="text-slate-900">{plan.patientId?.userId?.name}</strong> (
                        {plan.patientId?.patientCode}) • Duration: {plan.expectedDurationWeeks} Weeks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setPhasePromotion(Math.min(4, plan.currentPhase + 1));
                        setShowPhaseModal(true);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Advance Phase
                    </button>
                    <Link
                      href={`/therapist/patients/${plan.patientId?._id}`}
                      className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-sky-200"
                    >
                      Patient Profile <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 4 Phases Progression Grid */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    4-Phase Rehabilitation Pathway
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(plan.phases || []).map((ph: any) => {
                      const isCurrent = ph.phaseNumber === plan.currentPhase;
                      const isCompleted = ph.phaseNumber < plan.currentPhase || ph.status === 'COMPLETED';
                      return (
                        <div
                          key={ph._id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'bg-sky-50 border-sky-400 shadow-sm ring-2 ring-sky-500/20'
                              : isCompleted
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Phase {ph.phaseNumber}
                            </span>
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isCurrent ? (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                                Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Upcoming</span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 mt-2">{ph.name}</h4>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{ph.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plan Goals & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">Clinical Milestones / Goals</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {(plan.goals || []).map((g: string, i: number) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">Therapist Clinical Notes</span>
                    <p className="text-slate-600 leading-relaxed italic">
                      {plan.therapistNotes || 'No special modifications noted for this plan.'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Rehabilitation Plan">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Patient</label>
            <select
              required
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name} ({p.patientCode} - {p.medicalHistory?.reasonForVisit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Plan Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Right ACL Graft Kinetic Recovery"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Duration (Weeks)</label>
              <input
                type="number"
                min={1}
                max={52}
                required
                value={form.expectedDurationWeeks}
                onChange={(e) => setForm({ ...form, expectedDurationWeeks: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Starting Phase</label>
              <select
                value={form.currentPhase}
                onChange={(e) => setForm({ ...form, currentPhase: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
              >
                <option value={1}>Phase 1: Pain Management & Mobility</option>
                <option value={2}>Phase 2: Strength Development</option>
                <option value={3}>Phase 3: Functional Recovery</option>
                <option value={4}>Phase 4: Return to Normal Activity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Goals (One per line)</label>
            <textarea
              rows={3}
              placeholder="Restore terminal knee extension&#10;Quad limb symmetry index > 80%&#10;Independent stair ambulation"
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Directives / Notes</label>
            <textarea
              rows={2}
              value={form.therapistNotes}
              onChange={(e) => setForm({ ...form, therapistNotes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl shadow">
              Assign & Create Plan
            </button>
          </div>
        </form>
      </Modal>

      {/* ADVANCE PHASE MODAL */}
      <Modal
        isOpen={showPhaseModal}
        onClose={() => setShowPhaseModal(false)}
        title={`Promote Phase: ${selectedPlan?.patientId?.userId?.name}`}
      >
        <form onSubmit={handlePromotePhase} className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Advancing the rehabilitation phase updates the patient&apos;s active protocol and automatically notifies the patient of their milestone achievement.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Target Rehabilitation Phase</label>
            <select
              value={phasePromotion}
              onChange={(e) => setPhasePromotion(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
            >
              <option value={1}>Phase 1: Pain Management & Mobility</option>
              <option value={2}>Phase 2: Strength Development</option>
              <option value={3}>Phase 3: Functional Recovery</option>
              <option value={4}>Phase 4: Return to Normal Activity</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPhaseModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
              Confirm Phase Promotion
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
