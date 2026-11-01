import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusPill from '../../components/StatusPill';
import Modal from '../../components/Modal';
import {
  Building2,
  Plus,
  Users,
  Calendar,
  Banknote,
  MapPin,
  CheckCircle2,
  XCircle,
  FileCheck,
  Download,
  AlertCircle,
  Sparkles,
  Sliders
} from 'lucide-react';

export default function DriveManagementPage() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Drive Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);

  const [formData, setFormData] = useState({
    companyId: '',
    roleTitle: '',
    roleDescription: '',
    careerDomain: 'Full Stack Development',
    preferenceGroup: 'TECHNICAL',
    codingIntensity: 'MEDIUM',
    compensationMin: 800000,
    compensationMax: 1200000,
    driveTitle: '',
    employmentType: 'FULL_TIME',
    workMode: 'HYBRID',
    location: 'Kolkata, West Bengal',
    applicationDeadline: '2026-12-01T23:59',
    minCgpa: 7.5,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'IT'],
    graduationYear: 2026,
    skillsInput: 'JavaScript, React, Node.js (Req), SQL'
  });

  // Applicants Modal State
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const loadDrives = async () => {
    try {
      setLoading(true);
      const [drivesRes, compRes] = await Promise.all([
        api.getPlacementDrives(),
        api.getCompanies()
      ]);
      if (drivesRes.success) setDrives(drivesRes.data);
      if (compRes.success && compRes.data.length > 0) {
        setCompanies(compRes.data);
        setFormData(prev => ({ ...prev, companyId: compRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrives();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBranchToggle = (branch) => {
    setFormData(prev => {
      const branches = prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter(b => b !== branch)
        : [...prev.allowedBranches, branch];
      return { ...prev, allowedBranches: branches };
    });
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateMsg(null);

    // Parse skills from comma-separated input with "(Req)" indicator
    const parsedSkills = formData.skillsInput.split(',').map(s => {
      const clean = s.trim();
      const isReq = clean.toLowerCase().includes('(req)');
      const name = clean.replace(/\(req\)/i, '').trim();
      return { name, is_mandatory: isReq };
    }).filter(s => s.name);

    const payload = {
      companyId: formData.companyId,
      roleTitle: formData.roleTitle,
      roleDescription: formData.roleDescription,
      careerDomain: formData.careerDomain,
      preferenceGroup: formData.preferenceGroup,
      codingIntensity: formData.codingIntensity,
      compensationMin: formData.compensationMin,
      compensationMax: formData.compensationMax,
      driveTitle: formData.driveTitle || `${formData.roleTitle} Campus Drive`,
      employmentType: formData.employmentType,
      workMode: formData.workMode,
      location: formData.location,
      applicationDeadline: `${formData.applicationDeadline}:00`,
      criteria: [
        { type: 'MIN_CGPA', operator: 'GTE', value: formData.minCgpa.toString(), mandatory: true },
        { type: 'MAX_ACTIVE_BACKLOGS', operator: 'LTE', value: formData.maxBacklogs.toString(), mandatory: true },
        { type: 'ALLOWED_BRANCHES', operator: 'IN', value: JSON.stringify(formData.allowedBranches), mandatory: true },
        { type: 'GRADUATION_YEAR', operator: 'EQ', value: formData.graduationYear.toString(), mandatory: true }
      ],
      skills: parsedSkills
    };

    try {
      await api.createPlacementDrive(payload);
      setCreateMsg({ type: 'success', text: 'Campus drive successfully created and published!' });
      setTimeout(() => {
        setCreateModalOpen(false);
        loadDrives();
      }, 1200);
    } catch (err) {
      setCreateMsg({ type: 'error', text: err.message || 'Failed to create drive.' });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenApplicants = async (drive) => {
    setSelectedDrive(drive);
    setApplicantsModalOpen(true);
    setLoadingApplicants(true);
    try {
      const res = await api.getDriveApplicants(drive.id);
      if (res.success) setApplicants(res.data);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.updateApplicationStatus(appId, {
        status: newStatus,
        reason: `Status updated by placement administrator (${user?.firstName}).`
      });
      // Refresh applicants
      if (selectedDrive) {
        const res = await api.getDriveApplicants(selectedDrive.id);
        if (res.success) setApplicants(res.data);
      }
      loadDrives();
    } catch (err) {
      alert(err.message || 'Failed to update applicant status');
    }
  };

  const handleDownloadResume = (resumeId) => {
    if (!resumeId) return;
    const downloadUrl = api.getResumeDownloadUrl(resumeId);
    const token = localStorage.getItem('placewise_token');

    fetch(downloadUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_resume_${resumeId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => alert(err.message));
  };

  const branches = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE'];

  if (loading) return <LoadingSpinner text="Loading campus placement drives..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Placement Drives</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish on-campus opportunities, configure eligibility rules, and manage applicant evaluation rounds.
          </p>
        </div>

        <button
          onClick={() => { setCreateModalOpen(true); setCreateMsg(null); }}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Drive</span>
        </button>
      </div>

      {/* Drives Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-900">Active & Published Campus Drives ({drives.length})</span>
          <span className="text-xs text-slate-500">{user?.institutionName}</span>
        </div>

        {drives.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            No campus placement drives published yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {drives.map(d => (
              <div key={d.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-xs text-slate-900">{d.company_name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {d.career_domain} ({d.preference_group})
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {d.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{d.title}</h3>

                  <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500">
                    <span>Deadline: <strong>{new Date(d.application_deadline).toLocaleDateString()}</strong></span>
                    <span>•</span>
                    <span>Location: {d.location} ({d.work_mode?.toLowerCase()})</span>
                    <span>•</span>
                    <span>Compensation: ₹{(d.compensation_min / 100000).toFixed(1)} – {(d.compensation_max / 100000).toFixed(1)} LPA</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => handleOpenApplicants(d)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center space-x-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Applicants ({d.applicant_count || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE CAMPUS DRIVE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish On-Campus Placement Drive"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateDrive} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {createMsg && (
            <div className={`p-3 rounded-lg text-xs ${createMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {createMsg.text}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
              <input
                type="text"
                name="roleTitle"
                required
                value={formData.roleTitle}
                onChange={handleFormChange}
                placeholder="e.g. Graduate Software Engineer"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Domain</label>
              <select
                name="careerDomain"
                value={formData.careerDomain}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="Software Development">Software Development</option>
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="AI and Machine Learning">AI & Machine Learning</option>
                <option value="Cloud Engineering">Cloud Engineering</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Management Trainee">Management Trainee</option>
                <option value="Operations">Operations</option>
                <option value="Embedded Systems">Embedded Systems</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preference Group</label>
              <select
                name="preferenceGroup"
                value={formData.preferenceGroup}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="TECHNICAL">Technical Group</option>
                <option value="NON_TECHNICAL">Non-Technical Group</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="IN_OFFICE">In-Office</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Comp (INR/yr)</label>
              <input
                type="number"
                name="compensationMin"
                value={formData.compensationMin}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Comp (INR/yr)</label>
              <input
                type="number"
                name="compensationMax"
                value={formData.compensationMax}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Date & Time</label>
              <input
                type="datetime-local"
                name="applicationDeadline"
                required
                value={formData.applicationDeadline}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Title (Public Headline)</label>
            <input
              type="text"
              name="driveTitle"
              value={formData.driveTitle}
              onChange={handleFormChange}
              placeholder="e.g. Apex Core Campus Engineering Drive 2026"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleFormChange}
              placeholder="e.g. Kolkata, West Bengal"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          {/* Academic Criteria Configuration */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-900 block">Mandatory Academic Eligibility Criteria</span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  name="minCgpa"
                  value={formData.minCgpa}
                  onChange={handleFormChange}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  name="maxBacklogs"
                  value={formData.maxBacklogs}
                  onChange={handleFormChange}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleFormChange}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Eligible Engineering Branches</label>
              <div className="flex flex-wrap gap-1.5">
                {branches.map(b => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => handleBranchToggle(b)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                      formData.allowedBranches.includes(b)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Builder */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Skills (Use <code className="text-indigo-600">(Req)</code> for mandatory prerequisite)
            </label>
            <input
              type="text"
              name="skillsInput"
              value={formData.skillsInput}
              onChange={handleFormChange}
              placeholder="e.g. JavaScript (Req), React, Node.js (Req), SQL"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Skills without (Req) will be evaluated as desirable skills and analyzed for skill gaps.
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 shadow-xs"
            >
              {createSubmitting ? 'Publishing...' : 'Publish Campus Drive'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DRIVE APPLICANTS MODAL */}
      <Modal
        isOpen={applicantsModalOpen}
        onClose={() => setApplicantsModalOpen(false)}
        title={selectedDrive ? `Applicants for ${selectedDrive.title}` : 'Drive Applicants'}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              Total Authorized Applicants: <strong>{applicants.length}</strong>
            </span>
            <span className="text-xs text-slate-500">{user?.institutionName}</span>
          </div>

          {loadingApplicants ? (
            <LoadingSpinner text="Retrieving applicant credentials..." />
          ) : applicants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              No students have applied to this drive yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {applicants.map(app => (
                <div key={app.application_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{app.first_name} {app.last_name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({app.student_id_code})</span>
                      <StatusPill status={app.application_status} />
                    </div>
                    <div className="text-slate-500 flex items-center space-x-2 text-[11px]">
                      <span>{app.degree} ({app.branch})</span>
                      <span>•</span>
                      <span>CGPA: <strong>{parseFloat(app.cgpa).toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Backlogs: {app.active_backlogs}</span>
                      <span>•</span>
                      <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {app.active_resume_id ? (
                      <button
                        onClick={() => handleDownloadResume(app.active_resume_id)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1"
                        title="Download student resume"
                      >
                        <Download className="w-3 h-3" />
                        <span>Resume</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No Resume</span>
                    )}

                    {/* Quick Stage Progression */}
                    <select
                      value={app.application_status}
                      onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                      className="px-2 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-800"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="ASSESSMENT">Assessment</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="SELECTED">Selected</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setApplicantsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

