import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  ExternalLink,
  Building2,
  Calendar,
  AlertCircle,
  Globe
} from 'lucide-react';

export default function ModerationQueuePage() {
  const [queue, setQueue] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await api.getExternalModerationQueue(filter);
      if (res.success) setQueue(res.data);
    } catch (err) {
      console.error('Failed to load moderation queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [filter]);

  const handleVerify = async (driveId) => {
    try {
      await api.verifyExternalOpportunity(driveId, 'Verified and approved by platform administration.');
      setActionMsg({ type: 'success', text: `Listing #${driveId} verified and published.` });
      loadQueue();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Verification failed.' });
    }
  };

  const handleReject = async (driveId) => {
    const reason = prompt('Please enter the reason for rejection / expiration:', 'Expired or inaccurate listing requirements.');
    if (!reason) return;
    try {
      await api.rejectExternalOpportunity(driveId, reason);
      setActionMsg({ type: 'success', text: `Listing #${driveId} marked as expired/rejected.` });
      loadQueue();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Rejection failed.' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading external listings moderation queue..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">External Opportunities Moderation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enforce provenance, verify company application links, and approve external off-campus listings.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5">
          {['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'EXPIRED'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {actionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Queue List */}
      {queue.length === 0 ? (
        <EmptyState
          title="No opportunities in moderation queue"
          description="All external listings have been moderated and verified."
          icon={CheckCircle}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {queue.map(item => (
            <div key={item.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-bold text-xs text-slate-900">{item.company_name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    Scope: {item.college_scope?.replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.verification_status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.verification_status === 'PENDING_VERIFICATION'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {item.verification_status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>

                <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500">
                  <span>Domain: <strong>{item.career_domain}</strong> ({item.preference_group})</span>
                  <span>•</span>
                  <span>Deadline: {new Date(item.application_deadline).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Location: {item.location}</span>
                </div>

                {item.official_url && (
                  <div className="pt-1">
                    <a
                      href={item.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Globe className="w-3.5 h-3.5 mr-1" />
                      <span>{item.official_url}</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {item.verification_status !== 'VERIFIED' && (
                  <button
                    onClick={() => handleVerify(item.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {item.verification_status !== 'EXPIRED' && (
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject / Expire</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
