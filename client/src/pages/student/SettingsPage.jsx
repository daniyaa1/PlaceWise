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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, institutional link, and security boundaries.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Account Credentials</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</span>
            <span className="font-semibold text-slate-800">{user?.firstName} {user?.lastName}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</span>
            <span className="font-semibold text-slate-800">{user?.email}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Role</span>
            <span className="font-semibold text-slate-800">{user?.role}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Affiliated Institution</span>
            <span className="font-semibold text-slate-800">{user?.institutionName || 'Platform Level'}</span>
          </div>
        </div>
      </div>

      {/* Password & Security Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Shield className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Security & Password Management</h2>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3 text-xs text-slate-600">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900">MVP Password Reset Policy</p>
            <p className="mt-0.5 text-slate-500 leading-relaxed">
              In this MVP production configuration, institutional single-sign-on and self-service password resets are mediated by your college placement office or platform administration. Contact your institution administrator for credential reissuance.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-rose-700">Session Controls</h3>
        <p className="text-xs text-slate-500">
          Sign out of your active PlaceWise intelligence session across this browser.
        </p>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center space-x-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of PlaceWise</span>
        </button>
      </div>
    </div>
  );
}
