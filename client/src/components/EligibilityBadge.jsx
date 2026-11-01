import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function EligibilityBadge({ status, size = 'sm', showIcon = true }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const configs = {
    ELIGIBLE: {
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-xs shadow-emerald-500/10',
      icon: CheckCircle2,
      label: 'Eligible'
    },
    NOT_ELIGIBLE: {
      bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 shadow-xs shadow-rose-500/10',
      icon: XCircle,
      label: 'Not Eligible'
    },
    NEEDS_VERIFICATION: {
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 shadow-xs shadow-amber-500/10',
      icon: AlertCircle,
      label: 'Needs Verification'
    }
  };

  const current = configs[normalized] || {
    bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    icon: AlertCircle,
    label: normalized
  };

  const Icon = current.icon;
  const padding = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-bold rounded-full border backdrop-blur-md ${current.bg} ${padding} transition-all`}>
      {showIcon && <Icon className={`w-3.5 h-3.5 mr-1 shrink-0`} />}
      <span>{current.label}</span>
    </span>
  );
}
