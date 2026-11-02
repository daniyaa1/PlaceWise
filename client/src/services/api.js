const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('placewise_token');
  const headers = {
    ...(options.headers || {})
  };

  // Only set Content-Type to JSON if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Institutions
  getInstitutions: () => request('/institutions'),
  getInstitution: (id) => request(`/institutions/${id}`),

  // Student Profile & Preferences
  getProfile: () => request('/students/profile'),
  updateProfile: (profileData) => request('/students/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  getPreferences: () => request('/students/preferences'),
  updatePreferences: (preferenceMode) => request('/students/preferences', { method: 'PUT', body: JSON.stringify({ preferenceMode }) }),
  getSkillsCatalog: () => request('/students/skills-catalog'),
  addSkill: (skill) => request('/students/skills', { method: 'POST', body: JSON.stringify(skill) }),
  removeSkill: (skillId) => request(`/students/skills/${skillId}`, { method: 'DELETE' }),

  // Resumes
  listResumes: () => request('/resumes'),
  uploadResume: (formData) => request('/resumes/upload', { method: 'POST', body: formData }),
  deleteResume: (id) => request(`/resumes/${id}`, { method: 'DELETE' }),
  getResumeDownloadUrl: (id) => `/api/resumes/${id}/download`,

  // Opportunities & CPIE
  getOpportunities: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/opportunities?${query.toString()}`);
  },
  getOpportunity: (id) => request(`/opportunities/${id}`),
  getOpportunityEligibility: (id) => request(`/opportunities/${id}/eligibility`),
  getRecommendations: () => request('/opportunities/recommendations'),
  getSkillGaps: () => request('/opportunities/skill-gaps'),

  // Applications
  getApplications: () => request('/applications'),
  createApplication: (appData) => request('/applications', { method: 'POST', body: JSON.stringify(appData) }),
  updateApplicationStatus: (id, updateData) => request(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(updateData) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  dismissNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),

  // Placement Admin
  getPlacementDrives: () => request('/admin/drives'),
  createPlacementDrive: (driveData) => request('/admin/drives', { method: 'POST', body: JSON.stringify(driveData) }),
  publishPlacementDrive: (id) => request(`/admin/drives/${id}/publish`, { method: 'POST' }),
  cancelPlacementDrive: (id, reason) => request(`/admin/drives/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getDriveApplicants: (id) => request(`/admin/drives/${id}/applicants`),
  getCompanies: () => request('/admin/companies'),
  createCompany: (companyData) => request('/admin/companies', { method: 'POST', body: JSON.stringify(companyData) }),

  // Platform Admin
  createInstitution: (instData) => request('/platform/institutions', { method: 'POST', body: JSON.stringify(instData) }),
  updateInstitution: (id, instData) => request(`/platform/institutions/${id}`, { method: 'PUT', body: JSON.stringify(instData) }),
  getExternalModerationQueue: (status) => request(`/platform/external-opportunities${status ? `?status=${status}` : ''}`),
  verifyExternalOpportunity: (id, notes) => request(`/platform/external-opportunities/${id}/verify`, { method: 'POST', body: JSON.stringify({ notes }) }),
  rejectExternalOpportunity: (id, reason) => request(`/platform/external-opportunities/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getAuditLogs: () => request('/platform/audit-logs')
};

