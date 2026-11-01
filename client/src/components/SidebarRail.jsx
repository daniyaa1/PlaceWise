import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Compass,
  Layers,
  Briefcase,
  CheckCircle2,
  Sliders,
  Bell,
  Settings,
  ShieldAlert,
  Building2
} from 'lucide-react';

export default function SidebarRail() {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();

  if (!isAuthenticated) return null;

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-20 py-7 glass-elevated border-r border-white/10 z-30 shrink-0 m-3 rounded-[32px] my-4 ml-4">
      {/* Top Diamond / Star Emblem matching user reference */}
      <Link
        to="/"
        className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_24px_rgba(6,182,212,0.45)] hover:scale-105 transition-all group"
        title="PlaceWise Intelligence"
      >
        <Compass className="w-5 h-5 text-white group-hover:rotate-45 transition-transform duration-300" />
      </Link>

      {/* Middle Navigation Icons with Left Active Notch Indicator */}
      <nav className="flex flex-col items-center space-y-4 my-auto">
        {user.role === 'STUDENT' && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `p-3.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`
              }
              title="Dashboard"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
                  )}
                  <Layers className="w-5 h-5" />
                  <span className="sr-only">Dashboard</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/opportunities"
              className={({ isActive }) =>
                `p-3.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`
              }
              title="Opportunity Discovery"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
                  )}
                  <Briefcase className="w-5 h-5" />
                  <span className="sr-only">Opportunities</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/applications"
              className={({ isActive }) =>
                `p-3.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`
              }
              title="Application Tracker"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
                  )}
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="sr-only">Applications</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/preferences"
              className={({ isActive }) =>
                `p-3.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`
              }
              title="Career Preferences"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
                  )}
                  <Sliders className="w-5 h-5" />
                  <span className="sr-only">Preferences</span>
                </>
              )}
            </NavLink>
          </>
        )}

        {user.role === 'PLACEMENT_ADMIN' && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `p-3.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`
              }
              title="Placement Dashboard"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
                  )}
                  <Layers className="w-5 h-5" />
                </>
              )}
            </NavLink>
            <NavLink
              to="/admin/drives"
              className={({ isActive }) =>
                `p-3.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`
              }
              title="Campus Drives"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
                  )}
                  <Briefcase className="w-5 h-5" />
                </>
              )}
            </NavLink>
          </>
        )}

        {user.role === 'PLATFORM_ADMIN' && (
          <>
            <NavLink
              to="/platform/moderation"
              className={({ isActive }) =>
                `p-3.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`
              }
              title="Moderation Queue"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
                  )}
                  <ShieldAlert className="w-5 h-5" />
                </>
              )}
            </NavLink>
            <NavLink
              to="/platform/institutions"
              className={({ isActive }) =>
                `p-3.5 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                }`
              }
              title="Institutions"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
                  )}
                  <Building2 className="w-5 h-5" />
                </>
              )}
            </NavLink>
          </>
        )}

        {/* Notifications with badge */}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `p-3.5 rounded-2xl transition-all relative group ${
              isActive
                ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
            }`
          }
          title="Notifications"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
              )}
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-900 shadow-[0_0_8px_#38bdf8]" />
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-3.5 rounded-2xl transition-all relative group ${
              isActive
                ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-lg backdrop-blur-xl border border-white/20'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
            }`
          }
          title="Settings"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_#38bdf8]" />
              )}
              <Settings className="w-5 h-5" />
            </>
          )}
        </NavLink>
      </nav>

      {/* Bottom User Avatar */}
      <Link
        to="/profile"
        className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-xs ring-2 ring-white/20 hover:scale-110 transition-all shadow-lg shadow-cyan-500/20 relative"
        title="My Profile"
      >
        <span>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
      </Link>
    </aside>
  );
}

