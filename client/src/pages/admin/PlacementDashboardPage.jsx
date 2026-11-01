import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusPill from '../../components/StatusPill';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function PlacementDashboardPage() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [drivesRes, compRes] = await Promise.all([
          api.getPlacementDrives(),
          api.getCompanies()
        ]);
        if (drivesRes.success) setDrives(drivesRes.data);
        if (compRes.success) setCompanies(compRes.data);
      } catch (err) {
        console.error('Failed to load placement admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading placement cell analytics..." />;

  const totalApplicants = drives.reduce((sum, d) => sum + parseInt(d.applicant_count || 0, 10), 0);
  const activeDrives = drives.filter(d => d.status === 'PUBLISHED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Placement Cell Administration
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {user?.institutionName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Institution Recruitment Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage on-campus placement drives, define eligibility parameters, and audit authorized applicants.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Link
              to="/admin/drives"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campus Drive</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Campus Drives</span>
            <span className="text-2xl font-extrabold text-slate-900">{activeDrives.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Published to students</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Applicants Logged</span>
            <span className="text-2xl font-extrabold text-slate-900">{totalApplicants}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Across all drives</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Partner Companies</span>
            <span className="text-2xl font-extrabold text-slate-900">{companies.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">In recruitment directory</span>
          </div>
        </div>
      </div>

      {/* Drives Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Institution Drives & Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Campus placement drives hosted for {user?.institutionName}</p>
          </div>
          <Link
            to="/admin/drives"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Manage all drives <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {drives.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            No campus placement drives created yet. Click "Create Campus Drive" to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {drives.slice(0, 5).map((d) => (
              <div key={d.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{d.company_name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-500">{d.career_domain}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">{d.title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span>Deadline: {new Date(d.application_deadline).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Location: {d.location} ({d.work_mode?.toLowerCase()})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 block">{d.applicant_count || 0}</span>
                    <span className="text-[10px] text-slate-400">Applicants</span>
                  </div>
                  <Link
                    to="/admin/drives"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
