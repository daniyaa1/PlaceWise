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
    <div className={`rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 glass-card ${cardTheme} group`}>
      {/* Subtle background wave texture lines */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-2xl group-hover:scale-125 transition-transform duration-500" />

      <div>
        {/* Top Header: Company Brand Icon & Status Badges */}
        <div className="flex items-start justify-between gap-2 mb-3 z-10 relative">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-sm text-slate-900 dark:text-white shadow-xs">
              {company_name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-white block leading-tight truncate max-w-[140px] sm:max-w-[170px]">
                {company_name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                {career_domain}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            {eligibility ? (
              <EligibilityBadge status={eligibility.status} size="xs" />
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 dark:bg-white/10 text-slate-800 dark:text-slate-200 backdrop-blur-sm border border-white/10">
                {isCampus ? 'Campus' : 'External'}
              </span>
            )}
            {is_demo_data && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30 font-semibold">
                DEMO
              </span>
            )}
          </div>
        </div>

        {/* Role Title */}
        <Link
          to={`/opportunities/${id}`}
          className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors line-clamp-1 mb-2 tracking-tight"
        >
          {title}
        </Link>

        {/* Big Bold Compensation (matching the $38.99 style in user reference) */}
        <div className="mb-3">
          <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            {formatCompensation(compensation_min, compensation_max)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-1.5">
            ({employment_type?.replace('_', ' ')?.toLowerCase()})
          </span>
        </div>

        {/* Recommendation Score Pill if available */}
        {recommendation && recommendation.score > 0 && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/10 text-[11px] text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center text-indigo-700 dark:text-cyan-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Fit Score: {recommendation.score}/100
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {recommendation.section === 'RECOMMENDED' ? 'Preferred Match' : 'Explore'}
            </span>
          </div>
        )}

        {/* Location & Deadline Pill */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-3 px-2.5 py-1.5 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-xs border border-white/10">
          <span className="flex items-center truncate">
            <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
            {location}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 ml-2">
            {work_mode?.toLowerCase()}
          </span>
        </div>

        {/* Skills Snippet */}
        {skills.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 mb-4">
            {skills.slice(0, 3).map((sk, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/10 text-slate-800 dark:text-slate-200 font-semibold"
              >
                {sk.name}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-1 font-medium">
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between z-10 relative">
        <Link
          to={`/opportunities/${id}`}
          className="text-xs font-bold text-slate-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 flex items-center transition-colors"
        >
          <span>View Dossier</span>
          <ArrowUpRight className="w-4 h-4 ml-0.5" />
        </Link>

        {onQuickApply && (
          <button
            onClick={() => onQuickApply(opportunity)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-950 dark:bg-white/20 hover:bg-slate-800 dark:hover:bg-white/30 backdrop-blur-md border border-white/10 transition-all shadow-xs"
          >
            Track Application
          </button>
        )}
      </div>
    </div>
  );
}
