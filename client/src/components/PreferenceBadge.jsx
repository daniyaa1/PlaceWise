import React from 'react';
import { Terminal, Briefcase, Split, Compass } from 'lucide-react';

export default function PreferenceBadge({ mode, group }) {
  const value = (group || mode || '').toUpperCase();

  const configs = {
    TECHNICAL: {
      bg: 'bg-indigo-500/10 text-indigo-700 dark:text-cyan-400 border-indigo-500/20',
      icon: Terminal,
      label: 'Technical'
    },
    NON_TECHNICAL: {
      bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      icon: Briefcase,
      label: 'Non-Technical'
    },
    BOTH: {
      bg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
      icon: Split,
      label: 'Both Domains'
    },
    OPEN_TO_ALL: {
      bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      icon: Compass,
      label: 'Open to All'
    }
  };

  const current = configs[value] || {
    bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    icon: Compass,
    label: value
  };

  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-md ${current.bg}`}>
      <Icon className="w-3 h-3 mr-1 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
