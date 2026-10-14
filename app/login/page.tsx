'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Lock, Mail, ShieldCheck, Stethoscope, UserCheck, Database, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store in tab-specific sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('rehabpulse_active_portal', data.user.role);
        if (data.token) {
          sessionStorage.setItem('rehabpulse_tab_token', data.token);
        }
      }

      // Redirect based on role
      const role = data.user.role;
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'THERAPIST') router.push('/therapist/dashboard');
      else if (role === 'PATIENT') router.push('/patient/dashboard');
      else router.push('/login');

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (eMail: string, pass: string = 'password123') => {
    setEmail(eMail);
    setPassword(pass);
    setError('');
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedSuccess('');
    setError('');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedSuccess('Demo database seeded successfully with Admin, Therapist & Patients!');
      } else {
        throw new Error(data.error || 'Seeding failed');
      }
    } catch (err: any) {
      setError(err.message || 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl medical-gradient flex items-center justify-center text-white shadow-xl ring-4 ring-sky-500/20">
            <HeartPulse className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">RehabPulse</h2>
        <p className="mt-1 text-center text-xs text-slate-400 font-medium">
          Outpatient Physical Therapy Rehabilitation Milestone Tracker & Patient Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {seedSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">
              {seedSuccess}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rehabpulse.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white medical-gradient hover:opacity-95 shadow-lg shadow-sky-500/25 focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Portal <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Access Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              Select Demo Account Role
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@rehabpulse.com')}
                className="flex items-center justify-center gap-1.5 p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-semibold border border-purple-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Admin
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('therapist@rehabpulse.com')}
                className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-semibold border border-blue-200 transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                Therapist
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('patient@rehabpulse.com')}
                className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Patient A
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('patient2@rehabpulse.com')}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-medium underline"
              >
                Or try Patient B (Elena Rostova)
              </button>

              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
              >
                <Database className="w-3 h-3" />
                {seeding ? 'Seeding DB...' : 'Re-seed Demo DB'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
