import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // If not on login page, can redirect
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateSavings: (data) => api.patch('/auth/savings', data),
};

export const loanAPI = {
  applyLoan: (formData) =>
    api.post('/loans/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyLoans: () => api.get('/loans/my-applications'),
  getLoanById: (id) => api.get(`/loans/${id}`),
  getBranchLoans: (params) => api.get('/loans/branch-review', { params }),
  subadminReview: (id, data) => api.patch(`/loans/${id}/subadmin-review`, data),
  getAllLoans: (params) => api.get('/loans/all', { params }),
  adminReview: (id, data) => api.patch(`/loans/${id}/admin-review`, data),
  updateStatus: (id, data) => api.patch(`/loans/${id}/status`, data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getSubadmins: () => api.get('/admin/subadmins'),
  createSubadmin: (data) => api.post('/admin/subadmins', data),
  toggleSubadminStatus: (id) => api.patch(`/admin/subadmins/${id}/toggle-status`),
  deleteSubadmin: (id) => api.delete(`/admin/subadmins/${id}`),
};

export default api;
