import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import OpportunityCard from '../../components/OpportunityCard';
import PreferenceBadge from '../../components/PreferenceBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  Sparkles,
  Compass,
  Briefcase,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sliders,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState({ recommended: [], exploreOther: [], ineligible: [] });
  const [preferenceMode, setPreferenceMode] = useState('OPEN_TO_ALL');
  const [skillGaps, setSkillGaps] = useState({ gaps: [] });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Track Modal State
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [trackStatus, setTrackStatus] = useState('APPLIED');
  const [trackNotes, setTrackNotes] = useState('');
  const [trackSubmitting, setTrackSubmitting] = useState(false);
  const [trackMessage, setTrackMessage] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [recRes, gapRes, appRes] = await Promise.all([
        api.getRecommendations(),
        api.getSkillGaps(),
        api.getApplications()
      ]);

      if (recRes.success) {
        setRecommendations(recRes.data);
        setPreferenceMode(recRes.preferenceMode);
      }
      if (gapRes.success) {
        setSkillGaps(gapRes.data);
      }
      if (appRes.success) {
        setApplications(appRes.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickApply = (drive) => {
    setSelectedDrive(drive);
    setTrackStatus('APPLIED');
    setTrackNotes('');
    setTrackMessage(null);
    setTrackModalOpen(true);
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDrive) return;
    setTrackSubmitting(true);
    setTrackMessage(null);

    try {
      await api.createApplication({
        driveId: selectedDrive.id,
        status: trackStatus,
        notes: trackNotes
      });
      setTrackMessage({ type: 'success', text: 'Application tracked successfully!' });
      setTimeout(() => {
        setTrackModalOpen(false);
        loadDashboardData();
      }, 1200);
    } catch (err) {
      setTrackMessage({ type: 'error', text: err.message || 'Failed to record application.' });
    } finally {
      setTrackSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing CPIE recommendations and eligibility..." />;
  }

  const activeAppsCount = applications.filter(a => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN').length;
  const eligibleCount = (recommendations.recommended?.length || 0) + (recommendations.exploreOther?.length || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Profile Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Student Placement Intelligence
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {user?.institutionName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.firstName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Enrolled in <span className="font-semibold text-slate-800">{user?.studentProfile?.degree} ({user?.studentProfile?.branch})</span>, graduating in <span className="font-semibold text-slate-800">{user?.studentProfile?.graduation_year}</span>. Verified CGPA: <span className="font-semibold text-slate-800">{user?.studentProfile?.cgpa ? parseFloat(user?.studentProfile?.cgpa).toFixed(2) : 'Pending'}</span>.
            </p>
          </div>

          {/* Preference Pill & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Preference Mode
              </span>
              <div className="flex items-center space-x-2">
                <PreferenceBadge mode={preferenceMode} />
                <Link
                  to="/preferences"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center ml-1"
                >
                  <Sliders className="w-3 h-3 mr-0.5" />
                  Change
                </Link>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 w-full sm:w-44">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Status</span>
                <span className="font-bold text-slate-800">{user?.profileCompletionPercentage || 90}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${user?.profileCompletionPercentage || 90}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 block leading-none">{eligibleCount}</span>
              <span className="text-[11px] font-medium text-slate-500">Eligible Opportunities</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 block leading-none">{recommendations.recommended?.length || 0}</span>
              <span className="text-[11px] font-medium text-slate-500">Matched to Preference</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 block leading-none">{activeAppsCount}</span>
              <span className="text-[11px] font-medium text-slate-500">Active Applications</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 block leading-none">{skillGaps.gaps?.length || 0}</span>
              <span className="text-[11px] font-medium text-slate-500">High Impact Skill Gaps</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A: RECOMMENDED FOR YOU */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {recommendations.recommended?.length || 0}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Verified opportunities satisfying all academic criteria and matching your <strong>{preferenceMode.replace('_', ' ')}</strong> preference.
            </p>
          </div>
          <Link
            to="/opportunities"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Explore all listings <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {recommendations.recommended && recommendations.recommended.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.recommended.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onQuickApply={handleQuickApply}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching recommended opportunities right now"
            description="All active opportunities have been evaluated. Check the Explore section below to discover roles outside your primary preference."
            actionLabel="View All Opportunities"
            onAction={() => window.location.href = '/opportunities'}
          />
        )}
      </section>

      {/* SECTION B: EXPLORE OTHER OPPORTUNITIES */}
      {recommendations.exploreOther && recommendations.exploreOther.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Explore Other Opportunities</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {recommendations.exploreOther.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              You meet all academic criteria for these roles, but they lie outside your primary preference mode. We never hide eligible opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.exploreOther.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onQuickApply={handleQuickApply}
              />
            ))}
          </div>
        </section>
      )}

      {/* Skill-Gap Market Impact Bar */}
      {skillGaps.gaps && skillGaps.gaps.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Skill-Gap Impact Analysis</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Most frequent desirable skills requested across your {eligibleCount} currently eligible opportunities.
              </p>
            </div>
            <span className="text-[10px] text-slate-400 max-w-xs text-right hidden sm:block">
              Market impact frequency, not a guarantee of employment.
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {skillGaps.gaps.slice(0, 4).map((gap, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">{gap.skillName}</span>
                  <span className="text-[10px] text-slate-500">
                    Appears in {gap.frequency} eligible role{gap.frequency > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  +{gap.frequency * 15}% fit
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Track Application Modal */}
      <Modal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        title={selectedDrive ? `Track Application: ${selectedDrive.company_name}` : 'Track Application'}
      >
        {selectedDrive && (
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            {trackMessage && (
              <div className={`p-3 rounded-lg text-xs ${trackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {trackMessage.text}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-600 font-medium">Role: <span className="font-bold text-slate-900">{selectedDrive.title}</span></p>
              <p className="text-[11px] text-slate-500">Source: {selectedDrive.source_type === 'CAMPUS' ? 'On-Campus Drive' : 'External Listing'}</p>
            </div>

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Notes (Optional)</label>
              <textarea
                value={trackNotes}
                onChange={(e) => setTrackNotes(e.target.value)}
                placeholder="e.g. Applied via official portal, referral from alum."
                rows={3}
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
                disabled={trackSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 shadow-xs"
              >
                {trackSubmitting ? 'Saving...' : 'Confirm Tracking'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
