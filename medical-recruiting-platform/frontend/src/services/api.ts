import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me')
}

export const jobsAPI = {
  search: (params?: any) => api.get('/jobs/search', { params }),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (data: any) => api.post('/jobs', data),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`)
}

export const providersAPI = {
  search: (params?: any) => api.get('/providers/search', { params }),
  getById: (id: string) => api.get(`/providers/${id}`),
  updateProfile: (data: any) => api.put('/providers/profile', data),
  getMatches: () => api.get('/providers/matches'),
  addCredential: (data: any) => api.post('/providers/credentials', data)
}

export const employersAPI = {
  search: (params?: any) => api.get('/employers/search', { params }),
  getById: (id: string) => api.get(`/employers/${id}`),
  updateProfile: (data: any) => api.put('/employers/profile', data)
}

export const applicationsAPI = {
  create: (data: any) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/my-applications'),
  updateStatus: (id: string, status: string) => api.patch(`/applications/${id}/status`, { status })
}

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId: string) => api.get(`/messages/${userId}`),
  send: (data: any) => api.post('/messages', data)
}

export const matchingAPI = {
  getMyMatches: () => api.get('/matching/my-matches'),
  runMatch: (jobId: string) => api.post(`/matching/run/${jobId}`)
}

export const paymentsAPI = {
  createIntent: (data: any) => api.post('/payments/create-intent', data),
  getMyPayments: () => api.get('/payments/my-payments')
}

export const notificationsAPI = {
  getMyNotifications: () => api.get('/notifications/my-notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all')
}

export const hipaaAPI = {
  getAuditLog: () => api.get('/hipaa/my-audit-log'),
  getConsents: () => api.get('/hipaa/consents'),
  updateConsent: (data: any) => api.post('/hipaa/consent', data)
}
