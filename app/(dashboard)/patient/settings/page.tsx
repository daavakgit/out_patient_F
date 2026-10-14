'use client';

import React, { useState } from 'react';
import { Settings, Bell, Lock, Eye, CheckCircle2, ShieldCheck, Moon } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function PatientSettingsPage() {
  const [reminders, setReminders] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Portal Preferences & Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your daily exercise reminders, accessibility parameters, and security preferences.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings updated successfully!
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-600" /> Exercise & Appointment Notifications
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Daily Exercise Reminders</span>
                <span className="text-slate-500">Receive an alert when scheduled home exercises are pending.</span>
              </div>
              <input
                type="checkbox"
                checked={reminders}
                onChange={(e) => setReminders(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Clinical Appointment Alerts</span>
                <span className="text-slate-500">Reminders 24 hours prior to therapist consultations.</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Accessibility & Display */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-600" /> Accessibility & Patient Display
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">High Contrast Exercise Interface</span>
                <span className="text-slate-500">Enhanced visual clarity during live exercise timer tracking.</span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
