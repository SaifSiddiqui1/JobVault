import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { employerAPI } from '../../services/api';
import useEmployerAuthStore from '../../store/employerAuthStore';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';

export default function EmployerLoginPage() {
    const navigate = useNavigate();
    const { setEmployerAuth } = useEmployerAuthStore();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await employerAPI.login(form);
            setEmployerAuth(res.employer, res.token);
            toast.success(`Welcome back, ${res.employer.contactName}!`);
            navigate('/employer/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message;
            if (err.response?.data?.needsVerification) {
                toast.error('Please verify your email first.');
            } else {
                toast.error(msg || 'Login failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center mb-6">
                        <img src="/logo.png" alt="JobVault" className="h-12 w-auto object-contain" />
                    </Link>
                    <h1 className="font-heading text-3xl font-bold text-white">Employer Sign In</h1>
                    <p className="text-indigo-300 mt-2">Manage your job postings and applications</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Work Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                                    placeholder="you@company.com"
                                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 pl-9 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
                                    placeholder="••••••••"
                                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 pl-9 pr-10 focus:outline-none focus:border-indigo-400" />
                                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                            {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-white/50 text-sm pt-2 border-t border-white/10">
                        New employer?{' '}
                        <Link to="/employer/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Create free account</Link>
                    </p>
                </div>

                <p className="text-center text-white/30 text-xs mt-6">
                    Looking for a job? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Job seeker login →</Link>
                </p>
            </div>
        </div>
    );
}
