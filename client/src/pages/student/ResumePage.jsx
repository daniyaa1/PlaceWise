import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function ResumePage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const res = await api.listResumes();
      if (res.success) {
        setResumes(res.data);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'File exceeds maximum allowed size of 5MB.' });
      return;
    }

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.uploadResume(formData);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Resume uploaded and set as active profile resume.' });
        loadResumes();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to upload resume document.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      setStatusMsg({ type: 'success', text: 'Resume removed successfully.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete resume.' });
    }
  };

  const handleDownload = (id) => {
    const downloadUrl = api.getResumeDownloadUrl(id);
    const token = localStorage.getItem('placewise_token');

    // Fetch blob with auth headers
    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => alert(err.message));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) return <LoadingSpinner text="Loading documents..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resume Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload and maintain verified resumes for your campus drives and external applications.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          {uploading ? 'Uploading document...' : 'Upload your updated resume'}
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          Supported formats: PDF, DOCX (Max 5MB). Files are securely encrypted and stored privately outside public directories.
        </p>

        <label className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
          <span>Browse File</span>
        </label>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-900">Your Document Vault</span>
          <span className="text-xs text-slate-500">{resumes.length} document{resumes.length === 1 ? '' : 's'}</span>
        </div>

        {resumes.length === 0 ? (
          <EmptyState
            title="No resumes uploaded yet"
            description="Upload your resume above to enable one-click campus drive applications."
            icon={FileText}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {resumes.map((r) => (
              <div key={r.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${r.is_active ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900 truncate block">
                        {r.file_name}
                      </span>
                      {r.is_active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {formatFileSize(r.file_size)} • Uploaded {new Date(r.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-4">
                  <button
                    onClick={() => handleDownload(r.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Download resume"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
