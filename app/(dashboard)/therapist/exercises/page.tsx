'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  Plus,
  Dumbbell,
  UserCheck,
  CheckCircle,
  ShieldAlert,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Refs for accessibility and auto-scrolling
  const formBodyRef = useRef<HTMLDivElement>(null);
  const errorAlertRef = useRef<HTMLDivElement>(null);

  // Exercise Form State
  const defaultExerciseForm = {
    name: '',
    category: 'Strength',
    difficulty: 'Moderate',
    targetArea: '',
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldDuration: 5,
    defaultRestDuration: 30,
    description: '',
    instructions: '',
    safetyInstructions: '',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
  };

  const [exerciseForm, setExerciseForm] = useState(defaultExerciseForm);

  // Multi-Patient Assign Form
  const [assignForm, setAssignForm] = useState({
    selectedPatientIds: [] as string[],
    sets: 3,
    reps: 10,
    holdDuration: 5,
    restDuration: 30,
    frequency: 'Daily',
    therapistNotes: '',
  });

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter]);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);

      const [resE, resP] = await Promise.all([
        fetch(`/api/exercises?${params.toString()}`),
        fetch('/api/patients'),
      ]);

      if (resE.ok) {
        const dE = await resE.json();
        setExercises(dE.exercises || []);
      }
      if (resP.ok) {
        const dP = await resP.json();
        setPatients(dP.patients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingExerciseId(null);
    setExerciseForm(defaultExerciseForm);
    setFormError('');
    setShowCreateModal(true);
  };

  // Open Edit Modal with Pre-filled Exercise Data
  const handleOpenEdit = (ex: any) => {
    setIsEditing(true);
    setEditingExerciseId(ex._id);
    setExerciseForm({
      name: ex.name || '',
      category: ex.category || 'Strength',
      difficulty: ex.difficulty || 'Moderate',
      targetArea: ex.targetArea || '',
      defaultSets: ex.defaultSets || 3,
      defaultReps: ex.defaultReps || 10,
      defaultHoldDuration: ex.defaultHoldDuration ?? 5,
      defaultRestDuration: ex.defaultRestDuration ?? 30,
      description: ex.description || '',
      instructions: ex.instructions || '',
      safetyInstructions: ex.safetyInstructions || '',
      imageUrl: ex.imageUrl || defaultExerciseForm.imageUrl,
    });
    setFormError('');
    setShowCreateModal(true);
  };

  // Handle Form HTML5 Validation Failure - smoothly scroll to first invalid field
  const handleFormInvalid = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
    }
  };

  // Handle Submit for both Create and Edit
  const handleSaveExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid') as HTMLElement;
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus({ preventScroll: true });
      }
      return;
    }

    try {
      const url = isEditing ? `/api/exercises/${editingExerciseId}` : '/api/exercises';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exerciseForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save exercise protocol');
      }

      setShowCreateModal(false);
      setExerciseForm(defaultExerciseForm);
      showNotification(isEditing ? `"${exerciseForm.name}" updated successfully!` : `"${exerciseForm.name}" created successfully!`);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
      setTimeout(() => {
        errorAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  // Open Delete Confirmation Modal
  const handlePromptDelete = (ex: any) => {
    setExerciseToDelete(ex);
    setShowDeleteModal(true);
  };

  // Execute Exercise Deletion
  const handleExecuteDelete = async () => {
    if (!exerciseToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/exercises/${exerciseToDelete._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete exercise');
      }

      setShowDeleteModal(false);
      showNotification(`"${exerciseToDelete.name}" removed from exercise library`);
      setExerciseToDelete(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting exercise');
    } finally {
      setIsDeleting(false);
    }
  };

  // Assign Modal Handlers
  const handleOpenAssignModal = (ex: any) => {
    setSelectedExercise(ex);
    setAssignForm({
      selectedPatientIds: [],
      sets: ex.defaultSets,
      reps: ex.defaultReps,
      holdDuration: ex.defaultHoldDuration ?? 0,
      restDuration: ex.defaultRestDuration ?? 30,
      frequency: 'Daily',
      therapistNotes: '',
    });
    setShowAssignModal(true);
  };

  const togglePatientSelection = (pId: string) => {
    setAssignForm((prev) => {
      const exists = prev.selectedPatientIds.includes(pId);
      return {
        ...prev,
        selectedPatientIds: exists
          ? prev.selectedPatientIds.filter((id) => id !== pId)
          : [...prev.selectedPatientIds, pId],
      };
    });
  };

  const handleAssignExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignForm.selectedPatientIds.length === 0 || !selectedExercise) return;

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientIds: assignForm.selectedPatientIds,
          exerciseId: selectedExercise._id,
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
        showNotification(`Assigned to ${assignForm.selectedPatientIds.length} patient(s)!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Exercise Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Clinical protocol library. Edit, delete, create, and prescribe exercises to patient rehabilitation plans.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" /> Create New Exercise
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search exercise name or target body area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus-visible:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus-visible:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Mobility">Mobility</option>
          <option value="Strength">Strength</option>
          <option value="Flexibility">Flexibility</option>
          <option value="Balance">Balance</option>
          <option value="Recovery">Recovery</option>
          <option value="Functional Training">Functional Training</option>
        </select>
      </div>

      {/* Exercise Cards Grid */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
              <Dumbbell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600">No exercises found.</p>
              <p className="text-xs text-slate-400 mt-1">Try another search or click "Create New Exercise".</p>
            </div>
          ) : (
            exercises.map((ex) => (
              <div
                key={ex._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image with Badges and Overlay Actions */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={ex.imageUrl}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <Badge variant="info">{ex.category}</Badge>
                      <Badge
                        variant={
                          ex.difficulty === 'Easy'
                            ? 'success'
                            : ex.difficulty === 'Moderate'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {ex.difficulty}
                      </Badge>
                    </div>

                    {/* Quick Action Buttons on Image Overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(ex)}
                        title="Edit Exercise"
                        className="p-2 bg-white/95 hover:bg-white text-slate-700 hover:text-sky-600 rounded-xl shadow-md transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePromptDelete(ex)}
                        title="Delete Exercise"
                        className="p-2 bg-white/95 hover:bg-white text-slate-700 hover:text-rose-600 rounded-xl shadow-md transition-all focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{ex.name}</h3>
                    <p className="text-xs text-sky-700 font-bold uppercase tracking-wider">
                      Target: {ex.targetArea}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ex.description}</p>

                    <div className="pt-2 flex items-center gap-3 text-xs font-semibold text-slate-700">
                      <span>
                        Default: <strong className="text-slate-900">{ex.defaultSets} Sets</strong>
                      </span>
                      <span>×</span>
                      <span>
                        <strong className="text-slate-900">{ex.defaultReps} Reps</strong>
                      </span>
                      {ex.defaultHoldDuration > 0 && (
                        <>
                          <span>•</span>
                          <span>Hold {ex.defaultHoldDuration}s</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer with Edit, Delete, and Assign */}
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(ex)}
                      title="Edit Exercise Protocol"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handlePromptDelete(ex)}
                      title="Delete Exercise Protocol"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenAssignModal(ex)}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE / EDIT EXERCISE MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={isEditing ? 'Edit Therapeutic Exercise Protocol' : 'Create New Therapeutic Exercise'}
        subtitle={
          isEditing
            ? `Modify clinical prescription defaults, instructions, and safety parameters for "${exerciseForm.name}"`
            : 'Add a clinically validated exercise protocol to your therapeutic library'
        }
        noBodyPadding
        customWidth="min(960px, calc(100vw - 32px))"
        maxHeight="calc(100dvh - 32px)"
      >
        <form
          onSubmit={handleSaveExercise}
          onInvalid={handleFormInvalid}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          {/* SECTION 2: SCROLLABLE FORM BODY */}
          <div
            ref={formBodyRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-7 space-y-4 text-xs"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Form Error Banner */}
            {formError && (
              <div
                ref={errorAlertRef}
                className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold flex items-center gap-2 text-xs animate-fade-in"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Exercise Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Exercise Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={exerciseForm.name}
                onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                placeholder="e.g. Knee Extension Isometric Hold"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-medium text-slate-900 focus-visible:outline-none"
              />
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={exerciseForm.category}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-slate-900 focus-visible:outline-none"
                >
                  <option value="Mobility">Mobility</option>
                  <option value="Strength">Strength</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Balance">Balance</option>
                  <option value="Recovery">Recovery</option>
                  <option value="Functional Training">Functional Training</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Difficulty Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={exerciseForm.difficulty}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, difficulty: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-slate-900 focus-visible:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Target Anatomical Area */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Anatomical Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={exerciseForm.targetArea}
                onChange={(e) => setExerciseForm({ ...exerciseForm, targetArea: e.target.value })}
                placeholder="e.g. Quadriceps / Patellar Tendon"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all font-medium text-slate-900 focus-visible:outline-none"
              />
            </div>

            {/* Grouped Prescription Parameters */}
            <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-sky-600" /> Default Prescription Parameters
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Standard clinical baseline</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Default Sets</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={exerciseForm.defaultSets}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, defaultSets: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Default Reps</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={exerciseForm.defaultReps}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, defaultReps: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Hold (Sec)</label>
                  <input
                    type="number"
                    min={0}
                    value={exerciseForm.defaultHoldDuration}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, defaultHoldDuration: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Rest (Sec)</label>
                  <input
                    type="number"
                    min={0}
                    value={exerciseForm.defaultRestDuration}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, defaultRestDuration: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Reference Image URL + Live Preview */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reference Image URL <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="text"
                  required
                  value={exerciseForm.imageUrl}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full sm:flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-mono text-[11px] text-slate-700 truncate focus-visible:outline-none"
                />
                {exerciseForm.imageUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm relative group">
                    <img
                      src={exerciseForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Long Text Fields: Clinical Guidance, Safety & Instructions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
              {/* Left Column: Description & Safety */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Clinical Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={exerciseForm.description}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                    placeholder="Primary therapeutic objective, targeted joint motion, clinical indications..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 resize-none text-slate-900 focus-visible:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Safety Precautions & Contraindications <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={exerciseForm.safetyInstructions}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, safetyInstructions: e.target.value })}
                    placeholder="Stop if sharp pain arises, maintain neutral spinal alignment, avoid compensatory pelvic tilt..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 resize-none text-slate-900 focus-visible:outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Step-by-Step Instructions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Step-by-Step Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={7}
                  required
                  value={exerciseForm.instructions}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, instructions: e.target.value })}
                  placeholder="1. Patient setup and initial posture&#10;2. Execution motion and contraction phase&#10;3. Hold duration adherence&#10;4. Controlled release and return to baseline..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 resize-none text-slate-900 focus-visible:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: FIXED FOOTER - Stays pinned at bottom, never scrolls */}
          <div
            className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex items-center justify-end gap-3 z-10"
            style={{ boxSizing: 'border-box' }}
          >
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/20 transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              {isEditing ? 'Save Exercise Changes' : 'Create Exercise Protocol'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Exercise Protocol"
        maxWidth="max-w-md"
      >
        {exerciseToDelete && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-rose-950">Confirm Permanent Deletion</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Are you sure you want to remove <strong className="text-rose-950">"{exerciseToDelete.name}"</strong>?
                </p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              This will remove this exercise from the active library. Existing historical session logs will retain their data, but therapists won't be able to assign this protocol to future plans.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Exercise'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MULTI-PATIENT ASSIGNMENT MODAL */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign ${selectedExercise?.name} to Patients`}
        subtitle="Select one or more patients and prescribe custom parameters"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAssignExercise} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-700">Select Patient(s) for Assignment</label>
              <span className="text-[11px] text-sky-600 font-semibold">
                {assignForm.selectedPatientIds.length} selected
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 divide-y divide-slate-100 bg-slate-50">
              {patients.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No active patients found</p>
              ) : (
                patients.map((p) => {
                  const isSelected = assignForm.selectedPatientIds.includes(p._id);
                  return (
                    <div
                      key={p._id}
                      onClick={() => togglePatientSelection(p._id)}
                      className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-100/80 border border-sky-300 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <span className="text-slate-900 font-bold">{p.userId?.name}</span>
                        <span className="text-[11px] text-slate-500 ml-2">({p.patientCode})</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100">
            <h4 className="font-bold text-sky-900 mb-2">Patient-Specific Prescription Parameters</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Prescribed Sets</label>
                <input
                  type="number"
                  min={1}
                  value={assignForm.sets}
                  onChange={(e) => setAssignForm({ ...assignForm, sets: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Prescribed Reps</label>
                <input
                  type="number"
                  min={1}
                  value={assignForm.reps}
                  onChange={(e) => setAssignForm({ ...assignForm, reps: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Hold (Sec)</label>
                <input
                  type="number"
                  min={0}
                  value={assignForm.holdDuration}
                  onChange={(e) => setAssignForm({ ...assignForm, holdDuration: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Rest (Sec)</label>
                <input
                  type="number"
                  min={0}
                  value={assignForm.restDuration}
                  onChange={(e) => setAssignForm({ ...assignForm, restDuration: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-3 pb-1 border-t border-slate-100 flex items-center justify-end gap-2 z-10">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignForm.selectedPatientIds.length === 0}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              Assign to Selected ({assignForm.selectedPatientIds.length})
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
