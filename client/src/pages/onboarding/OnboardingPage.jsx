import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Compass,
  Terminal,
  Briefcase,
  Layers,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [preferenceMode, setPreferenceMode] = useState('TECHNICAL');
  const [profile, setProfile] = useState({
    branch: 'CSE',
    graduationYear: 2026,
    cgpa: 8.0,
    activeBacklogs: 0,
    preferredWorkMode: 'HYBRID'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getProfile();
        if (res.success && res.data) {
          setProfile({
            branch: res.data.branch || 'CSE',
            graduationYear: res.data.graduation_year || 2026,
            cgpa: res.data.cgpa || 8.0,
            activeBacklogs: res.data.active_backlogs || 0,
            preferredWorkMode: res.data.preferred_work_mode || 'HYBRID'
          });
          if (res.data.preference_mode) {
            setPreferenceMode(res.data.preference_mode);
          }
        }
      } catch (err) {
        console.error('Failed to load profile for onboarding:', err);
      }
    }
    loadData();
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Update preferences
      await api.updatePreferences(preferenceMode);
      // 2. Update profile
      await api.updateProfile(profile);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  const preferenceCards = [
    {
      id: 'TECHNICAL',
      title: 'Technical Roles',
      icon: Terminal,
      description: 'Prioritize software engineering, full stack, machine learning, cloud, and core embedded firmware.',
      domains: ['Software Dev', 'AI & ML', 'Cloud Engineering', 'Embedded Systems']
    },
    {
      id: 'NON_TECHNICAL',
      title: 'Non-Technical Roles',
      icon: Briefcase,
      description: 'Prioritize management trainees, operations, business consulting, business development, and talent acquisition.',
      domains: ['Management Trainee', 'Operations', 'Consulting', 'Financial Ops']
    },
    {
      id: 'BOTH',
      title: 'Both Domains',
      icon: Layers,
      description: 'Receive equal recommendations across both technical and management/business opportunities.',
      domains: ['Full Stack', 'Data Analyst', 'Product Analyst', 'Business Strategy']
    },
    {
      id: 'OPEN_TO_ALL',
      title: 'Open to All',
      icon: Compass,
      description: 'Explore all opportunities you qualify for without restricting recommendations to a domain.',
      domains: ['All Available Disciplines']
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      {/* Onboarding Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>Personalize Your Intelligence Engine</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome to PlaceWise, {user?.firstName}!
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-lg mx-auto">
          Let's tailor your career discovery. Your engineering branch represents where you study, but your career preference represents where you want to go.
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-center space-x-4 mb-8 text-xs font-medium">
        <span className={`flex items-center space-x-1.5 ${step === 1 ? 'text-cyan-500 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${step === 1 ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-300 dark:border-slate-700'}`}>1</span>
          <span>Career Preference</span>
        </span>
        <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800" />
        <span className={`flex items-center space-x-1.5 ${step === 2 ? 'text-cyan-500 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${step === 2 ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-300 dark:border-slate-700'}`}>2</span>
          <span>Academic Verification</span>
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl dark:border-white/10 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              What kind of opportunities are you interested in?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              You can change this mode anytime from your profile settings.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {preferenceCards.map((card) => {
                const Icon = card.icon;
                const isSelected = preferenceMode === card.id;

                return (
                  <div
                    key={card.id}
                    onClick={() => setPreferenceMode(card.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500/80 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/40 dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{card.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{card.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {card.domains.map((d, i) => (
                        <span key={i} className="text-[10px] bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-lg shadow-cyan-500/25 flex items-center cursor-pointer"
              >
                Continue to Academic Details
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl dark:border-white/10 shadow-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Confirm Your Academic Background
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The eligibility engine uses these metrics to determine which opportunities you qualify for.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Engineering Branch</label>
              <select
                value={profile.branch}
                onChange={(e) => setProfile(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
              >
                <option value="CSE" className="dark:bg-slate-900">Computer Science and Engineering (CSE)</option>
                <option value="IT" className="dark:bg-slate-900">Information Technology (IT)</option>
                <option value="ECE" className="dark:bg-slate-900">Electronics and Communication (ECE)</option>
                <option value="EE" className="dark:bg-slate-900">Electrical Engineering (EE)</option>
                <option value="ME" className="dark:bg-slate-900">Mechanical Engineering (ME)</option>
                <option value="CE" className="dark:bg-slate-900">Civil Engineering (CE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Graduation Year</label>
              <select
                value={profile.graduationYear}
                onChange={(e) => setProfile(prev => ({ ...prev, graduationYear: parseInt(e.target.value, 10) }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
              >
                <option value="2025" className="dark:bg-slate-900">2025</option>
                <option value="2026" className="dark:bg-slate-900">2026</option>
                <option value="2027" className="dark:bg-slate-900">2027</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Verified CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa}
                onChange={(e) => setProfile(prev => ({ ...prev, cgpa: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Active Backlogs</label>
              <input
                type="number"
                min="0"
                value={profile.activeBacklogs}
                onChange={(e) => setProfile(prev => ({ ...prev, activeBacklogs: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Back to Preferences
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-60 transition-all shadow-lg shadow-cyan-500/25 flex items-center cursor-pointer"
            >
              {loading ? 'Finalizing Setup...' : 'Launch Dashboard'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

