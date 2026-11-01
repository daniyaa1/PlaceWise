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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic & Career Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your verified academic background and technical competencies.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Identity Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Personal & Institutional Credentials</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={profile?.first_name || ''}
                onChange={handleProfileChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profile?.last_name || ''}
                onChange={handleProfileChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Enrollment / Roll ID</label>
              <input
                type="text"
                name="student_id_code"
                value={profile?.student_id_code || ''}
                onChange={handleProfileChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Institution</label>
              <input
                type="text"
                disabled
                value={profile?.institution_name || 'Autonomous Institution'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Academic Eligibility Fields */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Academic Standing (CPIE Criteria Source)</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
              <select
                name="degree"
                value={profile?.degree || 'B.Tech'}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MCA">MCA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Branch</label>
              <select
                name="branch"
                value={profile?.branch || 'CSE'}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="CSE">Computer Science and Engineering (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics & Communication (ECE)</option>
                <option value="EE">Electrical Engineering (EE)</option>
                <option value="ME">Mechanical Engineering (ME)</option>
                <option value="CE">Civil Engineering (CE)</option>
                <option value="OTHER">Other Discipline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
              <select
                name="graduation_year"
                value={profile?.graduation_year || 2026}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={profile?.cgpa || 0}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                name="active_backlogs"
                value={profile?.active_backlogs || 0}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Historical Backlogs</label>
              <input
                type="number"
                min="0"
                name="historical_backlogs"
                value={profile?.historical_backlogs || 0}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Work Preferences & Logistics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Work Mode & Preferred Locations</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Work Mode</label>
              <select
                name="preferred_work_mode"
                value={profile?.preferred_work_mode || 'OPEN'}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="OPEN">Open to Any Work Mode</option>
                <option value="HYBRID">Hybrid (Office + Remote)</option>
                <option value="IN_OFFICE">In-Office</option>
                <option value="REMOTE">Remote Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Locations (Comma separated)</label>
              <input
                type="text"
                value={Array.isArray(profile?.preferred_locations) ? profile.preferred_locations.join(', ') : ''}
                onChange={handleLocationsChange}
                placeholder="e.g. Bangalore, Kolkata, Remote"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Bio / Summary</label>
            <textarea
              name="bio"
              rows={3}
              value={profile?.bio || ''}
              onChange={handleProfileChange}
              placeholder="Brief summary of your technical interests and projects..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Academic Profile'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Skills Competency Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Your Technical & Business Skills</h2>
          </div>
          <span className="text-xs text-slate-500">
            {profile?.skills?.length || 0} Skills Tagged
          </span>
        </div>

        {/* Current Skills List */}
        <div className="flex flex-wrap gap-2 min-h-12 items-center">
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map(sk => (
              <div
                key={sk.id}
                className="inline-flex items-center px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium"
              >
                <span>{sk.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({sk.proficiency?.toLowerCase()})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(sk.id)}
                  className="ml-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No skills added yet. Add your core competencies below.</p>
          )}
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="pt-4 border-t border-slate-100 grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select from Directory</label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              {skillsCatalog.map(sk => (
                <option key={sk.id} value={sk.id}>
                  {sk.name} ({sk.category})
                </option>
              ))}
              <option value="CUSTOM">+ Add Custom Skill Name</option>
            </select>
          </div>

          {selectedSkillId === 'CUSTOM' ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Custom Skill Name</label>
              <input
                type="text"
                required
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                placeholder="e.g. Next.js"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Proficiency</label>
              <select
                value={skillProficiency}
                onChange={(e) => setSkillProficiency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-300 flex items-center justify-center space-x-1"
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
