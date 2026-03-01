import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { employerAPI } from '../../services/api';
import useEmployerAuthStore from '../../store/employerAuthStore';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, User, Globe, Briefcase, ChevronRight, Eye, EyeOff } from 'lucide-react';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce', 'Manufacturing', 'Media', 'Consulting', 'Government', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function EmployerSignupPage() {
    const navigate = useNavigate();
    const { setEmployerAuth } = useEmployerAuthStore();
    const [step, setStep] = useState(1); // 1=form, 2=otp
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [employerId, setEmployerId] = useState(null);
    const [otp, setOtp] = useState('');

    const [form, setForm] = useState({
        contactName: '', companyName: '',
        email: '', password: '',
        companyWebsite: '', industry: '', companySize: '1-10',
    });

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await employerAPI.register(form);
            setEmployerId(res.employerId);
            toast.success('Account created! Check your email for OTP.');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await employerAPI.verifyOtp({ employerId, otp });
            setEmployerAuth(res.employer, res.token);
            toast.success('Email verified! Welcome to JobVault for Employers 🎉');
            navigate('/employer/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center mb-6">
                        <img src="/logo.png" alt="JobVault" className="h-12 w-auto object-contain" />
                    </Link>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-4">
                        <Building2 size={14} className="text-indigo-400" />
                        Post Jobs Free — For Employers
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-white">
                        {step === 1 ? 'Create Your Employer Account' : 'Verify Your Email'}
                    </h1>
                    <p className="text-indigo-300 mt-2">
                        {step === 1 ? 'Reach thousands of talented job seekers' : `Enter the 6-digit code sent to ${form.email}`}
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                    {step === 1 ? (
                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Row 1 */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1.5">Your Name *</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                        <input name="contactName" value={form.contactName} onChange={handleChange} required
                                            placeholder="Rahul Sharma"
                                            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 pl-9 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1.5">Company Name *</label>
                                    <div className="relative">
                                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                        <input name="companyName" value={form.companyName} onChange={handleChange} required
                                            placeholder="Acme Technologies"
                                            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 pl-9 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                </div>
                            </div>
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Work Email *</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                                        placeholder="you@company.com"
                                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 pl-9 focus:outline-none focus:border-indigo-400" />
                                </div>
                            </div>
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">Password *</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required minLength={8}
                                        placeholder="Min 8 characters"
                                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 pl-9 pr-10 focus:outline-none focus:border-indigo-400" />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            {/* Row 3 */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-white/80 mb-1.5">Company Website</label>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                        <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange}
                                            placeholder="https://..."
                                            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 pl-9 focus:outline-none focus:border-indigo-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1.5">Industry</label>
                                    <select name="industry" value={form.industry} onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400">
                                        <option value="" className="bg-gray-900">Select...</option>
                                        {INDUSTRIES.map(i => <option key={i} value={i} className="bg-gray-900">{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1.5">Team Size</label>
                                    <select name="companySize" value={form.companySize} onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400">
                                        {SIZES.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <><ChevronRight size={16} /> Create Free Account</>}
                            </button>

                            <p className="text-center text-white/50 text-sm">
                                Already have an account?{' '}
                                <Link to="/employer/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center mx-auto mb-4">
                                    <Mail size={28} className="text-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2 text-center">6-Digit Verification Code</label>
                                <input value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                                    placeholder="000000"
                                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] focus:outline-none focus:border-indigo-400" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : 'Verify & Continue'}
                            </button>
                            <button type="button" onClick={() => employerAPI.resendOtp({ employerId }).then(() => toast.success('New code sent!'))}
                                className="w-full text-indigo-400 hover:text-indigo-300 text-sm font-medium py-2">
                                Didn't receive it? Resend Code
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-white/30 text-xs mt-6">
                    Looking for a job? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">Job seeker signup →</Link>
                </p>
            </div>
        </div>
    );
}
