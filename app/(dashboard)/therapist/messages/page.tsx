'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, User, Clock, CheckCheck, RefreshCw } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TherapistMessagesPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchRoster();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchConversation(selectedPatient._id);
    }
  }, [selectedPatient]);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const json = await res.json();
        const list = json.patients || [];
        setPatients(list);
        if (list.length > 0 && !selectedPatient) {
          setSelectedPatient(list[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (patientId: string) => {
    try {
      const res = await fetch(`/api/messages?patientId=${patientId}`);
      if (res.ok) {
        const json = await res.json();
        setMessages(json.messages || []);
      }
    } catch (e) {}
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedPatient?.userId?._id) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedPatient.userId._id,
          patientId: selectedPatient._id,
          content: content.trim(),
        }),
      });

      if (res.ok) {
        setContent('');
        fetchConversation(selectedPatient._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Direct Patient Messaging</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Secure clinical communication channel between therapist and assigned patients.
          </p>
        </div>
      </div>

      {/* Main Messaging Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
        {/* Left: Patient Conversations List */}
        <div className="border-r border-slate-200 p-4 space-y-2 bg-slate-50/50">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 pb-1">
            Assigned Patients ({patients.length})
          </p>

          {patients.map((p) => {
            const isSelected = selectedPatient?._id === p._id;
            return (
              <button
                key={p._id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 ${
                  isSelected ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {p.userId?.name?.substring(0, 2).toUpperCase() || 'PT'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-xs truncate">{p.userId?.name}</div>
                  <div className={`text-[11px] truncate ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                    {p.patientCode} • Phase {p.currentPhase || 1}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Chat Conversation */}
        <div className="md:col-span-2 flex flex-col justify-between p-6 bg-white">
          {selectedPatient ? (
            <>
              {/* Active Header */}
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                    {selectedPatient.userId?.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{selectedPatient.userId?.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      Condition: {selectedPatient.medicalHistory?.reasonForVisit}
                    </p>
                  </div>
                </div>
                <a
                  href={`/therapist/patients/${selectedPatient._id}`}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800"
                >
                  View Profile →
                </a>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[380px] custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                    No message history with this patient yet. Send a greeting below.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isFromPatient = m.senderId?._id === selectedPatient.userId?._id;
                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col max-w-md ${isFromPatient ? 'items-start mr-auto' : 'items-end ml-auto'}`}
                      >
                        <div
                          className={`p-3.5 rounded-2xl text-xs ${
                            isFromPatient
                              ? 'bg-slate-100 text-slate-900 border border-slate-200'
                              : 'bg-sky-600 text-white shadow-sm'
                          }`}
                        >
                          <p className="leading-relaxed">{m.content}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {!isFromPatient && <CheckCheck className="w-3 h-3 text-sky-500" />}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSend} className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={`Write clinical message to ${selectedPatient.userId?.name}...`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a patient from the roster to begin messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
