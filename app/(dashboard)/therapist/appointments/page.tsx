'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, User, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    patientId: '',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'Follow-up Evaluation',
    notes: '',
  });

  const appointmentTypes = [
    'Initial Clinical Assessment',
    'Follow-up Evaluation',
    'Rehabilitation Progress Check',
    'Phase Advancement Review',
    'Manual Therapy Session',
    'Final Discharge Evaluation',
  ];

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const json = await res.json();
        setAppointments(json.appointments || []);
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
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        setForm({
          patientId: '',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00 AM',
          type: 'Follow-up Evaluation',
          notes: '',
        });
        fetchAppointments();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to schedule appointment');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Appointment Schedule</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage outpatient clinical consultations, evaluations, and progress reviews.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ ...form, patientId: patients[0]?._id || '' });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Schedule Clinical Session
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              No appointments scheduled. Click &quot;Schedule Clinical Session&quot; to book an appointment.
            </div>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <Badge variant={apt.status === 'SCHEDULED' ? 'info' : apt.status === 'COMPLETED' ? 'success' : 'danger'}>
                      {apt.status}
                    </Badge>
                    <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl">
                      {apt.time}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 mt-3">{apt.type}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-900">{apt.patientId?.userId?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      Notes: {apt.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`/therapist/patients/${apt.patientId?._id}`}
                    className="font-bold text-sky-600 hover:text-sky-800"
                  >
                    View Patient Hub →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SCHEDULE MODAL */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Schedule Clinical Appointment">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Appointment Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
              <input
                type="text"
                required
                placeholder="e.g. 10:30 AM"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Consultation Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
            >
              {appointmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Preparation / Clinical Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Goniometer measurement required for terminal extension"
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
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
