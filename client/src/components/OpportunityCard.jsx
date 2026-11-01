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
  ArrowRight
} from 'lucide-react';
import EligibilityBadge from './EligibilityBadge';
import PreferenceBadge from './PreferenceBadge';
import SkillTag from './SkillTag';

export default function OpportunityCard({ opportunity, onQuickApply }) {
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
    if (!min && !max) return 'Not Disclosed';
    const fmt = (n) => (n >= 100000 ? `${(n / 100000).toFixed(1)} LPA` : `₹${n.toLocaleString()}/mo`);
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(min || max);
  };

  const isCampus = source_type === 'CAMPUS';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs hover:shadow-sm p-5 flex flex-col justify-between group">
      <div>
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="font-semibold text-xs text-slate-800 tracking-tight flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {company_name}
            </span>

            {is_demo_data && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
                DEMO
              </span>
            )}

            {isCampus ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Campus Drive ({institution_name || 'College'})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 flex items-center">
                <Globe className="w-2.5 h-2.5 mr-1 text-slate-400" />
                {college_scope === 'OPEN_TO_ALL_COLLEGES' ? 'Off-Campus (Open)' : 'Off-Campus (Partner)'}
              </span>
            )}

            {verification_status === 'VERIFIED' && (
              <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                Verified
              </span>
            )}
          </div>

          {/* Eligibility Badge if calculated */}
          {eligibility && (
            <EligibilityBadge status={eligibility.status} size="xs" />
          )}
        </div>

        {/* Role Title */}
        <Link
          to={`/opportunities/${id}`}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 block mb-1"
        >
          {title}
        </Link>

        {/* Domain & Preference Badges */}
        <div className="flex items-center flex-wrap gap-1.5 mb-3">
          <span className="text-xs text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
            {career_domain}
          </span>
          <PreferenceBadge group={preference_group} />
          <span className="text-[11px] text-slate-500 font-medium">
            {employment_type?.replace('_', ' ')}
          </span>
        </div>

        {/* Key Job Attributes */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-600 mb-3.5 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center text-slate-700 font-medium">
            <Banknote className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span className="truncate">{formatCompensation(compensation_min, compensation_max)}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span className="truncate">{location} ({work_mode?.toLowerCase()})</span>
          </div>
          <div className="flex items-center col-span-2 text-slate-500 text-[11px]">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span>Deadline: {new Date(application_deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Recommendation explanation note */}
        {recommendation && recommendation.score > 0 && (
          <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 flex items-start space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="line-clamp-2">
              <span className="font-semibold mr-1">Score: {recommendation.score}/100</span>
              <span className="text-indigo-800">{recommendation.explanation}</span>
            </div>
          </div>
        )}

        {/* Skills Snippet */}
        {skills.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 mb-4">
            {skills.slice(0, 4).map((sk, idx) => (
              <SkillTag key={idx} name={sk.name} isMandatory={sk.is_mandatory} />
            ))}
            {skills.length > 4 && (
              <span className="text-[10px] text-slate-500 font-medium pl-1">
                +{skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/opportunities/${id}`}
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center group-hover:translate-x-0.5 transition-transform"
        >
          View Requirements <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>

        {onQuickApply && (
          <button
            onClick={() => onQuickApply(opportunity)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Track Application
          </button>
        )}
      </div>
    </div>
  );
}
