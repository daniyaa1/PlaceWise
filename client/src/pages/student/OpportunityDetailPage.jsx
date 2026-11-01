import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EligibilityBadge from '../../components/EligibilityBadge';
import PreferenceBadge from '../../components/PreferenceBadge';
import SkillTag from '../../components/SkillTag';
import StatusPill from '../../components/StatusPill';
import Modal from '../../components/Modal';
import {
  Building2,
  MapPin,
  Calendar,
  Banknote,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Briefcase,
  Layers,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application Tracking State
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackStatus, setTrackStatus] = useState('APPLIED');
  const [trackNotes, setTrackNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await api.getOpportunity(id);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load opportunity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      await api.createApplication({
        driveId: Number(id),
        status: trackStatus,
        notes: trackNotes
      });
      setMsg({ type: 'success', text: 'Application status saved to your tracker!' });
      setTimeout(() => {
        setTrackModalOpen(false);
        loadDetail();
      }, 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to record application.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Auditing opportunity requirements..." />;
  if (!data?.data) return <div className="p-8 text-center text-slate-500">Opportunity not found.</div>;

  const drive = data.data;
  const eligibility = data.studentEligibility;
  const recommendation = data.recommendationInsight;
  const existingApp = data.userApplication;

  const formatCompensation = (min, max) => {
    if (!min && !max) return 'Not Disclosed';
    const fmt = (n) => (n >= 100000 ? `${(n / 100000).toFixed(1)} LPA` : `₹${n.toLocaleString()}/mo`);
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(min || max);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/opportunities"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to opportunities
        </Link>
      </div>

      {/* Main Dossier Header Card */}
      <div className="glass-panel rounded-3xl dark:border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-white/10">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                <Building2 className="w-4 h-4 mr-1 text-cyan-500" />
                {drive.company_name}
              </span>

              {drive.is_demo_data && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  DEMO DATA RECORD
                </span>
              )}

              {drive.source_type === 'CAMPUS' ? (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  Campus Drive ({drive.institution_name || 'College'})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                  External Opening ({drive.college_scope?.replace(/_/g, ' ')})
                </span>
              )}

              {drive.verification_status === 'VERIFIED' && (
                <span className="inline-flex items-center text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Listing
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {drive.title}
            </h1>

            <div className="flex items-center flex-wrap gap-2 pt-1">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-white/60 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-white/10">
                Domain: {drive.career_domain}
              </span>
              <PreferenceBadge group={drive.preference_group} />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Coding Intensity: <strong className="text-slate-900 dark:text-white">{drive.coding_intensity}</strong>
              </span>
            </div>
          </div>

          {/* Action Callout */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {existingApp ? (
              <div className="glass-panel p-3.5 rounded-2xl text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Your Application Status
                </span>
                <StatusPill status={existingApp.status} />
              </div>
            ) : (
              <button
                onClick={() => setTrackModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Track This Opportunity
              </button>
            )}

            {drive.official_url && (
              <a
                href={drive.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-bold text-cyan-500 hover:text-cyan-400"
              >
                <span>Official Careers Page</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            )}
          </div>
        </div>

        {/* Attribute Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="glass-panel p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Compensation</span>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
              <Banknote className="w-4 h-4 mr-1 text-cyan-500" />
              {formatCompensation(drive.compensation_min, drive.compensation_max)}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Location & Mode</span>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center truncate">
              <MapPin className="w-4 h-4 mr-1 text-cyan-500 shrink-0" />
              {drive.location} ({drive.work_mode?.toLowerCase()})
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Application Deadline</span>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-cyan-500" />
              {new Date(drive.application_deadline).toLocaleDateString()}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Employment Type</span>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              {drive.employment_type?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* CPIE ELIGIBILITY AUDIT BREAKDOWN (Core Requirement) */}
      {eligibility && (
        <div className={`p-6 rounded-2xl border ${
          eligibility.status === 'ELIGIBLE'
            ? 'bg-emerald-50/50 border-emerald-200'
            : eligibility.status === 'NOT_ELIGIBLE'
            ? 'bg-rose-50/50 border-rose-200'
            : 'bg-amber-50/50 border-amber-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className={`w-5 h-5 ${
                eligibility.status === 'ELIGIBLE' ? 'text-emerald-700' : eligibility.status === 'NOT_ELIGIBLE' ? 'text-rose-700' : 'text-amber-700'
              }`} />
              <div>
                <h3 className="font-extrabold text-sm text-slate-950">
                  CPIE Eligibility Audit for Your Profile
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {eligibility.explanation}
                </p>
              </div>
            </div>
            <EligibilityBadge status={eligibility.status} />
          </div>

          {/* Criteria Checklist */}
          <div className="mt-4 pt-4 border-t border-slate-200/60 grid sm:grid-cols-2 gap-3 text-xs">
            {eligibility.criteriaChecked?.map((c, i) => {
              const passed = c.status === 'PASSED';
              const failed = c.status === 'FAILED';
              const missing = c.status === 'MISSING';

              return (
                <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 flex items-start space-x-2.5">
                  {passed && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                  {failed && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  {missing && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {c.criterion.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Expected: <strong>{c.expected}</strong> {c.actual !== undefined && `| Your profile: ${JSON.stringify(c.actual)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CPIE RECOMMENDATION SCORE BREAKDOWN */}
      {recommendation && recommendation.score > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Explainable Recommendation Score Breakdown</h3>
            </div>
            <span className="text-base font-extrabold text-indigo-600">
              {recommendation.score}/100
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Formula: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">Score = 0.40P + 0.35K + 0.15W + 0.10L</code>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Career Preference (P)</span>
              <span className="font-extrabold text-sm text-slate-900">{recommendation.preferenceScore}/100</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Weight: 40%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Skill Fit (K)</span>
              <span className="font-extrabold text-sm text-slate-900">{recommendation.skillScore}/100</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Weight: 35%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Work Mode (W)</span>
              <span className="font-extrabold text-sm text-slate-900">{recommendation.workModeScore}/100</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Weight: 15%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Location (L)</span>
              <span className="font-extrabold text-sm text-slate-900">{recommendation.locationScore}/100</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Weight: 10%</span>
            </div>
          </div>
        </div>
      )}

      {/* Role Details & Description */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Job Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {drive.description}
            </p>

            {drive.responsibilities && (
              <>
                <h4 className="font-bold text-xs text-slate-900 pt-2">Core Responsibilities</h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {drive.responsibilities}
                </p>
              </>
            )}
          </div>

          {/* Skills Required & Desirable */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Skills & Competencies</h3>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-2">Mandatory Prerequisite Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {drive.skills?.filter(s => s.is_mandatory).length > 0 ? (
                  drive.skills.filter(s => s.is_mandatory).map((s, i) => (
                    <SkillTag key={i} name={s.name} isMandatory={true} />
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No hard mandatory skills declared.</span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-2">Desirable / Evaluated Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {drive.skills?.filter(s => !s.is_mandatory).length > 0 ? (
                  drive.skills.filter(s => !s.is_mandatory).map((s, i) => (
                    <SkillTag key={i} name={s.name} isMandatory={false} />
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None listed.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Dossier: Selection Rounds, Required Docs, Provenance */}
        <div className="space-y-6">
          {/* Selection Rounds */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Selection Process</h3>
            <div className="space-y-2">
              {drive.selection_rounds?.map((round, idx) => (
                <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                    {idx + 1}
                  </span>
                  <span>{round}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Required Documents</h3>
            <div className="space-y-2">
              {drive.required_documents?.map((doc, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-slate-600">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Provenance Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900">Listing Provenance</h4>
            <div className="space-y-1 text-[11px]">
              <p><span className="text-slate-400">Source:</span> {drive.listing_source || 'Placement Network'}</p>
              <p><span className="text-slate-400">Status:</span> {drive.verification_status}</p>
              <p><span className="text-slate-400">Last Verified:</span> {drive.last_verified_date || 'Current'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Track Application Modal */}
      <Modal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        title={`Track Application: ${drive.company_name}`}
      >
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          {msg && (
            <div className={`p-3 rounded-lg text-xs ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {msg.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Application Stage</label>
            <select
              value={trackStatus}
              onChange={(e) => setTrackStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="INTERESTED">Bookmarked / Interested</option>
              <option value="APPLIED">Submitted Application</option>
              <option value="ASSESSMENT">Online Assessment Scheduled</option>
              <option value="INTERVIEW">Interview Round</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Application Notes (Optional)</label>
            <textarea
              rows={3}
              value={trackNotes}
              onChange={(e) => setTrackNotes(e.target.value)}
              placeholder="e.g. Applied via official portal, referral link."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTrackModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 shadow-xs"
            >
              {submitting ? 'Saving...' : 'Confirm Tracking'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

