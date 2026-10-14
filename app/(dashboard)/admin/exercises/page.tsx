'use client';

import React, { useEffect, useState } from 'react';
import { Dumbbell, Plus, Search, Filter, Trash2, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function AdminGlobalExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Strength',
    difficulty: 'Moderate',
    targetArea: 'Knee Quadriceps',
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldDuration: 5,
    defaultRestDuration: 30,
    description: '',
    instructions: '',
    safetyInstructions: '',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
  });

  const categories = ['Mobility', 'Strength', 'Flexibility', 'Balance', 'Recovery', 'Functional Training'];
  const difficulties = ['Easy', 'Moderate', 'Hard'];

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exercises');
      if (res.ok) {
        const json = await res.json();
        setExercises(json.exercises || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedExerciseId(null);
    setForm({
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
    });
    setShowModal(true);
  };

  const handleOpenEdit = (ex: any) => {
    setIsEditing(true);
    setSelectedExerciseId(ex._id);
    setForm({
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      targetArea: ex.targetArea,
      defaultSets: ex.defaultSets,
      defaultReps: ex.defaultReps,
      defaultHoldDuration: ex.defaultHoldDuration || 0,
      defaultRestDuration: ex.defaultRestDuration || 30,
      description: ex.description,
      instructions: ex.instructions,
      safetyInstructions: ex.safetyInstructions,
      imageUrl: ex.imageUrl,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/exercises/${selectedExerciseId}` : '/api/exercises';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        fetchExercises();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the global therapeutic library?`)) return;

    try {
      const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchExercises();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = exercises.filter((ex) => {
    const matchSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.targetArea.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || ex.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Global Therapeutic Exercise Bank</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System-wide repository of clinically validated protocols available for therapist assignment.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Global Exercise
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercises by name or anatomical target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exercise Cards */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ex) => (
            <div
              key={ex._id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <img
                  src={ex.imageUrl}
                  alt={ex.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge variant="info">{ex.category}</Badge>
                  <Badge variant={ex.difficulty === 'Easy' ? 'success' : ex.difficulty === 'Moderate' ? 'warning' : 'danger'}>
                    {ex.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{ex.name}</h3>
                  <p className="text-xs font-bold text-sky-700 mt-1">Target: {ex.targetArea}</p>
                  <div className="mt-2 text-xs text-slate-500 font-medium">
                    Default Protocol: <strong className="text-slate-800">{ex.defaultSets} Sets × {ex.defaultReps} Reps</strong>
                    {ex.defaultHoldDuration ? ` (Hold: ${ex.defaultHoldDuration}s)` : ''}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{ex.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Global Template</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(ex)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(ex._id, ex.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Global Therapeutic Exercise' : 'Create New Global Exercise'}
        subtitle="Manage validated therapeutic exercises available across the entire clinical system"
        noBodyPadding
        customWidth="min(960px, calc(100vw - 32px))"
        maxHeight="calc(100dvh - 32px)"
      >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ boxSizing: 'border-box' }}>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-7 space-y-4 text-xs" style={{ boxSizing: 'border-box' }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Core Parameters (7 cols) */}
              <div className="lg:col-span-7 space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Exercise Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quad Sets with Towel Roll"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Anatomical Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Knee Quadriceps"
                    value={form.targetArea}
                    onChange={(e) => setForm({ ...form, targetArea: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium text-slate-900"
                >
                  {difficulties.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Prescription Metrics */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                    Prescription Defaults
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Global Protocol Baseline</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Default Sets</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={form.defaultSets}
                      onChange={(e) => setForm({ ...form, defaultSets: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Default Reps</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={form.defaultReps}
                      onChange={(e) => setForm({ ...form, defaultReps: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Hold (Sec)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.defaultHoldDuration}
                      onChange={(e) => setForm({ ...form, defaultHoldDuration: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Rest (Sec)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.defaultRestDuration}
                      onChange={(e) => setForm({ ...form, defaultRestDuration: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reference Image URL + Preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reference Image URL</label>
                <div className="flex gap-2.5 items-center">
                  <input
                    type="url"
                    required
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-mono text-[11px] text-slate-700 truncate"
                  />
                  {form.imageUrl && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm">
                      <img
                        src={form.imageUrl}
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
            </div>

            {/* Right Column: Descriptions & Instructions (5 cols) */}
            <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clinical Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Primary therapeutic objective, muscle activation goals..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 resize-none text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Execution Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="1. Posture setup&#10;2. Isometric contraction&#10;3. Controlled release..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 resize-none text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Safety & Contraindication Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.safetyInstructions}
                  onChange={(e) => setForm({ ...form, safetyInstructions: e.target.value })}
                  placeholder="Precautions and contraindication criteria..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 resize-none text-slate-900"
                />
              </div>
            </div>
          </div>

          </div>

          {/* Pinned Footer */}
          <div
            className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex items-center justify-end gap-3 z-10"
            style={{ boxSizing: 'border-box' }}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
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
    </div>
  );
}
