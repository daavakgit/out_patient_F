'use client';

import React, { useEffect, useState } from 'react';
import { Award, Plus, Search, Filter, CheckCircle2, Clock, Check, Edit2, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistMilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);

  const [form, setForm] = useState({
    patientId: '',
    name: '',
    description: '',
    criteria: '',
    phaseNumber: 1,
    status: 'IN_PROGRESS',
    notes: '',
  });

  useEffect(() => {
    fetchMilestones();
    fetchPatients();
  }, [selectedPatientId]);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const url =
        selectedPatientId && selectedPatientId !== 'ALL'
          ? `/api/milestones?patientId=${selectedPatientId}`
          : '/api/milestones';
      const res = await fetch(url);
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

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const json = await res.json();
        setPatients(json.patients || []);
      }
    } catch (e) {}
  };

  const handleOpenAdd = () => {
    setEditingMilestoneId(null);
    setForm({
      patientId: patients[0]?._id || '',
      name: '',
      description: '',
      criteria: '',
      phaseNumber: 1,
      status: 'IN_PROGRESS',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingMilestoneId(m._id);
    setForm({
      patientId: m.patientId?._id || m.patientId,
      name: m.name,
      description: m.description,
      criteria: m.criteria || '',
      phaseNumber: m.phaseNumber,
      status: m.status,
      notes: m.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMilestoneId ? `/api/milestones/${editingMilestoneId}` : '/api/milestones';
      const method = editingMilestoneId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        fetchMilestones();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save milestone');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleMarkAchieved = async (id: string) => {
    try {
      const res = await fetch(`/api/milestones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (res.ok) {
        fetchMilestones();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = milestones.filter((m) => {
    const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Milestone Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track objective rehabilitation milestones, functional mobility targets, and discharge clearance.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500">Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 w-full md:w-64"
          >
            <option value="ALL">All Authorized Patients</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.userId?.name} ({p.patientCode})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {/* Milestones Cards */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              No clinical milestones found. Click &quot;Add Milestone&quot; to set new criteria.
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m._id}
                className={`bg-white rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
                  m.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Phase {m.phaseNumber} Target
                    </span>
                    <Badge
                      variant={
                        m.status === 'COMPLETED' ? 'success' : m.status === 'IN_PROGRESS' ? 'info' : 'neutral'
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 mt-3">{m.name}</h3>
                  <p className="text-xs text-sky-700 font-bold mt-0.5">
                    Patient: {m.patientId?.userId?.name || 'Assigned Patient'}
                  </p>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.description}</p>

                  {m.criteria && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                      <strong className="text-slate-800">Criteria:</strong> {m.criteria}
                    </div>
                  )}

                  {m.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 italic">
                      Notes: {m.notes}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {m.completedDate ? `Achieved on ${new Date(m.completedDate).toLocaleDateString()}` : 'In Review'}
                  </span>

                  <div className="flex items-center gap-2">
                    {m.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleMarkAchieved(m._id)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-emerald-200"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Achieved
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                      title="Edit Milestone"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMilestoneId ? 'Edit Clinical Milestone' : 'Add Clinical Milestone'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!editingMilestoneId && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Patient</label>
              <select
                required
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
              >
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.userId?.name} ({p.patientCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Milestone Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Full Active Extension (0°)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rehabilitation Phase</label>
              <select
                value={form.phaseNumber}
                onChange={(e) => setForm({ ...form, phaseNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option value={1}>Phase 1: Pain & Mobility</option>
                <option value={2}>Phase 2: Strength</option>
                <option value={3}>Phase 3: Functional</option>
                <option value={4}>Phase 4: Discharge</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option value="NOT_STARTED">NOT_STARTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ON_HOLD">ON_HOLD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Measurable Objective Criteria</label>
            <input
              type="text"
              placeholder="e.g. Goniometer measurement 0 deg without pain lag"
              value={form.criteria}
              onChange={(e) => setForm({ ...form, criteria: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Therapist Clinical Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl shadow">
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
