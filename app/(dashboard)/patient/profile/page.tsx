'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, HeartPulse, ShieldCheck, Stethoscope, Award, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [resU, resP] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/patients'),
      ]);

      if (resU.ok) {
        const jU = await resU.json();
        setUser(jU.user);
      }

      if (resP.ok) {
        const jP = await resP.json();
        const list = jP.patients || [];
        if (list.length > 0) setPatient(list[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Patient Personal Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Rehabilitation journey identity, emergency contacts, and medical history.
          </p>
        </div>
        <Badge variant="success">ACTIVE REHABILITATION</Badge>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            {user?.name?.substring(0, 2).toUpperCase() || 'PT'}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-extrabold border border-sky-200">
                {patient?.patientCode || 'N/A'}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Diagnosis: <strong className="text-slate-800">{patient?.medicalHistory?.reasonForVisit || 'Pending clinical assessment'}</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {patient?.phone || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Assigned Physical Therapist</span>
            <p className="text-sm font-extrabold text-slate-900">
              {patient?.therapistId?.userId?.name || 'Not assigned yet'}
            </p>
            <p className="text-slate-500 text-[11px]">
              {patient?.therapistId ? 'Senior Physiotherapist • Outpatient Orthopedics' : 'Care team assignment pending'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Current Rehabilitation Phase</span>
            <p className="text-sm font-extrabold text-sky-700">
              Phase {patient?.currentPhase || 1} Active
            </p>
            <p className="text-slate-500 text-[11px]">Overall Adherence: {patient?.adherenceScore ?? 0}%</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Affected Anatomical Area</span>
            <p className="text-sm font-extrabold text-slate-900">
              {patient?.medicalHistory?.affectedBodyPart || 'Not specified'}
            </p>
            <p className="text-slate-500 text-[11px]">Initial Pain Baseline: {patient?.medicalHistory?.initialPainScore ?? 0}/10</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Emergency Contact</span>
            <p className="text-sm font-extrabold text-slate-900">
              {patient?.emergencyContact || 'None provided'}
            </p>
            <p className="text-slate-500 text-[11px]">Clinical emergency notification recipient.</p>
          </div>
        </div>

        {/* Address & Medical History Details */}
        <div className="p-5 bg-sky-50/50 rounded-2xl border border-sky-100 text-xs space-y-2">
          <span className="font-bold text-sky-900 uppercase tracking-wider block">
            Relevant Clinical History & Previous Surgeries
          </span>
          <p className="text-slate-700 leading-relaxed">
            {patient?.medicalHistory?.previousSurgery
              ? `Previous Surgery: ${patient.medicalHistory.previousSurgery}. `
              : ''}
            {patient?.medicalHistory?.previousInjury
              ? `Prior Injury: ${patient.medicalHistory.previousInjury}. `
              : ''}
            {patient?.medicalHistory?.currentMedications
              ? `Current Medications: ${patient.medicalHistory.currentMedications}.`
              : 'No medications reported.'}
          </p>
        </div>
      </div>
    </div>
  );
}
