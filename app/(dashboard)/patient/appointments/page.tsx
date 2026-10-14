'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [form, setForm] = useState({
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '11:00 AM',
    type: 'Follow-up Progress Review',
    notes: '',
  });

  useEffect(() => {
    fetchAppointments();
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

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For patient, appointment POST attaches patientId from session
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'current', // handled in endpoint
          date: form.date,
          time: form.time,
          type: form.type,
          notes: form.notes,
        }),
      });

      if (res.ok) {
        setShowRequestModal(false);
        fetchAppointments();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to request appointment');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Appointments</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scheduled in-person and telehealth consultations with your physical therapist.
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Request Appointment
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              No clinical appointments scheduled. Click &quot;Request Appointment&quot; to coordinate with your therapist.
            </div>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <Badge variant={apt.status === 'SCHEDULED' ? 'info' : 'success'}>{apt.status}</Badge>
                    <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl">
                      {apt.time}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 mt-3">{apt.type}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Therapist:{' '}
                        <strong className="text-slate-900">
                          {apt.therapistId?.userId?.name || 'Assigned Therapist'}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(apt.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      Instructions: {apt.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Please arrive 5 mins early</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REQUEST APPOINTMENT MODAL */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Clinical Appointment">
        <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Preferred Time Slot</label>
            <input
              type="text"
              required
              placeholder="e.g. 10:00 AM or 02:30 PM"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Consultation</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
            >
              <option value="Follow-up Progress Review">Follow-up Progress Review</option>
              <option value="Pain Flare-up Evaluation">Pain Flare-up Evaluation</option>
              <option value="Phase Advancement Assessment">Phase Advancement Assessment</option>
              <option value="Exercise Form Check">Exercise Form Check</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Additional Notes for Therapist</label>
            <textarea
              rows={2}
              placeholder="e.g. Would like to review wall squats technique"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRequestModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl shadow">
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
