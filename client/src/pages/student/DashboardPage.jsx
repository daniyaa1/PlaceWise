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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Header Bar */}
      <div className="glass-panel p-6 sm:p-7 rounded-[32px] relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-cyan-500 uppercase tracking-widest flex items-center">
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
            Enrolled in <span className="font-bold text-slate-900 dark:text-slate-200">{user?.studentProfile?.degree} ({user?.studentProfile?.branch})</span>, Class of <span className="font-bold text-slate-900 dark:text-slate-200">{user?.studentProfile?.graduation_year}</span>. Verified CGPA: <span className="font-bold text-slate-900 dark:text-slate-200">{user?.studentProfile?.cgpa ? parseFloat(user?.studentProfile?.cgpa).toFixed(2) : '8.40'}</span>.
          </p>
        </div>

        {/* Preference Mode & Profile Status */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl glass-pill w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Preference Mode
            </span>
            <div className="flex items-center space-x-2">
              <PreferenceBadge mode={preferenceMode} />
              <Link
                to="/preferences"
                className="text-xs text-cyan-500 hover:underline font-bold flex items-center ml-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3 mr-0.5" />
                Edit
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-pill w-full sm:w-48">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Match</span>
              <span className="font-black text-slate-900 dark:text-white">{user?.profileCompletionPercentage || 92}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_8px_#38bdf8]"
                style={{ width: `${user?.profileCompletionPercentage || 92}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Cards + Chart + Contacts) & Right 1 Col (My Cards / Pipeline) */}
      <div className="grid lg:grid-cols-3 gap-7 relative z-10">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-7">
          {/* Section: Top 3 Cards matching Spotify / Dribbble / Emelia layout in reference image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Top Recommended Opportunities
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25">
                  +{recommendations.recommended?.length || 0} Matches
                </span>
              </div>

              <Link
                to="/opportunities"
                className="text-xs font-bold text-cyan-500 hover:text-cyan-400 flex items-center"
              >
                <span>Browse All</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>

            {/* 3 Prominent Glass Cards Side-by-Side matching reference image */}
            {recommendations.recommended && recommendations.recommended.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.recommended.slice(0, 3).map((opp) => (
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

          {/* Bottom Row: Changes Chart (Left) + Contacts List (Right) */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 1. Changes Chart (Matching Blue Spline Curve in Reference Image) */}
            <div className="glass-panel p-6 rounded-[32px] relative overflow-hidden shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Changes Chart
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full glass-pill text-slate-600 dark:text-slate-300">
                      Cohort 2026
                    </span>
                    <span className="text-[11px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                      +6.23%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-4">
                  <span>CTC trajectory over time</span>
                  <span>Updated on 9:16 AM</span>
                </div>
              </div>

              {/* Custom SVG Curve with Pin Tooltip matching screenshot */}
              <div className="relative pt-6 pb-2">
                <svg viewBox="0 0 320 100" className="w-full h-28 overflow-visible">
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Vertical Dashed Line to Point */}
                  <line x1="180" y1="20" x2="180" y2="90" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                  {/* Fill Area */}
                  <path
                    d="M 0 85 C 40 85, 70 50, 110 65 C 150 80, 160 20, 180 20 C 200 20, 210 75, 240 60 C 270 45, 290 70, 320 65 L 320 100 L 0 100 Z"
                    fill="url(#curveGrad)"
                  />
                  {/* Glowing Spline Path */}
                  <path
                    d="M 0 85 C 40 85, 70 50, 110 65 C 150 80, 160 20, 180 20 C 200 20, 210 75, 240 60 C 270 45, 290 70, 320 65"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                  />
                  {/* Highlight Pin Vertex */}
                  <circle cx="180" cy="20" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="drop-shadow-[0_0_6px_#38bdf8]" />
                </svg>

                {/* Floating Tooltip matching "Shane $1,280.00" in user screenshot */}
                <div className="absolute top-0 left-[56%] -translate-x-1/2 glass-elevated px-3 py-1 rounded-2xl shadow-xl border border-cyan-400/40 text-[11px] text-white flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                  <span className="font-bold text-slate-900 dark:text-white">Average Offer</span>
                  <span className="text-cyan-400 font-black">₹14.2 LPA</span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-3 border-t border-white/5">
                <span>Nov 1</span>
                <span>Nov 15</span>
                <span>Nov 30</span>
              </div>
            </div>

            {/* 2. Contacts List & My Groups matching screenshot */}
            <div className="glass-panel p-6 rounded-[32px] space-y-5 shadow-2xl">
              {/* Contacts Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Contacts List
                  </h3>
                  <span className="text-[11px] font-bold text-cyan-400 cursor-pointer hover:underline">
                    Edit List
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>81 People</span>
                  <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                    9 Recently Added
                  </span>
                </div>
              </div>

              {/* Popular Contacts Circular Avatars */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Placement Mentors
                </span>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {[
                    { name: 'Dr. Sen', role: 'TPO Lead', bg: 'from-amber-400 to-orange-500' },
                    { name: 'Priya M.', role: 'Google', bg: 'from-cyan-400 to-blue-500' },
                    { name: 'Rohan K.', role: 'Amazon', bg: 'from-purple-400 to-indigo-500' },
                    { name: 'Amity Cell', role: 'Amity', bg: 'from-emerald-400 to-teal-500' },
                    { name: 'Vikram S.', role: 'Microsoft', bg: 'from-pink-400 to-rose-500' }
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-tr flex items-center justify-center text-white text-xs font-black ring-2 ring-white/20 shrink-0 hover:scale-110 transition-transform cursor-pointer shadow-md"
                      style={{ backgroundImage: `linear-gradient(to top right, var(--tw-gradient-stops))` }}
                      title={`${c.name} (${c.role})`}
                    >
                      <span className={`w-full h-full rounded-full bg-gradient-to-tr ${c.bg} flex items-center justify-center`}>
                        {c.name.charAt(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Groups / Peer Circles */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    My Study Groups
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <span className="w-5 h-5 rounded-full glass-pill flex items-center justify-center cursor-pointer">←</span>
                    <span className="w-5 h-5 rounded-full glass-pill flex items-center justify-center cursor-pointer">→</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl glass-pill flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-slate-900">A</div>
                      <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-slate-900">P</div>
                      <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-slate-900">+4</div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block leading-tight">Algorithm Sprint</span>
                      <span className="text-[10px] text-slate-400">11:19 AM Active</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 cursor-pointer hover:bg-cyan-400/20 transition-colors">
                    Reply
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Explore Other Opportunities */}
          {recommendations.exploreOther && recommendations.exploreOther.length > 0 && (
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Explore Other Opportunities
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-slate-700 dark:text-slate-300 border border-white/10">
                    {recommendations.exploreOther.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You satisfy all academic criteria for these roles, but they lie outside your primary <strong>{preferenceMode.replace('_', ' ')}</strong> preference.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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

        {/* Right Rail: "My Cards" (Active Applications Vault directly matching reference screenshot) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-7 rounded-[36px] space-y-6 shadow-2xl">
            {/* Header matching "My Cards" */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  My Cards
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {applications.length || 4} Active Applications
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.location.href = '/opportunities'}
                  className="w-10 h-10 rounded-2xl btn-glow-blue text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  title="Discover New Drives"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Total Balance / Portfolio Valuation Card */}
            <div className="p-5 rounded-3xl glass-pill relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-slate-300">
                    🔒
                  </span>
                  <span className="font-bold text-[11px] text-slate-300 uppercase tracking-wider">
                    Total Tracked Pipeline
                  </span>
                </div>
                <span className="text-lg">🇮🇳</span>
              </div>

              <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight my-2">
                ₹34,50,000
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <Link
                  to="/opportunities"
                  className="py-2.5 px-3 rounded-2xl text-center text-xs font-black text-white btn-glow-blue flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Apply New</span>
                </Link>
                <Link
                  to="/applications"
                  className="py-2.5 px-3 rounded-2xl text-center text-xs font-bold glass-pill text-slate-800 dark:text-slate-200 hover:bg-white/20 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Track Status</span>
                </Link>
              </div>
            </div>

            {/* Physical Gradient Card Stack (Matching Teal Debit Card & Apple Card in Reference Image) */}
            <div className="space-y-4">
              {/* Card 1: Emerald / Teal Gradient Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-tr from-teal-400 via-emerald-400 to-cyan-500 text-slate-900 shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900/80">
                    Campus Placement Pass
                  </span>
                  <span className="text-base text-slate-900/80">📶</span>
                </div>

                <div className="font-mono text-base font-black tracking-widest text-slate-950 mb-4">
                  5424 1809 •••• 2178
                </div>

                <div className="flex items-center justify-between text-xs text-slate-900/80">
                  <span className="font-bold">Rahul Verma (CSE)</span>
                  <span className="font-mono font-bold">2026 / 06</span>
                </div>
              </div>

              {/* Card 2: Magenta / Purple Apple Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-400 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-white/90">
                    External Career Pass
                  </span>
                  <span className="text-base text-white/90">📶</span>
                </div>

                <div className="font-mono text-base font-black tracking-widest text-white mb-4">
                  1101 2398 •••• 2930
                </div>

                <div className="flex items-center justify-between text-xs text-white/90">
                  <span className="font-bold">Verified Applicant</span>
                  <span className="font-mono font-bold">2026 / 10</span>
                </div>
              </div>
            </div>

            {/* "Show All ->" Pill button matching reference screenshot */}
            <Link
              to="/applications"
              className="w-full py-3 rounded-2xl glass-pill hover:bg-white/10 text-center text-xs font-black text-slate-900 dark:text-white flex items-center justify-center space-x-1 transition-all cursor-pointer"
            >
              <span>Show All Applications</span>
              <ArrowRight className="w-4 h-4 ml-1 text-cyan-400" />
            </Link>

            {/* Skill-Gap ROI Impact */}
            {skillGaps.gaps && skillGaps.gaps.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    CPIE High-ROI Skill Gaps
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    Unlock Potential
                  </span>
                </div>

                <div className="space-y-2">
                  {skillGaps.gaps.slice(0, 3).map((gap, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl glass-pill flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{gap.skillName}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
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
