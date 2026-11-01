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
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-College Career & Placement Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] mb-6">
              Discover opportunities through your college <span className="text-indigo-600">and beyond it.</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              PlaceWise unifies on-campus recruitment drives with verified off-campus opportunities. With our transparent Career Path Intelligence Engine (CPIE), your engineering branch never restricts your aspirations.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'STUDENT' ? '/dashboard' : user?.role === 'PLACEMENT_ADMIN' ? '/admin/dashboard' : '/platform/moderation'}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm flex items-center"
                >
                  Go to {user?.role === 'STUDENT' ? 'Student Dashboard' : 'Admin Portal'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm flex items-center"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors border border-slate-200"
                  >
                    Explore Demo Accounts
                  </Link>
                </>
              )}
              <Link
                to="/opportunities"
                className="px-5 py-3 rounded-xl font-semibold text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
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
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Dual Sourcing</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Two Opportunity Sources in One View</h2>
          <p className="text-sm text-slate-600 mt-2">
            Never miss out on openings simply because a company chose off-campus recruitment or visited another campus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Campus Opportunities</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Direct recruitment drives published by your university placement cell. Filtered strictly to your authorized institution, graduation year, and academic eligibility criteria.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" /> On-campus recruitment drives & internships</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" /> Verified college-specific eligibility criteria</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" /> Direct coordination with placement administrators</li>
            </ul>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">External Opportunities</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Off-campus early careers, graduate engineering trainee programmes, and corporate openings. Clearly distinguished by verification status and college eligibility scope.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" /> Open to all colleges & selected partner institutions</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" /> Verified official application URLs (no scraping illusions)</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" /> Platform moderation & expiry tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Four Career Preference Modes */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">No Stereotypes</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Your Engineering Branch Is Academic. Your Career Preference Is Your Choice.
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              A Mechanical student can prefer software; a CSE student can target management consulting. PlaceWise supports exactly four explicit preference modes:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">1. Technical</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioritizes software, AI/ML, cloud, data engineering, and embedded systems.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">2. Non-Technical</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioritizes management trainee, business analysis, operations, and consulting.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">3. Both</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recommends eligible roles across both technical and non-technical domains equally.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">4. Open to All</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explores all eligible opportunities without domain preference filtering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CPIE Intelligence Engine Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1 space-y-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Engine Power</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Career Path Intelligence Engine (CPIE)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              CPIE decouples academic eligibility from personal preference. Every recommendation is mathematically explainable and based on real verified records.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Experience CPIE in Action <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
              <h4 className="font-bold text-sm text-slate-900 mb-1">Eligibility Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict evaluation: ELIGIBLE, NOT_ELIGIBLE, or NEEDS_VERIFICATION. Missing data never falsely passes criteria.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <TrendingUp className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-bold text-sm text-slate-900 mb-1">Explainable Ranking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scored via 0.40P + 0.35K + 0.15W + 0.10L. Ineligible jobs are never recommended.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <Sliders className="w-6 h-6 text-teal-600 mb-2" />
              <h4 className="font-bold text-sm text-slate-900 mb-1">Mandatory vs Desirable</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Missing desirable skills never fail eligibility, keeping student exploration fair and transparent.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <Sparkles className="w-6 h-6 text-amber-600 mb-2" />
              <h4 className="font-bold text-sm text-slate-900 mb-1">Skill-Gap Impact</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aggregates high-impact missing skills across eligible openings with clear market indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Helper Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-950">Demonstration Accounts Ready</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                All accounts use password: <code className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-bold text-indigo-950">Demo@1234</code>
              </p>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0"
            >
              Sign In with Demo Account
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <span className="font-bold text-slate-900 block">Student (Technical)</span>
              <span className="text-slate-600 font-mono text-[11px] block truncate">rohan.cse@auk.edu</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Amity Kolkata, CSE, 8.8 CGPA</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <span className="font-bold text-slate-900 block">Student (Both Domains)</span>
              <span className="text-slate-600 font-mono text-[11px] block truncate">ananya.ece@auk.edu</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Amity Kolkata, ECE, 7.6 CGPA</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <span className="font-bold text-slate-900 block">Placement Admin</span>
              <span className="text-slate-600 font-mono text-[11px] block truncate">placement@auk.placewise.io</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Amity Kolkata Placement Cell</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <span className="font-bold text-slate-900 block">Platform Admin</span>
              <span className="text-slate-600 font-mono text-[11px] block truncate">admin@placewise.io</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Moderation & Institutions HQ</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
