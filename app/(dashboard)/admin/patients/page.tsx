'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Key,
  Copy,
  Check,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

export default function AdminPatientDirectoryPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'adherence' | 'phase'>('name');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const json = await res.json();
        setPatients(json.patients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPatientCredentials = (p: any) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `RehabPulse Patient Portal Login:\nPatient Name: ${p.userId?.name || 'Patient'}\nPatient ID: ${p.patientCode}\nEmail ID: ${p.userId?.email}\nPassword: ${p.portalPassword || 'password123'}\nPortal URL: ${origin}/login`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(p._id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDeactivate = async (patientId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'INACTIVE' ? 'ON_TRACK' : 'INACTIVE';
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchPatients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = patients
    .filter((p) => {
      const name = p.userId?.name?.toLowerCase() || '';
      const email = p.userId?.email?.toLowerCase() || '';
      const code = p.patientCode?.toLowerCase() || '';
      const condition = p.medicalHistory?.reasonForVisit?.toLowerCase() || '';
      const query = search.toLowerCase();
      const matchesSearch = name.includes(query) || email.includes(query) || code.includes(query) || condition.includes(query);
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.userId?.name || '').localeCompare(b.userId?.name || '');
      if (sortBy === 'adherence') return (b.adherenceScore || 0) - (a.adherenceScore || 0);
      if (sortBy === 'phase') return (b.currentPhase || 1) - (a.currentPhase || 1);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global management, portal credentials, and adherence telemetry for all registered rehabilitation patients.
          </p>
        </div>
        <button
          onClick={fetchPatients}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, ID (e.g. PAT-1001), condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ON_TRACK">On Track</option>
            <option value="IMPROVING">Improving</option>
            <option value="NEEDS_ATTENTION">Needs Attention</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 ml-2">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="name">Name</option>
            <option value="adherence">Adherence</option>
            <option value="phase">Current Phase</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Patient ID</th>
                  <th className="p-4">Portal Login Credentials</th>
                  <th className="p-4">Assigned Therapist</th>
                  <th className="p-4">Current Phase</th>
                  <th className="p-4">Adherence</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No patients found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const password = p.portalPassword || 'password123';
                    const isPassVisible = !!visiblePasswords[p._id];
                    const isCopied = copiedId === p._id;

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0">
                              {p.userId?.name?.substring(0, 2).toUpperCase() || 'PT'}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">{p.userId?.name}</div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{p.medicalHistory?.reasonForVisit}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-bold text-slate-700">{p.patientCode}</td>

                        {/* Portal Login Credentials */}
                        <td className="p-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 max-w-[210px] space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between gap-1 text-[11px]">
                              <span className="text-slate-600 font-semibold truncate max-w-[140px]" title={p.userId?.email}>
                                {p.userId?.email || 'No email'}
                              </span>
                              <button
                                onClick={() => copyPatientCredentials(p)}
                                title="Copy all login credentials"
                                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded transition-colors"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-1.5 pt-0.5">
                              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                <Key className="w-3 h-3 text-amber-500 shrink-0" />
                                <span className="font-bold">{isPassVisible ? password : '••••••••'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(p._id)}
                                className="text-[10px] text-sky-600 hover:text-sky-800 font-bold hover:underline"
                              >
                                {isPassVisible ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-slate-800">
                            {p.therapistId?.userId?.name || 'Assigned Therapist'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            Phase {p.currentPhase || 1}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${p.adherenceScore || 100}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-900">{p.adherenceScore || 100}%</span>
                          </div>
                        </td>

                        <td className="p-4">
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
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/therapist/patients/${p._id}`}
                              className="p-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-600 rounded-lg transition-colors"
                              title="View Clinical Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeactivate(p._id, p.status)}
                              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                                p.status === 'INACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              {p.status === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
