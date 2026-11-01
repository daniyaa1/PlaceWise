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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real alerts regarding matched drives, deadlines, and application status changes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5 text-indigo-600 mr-1" />
              <span>Mark All Read</span>
            </button>
          )}

          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${filter === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${!n.read_at ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'}`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{n.title}</h3>
                    {!n.read_at && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                {!n.read_at && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => dismiss(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Dismiss notification"
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
