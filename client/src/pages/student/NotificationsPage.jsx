import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import EmptyState from '../../components/EmptyState';
import {
  Bell,
  CheckCheck,
  Trash2,
  Briefcase,
  Building2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  const filtered = filter === 'UNREAD'
    ? notifications.filter(n => !n.read_at)
    : notifications;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CAMPUS_DRIVE':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'OPPORTUNITY_MATCH':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'APPLICATION_UPDATE':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'DEADLINE_ALERT':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real alerts regarding matched drives, deadlines, and application status changes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold glass-panel text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-cyan-500 mr-1" />
              <span>Mark All Read</span>
            </button>
          )}

          <div className="flex rounded-xl bg-slate-100/80 dark:bg-slate-900/80 p-1 text-xs font-medium border border-slate-200/60 dark:border-white/5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filter === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filter === 'UNREAD' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No notifications in this view"
          description="You're completely caught up! New campus drives and match alerts will appear here."
          icon={Bell}
        />
      ) : (
        <div className="glass-panel rounded-3xl dark:border-white/10 shadow-xl overflow-hidden divide-y divide-slate-100/60 dark:divide-white/5">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-all ${!n.read_at ? 'bg-cyan-500/5' : 'hover:bg-slate-50/40 dark:hover:bg-white/5'}`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {!n.read_at && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => dismiss(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                  title="Dismiss"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

