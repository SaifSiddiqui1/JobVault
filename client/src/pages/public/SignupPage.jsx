import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, Phone, User, Eye, EyeOff, ArrowRight, Briefcase, Building2, Globe, Sparkles } from 'lucide-react'
import { authAPI, employerAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import useEmployerAuthStore from '../../store/employerAuthStore'
import toast from 'react-hot-toast'
import { isValidPhoneNumber } from 'libphonenumber-js'

const ROLE_SEEKER = 'seeker'
const ROLE_EMPLOYER = 'employer'
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce', 'Manufacturing', 'Media', 'Consulting', 'Government', 'Other']
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

export default function SignupPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const { setEmployerAuth } = useEmployerAuthStore()

    const [role, setRole] = useState(ROLE_SEEKER)
    const isEmployer = role === ROLE_EMPLOYER

    // Common state
    const [step, setStep] = useState(1) // 1=form, 2=OTP
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Job Seeker state
    const [seekerForm, setSeekerForm] = useState({ fullName: '', username: '', email: '', password: '', contactNumber: '', dateOfBirth: '' })
    const [seekerUserId, setSeekerUserId] = useState(null)
    const [seekerOtp, setSeekerOtp] = useState('')

    // Employer state
    const [empForm, setEmpForm] = useState({ contactName: '', companyName: '', email: '', password: '', companyWebsite: '', industry: '', companySize: '1-10' })
    const [empId, setEmpId] = useState(null)
    const [empOtp, setEmpOtp] = useState('')

    const handleSeekerChange = e => setSeekerForm(p => ({ ...p, [e.target.name]: e.target.value }))
    const handleEmpChange = e => setEmpForm(p => ({ ...p, [e.target.name]: e.target.value }))

    // ─── SEEKER REGISTER ─────────────────────
    const handleSeekerRegister = async (e) => {
        e.preventDefault()
        if (seekerForm.dateOfBirth) {
            const age = Math.floor((new Date() - new Date(seekerForm.dateOfBirth)) / 31557600000)
            if (age < 15) return toast.error('You must be at least 15 years old.')
        }
        if (seekerForm.contactNumber) {
            try {
                const numStr = seekerForm.contactNumber.startsWith('+') ? seekerForm.contactNumber : `+91${seekerForm.contactNumber}`
                if (!isValidPhoneNumber(numStr)) return toast.error('Please enter a valid phone number.')
            } catch { return toast.error('Invalid contact number.') }
        }
        setLoading(true)
        try {
            const res = await authAPI.register(seekerForm)
            setSeekerUserId(res.data.userId)
            setStep(2)
            if (res.data.devOtp) { setSeekerOtp(res.data.devOtp); toast.success(`OTP: ${res.data.devOtp}`) }
            else toast.success('OTP sent to your email!')
        } catch (err) { toast.error(err.response?.data?.message || 'Registration failed.') }
        finally { setLoading(false) }
    }

    // ─── EMPLOYER REGISTER ───────────────────
    const handleEmpRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await employerAPI.register(empForm)
            setEmpId(res.employerId)
            toast.success('Account created! You can now log in.')
            navigate('/login')
        } catch (err) { toast.error(err.response?.data?.message || 'Registration failed.') }
        finally { setLoading(false) }
    }

    // ─── SEEKER VERIFY ───────────────────────
    const handleSeekerVerify = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authAPI.verifyEmail({ userId: seekerUserId, otp: seekerOtp })
            setAuth(res.data.user, res.data.token)
            toast.success('Email verified! Welcome to JobVault 🎉')
            navigate('/dashboard')
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP') }
        finally { setLoading(false) }
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const inputCls = "w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"

    return (
        <div className="min-h-screen flex">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{
                background: isEmployer
                    ? 'linear-gradient(135deg, #312e81 0%, #4c1d95 40%, #1e1b4b 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0c4a6e 100%)'
            }}>
                <div className="absolute top-20 -left-12 w-64 h-64 rounded-full opacity-10" style={{ background: isEmployer ? '#a78bfa' : '#38bdf8', filter: 'blur(60px)' }} />
                <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full opacity-10" style={{ background: isEmployer ? '#818cf8' : '#06b6d4', filter: 'blur(50px)' }} />

                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <Link to="/" className="inline-flex items-center">
                        <img src="/logo.png" alt="JobVault" className="h-10 w-auto object-contain brightness-200" />
                    </Link>
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-xs font-medium uppercase tracking-wide">
                            <Sparkles size={12} className="text-amber-400" />
                            {isEmployer ? 'Hire Top Talent' : 'Launch Your Career'}
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight font-heading">
                            {isEmployer ? (
                                <>Post jobs for free.<br />Hire <span className="text-violet-300">smarter.</span></>
                            ) : (
                                <>Build. Apply.<br /><span className="text-cyan-300">Get hired.</span></>
                            )}
                        </h2>
                        <p className="text-white/50 text-base max-w-sm leading-relaxed">
                            {isEmployer
                                ? 'Create your employer account and reach thousands of qualified candidates on India\'s fastest-growing job platform.'
                                : 'Join thousands of professionals who found their dream job through JobVault\'s AI-powered platform.'}
                        </p>
                    </div>
                    <p className="text-white/20 text-xs">© {new Date().getFullYear()} JobVault. All rights reserved.</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center py-8 px-6 sm:px-10 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
                <div className="w-full max-w-md space-y-7">
                    <div className="lg:hidden text-center">
                        <Link to="/"><img src="/logo.png" alt="JobVault" className="h-10 mx-auto mb-4" /></Link>
                    </div>

                    {/* Role Toggle */}
                    <div className="bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl flex relative">
                        <div className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-300 ease-out shadow-md"
                            style={{
                                width: 'calc(50% - 6px)',
                                left: role === ROLE_SEEKER ? '6px' : 'calc(50%)',
                                background: isEmployer ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                            }} />
                        <button onClick={() => { setRole(ROLE_SEEKER); setStep(1) }}
                            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${role === ROLE_SEEKER ? 'text-white' : 'text-gray-500'}`}>
                            <Briefcase size={16} /> Job Seeker
                        </button>
                        <button onClick={() => { setRole(ROLE_EMPLOYER); setStep(1) }}
                            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${role === ROLE_EMPLOYER ? 'text-white' : 'text-gray-500'}`}>
                            <Building2 size={16} /> Employer
                        </button>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                            {step === 2 ? 'Verify Your Email' : (isEmployer ? 'Create Employer Account' : 'Create Your Account')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            {step === 2 ? `Enter the OTP sent to ${seekerForm.email}` : (isEmployer ? 'Start hiring talent for free' : 'Join thousands of job seekers')}
                        </p>
                    </div>

                    {/* ─── SEEKER SIGNUP ─── */}
                    {!isEmployer && step === 1 && (
                        <>
                            {/* Social auth */}
                            <div className="grid grid-cols-2 gap-3">
                                <a href={`${apiBase}/api/auth/google`}
                                    className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all hover:shadow-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google
                                </a>
                                <a href={`${apiBase}/api/auth/github`}
                                    className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all hover:shadow-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                                    GitHub
                                </a>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                                <span className="text-gray-400 text-xs font-medium">or</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                            </div>
                            <form onSubmit={handleSeekerRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                                        <div className="relative">
                                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input name="fullName" value={seekerForm.fullName} onChange={handleSeekerChange} required placeholder="John Doe" className={`${inputCls} pl-10`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username *</label>
                                        <input name="username" value={seekerForm.username} onChange={handleSeekerChange} required placeholder="johndoe" className={inputCls} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="email" type="email" value={seekerForm.email} onChange={handleSeekerChange} required placeholder="you@email.com" className={`${inputCls} pl-10`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="password" type={showPassword ? 'text' : 'password'} value={seekerForm.password} onChange={handleSeekerChange} required minLength={8} placeholder="Min 8 characters" className={`${inputCls} pl-10 pr-10`} />
                                        <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                                        <div className="relative">
                                            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input name="contactNumber" value={seekerForm.contactNumber} onChange={handleSeekerChange} placeholder="+91..." className={`${inputCls} pl-10`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date of Birth</label>
                                        <input name="dateOfBirth" type="date" value={seekerForm.dateOfBirth} onChange={handleSeekerChange} max={new Date().toISOString().split('T')[0]} className={inputCls} />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 8px 24px rgba(14,165,233,0.3)' }}>
                                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ─── SEEKER OTP ─── */}
                    {!isEmployer && step === 2 && (
                        <form onSubmit={handleSeekerVerify} className="space-y-5">
                            <div className="text-center py-3">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto mb-3">
                                    <Mail size={28} className="text-blue-500" />
                                </div>
                                <p className="text-gray-500 text-sm">We've sent a 6-digit code to your email</p>
                            </div>
                            <input value={seekerOtp} onChange={e => setSeekerOtp(e.target.value)} required maxLength={6} placeholder="000000"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                            <button type="submit" disabled={loading || seekerOtp.length !== 6}
                                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                                {loading ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                            <button type="button" onClick={() => authAPI.resendOTP({ userId: seekerUserId }).then(() => toast.success('New OTP sent!'))}
                                className="w-full text-blue-600 dark:text-blue-400 text-sm font-medium py-2 hover:underline">
                                Didn't get it? Resend OTP
                            </button>
                        </form>
                    )}

                    {/* ─── EMPLOYER SIGNUP ─── */}
                    {isEmployer && (
                        <form onSubmit={handleEmpRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Name *</label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="contactName" value={empForm.contactName} onChange={handleEmpChange} required placeholder="Rahul Sharma" className={`${inputCls} pl-10`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name *</label>
                                    <div className="relative">
                                        <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="companyName" value={empForm.companyName} onChange={handleEmpChange} required placeholder="Acme Technologies" className={`${inputCls} pl-10`} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Work Email *</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="email" type="email" value={empForm.email} onChange={handleEmpChange} required placeholder="you@company.com" className={`${inputCls} pl-10`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="password" type={showPassword ? 'text' : 'password'} value={empForm.password} onChange={handleEmpChange} required minLength={8} placeholder="Min 8 characters" className={`${inputCls} pl-10 pr-10`} />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
                                    <div className="relative">
                                        <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="companyWebsite" value={empForm.companyWebsite} onChange={handleEmpChange} placeholder="https://..." className={`${inputCls} pl-10`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Industry</label>
                                    <select name="industry" value={empForm.industry} onChange={handleEmpChange} className={inputCls}>
                                        <option value="">Select...</option>
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Team Size</label>
                                    <select name="companySize" value={empForm.companySize} onChange={handleEmpChange} className={inputCls}>
                                        {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Free Account <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Already have an account? <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
