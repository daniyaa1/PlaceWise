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
  FileText,
  Plus,
  Share2,
  CreditCard,
  Building2,
  ChevronRight,
  ArrowUpRight,
  Layers
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Ambient background glows inspired by user image */}
      <div className="ambient-glow bg-indigo-600/30 -top-40 -left-40" />
      <div className="ambient-glow bg-cyan-500/25 top-1/2 -right-40" />

      {/* Top Welcome Header Bar */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Intelligence Dashboard
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {user?.institutionName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Enrolled in <span className="font-bold text-slate-900 dark:text-slate-200">{user?.studentProfile?.degree} ({user?.studentProfile?.branch})</span>, Class of <span className="font-bold text-slate-900 dark:text-slate-200">{user?.studentProfile?.graduation_year}</span>. Verified CGPA: <span className="font-bold text-slate-900 dark:text-slate-200">{user?.studentProfile?.cgpa ? parseFloat(user?.studentProfile?.cgpa).toFixed(2) : 'Pending'}</span>.
          </p>
        </div>

        {/* Preference Mode & Profile Status */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Preference Mode
            </span>
            <div className="flex items-center space-x-2">
              <PreferenceBadge mode={preferenceMode} />
              <Link
                to="/preferences"
                className="text-xs text-indigo-600 dark:text-cyan-400 hover:underline font-semibold flex items-center ml-1"
              >
                <Sliders className="w-3 h-3 mr-0.5" />
                Edit
              </Link>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-md w-full sm:w-44">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Match</span>
              <span className="font-black text-slate-900 dark:text-white">{user?.profileCompletionPercentage || 92}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${user?.profileCompletionPercentage || 92}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Opportunities & Chart) + Right 1 Col (Pipeline Cards) */}
      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Top Recent Recommendations (Cards like Spotify/Dribbble/Emelia in reference picture) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Recommended For You
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                  +{recommendations.recommended?.length || 0} Matches
                </span>
              </div>

              <Link
                to="/opportunities"
                className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center"
              >
                <span>Browse All</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>

            {recommendations.recommended && recommendations.recommended.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-5">
                {recommendations.recommended.slice(0, 4).map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onQuickApply={handleQuickApply}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No direct recommendation matches"
                description="Explore other opportunities below that satisfy all your academic eligibility requirements."
                actionLabel="Explore All Opportunities"
                onAction={() => window.location.href = '/opportunities'}
              />
            )}
          </div>

          {/* Placement Market Trends Chart (inspired by the blue wave chart in user screenshot) */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Market Demand & Eligibility Index
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time opportunity trajectory mapped across graduation cohorts
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20 self-start sm:self-auto">
                +23.19% In Demand
              </span>
            </div>

            {/* Custom SVG Curve matching the screenshot */}
            <div className="relative pt-6 pb-2">
              <svg viewBox="0 0 500 130" className="w-full h-32 overflow-visible">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Fill Area */}
                <path
                  d="M 0 100 Q 80 40 160 85 T 320 30 T 500 70 L 500 130 L 0 130 Z"
                  fill="url(#waveGradient)"
                />
                {/* Stroke Wave */}
                <path
                  d="M 0 100 Q 80 40 160 85 T 320 30 T 500 70"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Glowing Highlight Point (like Shane $1,280 in reference) */}
                <circle cx="320" cy="30" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Tooltip Overlay */}
              <div className="absolute top-2 left-[58%] -translate-x-1/2 glass-panel px-3 py-1.5 rounded-xl shadow-lg border border-cyan-400/30 text-[11px] text-slate-900 dark:text-white flex items-center space-x-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="font-bold">Peak Placement Cycle</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">₹14.2 LPA Avg</span>
              </div>
            </div>

            <div className="flex justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200/60 dark:border-white/5">
              <span>Semester 5</span>
              <span>Semester 6 (Internships)</span>
              <span>Semester 7 (Day 1 Campus)</span>
              <span>Semester 8 (Off-Campus PPO)</span>
            </div>
          </div>

          {/* Section: Explore Other Opportunities */}
          {recommendations.exploreOther && recommendations.exploreOther.length > 0 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Explore Other Opportunities
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    {recommendations.exploreOther.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You meet all academic criteria for these roles, but they lie outside your primary <strong>{preferenceMode.replace('_', ' ')}</strong> preference.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {recommendations.exploreOther.slice(0, 4).map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onQuickApply={handleQuickApply}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Rail: My Placement Pipeline (Styled like "My Cards" from reference image) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  My Placement Pipeline
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {applications.length} Tracked Roles
                </span>
              </div>

              <Link
                to="/applications"
                className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all"
                title="View All Tracked Applications"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>

            {/* Total Balance / Metrics Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-white/10 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Active Interview Pipeline
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black tracking-tight text-white">{activeAppsCount}</span>
                <span className="text-xs text-cyan-400 font-bold">Active Rounds</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Link
                  to="/applications"
                  className="py-2 px-3 rounded-xl text-center text-xs font-bold bg-cyan-500 text-white hover:bg-cyan-400 transition-colors shadow-xs"
                >
                  View Pipeline
                </Link>
                <Link
                  to="/resumes"
                  className="py-2 px-3 rounded-xl text-center text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                >
                  Resume Vault
                </Link>
              </div>
            </div>

            {/* Stack of Glass Credit-Card Style Opportunity Badges (matching debit cards in image) */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Tracked Opportunities
              </span>

              {applications.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                  No tracked applications yet. Click "Track Application" on any job to add it here.
                </div>
              ) : (
                applications.slice(0, 3).map((app, idx) => (
                  <div
                    key={app.id}
                    className={`p-4 rounded-2xl transition-all relative overflow-hidden ${
                      idx === 0
                        ? 'glass-card-emerald text-white'
                        : idx === 1
                        ? 'glass-card-purple text-white'
                        : 'glass-card-cyan text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white block truncate max-w-[150px]">
                        {app.company_name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-slate-900 dark:text-white border border-white/20">
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mb-3">
                      {app.drive_title}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-300 pt-2 border-t border-white/10">
                      <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                      <Link
                        to={`/opportunities/${app.drive_id}`}
                        className="font-bold underline text-slate-900 dark:text-white"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Skill-Gap Market Impact */}
            {skillGaps.gaps && skillGaps.gaps.length > 0 && (
              <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Skill-Gap Impact</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    Top High-ROI Skills
                  </span>
                </span>

                <div className="space-y-2">
                  {skillGaps.gaps.slice(0, 3).map((gap, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{gap.skillName}</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        +{gap.frequency * 15}% Fit
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Track Application Modal */}
      <Modal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        title={selectedDrive ? `Track Application: ${selectedDrive.company_name}` : 'Track Application'}
      >
        {selectedDrive && (
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            {trackMessage && (
              <div className={`p-3 rounded-xl text-xs ${trackMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'}`}>
                {trackMessage.text}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Role: <span className="font-bold text-slate-900 dark:text-white">{selectedDrive.title}</span></p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Source: {selectedDrive.source_type === 'CAMPUS' ? 'On-Campus Drive' : 'External Opening'}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Application Stage</label>
              <select
                value={trackStatus}
                onChange={(e) => setTrackStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="INTERESTED">Bookmarked / Interested</option>
                <option value="APPLIED">Submitted Application</option>
                <option value="ASSESSMENT">Online Assessment Scheduled</option>
                <option value="INTERVIEW">Interview Round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Notes (Optional)</label>
              <textarea
                value={trackNotes}
                onChange={(e) => setTrackNotes(e.target.value)}
                placeholder="e.g. Applied via official portal, referral link."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setTrackModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={trackSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-cyan-500 text-white hover:bg-slate-800 dark:hover:bg-cyan-400 disabled:opacity-60 shadow-xs"
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
