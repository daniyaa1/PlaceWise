import React from 'react';
import { Terminal, Briefcase, Split, Compass } from 'lucide-react';

export default function PreferenceBadge({ mode, group }) {
  const value = (group || mode || '').toUpperCase();

  const configs = {
    TECHNICAL: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Terminal,
      label: 'Technical'
    },
    NON_TECHNICAL: {
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Briefcase,
      label: 'Non-Technical'
    },
    BOTH: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Split,
      label: 'Both Technical & Non-Tech'
    },
    OPEN_TO_ALL: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Compass,
      label: 'Open to All Domains'
    }
  };

  const current = configs[value] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Compass,
    label: value
  };

  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${current.bg}`}>
      <Icon className="w-3 h-3 mr-1 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
