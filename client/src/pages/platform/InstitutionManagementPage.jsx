import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  Building2,
  Plus,
  Globe,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function InstitutionManagementPage() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [institutionType, setInstitutionType] = useState('AUTONOMOUS_INSTITUTE');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const res = await api.getInstitutions();
      if (res.success) setInstitutions(res.data);
    } catch (err) {
      console.error('Failed to load institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      await api.createInstitution({
        name,
        universityName,
        code,
        location,
        institutionType,
        website
      });
      setMsg({ type: 'success', text: `Institution ${name} (${code}) successfully provisioned!` });
      setTimeout(() => {
        setModalOpen(false);
        setName('');
        setUniversityName('');
        setCode('');
        setLocation('');
        setWebsite('');
        loadInstitutions();
      }, 1000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to create institution.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading affiliated institutions..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Multi-College Institutions Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision colleges, enforce institutional data isolation, and manage affiliated engineering campuses.
          </p>
        </div>

        <button
          onClick={() => { setModalOpen(true); setMsg(null); }}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New College</span>
        </button>
      </div>

      {/* Institutions Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {institutions.map(inst => (
          <div key={inst.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {inst.code}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 mb-1">{inst.name}</h3>
              {inst.university_name && (
                <p className="text-xs text-slate-500 mb-2">University: {inst.university_name}</p>
              )}

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                  <span>{inst.location}</span>
                </div>
                <div className="flex items-center text-[11px] text-slate-500">
                  <span>Type: {inst.institution_type?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>

            {inst.website && (
              <div className="pt-3 border-t border-slate-100">
                <a
                  href={inst.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Provision College Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Provision New Partner College"
      >
        <form onSubmit={handleCreateInstitution} className="space-y-4">
          {msg && (
            <div className={`p-3 rounded-lg text-xs ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {msg.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amity University Kolkata"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unique Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AUK"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Type</label>
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="UNIVERSITY">University</option>
                <option value="AFFILIATED_COLLEGE">Affiliated College</option>
                <option value="AUTONOMOUS_INSTITUTE">Autonomous Institute</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">University Name (If affiliated)</label>
            <input
              type="text"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              placeholder="e.g. Amity University"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kolkata, West Bengal"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://kolkata.amity.edu"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 shadow-xs"
            >
              {submitting ? 'Provisioning...' : 'Provision Institution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

