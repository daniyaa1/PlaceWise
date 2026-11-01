import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function EligibilityBadge({ status, size = 'sm', showIcon = true }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const configs = {
    ELIGIBLE: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Eligible'
    },
    NOT_ELIGIBLE: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Not Eligible'
    },
    NEEDS_VERIFICATION: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
      label: 'Needs Verification'
    }
  };

  const current = configs[normalized] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle,
    label: normalized
  };

  const Icon = current.icon;
  const padding = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${current.bg} ${padding}`}>
      {showIcon && <Icon className={`w-3.5 h-3.5 mr-1 shrink-0`} />}
      <span>{current.label}</span>
    </span>
  );
}
