'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  FileText,
  Activity,
  FileSpreadsheet,
  Dumbbell,
  PlayCircle,
  TrendingUp,
  Target,
  Calendar,
  MessageSquare,
  StickyNote,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  PlusCircle,
  Pencil,
  Trash2,
  Save,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistPatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  // Interactive Action Modal states inside Patient Hub
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [globalExercises, setGlobalExercises] = useState<any[]>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Edit patient state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState<'basic' | 'clinical' | 'medical'>('basic');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
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
  });

  // Delete patient state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Assign exercise form
  const [assignForm, setAssignForm] = useState({
    exerciseId: '',
    sets: 3,
    reps: 10,
    holdDuration: 5,
    restDuration: 30,
    frequency: 'Daily',
    therapistNotes: '',
  });

  // Milestone form
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    phaseNumber: 1,
    status: 'IN_PROGRESS',
  });

  // Chat input
  const [chatMessage, setChatMessage] = useState('');

  useEffect(() => {
    fetchPatientHubData();
    fetchGlobalExercises();
  }, [patientId]);

  const fetchPatientHubData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load patient profile');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalExercises = async () => {
    try {
      const res = await fetch('/api/exercises');
      if (res.ok) {
        const json = await res.json();
        setGlobalExercises(json.exercises || []);
      }
    } catch (e) {}
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientIds: [patientId],
          exerciseId: assignForm.exerciseId,
          sets: assignForm.sets,
          reps: assignForm.reps,
          holdDuration: assignForm.holdDuration,
          restDuration: assignForm.restDuration,
          frequency: assignForm.frequency,
          therapistNotes: assignForm.therapistNotes,
        }),
      });
      if (res.ok) {
        setShowAssignModal(false);
        fetchPatientHubData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          name: milestoneForm.name,
          description: milestoneForm.description,
          phaseNumber: milestoneForm.phaseNumber,
          status: milestoneForm.status,
        }),
      });
      if (res.ok) {
        setShowMilestoneModal(false);
        fetchPatientHubData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !patient?.userId?._id) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: patient.userId._id,
          patientId,
          content: chatMessage,
        }),
      });
      if (res.ok) {
        setChatMessage('');
        fetchPatientHubData();
      }
    } catch (e) {}
  };

  const openEditModal = () => {
    if (!patient) return;
    setEditError('');
    setEditTab('basic');
    setShowEditPassword(false);
    setEditFormData({
      name: patient.userId?.name || '',
      email: patient.userId?.email || '',
      portalPassword: patient.portalPassword || 'password123',
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || 'Male',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      status: patient.status || 'ON_TRACK',
      currentPhase: patient.currentPhase || 1,
      adherenceScore: patient.adherenceScore !== undefined ? patient.adherenceScore : 100,
      reasonForVisit: patient.medicalHistory?.reasonForVisit || '',
      affectedBodyPart: patient.medicalHistory?.affectedBodyPart || '',
      currentSymptoms: patient.medicalHistory?.currentSymptoms || '',
      initialPainScore: patient.medicalHistory?.initialPainScore ?? 5,
      previousInjury: patient.medicalHistory?.previousInjury || '',
      previousSurgery: patient.medicalHistory?.previousSurgery || '',
      relevantMedicalHistory: patient.medicalHistory?.relevantMedicalHistory || '',
      currentMedications: patient.medicalHistory?.currentMedications || '',
      referringPhysician: patient.medicalHistory?.referringPhysician || '',
      assessmentNotes: patient.initialAssessment?.assessmentNotes || '',
      functionalObservations: patient.initialAssessment?.functionalObservations || '',
      therapistNotes: patient.initialAssessment?.therapistNotes || '',
    });
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update patient');

      setShowEditModal(false);
      showToast('Patient profile updated successfully!');
      fetchPatientHubData();
    } catch (err: any) {
      setEditError(err.message || 'Error updating patient');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete patient');

      setShowDeleteModal(false);
      router.push('/therapist/patients');
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting patient');
      setIsDeleting(false);
    }
  };

  if (loading) return <CardSkeleton />;
  if (error) return <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl font-bold">{error}</div>;

  const patient = data?.patient || {};
  const plans = data?.plans || [];
  const phases = data?.phases || [];
  const assignments = data?.assignments || [];
  const sessions = data?.sessions || [];
  const milestones = data?.milestones || [];
  const appointments = data?.appointments || [];
  const messages = data?.messages || [];

  const tabs = [
    'Overview',
    'Medical Information',
    'Assessment',
    'Rehabilitation Plan',
    'Exercises',
    'Sessions',
    'Progress',
    'Milestones',
    'Appointments',
    'Messages',
    'Notes',
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-emerald-500">
          <CheckCircle className="w-4 h-4 text-emerald-100" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Patient Header Workspace Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md">
            {patient.userId?.name?.substring(0, 2).toUpperCase() || 'PT'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-slate-900">{patient.userId?.name}</h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                {patient.patientCode}
              </span>
              <Badge
                variant={
                  patient.status === 'ON_TRACK'
                    ? 'success'
                    : patient.status === 'IMPROVING'
                    ? 'info'
                    : patient.status === 'NEEDS_ATTENTION'
                    ? 'danger'
                    : 'neutral'
                }
              >
                {patient.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Condition: <strong className="text-slate-800">{patient.medicalHistory?.reasonForVisit}</strong> | Current Phase:{' '}
              <strong className="text-sky-700">Phase {patient.currentPhase || 1}</strong> | Adherence:{' '}
              <strong className="text-emerald-600">{patient.adherenceScore || 100}%</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Assign Exercise
          </button>
          <button
            onClick={() => setShowMilestoneModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Target className="w-4 h-4" /> Add Milestone
          </button>
          <button
            onClick={openEditModal}
            className="px-3.5 py-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
            title="Edit Patient Clinical Profile"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-600" /> Edit Patient
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
            title="Delete Patient Record"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete Patient
          </button>
        </div>
      </div>

      {/* 11 Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm overflow-x-auto flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT (ALL STRICTLY SCOPED TO THIS PATIENT ONLY) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                <p className="text-xs text-sky-700 font-bold uppercase tracking-wider">Reason for Visit</p>
                <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                  {patient.medicalHistory?.reasonForVisit}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Affected area: {patient.medicalHistory?.affectedBodyPart}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Rehabilitation Progress</p>
                <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                  Phase {patient.currentPhase} of 4 Active
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {assignments.length} assigned exercises protocol
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">Patient Adherence</p>
                <h4 className="text-sm font-extrabold text-slate-900 mt-1">{patient.adherenceScore || 100}% Score</h4>
                <p className="text-xs text-slate-600 mt-1">{sessions.length} completed sessions logged</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Assigned Patient Exercises ({assignments.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignments.map((a: any) => (
                  <div key={a._id} className="p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <img
                      src={a.exerciseId?.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200'}
                      alt={a.exerciseId?.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{a.exerciseId?.name}</h4>
                      <p className="text-xs text-sky-700 font-bold mt-0.5">
                        {a.sets} Sets × {a.reps} Reps ({a.frequency})
                      </p>
                      <p className="text-[11px] text-slate-500">Hold: {a.holdDuration}s | Rest: {a.restDuration}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEDICAL INFORMATION TAB */}
        {activeTab === 'Medical Information' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Medical History Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase mb-1">Diagnosis</span>
                <p className="text-slate-900 font-semibold">{patient.medicalHistory?.reasonForVisit}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase mb-1">Affected Area</span>
                <p className="text-slate-900 font-semibold">{patient.medicalHistory?.affectedBodyPart}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase mb-1">Previous Surgeries</span>
                <p className="text-slate-900">{patient.medicalHistory?.previousSurgery || 'None'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase mb-1">Current Medications</span>
                <p className="text-slate-900">{patient.medicalHistory?.currentMedications || 'None'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ASSESSMENT TAB */}
        {activeTab === 'Assessment' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Initial Clinical Assessment</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <span className="font-bold text-slate-500 uppercase block mb-1">Assessment Notes</span>
                <p className="text-slate-900 leading-relaxed">{patient.initialAssessment?.assessmentNotes}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block mb-1">Functional Observations</span>
                <p className="text-slate-900 leading-relaxed">{patient.initialAssessment?.functionalObservations}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block mb-1">Initial Pain Score</span>
                <p className="text-rose-600 font-extrabold text-sm">
                  {patient.initialAssessment?.initialPainScore}/10
                </p>
              </div>
            </div>
          </div>
        )}

        {/* REHABILITATION PLAN TAB */}
        {activeTab === 'Rehabilitation Plan' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Rehabilitation Plan & Phases</h3>
            {plans.map((plan: any) => (
              <div key={plan._id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">{plan.name}</h4>
                  <Badge variant="success">{plan.status}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {phases.map((ph: any) => (
                    <div
                      key={ph._id}
                      className={`p-3 rounded-xl border text-xs ${
                        ph.status === 'IN_PROGRESS'
                          ? 'bg-sky-50 border-sky-300 font-bold text-sky-900'
                          : ph.status === 'COMPLETED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="font-bold">Phase {ph.phaseNumber}</div>
                      <div className="text-[11px] mt-0.5">{ph.name}</div>
                      <div className="text-[10px] uppercase font-semibold mt-2">{ph.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EXERCISES TAB */}
        {activeTab === 'Exercises' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Patient-Specific Exercise Assignments</h3>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold"
              >
                + Assign Exercise
              </button>
            </div>
            <div className="space-y-3">
              {assignments.map((a: any) => (
                <div key={a._id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={a.exerciseId?.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200'}
                      alt={a.exerciseId?.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{a.exerciseId?.name}</h4>
                      <p className="text-xs text-sky-700 font-bold">
                        {a.sets} Sets × {a.reps} Reps | {a.frequency}
                      </p>
                      {a.therapistNotes && (
                        <p className="text-xs text-slate-500 italic mt-0.5">Notes: {a.therapistNotes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'Sessions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Session History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Exercise</th>
                    <th className="p-3">Sets Completed</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Pain Level</th>
                    <th className="p-3">Difficulty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s: any) => (
                    <tr key={s._id}>
                      <td className="p-3 font-semibold">{new Date(s.startTime).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-slate-900">{s.exerciseId?.name || 'Exercise'}</td>
                      <td className="p-3">{s.completedSets} / {s.targetSets} Sets</td>
                      <td className="p-3 font-mono">{Math.floor(s.duration / 60)}m {s.duration % 60}s</td>
                      <td className="p-3 font-extrabold text-rose-600">{s.painLevel || 0} / 10</td>
                      <td className="p-3"><Badge variant="info">{s.difficulty || 'Moderate'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'Progress' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Progress & Adherence Analytics</h3>
            <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-lg text-slate-900">{patient.adherenceScore}% Overall Adherence</h4>
                <p className="text-slate-600 mt-1">Calculated from total completed sessions vs assigned protocols.</p>
              </div>
            </div>
          </div>
        )}

        {/* MILESTONES TAB */}
        {activeTab === 'Milestones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Clinical Milestones</h3>
              <button
                onClick={() => setShowMilestoneModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                + Add Milestone
              </button>
            </div>
            <div className="space-y-3">
              {milestones.map((m: any) => (
                <div key={m._id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-sky-600">Phase {m.phaseNumber}</span>
                    <h4 className="font-bold text-sm text-slate-900">{m.name}</h4>
                    <p className="text-xs text-slate-500">{m.description}</p>
                  </div>
                  <Badge variant={m.status === 'COMPLETED' ? 'success' : m.status === 'IN_PROGRESS' ? 'info' : 'neutral'}>
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'Appointments' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Scheduled Appointments</h3>
            <div className="space-y-2">
              {appointments.map((apt: any) => (
                <div key={apt._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{apt.type}</div>
                    <div className="text-slate-500">{new Date(apt.date).toLocaleDateString()} at {apt.time}</div>
                  </div>
                  <Badge variant="info">{apt.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'Messages' && (
          <div className="space-y-4 flex flex-col h-96">
            <h3 className="text-sm font-bold text-slate-900">Patient Direct Messaging</h3>
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {messages.map((msg: any) => (
                <div
                  key={msg._id}
                  className={`p-3 rounded-2xl text-xs max-w-sm ${
                    msg.senderId?._id === patient.userId?._id
                      ? 'bg-white border border-slate-200 text-slate-900 self-start'
                      : 'bg-sky-600 text-white self-end ml-auto'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-[10px] opacity-70 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type message to patient..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
              <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold">
                Send
              </button>
            </form>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'Notes' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Therapist Clinical Notes</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-slate-700 leading-relaxed font-medium">
                {patient.initialAssessment?.therapistNotes || 'No extra clinical notes.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ASSIGN EXERCISE MODAL */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title={`Assign Exercise to ${patient.userId?.name}`}>
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Therapeutic Exercise</label>
            <select
              required
              value={assignForm.exerciseId}
              onChange={(e) => setAssignForm({ ...assignForm, exerciseId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            >
              <option value="">-- Choose Exercise --</option>
              {globalExercises.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.name} ({ex.targetArea})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sets</label>
              <input
                type="number"
                min={1}
                value={assignForm.sets}
                onChange={(e) => setAssignForm({ ...assignForm, sets: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reps</label>
              <input
                type="number"
                min={1}
                value={assignForm.reps}
                onChange={(e) => setAssignForm({ ...assignForm, reps: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hold Duration (Sec)</label>
              <input
                type="number"
                min={0}
                value={assignForm.holdDuration}
                onChange={(e) => setAssignForm({ ...assignForm, holdDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Frequency</label>
              <input
                type="text"
                value={assignForm.frequency}
                onChange={(e) => setAssignForm({ ...assignForm, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl">
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD MILESTONE MODAL */}
      <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Clinical Milestone">
        <form onSubmit={handleMilestoneSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Milestone Name</label>
            <input
              type="text"
              required
              value={milestoneForm.name}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              placeholder="e.g. Active Extension 0 deg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Criteria</label>
            <textarea
              rows={2}
              required
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phase</label>
              <select
                value={milestoneForm.phaseNumber}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, phaseNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option value={1}>Phase 1</option>
                <option value={2}>Phase 2</option>
                <option value={3}>Phase 3</option>
                <option value={4}>Phase 4</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={milestoneForm.status}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option value="NOT_STARTED">NOT_STARTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowMilestoneModal(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl">
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PATIENT CLINICAL MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          if (!isUpdating) {
            setShowEditModal(false);
            setEditError('');
          }
        }}
        title={`Edit Patient — ${patient.userId?.name || 'Clinical Profile'}`}
        subtitle={`Patient Code: ${patient.patientCode || ''} | Modifying clinical record and credentials`}
        maxWidth="max-w-2xl"
      >
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
                  <label className="block font-bold text-slate-700 mb-1">Portal Login Password</label>
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
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Changing this immediately updates their /login password
                  </span>
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
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          adherenceScore: Math.min(100, Math.max(0, Number(e.target.value))),
                        })
                      }
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
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          initialPainScore: Math.min(10, Math.max(0, Number(e.target.value))),
                        })
                      }
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
                setShowEditModal(false);
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
      </Modal>

      {/* DELETE PATIENT CONFIRMATION MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
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
                <strong className="text-rose-950 font-bold">{patient.userId?.name || 'this patient'}</strong>?
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Patient Code:</span>
              <span className="font-mono font-bold text-slate-900">{patient.patientCode}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Portal Email:</span>
              <span className="font-medium text-slate-900">{patient.userId?.email}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-semibold">Condition:</span>
              <span className="font-medium text-slate-900 truncate max-w-[200px]">
                {patient.medicalHistory?.reasonForVisit || 'Rehabilitation'}
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
                setShowDeleteModal(false);
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
