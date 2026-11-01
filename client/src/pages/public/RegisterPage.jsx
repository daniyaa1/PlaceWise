import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Compass, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState([]);
  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    institutionId: '',
    studentIdCode: '',
    degree: 'B.Tech',
    branch: 'CSE',
    graduationYear: '2026',
    cgpa: '8.00',
    preferenceMode: 'OPEN_TO_ALL'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInsts() {
      try {
        const res = await api.getInstitutions();
        if (res.success && res.data.length > 0) {
          setInstitutions(res.data);
          setFormData(prev => ({ ...prev, institutionId: res.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load institutions:', err);
      }
    }
    loadInsts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register({
        ...formData,
        role
      });
      if (user.role === 'STUDENT') {
        navigate('/onboarding');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Compass className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Your PlaceWise Account
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Join your institution's placement intelligence network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl dark:border-white/10 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector tabs */}
          <div className="flex rounded-xl bg-slate-100/80 dark:bg-slate-900/80 p-1.5 mb-6 border border-slate-200/60 dark:border-white/5">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'STUDENT'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Engineering Student
            </button>
            <button
              type="button"
              onClick={() => setRole('PLACEMENT_ADMIN')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'PLACEMENT_ADMIN'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Placement Administrator
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Verma"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@college.edu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            {/* Institution Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Associated Institution</label>
              <select
                name="institutionId"
                value={formData.institutionId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id} className="dark:bg-slate-900">
                    {inst.name} ({inst.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Student Specific Fields */}
            {role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Degree</label>
                    <select
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
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
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
                    >
                      <option value="CSE" className="dark:bg-slate-900">CSE</option>
                      <option value="IT" className="dark:bg-slate-900">IT</option>
                      <option value="ECE" className="dark:bg-slate-900">ECE</option>
                      <option value="EE" className="dark:bg-slate-900">EE</option>
                      <option value="ME" className="dark:bg-slate-900">ME</option>
                      <option value="CE" className="dark:bg-slate-900">CE</option>
                      <option value="OTHER" className="dark:bg-slate-900">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Grad Year</label>
                    <select
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
                    >
                      <option value="2025" className="dark:bg-slate-900">2025</option>
                      <option value="2026" className="dark:bg-slate-900">2026</option>
                      <option value="2027" className="dark:bg-slate-900">2027</option>
                      <option value="2028" className="dark:bg-slate-900">2028</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      placeholder="e.g. 8.40"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preference Mode</label>
                    <select
                      name="preferenceMode"
                      value={formData.preferenceMode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 text-slate-900 dark:text-white"
                    >
                      <option value="TECHNICAL" className="dark:bg-slate-900">Technical Roles</option>
                      <option value="NON_TECHNICAL" className="dark:bg-slate-900">Non-Technical Roles</option>
                      <option value="BOTH" className="dark:bg-slate-900">Both Domains</option>
                      <option value="OPEN_TO_ALL" className="dark:bg-slate-900">Open to All</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              {loading ? (
                <span>Registering account...</span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-cyan-500 hover:text-cyan-400">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

