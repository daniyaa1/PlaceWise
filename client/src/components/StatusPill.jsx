import React from 'react';

export default function StatusPill({ status }) {
  const configs = {
    INTERESTED: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    APPLIED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    ASSESSMENT: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    INTERVIEW: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    SELECTED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold',
    REJECTED: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    WITHDRAWN: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'
  };

  const style = configs[status] || 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md ${style}`}>
      {status}
    </span>
  );
}
