'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Check, Clock, Dumbbell, Award, Calendar, MessageSquare } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications || []);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Notifications & Updates</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exercise protocol prescriptions, milestone updates, and consultation reminders.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto border border-sky-200"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Feed */}
      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  !n.read ? 'bg-sky-50/50 rounded-2xl' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        n.type === 'EXERCISE'
                          ? 'info'
                          : n.type === 'PLAN'
                          ? 'success'
                          : n.type === 'APPOINTMENT'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {n.type || 'NOTICE'}
                    </Badge>
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {n.link && (
                      <Link href={n.link} className="text-[11px] font-bold text-sky-600 hover:text-sky-800 underline">
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkOne(n._id)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-white rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
