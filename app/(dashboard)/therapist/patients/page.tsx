'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  UserPlus,
  Filter,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Lock,
  ExternalLink,
  Sparkles,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
  X,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistPatientRosterPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Multi-step Add Patient Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password visibility & clipboard state
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showStep4Password, setShowStep4Password] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedStep4, setCopiedStep4] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Success Modal State after registration
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    patientCode: string;
    id: string;
  } | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Toast feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Edit Patient State
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [editTab, setEditTab] = useState<'basic' | 'clinical' | 'medical'>('basic');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const initialEditFormData = {
    name: '',
    email: '',
    portalPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    emergencyContact: '',
    status: 'ON_TRACK',
    currentPhase: 1,
    adherenceScore: 100,
    reasonForVisit: '',
    affectedBodyPart: '',
    currentSymptoms: '',
    initialPainScore: 5,
    previousInjury: '',
    previousSurgery: '',
    relevantMedicalHistory: '',
    currentMedications: '',
    referringPhysician: '',
    assessmentNotes: '',
    functionalObservations: '',
    therapistNotes: '',
  };

  const [editFormData, setEditFormData] = useState(initialEditFormData);

  // Delete Patient State
  const [deletingPatient, setDeletingPatient] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const initialFormData = {
    // Step 1: Basic
    name: '',
    email: '',
    password: 'password123',
    dateOfBirth: '1995-04-12',
    gender: 'Male',
    phone: '+1 (555) 345-6789',
    address: '456 Healthcare Ave, Boston MA',
    emergencyContact: 'Jane Doe - +1 (555) 345-6790',

    // Step 2: Medical
    reasonForVisit: 'General Outpatient Physical Therapy',
    affectedBodyPart: 'Left Knee Quadriceps',
    currentSymptoms: 'Moderate stiffness, pain on weight bearing',
    initialPainScore: 5,
    previousInjury: 'Meniscus tear 2025',
    previousSurgery: 'Left Knee Arthroscopy',
    relevantMedicalHistory: 'None',
    currentMedications: 'Ibuprofen 400mg',
    referringPhysician: 'Dr. Arthur Pendelton, MD',

    // Step 3: Assessment
    assessmentNotes: 'Mild quad lag. Range of motion 15-95 degrees.',
    functionalObservations: 'Gait shows slight antalgic limp on left side.',
    initialGoals: ['Restore full extension 0 deg', 'Increase quad strength LSI > 80%'],
    recommendedPhase: 1,
    therapistNotes: 'Compliant patient, recommended 3x weekly home exercise routine.',

    // Step 4: Consent
    consentGiven: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchPatients();
  }, [search, statusFilter]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/patients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
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
    const text = `RehabPulse Patient Portal Login:\nPatient Name: ${p.userId?.name || 'Patient'}\nEmail ID: ${p.userId?.email}\nPassword: ${p.portalPassword || 'password123'}\nPortal URL: ${origin}/login`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(p._id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const copyStep4Credentials = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `RehabPulse Patient Portal Login:\nPatient Name: ${formData.name || 'Patient'}\nEmail ID: ${formData.email}\nPassword: ${formData.password || 'password123'}\nPortal URL: ${origin}/login`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedStep4(true);
      setTimeout(() => setCopiedStep4(false), 2500);
    }
  };

  const copySuccessCredentials = () => {
    if (!createdCredentials) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `RehabPulse Patient Portal Login:\nPatient Name: ${createdCredentials.name}\nPatient ID: ${createdCredentials.patientCode}\nEmail ID: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nPortal URL: ${origin}/login`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.consentGiven) {
      setFormError('Patient consent and privacy acknowledgement are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register patient');

      setCreatedCredentials({
        name: data.patient?.name || formData.name,
        email: data.patient?.email || formData.email,
        password: data.patient?.password || formData.password || 'password123',
        patientCode: data.patient?.patientCode || '',
        id: data.patient?.id || '',
      });

      setShowAddModal(false);
      setShowSuccessModal(true);
      setStep(1);
      setFormData(initialFormData);
      showToast('Patient intake completed successfully!');
      fetchPatients();
    } catch (err: any) {
      setFormError(err.message || 'Error creating patient profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (p: any) => {
    setEditingPatient(p);
    setEditError('');
    setEditTab('basic');
    setShowEditPassword(false);
    setEditFormData({
      name: p.userId?.name || '',
      email: p.userId?.email || '',
      portalPassword: p.portalPassword || 'password123',
      phone: p.phone || '',
      dateOfBirth: p.dateOfBirth || '',
      gender: p.gender || 'Male',
      address: p.address || '',
      emergencyContact: p.emergencyContact || '',
      status: p.status || 'ON_TRACK',
      currentPhase: p.currentPhase || 1,
      adherenceScore: p.adherenceScore !== undefined ? p.adherenceScore : 100,
      reasonForVisit: p.medicalHistory?.reasonForVisit || '',
      affectedBodyPart: p.medicalHistory?.affectedBodyPart || '',
      currentSymptoms: p.medicalHistory?.currentSymptoms || '',
      initialPainScore: p.medicalHistory?.initialPainScore ?? 5,
      previousInjury: p.medicalHistory?.previousInjury || '',
      previousSurgery: p.medicalHistory?.previousSurgery || '',
      relevantMedicalHistory: p.medicalHistory?.relevantMedicalHistory || '',
      currentMedications: p.medicalHistory?.currentMedications || '',
      referringPhysician: p.medicalHistory?.referringPhysician || '',
      assessmentNotes: p.initialAssessment?.assessmentNotes || '',
      functionalObservations: p.initialAssessment?.functionalObservations || '',
      therapistNotes: p.initialAssessment?.therapistNotes || '',
    });
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    setEditError('');
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/patients/${editingPatient._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update patient profile');

      setEditingPatient(null);
      showToast(`Updated profile for ${editFormData.name || 'patient'} successfully!`);
      fetchPatients();
    } catch (err: any) {
      setEditError(err.message || 'Error updating patient');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPatient) return;
    setDeleteError('');
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/patients/${deletingPatient._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete patient');

      const deletedName = deletingPatient.userId?.name || 'Patient';
      setDeletingPatient(null);
      showToast(`Patient record "${deletedName}" was deleted permanently.`);
      fetchPatients();
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting patient record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-emerald-500">
          <CheckCircle className="w-4 h-4 text-emerald-100" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Roster</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized physical therapy patients, portal credentials, and clinical progress.
          </p>
        </div>
        <button
          onClick={() => {
            setStep(1);
            setFormData(initialFormData);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Patient (Multi-Step Intake)
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, ID code, or medical condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
        >
          <option value="ALL">All Clinical Statuses</option>
          <option value="ON_TRACK">ON_TRACK</option>
          <option value="IMPROVING">IMPROVING</option>
          <option value="NEEDS_ATTENTION">NEEDS_ATTENTION</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* Roster Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-3">Patient Name</th>
                  <th className="px-2.5 py-3">Code</th>
                  <th className="px-3 py-3">Login Credentials</th>
                  <th className="px-3 py-3">Condition</th>
                  <th className="px-2.5 py-3">Phase</th>
                  <th className="px-2.5 py-3">Adherence</th>
                  <th className="px-2.5 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No patients found matching your search.
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => {
                    const password = p.portalPassword || 'password123';
                    const isPassVisible = !!visiblePasswords[p._id];
                    const isCopied = copiedId === p._id;

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[11px] shadow-xs shrink-0">
                              {p.userId?.name?.substring(0, 2).toUpperCase() || 'PT'}
                            </div>
                            <div className="min-w-0">
                              <span className="block font-bold text-slate-900 truncate max-w-[130px]">{p.userId?.name || 'Unknown'}</span>
                              <span className="text-[10px] text-slate-400 font-normal truncate block max-w-[130px]">{p.userId?.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-2.5 py-3 font-mono font-bold text-slate-700 text-[11px] whitespace-nowrap">{p.patientCode}</td>

                        {/* Portal Login Credentials Column */}
                        <td className="px-3 py-3">
                          <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-1.5 max-w-[185px] space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              <span className="text-slate-600 font-semibold truncate max-w-[130px]" title={p.userId?.email}>
                                {p.userId?.email || 'No email'}
                              </span>
                              <button
                                onClick={() => copyPatientCredentials(p)}
                                title="Copy all login credentials"
                                className="p-0.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded transition-colors shrink-0"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                <Key className="w-2.5 h-2.5 text-amber-500 shrink-0" />
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

                        <td className="px-3 py-3 font-medium text-slate-800 max-w-[150px]">
                          <span className="line-clamp-2 text-[11px] leading-tight" title={p.medicalHistory?.reasonForVisit}>
                            {p.medicalHistory?.reasonForVisit || 'Rehabilitation'}
                          </span>
                        </td>
                        <td className="px-2.5 py-3 font-semibold text-slate-800 text-[11px] whitespace-nowrap">Phase {p.currentPhase || 1}</td>
                        <td className="px-2.5 py-3 font-extrabold text-sky-700 text-xs whitespace-nowrap">{p.adherenceScore || 100}%</td>
                        <td className="px-2.5 py-3 whitespace-nowrap">
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
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                            <a
                              href={`/therapist/patients/${p._id}`}
                              className="px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/70 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                              title="Open Clinical Workspace"
                            >
                              <span>Workspace</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="px-2 py-1 bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 border border-slate-200 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
                              title="Edit Patient Information"
                            >
                              <Pencil className="w-3 h-3 text-amber-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingPatient(p)}
                              className="px-2 py-1 bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
                              title="Delete Patient Record"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Delete</span>
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

      {/* Multi-Step Intake Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Patient Clinical Intake — Step ${step} of 4`}>
        <div className="space-y-4">
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between gap-2 mb-4 text-xs font-semibold text-slate-600">
            <span className={step >= 1 ? 'text-sky-600 font-bold' : ''}>1. Basic Info</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-sky-600 font-bold' : ''}>2. Medical History</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-sky-600 font-bold' : ''}>3. Assessment</span>
            <span>→</span>
            <span className={step >= 4 ? 'text-sky-600 font-bold' : ''}>4. Consent & Credentials</span>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
              {formError}
            </div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. David Miller"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email ID (Patient Portal Login) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="david@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Temporary Portal Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordInput ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="password123"
                      className="w-full pl-3 pr-10 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInput(!showPasswordInput)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Patient uses this to sign in</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Name & Phone"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Address"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  Next: Medical Info <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Medical Info */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit / Diagnosis</label>
                <input
                  type="text"
                  required
                  value={formData.reasonForVisit}
                  onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                  placeholder="e.g. Post-Op Knee Arthroscopy"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Affected Body Part</label>
                  <input
                    type="text"
                    required
                    value={formData.affectedBodyPart}
                    onChange={(e) => setFormData({ ...formData, affectedBodyPart: e.target.value })}
                    placeholder="e.g. Right Knee Quadriceps"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Pain Score (0-10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={formData.initialPainScore}
                    onChange={(e) => setFormData({ ...formData, initialPainScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Symptoms & History</label>
                <textarea
                  rows={2}
                  value={formData.currentSymptoms}
                  onChange={(e) => setFormData({ ...formData, currentSymptoms: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  placeholder="Describe current pain, stiffness or functional limitations..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  Next: Initial Assessment <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Initial Assessment */}
          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Assessment Notes</label>
                <textarea
                  rows={2}
                  value={formData.assessmentNotes}
                  onChange={(e) => setFormData({ ...formData, assessmentNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  placeholder="Physical examination notes, ROM measurements..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Functional Observations</label>
                <textarea
                  rows={2}
                  value={formData.functionalObservations}
                  onChange={(e) => setFormData({ ...formData, functionalObservations: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  placeholder="Gait patterns, posture observations..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Starting Phase</label>
                <select
                  value={formData.recommendedPhase}
                  onChange={(e) => setFormData({ ...formData, recommendedPhase: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                >
                  <option value={1}>Phase 1: Pain Management & Mobility</option>
                  <option value={2}>Phase 2: Strength Development</option>
                  <option value={3}>Phase 3: Functional Recovery</option>
                  <option value={4}>Phase 4: Return to Normal Activity</option>
                </select>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  Next: Consent & Save <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Consent & Complete */}
          {step === 4 && (
            <form onSubmit={handleCreatePatient} className="space-y-4 animate-fade-in">
              {/* Onboarding Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Patient Onboarding Summary</h4>
                <p className="text-slate-600 leading-relaxed">
                  Registering patient <strong className="text-slate-900">{formData.name || 'New Patient'}</strong> for{' '}
                  <strong className="text-slate-900">
                    {formData.reasonForVisit?.trim() || 'General Outpatient Rehabilitation'}
                  </strong>.
                </p>
                <p className="text-slate-500 text-[11px]">
                  An initial Rehabilitation Plan and default milestones will be generated automatically.
                </p>
              </div>

              {/* PATIENT PORTAL LOGIN CREDENTIALS CARD */}
              <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl text-xs space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-600 text-white rounded-lg shadow-xs">
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sky-950">Patient Portal Login Credentials</h4>
                      <p className="text-[10px] text-sky-700">Patient will use these credentials to access their exercise portal</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copyStep4Credentials}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-xl text-[11px] font-bold transition-all shadow-2xs"
                  >
                    {copiedStep4 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep4 ? 'Copied!' : 'Copy Details'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Name</span>
                    <span className="font-extrabold text-slate-900 truncate block mt-0.5 text-xs">
                      {formData.name || 'Not provided'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email ID (Login ID)</span>
                    <span className="font-bold text-sky-700 truncate block mt-0.5 text-xs">
                      {formData.email || 'Not provided'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Portal Password</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-extrabold text-slate-900 text-xs">
                        {showStep4Password ? (formData.password || 'password123') : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowStep4Password(!showStep4Password)}
                        className="text-[10px] text-sky-600 font-bold hover:underline"
                      >
                        {showStep4Password ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-sky-900 pt-1 border-t border-sky-200/60">
                  <span className="font-medium">
                    Patient Login Portal: <strong className="font-mono text-sky-950">/login</strong>
                  </span>
                  <span className="text-[10px] text-slate-500">Immediate access upon submission</span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consentCheck"
                  checked={formData.consentGiven}
                  onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="consentCheck" className="text-xs text-slate-700 font-medium leading-relaxed">
                  I confirm that patient consent and HIPAA privacy acknowledgements have been collected and documented.
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.consentGiven}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Complete Patient Intake'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* REGISTRATION SUCCESS & CREDENTIALS MODAL */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Patient Intake Completed Successfully"
      >
        {createdCredentials && (
          <div className="space-y-4 text-xs animate-fade-in">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950">Patient Workspace Initialized</h4>
                <p className="text-xs text-emerald-700">
                  Registered <strong className="text-emerald-950">{createdCredentials.name}</strong> ({createdCredentials.patientCode}).
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" /> Patient Portal Access Credentials
                </span>
                <button
                  onClick={copySuccessCredentials}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  {copiedSuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSuccess ? 'Credentials Copied!' : 'Copy Credentials'}</span>
                </button>
              </div>

              <div className="space-y-2 font-mono text-xs bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-sans text-slate-500 font-semibold">Patient Name:</span>
                  <span className="font-bold text-slate-900">{createdCredentials.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-sans text-slate-500 font-semibold">Patient ID:</span>
                  <span className="font-bold text-sky-700">{createdCredentials.patientCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-sans text-slate-500 font-semibold">Email ID (Login ID):</span>
                  <span className="font-bold text-slate-900">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-sans text-slate-500 font-semibold">Login Password:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {createdCredentials.password}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-sans text-slate-500 font-semibold">Patient Portal URL:</span>
                  <span className="font-bold text-sky-700">/login</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Close & Return to Roster
              </button>
              {createdCredentials.id && (
                <a
                  href={`/therapist/patients/${createdCredentials.id}`}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <span>Open Clinical Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT PATIENT CLINICAL MODAL */}
      <Modal
        isOpen={!!editingPatient}
        onClose={() => {
          if (!isUpdating) {
            setEditingPatient(null);
            setEditError('');
          }
        }}
        title={`Edit Patient — ${editingPatient?.userId?.name || 'Clinical Profile'}`}
        subtitle={`Patient Code: ${editingPatient?.patientCode || ''} | Modifying clinical record and credentials`}
        maxWidth="max-w-2xl"
      >
        {editingPatient && (
          <form onSubmit={handleUpdatePatient} className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 gap-1 pb-1">
              <button
                type="button"
                onClick={() => setEditTab('basic')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  editTab === 'basic'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                1. Identity & Credentials
              </button>
              <button
                type="button"
                onClick={() => setEditTab('clinical')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  editTab === 'clinical'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                2. Clinical Status & Phase
              </button>
              <button
                type="button"
                onClick={() => setEditTab('medical')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  editTab === 'medical'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                3. Medical & Assessment
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {editError}
              </div>
            )}

            {/* TAB 1: Identity & Credentials */}
            {editTab === 'basic' && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Address (Portal Login) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Portal Login Password
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editFormData.portalPassword}
                        onChange={(e) => setEditFormData({ ...editFormData, portalPassword: e.target.value })}
                        placeholder="Leave blank or change password"
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Changing this immediately updates their /login password</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editFormData.dateOfBirth}
                      onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      value={editFormData.emergencyContact}
                      onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                      placeholder="Name & Contact Phone"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Clinical Status & Phase */}
            {editTab === 'clinical' && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Clinical Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="ON_TRACK">ON_TRACK (Progressing Well)</option>
                      <option value="IMPROVING">IMPROVING (Positive Trend)</option>
                      <option value="NEEDS_ATTENTION">NEEDS_ATTENTION (Action Required)</option>
                      <option value="INACTIVE">INACTIVE (Discharged or Paused)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Rehabilitation Phase</label>
                    <select
                      value={editFormData.currentPhase}
                      onChange={(e) => setEditFormData({ ...editFormData, currentPhase: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    >
                      <option value={1}>Phase 1: Pain Management & Mobility</option>
                      <option value={2}>Phase 2: Strength Development</option>
                      <option value={3}>Phase 3: Functional Recovery</option>
                      <option value={4}>Phase 4: Return to Normal Activity</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-slate-700">Protocol Adherence Score</label>
                      <span className="font-extrabold text-sky-700">{editFormData.adherenceScore}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editFormData.adherenceScore}
                        onChange={(e) => setEditFormData({ ...editFormData, adherenceScore: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editFormData.adherenceScore}
                        onChange={(e) => setEditFormData({ ...editFormData, adherenceScore: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        className="w-16 px-2 py-1 text-center font-bold bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-slate-700">Pain Level (VAS 0-10)</label>
                      <span className="font-extrabold text-amber-700">{editFormData.initialPainScore} / 10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={editFormData.initialPainScore}
                        onChange={(e) => setEditFormData({ ...editFormData, initialPainScore: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={editFormData.initialPainScore}
                        onChange={(e) => setEditFormData({ ...editFormData, initialPainScore: Math.min(10, Math.max(0, Number(e.target.value))) })}
                        className="w-16 px-2 py-1 text-center font-bold bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinical Assessment Notes</label>
                  <textarea
                    rows={3}
                    value={editFormData.assessmentNotes}
                    onChange={(e) => setEditFormData({ ...editFormData, assessmentNotes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    placeholder="Physical examination notes, range of motion, muscle strength..."
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Medical & Assessment */}
            {editTab === 'medical' && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rehabilitation Diagnosis / Reason for Visit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.reasonForVisit}
                    onChange={(e) => setEditFormData({ ...editFormData, reasonForVisit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g. Post-Op ACL Reconstruction (Right Knee)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Affected Body Part / Joint</label>
                    <input
                      type="text"
                      value={editFormData.affectedBodyPart}
                      onChange={(e) => setEditFormData({ ...editFormData, affectedBodyPart: e.target.value })}
                      placeholder="e.g. Right Knee Patellar Tendon"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Referring Physician</label>
                    <input
                      type="text"
                      value={editFormData.referringPhysician}
                      onChange={(e) => setEditFormData({ ...editFormData, referringPhysician: e.target.value })}
                      placeholder="Dr. Arthur Pendelton, MD"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Symptoms & Limitations</label>
                  <textarea
                    rows={2}
                    value={editFormData.currentSymptoms}
                    onChange={(e) => setEditFormData({ ...editFormData, currentSymptoms: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    placeholder="Pain on weight bearing, stiffness in morning..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Functional Observations & Gait</label>
                  <textarea
                    rows={2}
                    value={editFormData.functionalObservations}
                    onChange={(e) => setEditFormData({ ...editFormData, functionalObservations: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    placeholder="Antalgic limp, compensation patterns observed..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Therapist Notes & Recommendations</label>
                  <textarea
                    rows={2}
                    value={editFormData.therapistNotes}
                    onChange={(e) => setEditFormData({ ...editFormData, therapistNotes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                    placeholder="Home exercise adherence notes, precautions..."
                  />
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => {
                  setEditingPatient(null);
                  setEditError('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {editTab === 'basic' && (
                  <button
                    type="button"
                    onClick={() => setEditTab('clinical')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-300"
                  >
                    <span>Next: Clinical</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {editTab === 'clinical' && (
                  <button
                    type="button"
                    onClick={() => setEditTab('medical')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-300"
                  >
                    <span>Next: Medical</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving Changes...' : 'Save Patient Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE PATIENT CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingPatient}
        onClose={() => {
          if (!isDeleting) {
            setDeletingPatient(null);
            setDeleteError('');
          }
        }}
        title="Delete Patient Record"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900">
            <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-extrabold text-sm text-rose-950">Permanent Deletion Warning</h4>
              <p className="text-rose-700 leading-relaxed">
                Are you sure you want to permanently delete patient{' '}
                <strong className="text-rose-950 font-bold">{deletingPatient?.userId?.name || 'this patient'}</strong>?
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Patient Code:</span>
              <span className="font-mono font-bold text-slate-900">{deletingPatient?.patientCode}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Portal Email:</span>
              <span className="font-medium text-slate-900">{deletingPatient?.userId?.email}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Condition:</span>
              <span className="font-medium text-slate-900 truncate max-w-[200px]">
                {deletingPatient?.medicalHistory?.reasonForVisit || 'Rehabilitation'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            This will permanently remove the patient login credentials, rehabilitation plans, assigned exercises, recorded workout sessions, appointments, and progress logs.
          </p>

          {deleteError && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded-xl font-semibold">
              {deleteError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setDeletingPatient(null);
                setDeleteError('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Permanently Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
