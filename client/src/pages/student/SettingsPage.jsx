import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Shield,
  Bell,
  Building2,
  LogOut,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account credentials, institutional link, and security boundaries.
        </p>
      </div>

      {/* Account Info */}
      <div className="glass-panel rounded-3xl dark:border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200/60 dark:border-white/10 pb-3">
          <User className="w-4 h-4 text-cyan-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Account Credentials</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Full Name</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Email Address</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Assigned Role</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.role}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Affiliated Institution</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.institutionName || 'Platform Level'}</span>
          </div>
        </div>
      </div>

      {/* Password & Security Card */}
      <div className="glass-panel rounded-3xl dark:border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200/60 dark:border-white/10 pb-3">
          <Shield className="w-4 h-4 text-cyan-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password Management</h2>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white">MVP Password Reset Policy</p>
            <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-relaxed">
              In this MVP production configuration, institutional single-sign-on and self-service password resets are mediated by your college placement office or platform administration. Contact your institution administrator for credential reissuance.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel rounded-3xl border border-rose-200 dark:border-rose-900/40 p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Session Controls</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign out of your active PlaceWise intelligence session across this browser.
        </p>
        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of PlaceWise</span>
        </button>
      </div>
    </div>
  );
}

