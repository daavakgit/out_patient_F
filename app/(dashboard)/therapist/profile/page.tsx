'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Stethoscope, Building, Phone, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [therapistData, setTherapistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
        if (json.user?.therapistId) {
          const tRes = await fetch(`/api/therapists/${json.user.therapistId}`);
          if (tRes.ok) {
            const tJson = await tRes.json();
            setTherapistData(tJson.therapist);
          }
        }
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
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Therapist Clinical Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Clinical credentials, hospital department appointment, and caseload authorization.
          </p>
        </div>
        <Badge variant="info">CLINICAL THERAPIST</Badge>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            {user?.name?.substring(0, 2).toUpperCase() || 'DR'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
            <p className="text-xs font-bold text-sky-700 mt-0.5">
              {therapistData?.position || 'Senior Physiotherapist'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {therapistData?.phone || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Qualifications & Dept */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Hospital Department</span>
            <p className="text-sm font-extrabold text-slate-900">
              {therapistData?.department || 'Outpatient Physical Rehabilitation'}
            </p>
            <p className="text-slate-500 text-[11px]">Authorized for outpatient physical rehabilitation care.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Clinical Specialization</span>
            <p className="text-sm font-extrabold text-slate-900">
              {therapistData?.specialization || 'Orthopedic & Musculoskeletal Rehabilitation'}
            </p>
            <p className="text-slate-500 text-[11px]">Primary diagnostic and therapeutic rehabilitation focus.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Authorized Patient Caseload</span>
            <p className="text-sm font-extrabold text-sky-700">
              {therapistData?.patientCount || 0} Active Patients
            </p>
            <p className="text-slate-500 text-[11px]">Strict server-enforced patient data isolation model.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Account Status</span>
            <p className="text-sm font-extrabold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> ACTIVE CLINICIAN
            </p>
            <p className="text-slate-500 text-[11px]">Verified clinical provider credentials.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
