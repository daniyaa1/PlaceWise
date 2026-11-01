import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Building2,
  Globe,
  Sliders,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
  Briefcase
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/80 dark:border-white/10 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-cyan-400 mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Multi-College Career & Placement Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.1] mb-6">
              Discover opportunities through your college <span className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">and beyond it.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 font-medium">
              PlaceWise unifies on-campus recruitment drives with verified off-campus opportunities. With our transparent Career Path Intelligence Engine (CPIE), your engineering branch never restricts your aspirations.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'STUDENT' ? '/dashboard' : user?.role === 'PLACEMENT_ADMIN' ? '/admin/dashboard' : '/platform/moderation'}
                  className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 flex items-center"
                >
                  Go to {user?.role === 'STUDENT' ? 'Student Dashboard' : 'Admin Portal'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 flex items-center"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm glass-panel text-slate-800 dark:text-white hover:bg-white/20 transition-all border border-slate-200 dark:border-white/10"
                  >
                    Explore Demo Accounts
                  </Link>
                </>
              )}
              <Link
                to="/opportunities"
                className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Browse Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Two Opportunity Sources */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Dual Sourcing</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Two Opportunity Sources in One View</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Never miss out on openings simply because a company chose off-campus recruitment or visited another campus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel p-7 rounded-3xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-cyan-400 mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Campus Opportunities</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Direct recruitment drives published by your university placement cell. Filtered strictly to your authorized institution, graduation year, and academic eligibility criteria.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> On-campus recruitment drives & internships</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Verified college-specific eligibility criteria</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Direct coordination with placement administrators</li>
            </ul>
          </div>

          <div className="glass-panel p-7 rounded-3xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">External Opportunities</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Off-campus early careers, graduate engineering trainee programmes, and corporate openings. Clearly distinguished by verification status and college eligibility scope.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Open to all colleges & selected partner institutions</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Verified official application URLs (no scraping illusions)</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Platform moderation & expiry tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Four Career Preference Modes */}
      <section className="glass-panel py-16 border-y border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">No Stereotypes</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Your Engineering Branch Is Academic. Your Career Preference Is Your Choice.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              A Mechanical student can prefer software; a CSE student can target management consulting. PlaceWise supports exactly four explicit preference modes:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card glass-card-cyan p-5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-md flex items-center justify-center mb-3 text-cyan-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">1. Technical</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Prioritizes software, AI/ML, cloud, data engineering, and embedded systems.
              </p>
            </div>

            <div className="glass-card glass-card-purple p-5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-md flex items-center justify-center mb-3 text-purple-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">2. Non-Technical</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Prioritizes management trainee, business operations, IT consulting, and finance.
              </p>
            </div>

            <div className="glass-card glass-card-emerald p-5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-md flex items-center justify-center mb-3 text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">3. Both</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Recommends eligible roles across both technical and business paths equally.
              </p>
            </div>

            <div className="glass-card glass-panel p-5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-md flex items-center justify-center mb-3 text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">4. Open to All</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Explores all eligible opportunities without domain preference filtering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel border border-cyan-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Demonstration Accounts Ready</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All accounts use password: <code className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold text-cyan-600 dark:text-cyan-400">Demo@1234</code>
              </p>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-white hover:bg-cyan-400 transition-colors shrink-0 shadow-md shadow-cyan-500/20"
            >
              Sign In with 1-Click
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="font-bold text-slate-900 dark:text-white block">Student (Technical)</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] block truncate">rohan.cse@auk.edu</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Amity Kolkata, CSE, 8.8 CGPA</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="font-bold text-slate-900 dark:text-white block">Student (Both Domains)</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] block truncate">ananya.ece@auk.edu</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Amity Kolkata, ECE, 7.6 CGPA</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="font-bold text-slate-900 dark:text-white block">Placement Admin</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] block truncate">placement@auk.placewise.io</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Amity Placement Cell</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="font-bold text-slate-900 dark:text-white block">Platform Admin</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] block truncate">admin@placewise.io</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Moderation & Institutions HQ</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
