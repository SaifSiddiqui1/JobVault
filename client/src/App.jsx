import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import useAdminAuthStore from './store/adminAuthStore'
import useEmployerAuthStore from './store/employerAuthStore'

// Layouts
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'
import EmployerLayout from './components/layout/EmployerLayout'

// Public pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import SignupPage from './pages/public/SignupPage'
import VerifyEmailPage from './pages/public/VerifyEmailPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import OAuthSuccessPage from './pages/public/OAuthSuccessPage'

// User pages
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import ResumePage from './pages/dashboard/ResumePage'
import ResumeBuilderPage from './pages/dashboard/ResumeBuilderPage'
import AtsCheckerPage from './pages/dashboard/AtsCheckerPage'
import JobsPage from './pages/dashboard/JobsPage'
import JobDetailPage from './pages/dashboard/JobDetailPage'
import StudyPage from './pages/dashboard/StudyPage'
import ToolsPage from './pages/dashboard/ToolsPage'
import AIToolsPage from './pages/dashboard/AIToolsPage'
import SettingsPage from './pages/dashboard/SettingsPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminJobs from './pages/admin/AdminJobs'
import AdminUsers from './pages/admin/AdminUsers'
import AdminStudy from './pages/admin/AdminStudy'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminJobDetailPage from './pages/admin/AdminJobDetailPage'
import AdminEmployers from './pages/admin/AdminEmployers'

// Employer pages
import EmployerSignupPage from './pages/employer/EmployerSignupPage'
import EmployerLoginPage from './pages/employer/EmployerLoginPage'
import EmployerDashboard from './pages/employer/EmployerDashboard'
import PostJobPage from './pages/employer/PostJobPage'
import EmployerJobsPage from './pages/employer/EmployerJobsPage'
import EmployerProfilePage from './pages/employer/EmployerProfilePage'

// Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated, isAdminRole } = useAdminAuthStore()
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />
  if (!isAdminRole()) return <Navigate to="/admin/login" replace />
  return children
}

const EmployerRoute = ({ children }) => {
  const { employer, employerToken } = useEmployerAuthStore()
  return (employer && employerToken) ? children : <Navigate to="/employer/login" replace />
}

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { user } = useAuthStore()

  // Apply dark mode
  useEffect(() => {
    if (user?.darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [user?.darkMode])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/oauth-success" element={<OAuthSuccessPage />} />

        {/* Admin Login (public — separate from user login) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="resume/builder" element={<ResumeBuilderPage />} />
          <Route path="resume/builder/:id" element={<ResumeBuilderPage />} />
          <Route path="resume/ats-check" element={<AtsCheckerPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="ai-tools" element={<AIToolsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/:id" element={<AdminJobDetailPage />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="study" element={<AdminStudy />} />
          <Route path="employers" element={<AdminEmployers />} />
        </Route>

        {/* Employer Portal */}
        <Route path="/employer/signup" element={<EmployerSignupPage />} />
        <Route path="/employer/login" element={<EmployerLoginPage />} />
        <Route path="/employer" element={<EmployerRoute><EmployerLayout /></EmployerRoute>}>
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="post-job" element={<PostJobPage />} />
          <Route path="jobs" element={<EmployerJobsPage />} />
          <Route path="profile" element={<EmployerProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
