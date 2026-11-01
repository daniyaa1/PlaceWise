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
    <aside className="hidden lg:flex flex-col items-center justify-between w-18 py-6 glass-panel border-r border-slate-200/80 dark:border-white/10 z-30 shrink-0">
      {/* Top Diamond Logo */}
      <Link
        to="/"
        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all"
        title="PlaceWise Home"
      >
        <Compass className="w-5 h-5 text-white" />
      </Link>

      {/* Middle Navigation Icons */}
      <nav className="flex flex-col items-center space-y-4 my-auto">
        {user.role === 'STUDENT' && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `p-3 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                }`
              }
              title="Dashboard"
            >
              <Layers className="w-5 h-5" />
              <span className="sr-only">Dashboard</span>
            </NavLink>

            <NavLink
              to="/opportunities"
              className={({ isActive }) =>
                `p-3 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                }`
              }
              title="Opportunity Discovery"
            >
              <Briefcase className="w-5 h-5" />
              <span className="sr-only">Opportunities</span>
            </NavLink>

            <NavLink
              to="/applications"
              className={({ isActive }) =>
                `p-3 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                }`
              }
              title="Application Tracker"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="sr-only">Applications</span>
            </NavLink>

            <NavLink
              to="/preferences"
              className={({ isActive }) =>
                `p-3 rounded-2xl transition-all relative group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                }`
              }
              title="Career Preferences"
            >
              <Sliders className="w-5 h-5" />
              <span className="sr-only">Preferences</span>
            </NavLink>
          </>
        )}

        {user.role === 'PLACEMENT_ADMIN' && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `p-3 rounded-2xl transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'
                }`
              }
              title="Placement Dashboard"
            >
              <Layers className="w-5 h-5" />
            </NavLink>
            <NavLink
              to="/admin/drives"
              className={({ isActive }) =>
                `p-3 rounded-2xl transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'
                }`
              }
              title="Campus Drives"
            >
              <Briefcase className="w-5 h-5" />
            </NavLink>
          </>
        )}

        {user.role === 'PLATFORM_ADMIN' && (
          <>
            <NavLink
              to="/platform/moderation"
              className={({ isActive }) =>
                `p-3 rounded-2xl transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'
                }`
              }
              title="Moderation Queue"
            >
              <ShieldAlert className="w-5 h-5" />
            </NavLink>
            <NavLink
              to="/platform/institutions"
              className={({ isActive }) =>
                `p-3 rounded-2xl transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'
                }`
              }
              title="Institutions"
            >
              <Building2 className="w-5 h-5" />
            </NavLink>
          </>
        )}

        {/* Notifications with badge */}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `p-3 rounded-2xl transition-all relative group ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
            }`
          }
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
          )}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-3 rounded-2xl transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
            }`
          }
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </NavLink>
      </nav>

      {/* Bottom User Avatar */}
      <Link
        to="/profile"
        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 dark:from-indigo-600 dark:to-cyan-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/10 hover:scale-105 transition-all shadow-md"
        title="My Profile"
      >
        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
      </Link>
    </aside>
  );
}
