import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Compass,
  Terminal,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders
} from 'lucide-react';

export default function PreferencesPage() {
  const { refreshUser } = useAuth();
  const [currentMode, setCurrentMode] = useState('OPEN_TO_ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function loadPref() {
      try {
        setLoading(true);
        const res = await api.getPreferences();
        if (res.success && res.data) {
          setCurrentMode(res.data.preferenceMode);
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPref();
  }, []);

  const handleSelectMode = async (mode) => {
    if (mode === currentMode) return;
    setSaving(true);
    setMsg(null);
    try {
      await api.updatePreferences(mode);
      setCurrentMode(mode);
      await refreshUser();
      setMsg({ type: 'success', text: `Preference mode updated to ${mode.replace('_', ' ')}.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update preference.' });
    } finally {
      setSaving(false);
    }
  };

  const modes = [
    {
      id: 'TECHNICAL',
      title: 'Technical Roles',
      icon: Terminal,
      color: 'indigo',
      badge: 'Software & Engineering',
      description: 'Prioritizes software development, full-stack, cloud engineering, machine learning, and embedded hardware.',
      behavior: 'Matches technical opportunities in "Recommended for You". Other eligible roles appear in "Explore Other Opportunities".'
    },
    {
      id: 'NON_TECHNICAL',
      title: 'Non-Technical Roles',
      icon: Briefcase,
      color: 'teal',
      badge: 'Management & Operations',
      description: 'Prioritizes management trainee, business operations, IT consulting, marketing, and business development.',
      behavior: 'Matches non-technical opportunities in "Recommended for You". Other eligible roles appear in "Explore Other Opportunities".'
    },
    {
      id: 'BOTH',
      title: 'Both Domains',
      icon: Layers,
      color: 'purple',
      badge: 'Dual Focus',
      description: 'Actively recommends eligible opportunities across both technical and business/management paths equally.',
      behavior: 'Both technical and non-technical eligible roles are ranked and recommended without penalty.'
    },
    {
      id: 'OPEN_TO_ALL',
      title: 'Open to All Domains',
      icon: Compass,
      color: 'amber',
      badge: 'Maximal Discovery',
      description: 'Displays all eligible campus and external opportunities without applying domain preference filters.',
      behavior: 'Standard ranking strictly according to skills, location, and work mode.'
    }
  ];

  if (loading) return <LoadingSpinner text="Loading career preferences..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-2">
          <Sliders className="w-3.5 h-3.5 text-indigo-600 mr-1" />
          <span>Core Recommendation Settings</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Career Preference Mode</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          PlaceWise does not infer your ambition from your engineering branch. Choose how you want the Career Path Intelligence Engine (CPIE) to prioritize your discovery feed.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Mode Selection Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = currentMode === m.id;

          return (
            <div
              key={m.id}
              onClick={() => handleSelectMode(m.id)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected ? (
                    <span className="inline-flex items-center text-xs font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Active Mode
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                      {m.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">{m.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{m.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">CPIE Feed Behavior: </span>
                {m.behavior}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanatory Policy Card */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center">
          <Sparkles className="w-4 h-4 text-indigo-600 mr-1.5" />
          The PlaceWise Career Preference Guarantee
        </h4>
        <p className="leading-relaxed">
          Selecting a preference mode never permanently hides an eligible opportunity. If you choose <strong>Technical</strong>, eligible non-technical drives are still accessible right under the <em>Explore Other Opportunities</em> section on your dashboard.
        </p>
      </div>
    </div>
  );
}
