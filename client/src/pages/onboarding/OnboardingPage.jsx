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
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Personalize Your Intelligence Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to PlaceWise, {user?.firstName}!
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
          Let's tailor your career discovery. Your engineering branch represents where you study, but your career preference represents where you want to go.
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-center space-x-4 mb-8 text-xs font-medium">
        <span className={`flex items-center space-x-1.5 ${step === 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
          <span className="w-5 h-5 rounded-full border flex items-center justify-center">1</span>
          <span>Career Preference</span>
        </span>
        <div className="w-8 h-0.5 bg-slate-200" />
        <span className={`flex items-center space-x-1.5 ${step === 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
          <span className="w-5 h-5 rounded-full border flex items-center justify-center">2</span>
          <span>Academic Verification</span>
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              What kind of opportunities are you interested in?
            </h2>
            <p className="text-xs text-slate-500 mb-6">
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
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-1">{card.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{card.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {card.domains.map((d, i) => (
                        <span key={i} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
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
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center"
              >
                Continue to Academic Details
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Confirm Your Academic Background
            </h2>
            <p className="text-xs text-slate-500">
              The eligibility engine uses these metrics to determine which opportunities you qualify for.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Branch</label>
              <select
                value={profile.branch}
                onChange={(e) => setProfile(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="CSE">Computer Science and Engineering (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics and Communication (ECE)</option>
                <option value="EE">Electrical Engineering (EE)</option>
                <option value="ME">Mechanical Engineering (ME)</option>
                <option value="CE">Civil Engineering (CE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
              <select
                value={profile.graduationYear}
                onChange={(e) => setProfile(prev => ({ ...prev, graduationYear: parseInt(e.target.value, 10) }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verified CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa}
                onChange={(e) => setProfile(prev => ({ ...prev, cgpa: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                value={profile.activeBacklogs}
                onChange={(e) => setProfile(prev => ({ ...prev, activeBacklogs: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back to Preferences
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-xs flex items-center"
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
