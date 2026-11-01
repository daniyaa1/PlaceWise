import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatusPill from '../../components/StatusPill';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  FileText,
  Clock,
  History,
  Building2,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Status History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Status Update / Withdraw Modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('WITHDRAWN');
  const [targetReason, setTargetReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getApplications();
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleOpenHistory = (app) => {
    setSelectedApp(app);
    setHistoryModalOpen(true);
  };

  const handleOpenUpdate = (app) => {
    setSelectedApp(app);
    setTargetStatus(app.status === 'INTERESTED' ? 'APPLIED' : 'WITHDRAWN');
    setTargetReason('');
    setUpdateModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      await api.updateApplicationStatus(selectedApp.id, {
        status: targetStatus,
        reason: targetReason
      });
      setUpdateModalOpen(false);
      loadApplications();
    } catch (err) {
      alert(err.message || 'Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterStatus === 'ALL'
    ? applications
    : applications.filter(a => a.status === filterStatus);

  if (loading) return <LoadingSpinner text="Loading your application tracker..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status tracking and audit history across campus and external opportunities.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {['ALL', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No applications in this category"
          description="Browse campus recruitment drives and external openings to track your career pipeline."
          actionLabel="Discover Opportunities"
          onAction={() => window.location.href = '/opportunities'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((app) => (
              <div key={app.id} className="p-5 sm:px-6 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-xs text-slate-800 flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {app.company_name}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      {app.source_type === 'CAMPUS' ? 'On-Campus Drive' : 'External Opening'}
                    </span>
                    <StatusPill status={app.status} />
                  </div>

                  <Link
                    to={`/opportunities/${app.drive_id}`}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block truncate"
                  >
                    {app.drive_title}
                  </Link>

                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span>Applied on: {new Date(app.applied_at).toLocaleDateString()}</span>
                    {app.notes && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="truncate max-w-xs text-slate-600 italic">"{app.notes}"</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions: View History & Update */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenHistory(app)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1"
                  >
                    <History className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    <span>Audit Trail</span>
                  </button>

                  {app.status !== 'WITHDRAWN' && app.status !== 'SELECTED' && app.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleOpenUpdate(app)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                    >
                      Update / Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={selectedApp ? `Status History: ${selectedApp.company_name}` : 'Application History'}
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 block">{selectedApp.drive_title}</span>
              <span className="text-xs text-slate-500">Initial applied date: {new Date(selectedApp.applied_at).toLocaleString()}</span>
            </div>

            <div className="space-y-3">
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                selectedApp.statusHistory.map((h, i) => (
                  <div key={h.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-[10px] text-slate-600 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {h.reason && <p className="text-slate-600 italic">"{h.reason}"</p>}
                      {h.first_name && (
                        <span className="text-[10px] text-slate-400 block">
                          Updated by: {h.first_name} {h.last_name} ({h.role})
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No transition history recorded yet.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Application Modal */}
      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title="Update Application Stage"
      >
        {selectedApp && (
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <p className="text-xs text-slate-600 font-medium">Role: <span className="font-bold text-slate-900">{selectedApp.drive_title}</span></p>
              <p className="text-xs text-slate-500">Current Status: <span className="font-semibold text-slate-800">{selectedApp.status}</span></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Stage</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="APPLIED">Applied (Formally submitted)</option>
                <option value="INTERESTED">Interested / Saved</option>
                <option value="WITHDRAWN">Withdraw Application</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Note</label>
              <textarea
                required
                rows={3}
                value={targetReason}
                onChange={(e) => setTargetReason(e.target.value)}
                placeholder="e.g. Accepted another offer / Submitted through campus link."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUpdateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 shadow-xs"
              >
                {submitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
