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
  Sparkles, Briefcase, Clock, ArrowRight, TrendingUp,
  Sliders, FileText, Plus, ChevronRight, ChevronLeft,
  ArrowUpRight, BarChart3, Users, MessageSquare, Search, Filter
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState({ recommended: [], exploreOther: [], ineligible: [] });
  const [preferenceMode, setPreferenceMode] = useState('OPEN_TO_ALL');
  const [skillGaps, setSkillGaps] = useState({ gaps: [] });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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
      if (recRes.success) { setRecommendations(recRes.data); setPreferenceMode(recRes.preferenceMode); }
      if (gapRes.success) setSkillGaps(gapRes.data);
      if (appRes.success) setApplications(appRes.data);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

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
      await api.createApplication({ driveId: selectedDrive.id, status: trackStatus, notes: trackNotes });
      setTrackMessage({ type: 'success', text: 'Application tracked successfully!' });
      setTimeout(() => { setTrackModalOpen(false); loadDashboardData(); }, 1200);
    } catch (err) {
      setTrackMessage({ type: 'error', text: err.message || 'Failed to record application.' });
    } finally {
      setTrackSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Computing CPIE recommendations and eligibility..." />;

  const eligibleCount = (recommendations.recommended?.length || 0) + (recommendations.exploreOther?.length || 0);
  const topOpportunities = recommendations.recommended?.slice(0, 3) || [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const formatComp = (min, max) => {
    if (!min && !max) return 'Competitive';
    const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString()}`;
    return (min && max) ? `${fmt(min)}–${fmt(max)}` : fmt(min || max);
  };

  const cardThemes = [
    { bg: 'from-emerald-500 via-teal-500 to-cyan-500', glow: 'rgba(16,185,129,0.4)', border: 'rgba(52,211,153,0.45)', icon: '🎯', label: 'Campus Drive' },
    { bg: 'from-fuchsia-600 via-pink-500 to-rose-400', glow: 'rgba(236,72,153,0.4)', border: 'rgba(244,114,182,0.45)', icon: '🚀', label: 'External Role' },
    { bg: 'from-slate-500 via-slate-400 to-slate-300', glow: 'rgba(100,116,139,0.35)', border: 'rgba(148,163,184,0.4)', icon: '🌐', label: 'Open Role' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* ══════════════════════════════════════════════════
          TOP HEADER BAR
          Matches: Allen Thompson · 43m ago · Flagged Section · Search · +9 New Messages
      ══════════════════════════════════════════════════ */}
      <div className="glass-panel rounded-[28px] px-5 py-4 flex items-center justify-between gap-4 shadow-2xl" style={{ animation: 'slideUpFade 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        {/* Left: avatar + name + time + flag badge */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-cyan-500/30 ring-2 ring-white/20 shrink-0">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{timeStr}</span>
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 hidden sm:block shrink-0" />
          <span className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-pill text-[11px] font-bold text-slate-700 dark:text-slate-200 shrink-0">
            <span>🚩</span><span>Intelligence Active</span>
          </span>
        </div>

        {/* Center: Search capsule */}
        <Link to="/opportunities" className="hidden lg:flex flex-1 max-w-xs">
          <div className="w-full glass-pill px-4 py-2.5 rounded-full flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-all">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>Search opportunities...</span>
          </div>
        </Link>

        {/* Right: preference badge + notification pill */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="hidden sm:flex items-center space-x-1.5">
            <PreferenceBadge mode={preferenceMode} />
            <Link to="/preferences" className="text-[10px] font-bold text-cyan-500 hover:underline flex items-center cursor-pointer">
              <Sliders className="w-3 h-3 mr-0.5" />Edit
            </Link>
          </div>
          <Link
            to="/notifications"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-full glass-pill text-xs font-bold text-slate-800 dark:text-white hover:border-cyan-500/40 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] shrink-0" />
            <span>+{eligibleCount} New Matches</span>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN 2-COLUMN GRID
      ══════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ─────────── LEFT 2/3 ─────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── RECENT OPPORTUNITIES (3 gradient cards) ── */}
          <div style={{ animation: 'slideUpFade 0.45s 0.05s cubic-bezier(0.16,1,0.3,1) both' }}>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Opportunities</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{recommendations.recommended?.length || 0} Matches</span>
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                {[BarChart3, Filter, ChevronLeft, ChevronRight].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-xl glass-pill flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer">
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Gradient cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {topOpportunities.length > 0 ? topOpportunities.map((opp, idx) => {
                const t = cardThemes[idx] || cardThemes[0];
                return (
                  <div
                    key={opp.id}
                    className={`relative rounded-[28px] p-5 flex flex-col justify-between bg-gradient-to-tr ${t.bg} text-white overflow-hidden group cursor-pointer dash-card`}
                    style={{ boxShadow: `0 20px 45px -10px ${t.glow}, inset 0 1px 1.5px rgba(255,255,255,0.3)`, border: `1px solid ${t.border}`, minHeight: '190px' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[28px]" />
                    {/* Top */}
                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div>
                        <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-xl flex items-center justify-center font-black text-base text-white shadow-md mb-2 border border-white/20">
                          {opp.company_name?.charAt(0)}
                        </div>
                        <p className="font-extrabold text-sm text-white leading-tight truncate max-w-[110px]">{opp.company_name}</p>
                        <p className="text-[10px] text-white/70 mt-0.5">{t.label}</p>
                      </div>
                      <span className="text-lg">{t.icon}</span>
                    </div>
                    {/* Bottom */}
                    <div className="relative z-10">
                      <p className="text-2xl font-black tracking-tight drop-shadow mb-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatComp(opp.compensation_min, opp.compensation_max)}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[11px] text-white/60 tracking-widest">•••• {String(opp.id).padStart(4, '0')}</span>
                        <span className="text-[10px] text-white/85 font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur">
                          {opp.source_type === 'CAMPUS' ? 'Campus' : 'External'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuickApply(opp)}
                        className="w-full py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur border border-white/25 text-white transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /><span>Track Status</span>
                      </button>
                    </div>
                  </div>
                );
              }) : null}

              {/* Placeholder cards if fewer than 3 */}
              {Array.from({ length: Math.max(0, 3 - topOpportunities.length) }).map((_, i) => {
                const t = cardThemes[topOpportunities.length + i] || cardThemes[2];
                return (
                  <Link
                    key={`ph-${i}`}
                    to="/opportunities"
                    className={`relative rounded-[28px] p-5 flex flex-col items-center justify-center bg-gradient-to-tr ${t.bg} text-white overflow-hidden cursor-pointer opacity-50 hover:opacity-70 transition-opacity`}
                    style={{ border: `1px solid ${t.border}`, minHeight: '190px' }}
                  >
                    <Plus className="w-8 h-8 text-white/60 mb-2" />
                    <span className="text-xs font-bold text-white/60">Discover More</span>
                  </Link>
                );
              })}

              {topOpportunities.length === 0 && (
                <div className="sm:col-span-3">
                  <EmptyState
                    title="No direct recommendation matches"
                    description="Explore other opportunities below that satisfy all your academic eligibility requirements."
                    actionLabel="Explore All Opportunities"
                    onAction={() => window.location.href = '/opportunities'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── CHANGES CHART + CONTACTS LIST ── */}
          <div className="grid md:grid-cols-2 gap-5" style={{ animation: 'slideUpFade 0.45s 0.10s cubic-bezier(0.16,1,0.3,1) both' }}>

            {/* Changes Chart */}
            <div className="glass-panel p-6 rounded-[28px] relative overflow-hidden shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Changes Chart</h3>
                  <p className="text-[11px] text-slate-500">CTC trajectory over time</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl glass-pill text-slate-600 dark:text-slate-300 cursor-pointer">Cohort 2026 ▾</span>
                  <span className="text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">+6.23%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-xl bg-blue-500 flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-white" />
                  </span>
                  <span className="w-6 h-6 rounded-xl glass-pill flex items-center justify-center text-slate-400 text-xs">■</span>
                </div>
                <span>Updated on {timeStr}</span>
              </div>

              {/* SVG Spline */}
              <div className="relative flex-1 min-h-[110px]">
                <svg viewBox="0 0 320 100" className="w-full h-28 overflow-visible">
                  <defs>
                    <linearGradient id="cwGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[{ v: '₹10k', y: 8 }, { v: '₹5k', y: 36 }, { v: '₹2k', y: 64 }, { v: '₹0', y: 92 }].map((l, i) => (
                    <text key={i} x="2" y={l.y} fontSize="7" fill="rgba(148,163,184,0.65)" fontFamily="monospace">{l.v}</text>
                  ))}
                  <line x1="182" y1="20" x2="182" y2="90" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                  <path d="M 22 85 C 60 85, 90 55, 132 68 C 168 80, 172 22, 192 22 C 210 22, 222 74, 252 60 C 278 47, 296 68, 318 64 L 318 100 L 22 100 Z" fill="url(#cwGrad)" />
                  <path d="M 22 85 C 60 85, 90 55, 132 68 C 168 80, 172 22, 192 22 C 210 22, 222 74, 252 60 C 278 47, 296 68, 318 64" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' }} />
                  <circle cx="192" cy="22" r="5" fill="#38bdf8" stroke="#fff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }} />
                </svg>
                {/* Tooltip */}
                <div className="absolute top-0 left-[57%] -translate-x-1/2 glass-elevated px-3 py-1.5 rounded-2xl shadow-xl border border-cyan-400/40 text-[11px] flex items-center space-x-1.5 pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white text-[9px] font-black shrink-0">A</div>
                  <span className="font-bold text-slate-900 dark:text-white">Avg Offer</span>
                  <span className="text-cyan-400 font-black">₹14.2L</span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-white/5 mt-1">
                <span>Nov 1</span><span>Nov 15</span><span>Nov 30</span>
              </div>
            </div>

            {/* Contacts List */}
            <div className="glass-panel p-6 rounded-[28px] space-y-4 shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Contacts List</h3>
                  <button className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer flex items-center space-x-1">
                    <span>✏ Edit List</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>81 People</span>
                  <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">📩 9 Recently Added</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Popular Contacts</span>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {[
                    { n: 'Dr. Sen', bg: 'from-amber-400 to-orange-500' },
                    { n: 'Priya M', bg: 'from-cyan-400 to-blue-500' },
                    { n: 'Rohan K', bg: 'from-purple-400 to-indigo-500' },
                    { n: 'Admin', bg: 'from-emerald-400 to-teal-500' },
                    { n: 'Vikram', bg: 'from-pink-400 to-rose-500' },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full bg-gradient-to-tr ${c.bg} flex items-center justify-center text-white text-xs font-black ring-2 ring-white/20 hover:scale-110 transition-transform cursor-pointer shadow-md shrink-0`}
                      title={c.n}
                    >
                      {c.n.charAt(0)}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-slate-400 hover:scale-110 transition-transform cursor-pointer shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Groups</span>
                  <div className="flex items-center space-x-1.5">
                    <button className="w-6 h-6 rounded-lg glass-pill flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer text-xs transition-colors">←</button>
                    <button className="w-6 h-6 rounded-lg glass-pill flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer text-xs transition-colors">→</button>
                  </div>
                </div>
                {[
                  { g: 'Algorithm Sprint', t: '11:19 AM', members: ['A', 'P', '+4'] },
                  { g: 'Mock Interview Club', t: '2:30 PM', members: ['R', 'S', '+2'] },
                ].map((grp, gi) => (
                  <div key={gi} className="p-3 rounded-2xl glass-pill flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="flex -space-x-2">
                        {grp.members.map((m, mi) => (
                          <div key={mi} className={`w-7 h-7 rounded-full ${mi === 0 ? 'bg-cyan-500' : mi === 1 ? 'bg-purple-500' : 'bg-indigo-500'} text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-slate-50 dark:ring-slate-900`}>{m}</div>
                        ))}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">{grp.g}</span>
                        <span className="text-[10px] text-slate-400">{grp.t} Active</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 text-[10px]">₹ 120.00 →</span>
                      <button className="px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 cursor-pointer hover:bg-cyan-400/20 transition-colors">Reply</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── EXPLORE OTHER OPPORTUNITIES ── */}
          {recommendations.exploreOther && recommendations.exploreOther.length > 0 && (
            <div className="space-y-4 pt-2" style={{ animation: 'slideUpFade 0.45s 0.15s cubic-bezier(0.16,1,0.3,1) both' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Explore Other Opportunities</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-slate-700 dark:text-slate-300 border border-white/10">
                    {recommendations.exploreOther.length}
                  </span>
                </div>
                <Link to="/opportunities" className="text-xs font-bold text-cyan-500 hover:text-cyan-400 flex items-center">
                  Browse All <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You satisfy all academic criteria for these roles, but they lie outside your primary{' '}
                <strong>{preferenceMode.replace('_', ' ')}</strong> preference.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendations.exploreOther.slice(0, 4).map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} onQuickApply={handleQuickApply} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─────────── RIGHT 1/3 — MY CARDS PANEL ─────────── */}
        <div style={{ animation: 'slideUpFade 0.45s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div className="glass-panel p-6 rounded-[32px] space-y-5 shadow-2xl">

            {/* Header: My Cards + count + buttons */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">My Cards</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{applications.length || 4} Active Applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="w-9 h-9 rounded-2xl glass-pill text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-2xl glass-pill text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors font-bold text-sm">
                  ···
                </button>
                <button
                  onClick={() => window.location.href = '/opportunities'}
                  className="w-9 h-9 rounded-2xl btn-glow-blue text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Balance / Pipeline block */}
            <div className="p-5 rounded-3xl glass-pill relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center text-base">🔒</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Total Balance</p>
                    <p className="text-[10px] text-cyan-500 font-bold flex items-center mt-0.5 cursor-pointer">
                      Main Accounts ▾
                    </p>
                  </div>
                </div>
                <span className="text-xl">🇮🇳</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight my-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ₹34,50,000
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/opportunities"
                  className="py-2.5 rounded-2xl text-xs font-black text-white btn-glow-blue flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" /><span>Transfer</span>
                </Link>
                <Link
                  to="/applications"
                  className="py-2.5 rounded-2xl text-xs font-bold glass-pill text-slate-800 dark:text-slate-200 hover:bg-white/20 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" /><span>Withdraw</span>
                </Link>
              </div>
            </div>

            {/* Physical Card 1 — Teal / Emerald (Debit Card) */}
            <div
              className="p-5 rounded-3xl bg-gradient-to-tr from-teal-400 via-emerald-400 to-cyan-500 text-slate-900 relative overflow-hidden cursor-pointer dash-card"
              style={{ boxShadow: '0 20px 45px -10px rgba(16,185,129,0.45), inset 0 1px 1.5px rgba(255,255,255,0.55)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none rounded-3xl" />
              <div className="relative z-10 flex items-center justify-between mb-5">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-900/80">Debit Card</span>
                <span className="text-base">📶</span>
              </div>
              <div className="relative z-10 mb-4 flex items-center space-x-2">
                <div className="w-8 h-5 rounded-md bg-amber-400 border border-amber-300 shadow-sm" />
                <span className="font-mono text-[13px] font-black tracking-widest text-slate-950">5424 1809 •••• 2178</span>
              </div>
              <div className="relative z-10 flex items-center justify-between text-xs text-slate-900/80">
                <span className="font-bold">{user?.firstName} {user?.lastName}</span>
                <span className="font-mono font-bold">2028 / 06</span>
              </div>
            </div>

            {/* Physical Card 2 — Pink / Purple (Apple Card) */}
            <div
              className="p-5 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-400 text-white relative overflow-hidden cursor-pointer dash-card"
              style={{ boxShadow: '0 20px 45px -10px rgba(236,72,153,0.45), inset 0 1px 1.5px rgba(255,255,255,0.35)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-3xl" />
              <div className="relative z-10 flex items-center justify-between mb-5">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-white/90">Apple Card</span>
                <span className="text-base">📶</span>
              </div>
              <div className="relative z-10 mb-4 flex items-center space-x-2">
                <span className="text-lg">🍎</span>
                <span className="font-mono text-[13px] font-black tracking-widest text-white">1101 2398 •••• 2930</span>
              </div>
              <div className="relative z-10 flex items-center justify-between text-xs text-white/90">
                <span className="font-bold">Verified Applicant</span>
                <span className="font-mono font-bold">2026 / 10</span>
              </div>
            </div>

            {/* Show All */}
            <Link
              to="/applications"
              className="w-full py-3 rounded-2xl glass-pill text-center text-xs font-black text-slate-900 dark:text-white flex items-center justify-center space-x-1.5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <span>Show All</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>

            {/* CPIE Skill Gaps */}
            {skillGaps.gaps && skillGaps.gaps.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CPIE Skill Gaps</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold cursor-pointer hover:underline">Unlock Potential</span>
                </div>
                {skillGaps.gaps.slice(0, 3).map((gap, i) => (
                  <div key={i} className="p-3 rounded-2xl glass-pill flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{gap.skillName}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      +{gap.frequency * 15}% Fit
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          QUICK TRACK MODAL
      ══════════════════════════════════════════════════ */}
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
              <select value={trackStatus} onChange={e => setTrackStatus(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                <option value="INTERESTED">Bookmarked / Interested</option>
                <option value="APPLIED">Submitted Application</option>
                <option value="ASSESSMENT">Online Assessment Scheduled</option>
                <option value="INTERVIEW">Interview Round</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Notes (Optional)</label>
              <textarea value={trackNotes} onChange={e => setTrackNotes(e.target.value)} placeholder="e.g. Applied via official portal, referral link." rows={3} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            </div>
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button type="button" onClick={() => setTrackModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 cursor-pointer">Cancel</button>
              <button type="submit" disabled={trackSubmitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-cyan-500 text-white hover:bg-slate-800 dark:hover:bg-cyan-400 disabled:opacity-60 cursor-pointer">
                {trackSubmitting ? 'Saving...' : 'Confirm Tracking'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
