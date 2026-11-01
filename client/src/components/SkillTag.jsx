import React from 'react';

export default function SkillTag({ name, isMandatory = false, matched = null }) {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (matched === true) {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
  } else if (matched === false && isMandatory) {
    style = 'bg-rose-50 text-rose-800 border-rose-200 font-medium';
  } else if (isMandatory) {
    style = 'bg-slate-900 text-white border-slate-900 font-semibold';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${style}`}>
      <span>{name}</span>
      {isMandatory && (
        <span className="ml-1 text-[9px] uppercase tracking-wider opacity-80">(Req)</span>
      )}
    </span>
  );
}
