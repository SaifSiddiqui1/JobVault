import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Lock, Mail, AlertTriangle, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react'
import useAdminAuthStore from '../../store/adminAuthStore'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
    const navigate = useNavigate()
    const { setAdminAuth, isAdminAuthenticated, isAdminRole } = useAdminAuthStore()

    // If already logged in as admin, redirect straight to admin panel
    if (isAdminAuthenticated && isAdminRole()) {
        navigate('/admin', { replace: true })
        return null
    }

    const [form, setForm] = useState({ email: '', password: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Forgot password state
    const [forgotMode, setForgotMode] = useState(false) // show forgot password UI
    const [forgotStep, setForgotStep] = useState(1)      // 1=email, 2=otp+newpw, 3=done
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotUserId, setForgotUserId] = useState('')
    const [forgotOtp, setForgotOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)
    const [forgotError, setForgotError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.email || !form.password) {
            setError('Both fields are required.')
            return
        }
        setLoading(true)
        try {
            const res = await authAPI.login({ login: form.email, password: form.password })
            const { user, token } = res.data
            if (user.role !== 'admin') {
                setError('Access denied. This portal is for administrators only.')
                setLoading(false)
                return
            }
            // Use admin auth store
            setAdminAuth(user, token)
            toast.success(`Welcome back, ${user.fullName}!`)
            navigate('/admin', { replace: true })
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid credentials.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    // STEP 1: Send OTP to admin email
    const handleForgotSubmit = async (e) => {
        e.preventDefault()
        setForgotError('')
        if (!forgotEmail) { setForgotError('Please enter your admin email.'); return }
        setForgotLoading(true)
        try {
            const res = await authAPI.forgotPassword({ email: forgotEmail })
            if (res.userId) setForgotUserId(res.userId)
            else if (res.data?.userId) setForgotUserId(res.data.userId)
            toast.success('If that email exists, a reset OTP was sent.')
            setForgotStep(2)
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Failed to send reset code.')
        } finally {
            setForgotLoading(false)
        }
    }

    // STEP 2: Verify OTP + set new password
    const handleResetSubmit = async (e) => {
        e.preventDefault()
        setForgotError('')
        if (!forgotOtp || !newPassword) { setForgotError('Please fill in both fields.'); return }
        if (newPassword.length < 8) { setForgotError('Password must be at least 8 characters.'); return }
        setForgotLoading(true)
        try {
            await authAPI.resetPassword({ userId: forgotUserId, otp: forgotOtp, newPassword })
            toast.success('Password reset successfully!')
            setForgotStep(3)
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Invalid OTP or reset failed.')
        } finally {
            setForgotLoading(false)
        }
    }

    const resetForgotState = () => {
        setForgotMode(false)
        setForgotStep(1)
        setForgotEmail('')
        setForgotUserId('')
        setForgotOtp('')
        setNewPassword('')
        setForgotError('')
    }

    const inputCls = "w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition"

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

                    {!forgotMode ? (
                        /* ─── LOGIN FORM ─── */
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                                    <Shield size={28} className="text-red-400" />
                                </div>
                                <h1 className="text-2xl font-bold text-white font-heading">Admin Portal</h1>
                                <p className="text-gray-500 text-sm mt-1">Restricted access — JobVault administrators only</p>
                            </div>

                            {/* Error banner */}
                            {error && (
                                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-5 text-sm">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            placeholder="admin@jobvault.live"
                                            className={inputCls}
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                            placeholder="••••••••"
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-10 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition"
                                            autoComplete="current-password"
                                        />
                                        <button type="button" onClick={() => setShowPw(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                                            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="text-right">
                                    <button type="button" onClick={() => setForgotMode(true)}
                                        className="text-xs text-red-400 hover:text-red-300 font-medium transition">
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Authenticating…
                                        </>
                                    ) : (
                                        <>
                                            <Shield size={15} />
                                            Sign In to Admin Panel
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer links */}
                            <div className="mt-6 pt-5 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
                                <a href="/login" className="hover:text-gray-400 transition">← Regular user login</a>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    JobVault Admin v1.0
                                </span>
                            </div>
                        </>
                    ) : (
                        /* ─── FORGOT PASSWORD FLOW ─── */
                        <>
                            {/* Back button */}
                            <button onClick={resetForgotState}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition">
                                <ArrowLeft size={14} /> Back to login
                            </button>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
                                    <KeyRound size={28} className="text-amber-400" />
                                </div>
                                <h1 className="text-2xl font-bold text-white font-heading">
                                    {forgotStep === 1 && 'Reset Password'}
                                    {forgotStep === 2 && 'Enter OTP & New Password'}
                                    {forgotStep === 3 && 'Password Reset!'}
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    {forgotStep === 1 && 'Enter your admin email to receive a reset code'}
                                    {forgotStep === 2 && `We sent a code to ${forgotEmail}`}
                                    {forgotStep === 3 && 'You can now sign in with your new password'}
                                </p>
                            </div>

                            {/* Error */}
                            {forgotError && (
                                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-5 text-sm">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                    <span>{forgotError}</span>
                                </div>
                            )}

                            {/* STEP 1: Enter email */}
                            {forgotStep === 1 && (
                                <form onSubmit={handleForgotSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Admin Email</label>
                                        <div className="relative">
                                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                            <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                                                placeholder="admin@jobvault.live" className={inputCls} autoFocus />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={forgotLoading}
                                        className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                                        {forgotLoading
                                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : 'Send Reset Code'}
                                    </button>
                                </form>
                            )}

                            {/* STEP 2: OTP + New Password */}
                            {forgotStep === 2 && (
                                <form onSubmit={handleResetSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">6-Digit OTP Code</label>
                                        <input value={forgotOtp} onChange={e => setForgotOtp(e.target.value)}
                                            placeholder="000000" maxLength={6} autoFocus
                                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">New Password</label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                                placeholder="Min 8 characters" minLength={8} className={inputCls} />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={forgotLoading}
                                        className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                                        {forgotLoading
                                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : 'Reset Password'}
                                    </button>
                                </form>
                            )}

                            {/* STEP 3: Success */}
                            {forgotStep === 3 && (
                                <div className="text-center space-y-5">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/30 flex items-center justify-center mx-auto">
                                        <CheckCircle size={32} className="text-green-400" />
                                    </div>
                                    <p className="text-gray-400">Your admin password has been changed successfully.</p>
                                    <button onClick={resetForgotState}
                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                                        <Shield size={15} /> Back to Sign In
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Security notice */}
                <p className="text-center text-xs text-gray-700 mt-4">
                    🔒 All admin actions are logged and audited
                </p>
            </div>
        </div>
    )
}
