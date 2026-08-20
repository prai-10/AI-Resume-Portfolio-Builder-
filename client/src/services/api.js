/**
 * Centralized API service layer.
 * All HTTP requests to the backend go through here.
 *
 * In development, Vite proxies /api → localhost:5000 so BASE_URL = '/api' works.
 * In production (separate frontend host), set VITE_API_URL to the backend base URL,
 * e.g. VITE_API_URL=https://your-backend.com  →  requests go to https://your-backend.com/api/...
 */

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => ({ error: 'Invalid server response' }));
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

// Profile
export const profileApi = {
  get: () => request('GET', '/profile'),
  update: (data) => request('PUT', '/profile', data)
};

// Education
export const educationApi = {
  getAll: () => request('GET', '/education'),
  create: (data) => request('POST', '/education', data),
  update: (id, data) => request('PUT', `/education/${id}`, data),
  delete: (id) => request('DELETE', `/education/${id}`)
};

// Skills
export const skillsApi = {
  getAll: () => request('GET', '/skills'),
  create: (data) => request('POST', '/skills', data),
  update: (id, data) => request('PUT', `/skills/${id}`, data),
  delete: (id) => request('DELETE', `/skills/${id}`)
};

// Projects
export const projectsApi = {
  getAll: () => request('GET', '/projects'),
  create: (data) => request('POST', '/projects', data),
  update: (id, data) => request('PUT', `/projects/${id}`, data),
  delete: (id) => request('DELETE', `/projects/${id}`)
};

// Experience
export const experienceApi = {
  getAll: () => request('GET', '/experience'),
  create: (data) => request('POST', '/experience', data),
  update: (id, data) => request('PUT', `/experience/${id}`, data),
  delete: (id) => request('DELETE', `/experience/${id}`)
};

// Certifications
export const certificationsApi = {
  getAll: () => request('GET', '/certifications'),
  create: (data) => request('POST', '/certifications', data),
  update: (id, data) => request('PUT', `/certifications/${id}`, data),
  delete: (id) => request('DELETE', `/certifications/${id}`)
};

// Achievements
export const achievementsApi = {
  getAll: () => request('GET', '/achievements'),
  create: (data) => request('POST', '/achievements', data),
  update: (id, data) => request('PUT', `/achievements/${id}`, data),
  delete: (id) => request('DELETE', `/achievements/${id}`)
};

// Links
export const linksApi = {
  getAll: () => request('GET', '/links'),
  create: (data) => request('POST', '/links', data),
  update: (id, data) => request('PUT', `/links/${id}`, data),
  delete: (id) => request('DELETE', `/links/${id}`)
};

// Generated Documents
export const documentsApi = {
  getAll: () => request('GET', '/generated-documents'),
  getById: (id) => request('GET', `/generated-documents/${id}`),
  delete: (id) => request('DELETE', `/generated-documents/${id}`)
};

// AI
export const aiApi = {
  status: () => request('GET', '/ai/status'),
  generateResume: (data) => request('POST', '/ai/generate-resume', data),
  generateCoverLetter: (data) => request('POST', '/ai/generate-cover-letter', data),
  getPortfolioData: () => request('GET', '/ai/portfolio-data')
};
