import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Github, Briefcase, Building2, Sparkles } from 'lucide-react'
import { authAPI, employerAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import useEmployerAuthStore from '../../store/employerAuthStore'
import toast from 'react-hot-toast'

const ROLE_SEEKER = 'seeker'
const ROLE_EMPLOYER = 'employer'

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const { setEmployerAuth } = useEmployerAuthStore()

    const [role, setRole] = useState(ROLE_SEEKER)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const isEmployer = role === ROLE_EMPLOYER

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) return toast.error('Please fill in all fields.')
        setLoading(true)
        try {
            if (isEmployer) {
                const res = await employerAPI.login({ email, password })
                setEmployerAuth(res.employer, res.token)
                toast.success(`Welcome back, ${res.employer.contactName}! 🏢`)
                navigate('/employer/dashboard')
            } else {
                const res = await authAPI.login({ login: email, password })
                setAuth(res.data.user, res.data.token)
                toast.success(`Welcome back, ${res.data.user.fullName?.split(' ')[0]}! 👋`)
                navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard')
            }
        } catch (err) {
            const data = err.response?.data
            if (data?.needsVerification) {
                navigate('/verify-email', { state: { userId: data.userId } })
            } else {
                toast.error(data?.message || 'Invalid credentials')
            }
        } finally {
            setLoading(false)
        }
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    return (
        <div className="min-h-screen flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{
                background: isEmployer
                    ? 'linear-gradient(135deg, #312e81 0%, #4c1d95 40%, #1e1b4b 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0c4a6e 100%)'
            }}>
                {/* Floating shapes */}
                <div className="absolute top-20 -left-12 w-64 h-64 rounded-full opacity-10" style={{ background: isEmployer ? '#a78bfa' : '#38bdf8', filter: 'blur(60px)' }} />
                <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full opacity-10" style={{ background: isEmployer ? '#818cf8' : '#06b6d4', filter: 'blur(50px)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-5" style={{ background: '#fff', filter: 'blur(80px)' }} />

                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <Link to="/" className="inline-flex items-center">
                        <img src="/logo.png" alt="JobVault" className="h-10 w-auto object-contain brightness-200" />
                    </Link>

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-xs font-medium tracking-wide uppercase">
                            <Sparkles size={12} className="text-amber-400" />
                            {isEmployer ? 'Employer Platform' : 'AI-Powered Careers'}
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight font-heading">
                            {isEmployer ? (
                                <>Find the right<br />talent, <span className="text-violet-300">faster.</span></>
                            ) : (
                                <>Your dream job<br />is <span className="text-cyan-300">one click</span> away.</>
                            )}
                        </h2>
                        <p className="text-white/50 text-base max-w-sm leading-relaxed">
                            {isEmployer
                                ? 'Post jobs, manage applications, and hire qualified candidates — all for free.'
                                : 'Build your resume with AI, get your ATS score, and apply to curated jobs instantly.'}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8 pt-4">
                            {(isEmployer
                                ? [{ n: '10K+', l: 'Active Seekers' }, { n: 'Free', l: 'Job Posting' }, { n: '<24h', l: 'Approval' }]
                                : [{ n: '5K+', l: 'Live Jobs' }, { n: 'AI', l: 'Resume Builder' }, { n: '95%', l: 'ATS Score' }]
                            ).map(s => (
                                <div key={s.l}>
                                    <p className="text-xl font-bold text-white">{s.n}</p>
                                    <p className="text-white/40 text-xs mt-0.5">{s.l}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-white/20 text-xs">© {new Date().getFullYear()} JobVault. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50 dark:bg-gray-950">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center">
                        <Link to="/"><img src="/logo.png" alt="JobVault" className="h-10 mx-auto mb-4" /></Link>
                    </div>

                    {/* Role Toggle */}
                    <div className="bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl flex relative">
                        <div
                            className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-300 ease-out shadow-md"
                            style={{
                                width: 'calc(50% - 6px)',
                                left: role === ROLE_SEEKER ? '6px' : 'calc(50%)',
                                background: isEmployer
                                    ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                                    : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                            }}
                        />
                        <button onClick={() => setRole(ROLE_SEEKER)}
                            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${role === ROLE_SEEKER ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                            <Briefcase size={16} /> Job Seeker
                        </button>
                        <button onClick={() => setRole(ROLE_EMPLOYER)}
                            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${role === ROLE_EMPLOYER ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                            <Building2 size={16} /> Employer
                        </button>
                    </div>

                    {/* Heading */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                            {isEmployer ? 'Employer Sign In' : 'Welcome Back'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            {isEmployer ? 'Access your recruiter dashboard' : 'Sign in to continue your job search'}
                        </p>
                    </div>

                    {/* Social Login — Job seekers only */}
                    {!isEmployer && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <a href={`${apiBase}/api/auth/google`}
                                    className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all hover:shadow-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google
                                </a>
                                <a href={`${apiBase}/api/auth/github`}
                                    className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all hover:shadow-sm">
                                    <Github size={16} /> GitHub
                                </a>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                                <span className="text-gray-400 text-xs font-medium">or</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                            </div>
                        </>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {isEmployer ? 'Work Email' : 'Email / Username / Phone'}
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={email} onChange={e => setEmail(e.target.value)} required
                                    type={isEmployer ? 'email' : 'text'}
                                    placeholder={isEmployer ? 'you@company.com' : 'your@email.com'}
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                {!isEmployer && <Link to="/forgot-password" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Forgot?</Link>}
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                    type={showPassword ? 'text' : 'password'} placeholder="Your password"
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl pl-11 pr-11 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                            style={{
                                background: isEmployer
                                    ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                                    : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                boxShadow: isEmployer
                                    ? '0 8px 24px rgba(99,102,241,0.3)'
                                    : '0 8px 24px rgba(14,165,233,0.3)',
                            }}>
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center space-y-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isEmployer ? "New employer? " : "Don't have an account? "}
                            <Link to="/signup" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                {isEmployer ? 'Create free account' : 'Sign up free'}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
