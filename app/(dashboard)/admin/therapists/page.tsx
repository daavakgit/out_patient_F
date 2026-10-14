'use client';

import React, { useEffect, useState } from 'react';
import { Stethoscope, Plus, Search, Filter, Eye, Edit2, CheckCircle2, XCircle, Users, Phone, Building } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function AdminTherapistDirectoryPage() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [detailedTherapist, setDetailedTherapist] = useState<any>(null);

  // Form states
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    position: 'Senior Physiotherapist',
    department: 'Outpatient Physical Therapy & Sports Medicine',
    specialization: 'Post-Operative Orthopedics & Knee Rehabilitation',
    phone: '+1 (555) 019-2000',
  });

  const positions = [
    'Physiotherapist',
    'Senior Physiotherapist',
    'Orthopedic Physiotherapist',
    'Rehabilitation Specialist',
    'Sports Physiotherapist',
  ];

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/therapists');
      if (res.ok) {
        const json = await res.json();
        setTherapists(json.therapists || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/therapists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setForm({
          name: '',
          email: '',
          password: 'password123',
          position: 'Senior Physiotherapist',
          department: 'Outpatient Physical Therapy & Sports Medicine',
          specialization: 'Post-Operative Orthopedics & Knee Rehabilitation',
          phone: '',
        });
        fetchTherapists();
      } else {
        alert(data.error || 'Failed to add therapist');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapist) return;
    try {
      const res = await fetch(`/api/therapists/${selectedTherapist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: form.position,
          department: form.department,
          specialization: form.specialization,
          phone: form.phone,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchTherapists();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (t: any) => {
    const currentStatus = t.user?.status || 'ACTIVE';
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/therapists/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTherapists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openViewDetails = async (t: any) => {
    try {
      const res = await fetch(`/api/therapists/${t.id}`);
      if (res.ok) {
        const json = await res.json();
        setDetailedTherapist(json.therapist);
        setViewDetailsModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (t: any) => {
    setSelectedTherapist(t);
    setForm({
      name: t.user?.name || '',
      email: t.user?.email || '',
      password: '',
      position: t.position || 'Senior Physiotherapist',
      department: t.department || '',
      specialization: t.specialization || '',
      phone: t.phone || '',
    });
    setShowEditModal(true);
  };

  const filtered = therapists.filter((t) => {
    const name = t.user?.name?.toLowerCase() || '';
    const email = t.user?.email?.toLowerCase() || '';
    const pos = t.position?.toLowerCase() || '';
    const dept = t.department?.toLowerCase() || '';
    const query = search.toLowerCase();
    return name.includes(query) || email.includes(query) || pos.includes(query) || dept.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Therapist Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage clinical staff, assigned positions, hospital departments, and patient caseloads.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Therapist
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search therapist by name, position, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Therapists Cards Grid */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                      {t.user?.name?.substring(0, 2).toUpperCase() || 'DR'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{t.user?.name}</h3>
                      <p className="text-xs text-sky-700 font-bold">{t.position}</p>
                    </div>
                  </div>
                  <Badge variant={t.user?.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {t.user?.status || 'ACTIVE'}
                  </Badge>
                </div>

                <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{t.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-500">{t.phone || 'Phone not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">{t.patientCount} Active Patients</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-700">Specialization:</strong> {t.specialization}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openViewDetails(t)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900"
                >
                  <Eye className="w-3.5 h-3.5" /> View Patients ({t.patientCount})
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                    title="Edit Therapist"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(t)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      t.user?.status === 'ACTIVE'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {t.user?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD THERAPIST MODAL */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Therapist">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name with Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Jennifer Adams, DPT"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="jennifer@rehabpulse.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Position / Title</label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
              >
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 019-3344"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              required
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Specialization</label>
            <textarea
              rows={2}
              required
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl shadow">
              Create Therapist Account
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit Therapist: ${form.name}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Position / Title</label>
            <select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
            >
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              required
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Specialization</label>
            <textarea
              rows={2}
              required
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl shadow">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS & ASSIGNED PATIENTS MODAL */}
      <Modal
        isOpen={viewDetailsModal}
        onClose={() => setViewDetailsModal(false)}
        title={detailedTherapist?.userId?.name || 'Therapist Profile'}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-extrabold text-sm text-slate-900">{detailedTherapist?.userId?.name}</div>
            <div className="text-sky-700 font-bold">{detailedTherapist?.position}</div>
            <div className="text-slate-500 mt-1">{detailedTherapist?.department}</div>
            <div className="text-slate-600 mt-2 font-medium">
              <strong>Specialization:</strong> {detailedTherapist?.specialization}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              Assigned Patients ({detailedTherapist?.assignedPatients?.length || 0})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(detailedTherapist?.assignedPatients || []).length === 0 ? (
                <p className="text-slate-400 italic">No patients assigned yet.</p>
              ) : (
                detailedTherapist.assignedPatients.map((p: any) => (
                  <div
                    key={p._id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{p.userId?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.patientCode} • Phase {p.currentPhase || 1} • {p.medicalHistory?.reasonForVisit}
                      </div>
                    </div>
                    <Badge
                      variant={
                        p.status === 'ON_TRACK'
                          ? 'success'
                          : p.status === 'IMPROVING'
                          ? 'info'
                          : p.status === 'NEEDS_ATTENTION'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
