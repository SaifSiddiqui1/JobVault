import axios from 'axios'
import useAuthStore from '../store/authStore'
import useAdminAuthStore from '../store/adminAuthStore'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
})

// Add token to every request
api.interceptors.request.use((config) => {
    let token = null;

    // Auth endpoints usually don't need token, but if it's an admin API call, use admin token
    if (config.url?.startsWith('/admin')) {
        token = useAdminAuthStore.getState().adminToken;
    } else {
        token = useAuthStore.getState().token;
    }

    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Handle 401 globally
api.interceptors.response.use(
    (res) => res.data,
    (err) => {
        if (err.response?.status === 401) {
            // Do not trigger global logout for authentication routes (where 401 is expected for bad credentials)
            if (!err.config?.url?.startsWith('/auth/')) {
                // Determine which store to log out based on the URL that triggered the 401
                if (err.config?.url?.startsWith('/admin')) {
                    useAdminAuthStore.getState().adminLogout()
                } else {
                    useAuthStore.getState().logout()
                }
            }
        }
        return Promise.reject(err)
    }
)

// ─── Auth ─────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    verifyEmail: (data) => api.post('/auth/verify-email', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
    login: (data) => api.post('/auth/login', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getMe: () => api.get('/auth/me'),
}

// ─── User ─────────────────────────────────────────────────────
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    uploadPhoto: (formData) => api.post('/users/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    uploadProfileResume: (formData) => api.post('/users/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteProfileResume: () => api.delete('/users/resume'),
    getSavedJobs: () => api.get('/users/saved-jobs'),
    toggleSavedJob: (jobId) => api.post(`/users/saved-jobs/${jobId}`),
    deleteAccount: () => api.delete('/users/account'),
}

// ─── Resume ───────────────────────────────────────────────────
export const resumeAPI = {
    getAll: () => api.get('/resume'),
    getOne: (id) => api.get(`/resume/${id}`),
    create: (data) => api.post('/resume', data),
    update: (id, data) => api.put(`/resume/${id}`, data),
    delete: (id) => api.delete(`/resume/${id}`),
    upload: (formData) => api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    trackDownload: (id) => api.post(`/resume/${id}/download`),
}

// ─── Jobs ─────────────────────────────────────────────────────
export const jobsAPI = {
    getAll: (params) => api.get('/jobs', { params }),
    getOne: (id) => api.get(`/jobs/${id}`),
    getRecommended: () => api.get('/jobs/recommended/for-me'),
}

// ─── AI ───────────────────────────────────────────────────────
export const aiAPI = {
    checkAts: (data) => api.post('/ai/ats-check', data),
    enhanceResume: (data) => api.post('/ai/enhance-resume', data),
    generateSummary: (data) => api.post('/ai/generate-summary', data),
    generateCoverLetter: (data) => api.post('/ai/cover-letter', data),
    analyzeSkillGap: (data) => api.post('/ai/skill-gap', data),
    generateBio: (data) => api.post('/ai/generate-bio', data),
    getInterviewQuestions: (data) => api.post('/ai/interview-questions', data),
    optimizeLinkedInProfile: (data) => api.post('/ai/linkedin-optimizer', data),
    adviseCareerPath: (data) => api.post('/ai/career-path', data),
    summarizeJobDescription: (data) => api.post('/ai/job-summarizer', data),
}

// ─── Study ────────────────────────────────────────────────────
export const studyAPI = {
    getAll: (params) => api.get('/study', { params }),
    getOne: (id) => api.get(`/study/${id}`),
}

// ─── Admin ────────────────────────────────────────────────────
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    getJobs: (params) => api.get('/admin/jobs', { params }),
    getJob: (id) => api.get(`/admin/jobs/${id}`),
    approveJob: (id) => api.put(`/admin/jobs/${id}/approve`),
    rejectJob: (id, reason) => api.put(`/admin/jobs/${id}/reject`, { reason }),
    createJob: (data) => api.post('/admin/jobs', data),
    deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
    fetchJobs: () => api.post('/admin/jobs/fetch'),
    uploadStudy: (formData) => api.post('/admin/study', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteStudy: (id) => api.delete(`/admin/study/${id}`),
}

// ─── Tools ────────────────────────────────────────────────────
export const toolsAPI = {
    generateBio: (data) => api.post('/tools/bio', data),
    resizePhoto: (formData) => api.post('/tools/resize-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    salaryCalc: (data) => api.post('/tools/salary-calculator', data),
}

// ─── Payment ──────────────────────────────────────────────────
export const paymentAPI = {
    getKey: () => api.get('/payment/key'),
    createOrder: () => api.post('/payment/create-order'),
    verifyPayment: (data) => api.post('/payment/verify', data)
}

// ─── Employer ─────────────────────────────────────────────────
import useEmployerAuthStore from '../store/employerAuthStore';

const employerApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});
employerApi.interceptors.request.use((config) => {
    const token = useEmployerAuthStore.getState().employerToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
employerApi.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err)
);

export const employerAPI = {
    // Auth
    register: (data) => employerApi.post('/employer/register', data),
    verifyOtp: (data) => employerApi.post('/employer/verify-otp', data),
    resendOtp: (data) => employerApi.post('/employer/resend-otp', data),
    login: (data) => employerApi.post('/employer/login', data),
    // Profile
    getMe: () => employerApi.get('/employer/me'),
    updateProfile: (data) => employerApi.put('/employer/profile', data),
    // Dashboard
    getDashboard: () => employerApi.get('/employer/dashboard'),
    // Jobs
    getJobs: (params) => employerApi.get('/employer/jobs', { params }),
    getJob: (id) => employerApi.get(`/employer/jobs/${id}`),
    postJob: (data) => employerApi.post('/employer/jobs', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
    updateJob: (id, data) => employerApi.put(`/employer/jobs/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
    deleteJob: (id) => employerApi.delete(`/employer/jobs/${id}`),
}

// ─── Admin Employer Mgmt (uses admin api instance) ────────────
export const adminEmployerAPI = {
    getEmployers: (params) => api.get('/admin/employers', { params }),
    verifyEmployer: (id) => api.put(`/admin/employers/${id}/verify`),
    rejectEmployer: (id, reason) => api.put(`/admin/employers/${id}/reject`, { reason }),
}

export default api
