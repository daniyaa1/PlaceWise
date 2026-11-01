import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import SkillTag from '../../components/SkillTag';
import {
  User,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building2,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Skill Add Modal State
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [skillProficiency, setSkillProficiency] = useState('INTERMEDIATE');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profRes, catRes] = await Promise.all([
          api.getProfile(),
          api.getSkillsCatalog()
        ]);
        if (profRes.success) setProfile(profRes.data);
        if (catRes.success) {
          setSkillsCatalog(catRes.data);
          if (catRes.data.length > 0) setSelectedSkillId(catRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationsChange = (e) => {
    const locs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setProfile(prev => ({ ...prev, preferred_locations: locs }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      await api.updateProfile({
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        studentIdCode: profile.student_id_code,
        degree: profile.degree,
        branch: profile.branch,
        graduationYear: profile.graduation_year,
        cgpa: profile.cgpa,
        activeBacklogs: profile.active_backlogs,
        historicalBacklogs: profile.historical_backlogs,
        preferredLocations: profile.preferred_locations,
        preferredWorkMode: profile.preferred_work_mode,
        bio: profile.bio
      });
      await refreshUser();
      setStatusMsg({ type: 'success', text: 'Academic profile successfully updated!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      if (selectedSkillId === 'CUSTOM' && customSkillName.trim()) {
        await api.addSkill({ skillName: customSkillName.trim(), proficiency: skillProficiency });
      } else if (selectedSkillId) {
        await api.addSkill({ skillId: selectedSkillId, proficiency: skillProficiency });
      }
      setCustomSkillName('');
      // Reload profile skills
      const profRes = await api.getProfile();
      if (profRes.success) setProfile(profRes.data);
    } catch (err) {
      alert(err.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await api.removeSkill(skillId);
      setProfile(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s.id !== skillId)
      }));
    } catch (err) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading academic credentials and skills..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Academic & Career Profile</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Maintain your verified academic background and technical competencies.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs flex items-center space-x-2 ${statusMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Identity Card */}
        <div className="glass-panel p-6 rounded-3xl dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200/60 dark:border-white/10 pb-3">
            <User className="w-4 h-4 text-cyan-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Personal & Institutional Credentials</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
              <input
                type="text"
                name="first_name"
                value={profile?.first_name || ''}
                onChange={handleProfileChange}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profile?.last_name || ''}
                onChange={handleProfileChange}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Institutional Email</label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Student Enrollment / Roll ID</label>
              <input
                type="text"
                name="student_id_code"
                value={profile?.student_id_code || ''}
                onChange={handleProfileChange}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Registered Institution</label>
              <input
                type="text"
                disabled
                value={profile?.institution_name || 'Autonomous Institution'}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Academic Eligibility Fields */}
        <div className="glass-panel p-6 rounded-3xl dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200/60 dark:border-white/10 pb-3">
            <GraduationCap className="w-4 h-4 text-cyan-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Academic Standing (CPIE Criteria Source)</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Degree</label>
              <select
                name="degree"
                value={profile?.degree || 'B.Tech'}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
              >
                <option value="B.Tech" className="dark:bg-slate-900">B.Tech</option>
                <option value="B.E." className="dark:bg-slate-900">B.E.</option>
                <option value="M.Tech" className="dark:bg-slate-900">M.Tech</option>
                <option value="MCA" className="dark:bg-slate-900">MCA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Branch</label>
              <select
                name="branch"
                value={profile?.branch || 'CSE'}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
              >
                <option value="CSE" className="dark:bg-slate-900">Computer Science (CSE)</option>
                <option value="IT" className="dark:bg-slate-900">Information Tech (IT)</option>
                <option value="ECE" className="dark:bg-slate-900">Electronics (ECE)</option>
                <option value="EE" className="dark:bg-slate-900">Electrical (EE)</option>
                <option value="ME" className="dark:bg-slate-900">Mechanical (ME)</option>
                <option value="CE" className="dark:bg-slate-900">Civil (CE)</option>
                <option value="OTHER" className="dark:bg-slate-900">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Graduation Year</label>
              <select
                name="graduation_year"
                value={profile?.graduation_year || 2026}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
              >
                <option value={2025} className="dark:bg-slate-900">2025</option>
                <option value={2026} className="dark:bg-slate-900">2026</option>
                <option value={2027} className="dark:bg-slate-900">2027</option>
                <option value={2028} className="dark:bg-slate-900">2028</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Verified CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={profile?.cgpa || 0}
                onChange={handleProfileChange}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Active Backlogs</label>
              <input
                type="number"
                min="0"
                name="active_backlogs"
                value={profile?.active_backlogs ?? 0}
                onChange={handleProfileChange}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Historical Backlogs</label>
              <input
                type="number"
                min="0"
                name="historical_backlogs"
                value={profile?.historical_backlogs ?? 0}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Work Preferences & Logistics */}
        <div className="glass-panel p-6 rounded-3xl dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200/60 dark:border-white/10 pb-3">
            <Briefcase className="w-4 h-4 text-cyan-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Work Mode & Preferred Locations</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preferred Work Mode</label>
              <select
                name="preferred_work_mode"
                value={profile?.preferred_work_mode || 'OPEN'}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
              >
                <option value="OPEN" className="dark:bg-slate-900">Open to Any Work Mode</option>
                <option value="HYBRID" className="dark:bg-slate-900">Hybrid (Office + Remote)</option>
                <option value="IN_OFFICE" className="dark:bg-slate-900">In-Office</option>
                <option value="REMOTE" className="dark:bg-slate-900">Remote Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preferred Locations (Comma separated)</label>
              <input
                type="text"
                value={Array.isArray(profile?.preferred_locations) ? profile.preferred_locations.join(', ') : ''}
                onChange={handleLocationsChange}
                placeholder="e.g. Bangalore, Kolkata, Remote"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Professional Bio / Summary</label>
            <textarea
              name="bio"
              rows={3}
              value={profile?.bio || ''}
              onChange={handleProfileChange}
              placeholder="Brief summary of your technical interests and projects..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-500/25 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Academic Profile'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Skills Competency Section */}
      <div className="glass-panel p-6 rounded-3xl dark:border-white/10 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-cyan-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your Technical & Business Skills</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {profile?.skills?.length || 0} Skills Tagged
          </span>
        </div>

        {/* Current Skills List */}
        <div className="flex flex-wrap gap-2 min-h-12 items-center">
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map(sk => (
              <div
                key={sk.id}
                className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <span>{sk.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({sk.proficiency?.toLowerCase()})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(sk.id)}
                  className="ml-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No skills added yet. Add your core competencies below.</p>
          )}
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="pt-4 border-t border-slate-200/60 dark:border-white/10 grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Select from Directory</label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
            >
              {skillsCatalog.map(sk => (
                <option key={sk.id} value={sk.id} className="dark:bg-slate-900">
                  {sk.name} ({sk.category})
                </option>
              ))}
              <option value="CUSTOM" className="dark:bg-slate-900">+ Add Custom Skill Name</option>
            </select>
          </div>

          {selectedSkillId === 'CUSTOM' ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Custom Skill Name</label>
              <input
                type="text"
                required
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                placeholder="e.g. Next.js"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Proficiency</label>
              <select
                value={skillProficiency}
                onChange={(e) => setSkillProficiency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
              >
                <option value="BEGINNER" className="dark:bg-slate-900">Beginner</option>
                <option value="INTERMEDIATE" className="dark:bg-slate-900">Intermediate</option>
                <option value="ADVANCED" className="dark:bg-slate-900">Advanced</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

