import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  Banknote,
  Globe,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Terminal,
  Briefcase,
  Layers
} from 'lucide-react';
import EligibilityBadge from './EligibilityBadge';
import PreferenceBadge from './PreferenceBadge';
import SkillTag from './SkillTag';

export default function OpportunityCard({ opportunity, onQuickApply, variant = 'auto' }) {
  const {
    id,
    title,
    company_name,
    company_industry,
    career_domain,
    preference_group,
    employment_type,
    work_mode,
    location,
    compensation_min,
    compensation_max,
    compensation_currency = 'INR',
    application_deadline,
    source_type,
    college_scope,
    verification_status,
    institution_name,
    is_demo_data,
    skills = [],
    eligibility,
    recommendation
  } = opportunity;

  const formatCompensation = (min, max) => {
    if (!min && !max) return 'Competitive';
    const fmt = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)} LPA` : `₹${n.toLocaleString()}/mo`);
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(min || max);
  };

  const isCampus = source_type === 'CAMPUS';

  // Card theme styling matching the uploaded screenshot
  let cardTheme = 'glass-card-cyan';
  let accentColor = 'cyan';
  if (preference_group === 'TECHNICAL') {
    cardTheme = isCampus ? 'glass-card-emerald' : 'glass-card-cyan';
    accentColor = isCampus ? 'emerald' : 'cyan';
  } else {
    cardTheme = 'glass-card-purple';
    accentColor = 'purple';
  }

  return (
    <div className={`rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 glass-card ${cardTheme} group cursor-pointer shadow-2xl`}>
      {/* Decorative concentric topographical wave lines matching uploaded image */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-30" viewBox="0 0 300 220" preserveAspectRatio="none">
        <path d="M-20,180 C80,120 180,240 320,160" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40" />
        <path d="M-20,140 C100,90 200,200 320,120" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30" />
        <path d="M-20,100 C120,60 220,160 320,80" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20" />
      </svg>

      {/* Floating radial light hotspot */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 dark:bg-white/5 pointer-events-none blur-3xl group-hover:scale-125 transition-transform duration-700" />

      <div className="relative z-10">
        {/* Top Header: Floating Glass Brand Icon & Badges */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/30 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/20 flex items-center justify-center font-black text-base text-slate-900 dark:text-white shadow-lg shadow-black/10">
              {company_name.charAt(0)}
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-tight truncate max-w-[150px] sm:max-w-[180px]">
                {company_name}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block truncate">
                {career_domain}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            {eligibility ? (
              <EligibilityBadge status={eligibility.status} size="xs" />
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/30 dark:bg-white/10 text-slate-800 dark:text-slate-200 backdrop-blur-md border border-white/20">
                {isCampus ? 'Campus Drive' : 'External'}
              </span>
            )}
            {is_demo_data && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-amber-400/25 text-amber-800 dark:text-amber-300 border border-amber-400/40 font-bold">
                DEMO RECORD
              </span>
            )}
          </div>
        </div>

        {/* Role Title */}
        <Link
          to={`/opportunities/${id}`}
          className="text-lg font-black text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors line-clamp-1 mb-3 tracking-tight block"
        >
          {title}
        </Link>

        {/* Big Bold Compensation with Currency Icon (Exactly like $38.99 in reference) */}
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight drop-shadow-sm">
              {formatCompensation(compensation_min, compensation_max)}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold ml-2">
              • {employment_type?.replace('_', ' ')?.toLowerCase()}
            </span>
          </div>

          {/* Miniature Credit Card / Drive Emblem in bottom right of upper section */}
          <div className="hidden sm:flex items-center space-x-1.5 opacity-75">
            <div className="flex -space-x-1">
              <span className={`w-3.5 h-3.5 rounded-full ${accentColor === 'emerald' ? 'bg-emerald-400' : accentColor === 'purple' ? 'bg-pink-400' : 'bg-cyan-400'}`} />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400/80" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-slate-600 dark:text-slate-400">
              •••• {String(id).padStart(4, '0')}
            </span>
          </div>
        </div>

        {/* Recommendation Score Pill if available */}
        {recommendation && recommendation.score > 0 && (
          <div className="mb-3 px-3 py-1.5 rounded-2xl bg-white/25 dark:bg-black/35 backdrop-blur-md border border-white/15 text-[11px] text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center text-indigo-800 dark:text-cyan-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              CPIE Fit Score: {recommendation.score}/100
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
              {recommendation.section === 'RECOMMENDED' ? 'Match Mode Active' : 'Explore Outside Mode'}
            </span>
          </div>
        )}

        {/* Location & Work Mode Pill */}
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-3 px-3 py-1.5 rounded-2xl bg-white/20 dark:bg-black/25 backdrop-blur-md border border-white/15">
          <span className="flex items-center truncate">
            <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-500 shrink-0" />
            {location}
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 shrink-0 ml-2 font-medium">
            {work_mode?.replace('_', ' ')?.toLowerCase()}
          </span>
        </div>

        {/* Skills Snippet */}
        {skills.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 mb-2">
            {skills.slice(0, 3).map((sk, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 text-slate-900 dark:text-slate-200 font-semibold"
              >
                {sk.name}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-[11px] text-slate-600 dark:text-slate-400 pl-1 font-semibold">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-white/15 flex items-center justify-between relative z-10">
        <Link
          to={`/opportunities/${id}`}
          className="text-xs font-bold text-slate-900 dark:text-white hover:text-cyan-400 flex items-center transition-colors group/link"
        >
          <span>Opportunity Dossier</span>
          <ArrowUpRight className="w-4 h-4 ml-1 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>

        {onQuickApply && (
          <button
            onClick={() => onQuickApply(opportunity)}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-slate-900/80 dark:bg-white/20 hover:bg-slate-900 dark:hover:bg-white/30 backdrop-blur-xl border border-white/20 transition-all shadow-md shadow-black/20 cursor-pointer"
          >
            Track Status
          </button>
        )}
      </div>
    </div>
  );
}
