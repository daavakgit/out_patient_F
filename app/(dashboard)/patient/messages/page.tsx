'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, User, Clock, CheckCheck, Stethoscope } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resP, resM] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/messages'),
      ]);

      if (resP.ok) {
        const jsonP = await resP.json();
        const pList = jsonP.patients || [];
        if (pList.length > 0) setPatient(pList[0]);
      }

      if (resM.ok) {
        const jsonM = await resM.json();
        setMessages(jsonM.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !patient?.therapistId?.userId?._id) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: patient.therapistId.userId._id,
          patientId: patient._id,
          content: content.trim(),
        }),
      });

      if (res.ok) {
        setContent('');
        const resM = await fetch('/api/messages');
        if (resM.ok) {
          const jsonM = await resM.json();
          setMessages(jsonM.messages || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <CardSkeleton />;

  const therapist = patient?.therapistId?.userId || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Therapist Direct Messaging</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Private clinical consultation channel with your dedicated rehabilitation specialist.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{therapist.name || 'Clinical Care Team'}</h3>
              <p className="text-[11px] text-sky-700 font-bold">
                {therapist.name ? 'Dedicated Physical Therapist • Available' : 'Care Team Messaging Channel'}
              </p>
            </div>
          </div>
          <Badge variant="success">ONLINE CONSULTATION</Badge>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No previous messages with your therapist. Send a message to get in touch.
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId?._id !== therapist._id;
              return (
                <div
                  key={m._id}
                  className={`flex flex-col max-w-md ${isMine ? 'items-end ml-auto' : 'items-start mr-auto'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 px-1 font-medium">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMine && <CheckCheck className="w-3 h-3 text-sky-500" />}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <input
            type="text"
            required
            placeholder={`Type your message to ${therapist.name || 'your therapist'}...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
