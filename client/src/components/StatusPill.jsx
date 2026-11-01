import React from 'react';

export default function StatusPill({ status }) {
  const configs = {
    INTERESTED: 'bg-slate-100 text-slate-700 border-slate-200',
    APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSESSMENT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    INTERVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
    SELECTED: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    WITHDRAWN: 'bg-zinc-100 text-zinc-600 border-zinc-200'
  };

  const style = configs[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}
