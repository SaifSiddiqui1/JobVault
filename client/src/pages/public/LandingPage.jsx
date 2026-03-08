import { Link } from 'react-router-dom';
import { Briefcase, Zap, Target, BarChart2, ChevronRight, CheckCircle, Star, Users, ArrowRight, Sparkles, FileText, Search } from 'lucide-react';

const STATS = [
    { value: '50K+', label: 'Active Jobs' },
    { value: '98%', label: 'ATS Pass Rate' },
    { value: '2.4x', label: 'Faster Hiring' },
    { value: '30K+', label: 'Professionals' },
];

const FEATURES = [
    {
        icon: Sparkles,
        title: 'AI Resume Builder',
        desc: 'Our intelligence engine generates high-impact bullet points and optimizes layout for ATS automatically.',
        color: 'from-violet-500/20 to-indigo-500/10',
        accent: 'text-violet-400',
        border: 'border-violet-500/20',
        large: true,
    },
    {
        icon: Target,
        title: 'ATS Score Checker',
        desc: 'Instant feedback on how well your resume matches any job description.',
        color: 'from-emerald-500/20 to-teal-500/10',
        accent: 'text-emerald-400',
        border: 'border-emerald-500/20',
    },
    {
        icon: Search,
        title: 'Curated Job Board',
        desc: 'Hand-picked roles from top companies before they hit general sites.',
        color: 'from-sky-500/20 to-blue-500/10',
        accent: 'text-sky-400',
        border: 'border-sky-500/20',
    },
    {
        icon: BarChart2,
        title: 'Smart Tracking',
        desc: 'Manage every stage of your job hunt with automatic follow-up reminders.',
        color: 'from-amber-500/20 to-orange-500/10',
        accent: 'text-amber-400',
        border: 'border-amber-500/20',
    },
];

const TESTIMONIALS = [
    { name: 'Sarah K.', role: 'Software Engineer at Google', text: 'JobVault\'s AI resume builder helped me land my dream role in 3 weeks. The ATS score checker was a game changer.', avatar: 'SK' },
    { name: 'Marcus T.', role: 'Product Manager at Stripe', text: 'The curated job board connected me directly with hiring managers. Got 5 interviews in my first week.', avatar: 'MT' },
    { name: 'Priya R.', role: 'Data Scientist at Netflix', text: 'I went from 0 callbacks to 8 interviews after optimizing my resume with JobVault. Absolutely worth it.', avatar: 'PR' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
            {/* ── Nav ─────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                            <Briefcase size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">JobVault</span>
                        <span className="ml-1 text-[10px] font-semibold bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/30">PRO</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                        <Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
                        <Link to="/employer/register" className="hover:text-white transition-colors">For Employers</Link>
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-1.5">Log in</Link>
                        <Link to="/signup" className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-violet-500/20">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative py-28 px-6 text-center overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]" />
                    <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px]" />
                </div>

                <div className="relative max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8">
                        <Zap size={14} className="text-violet-400" />
                        AI-Powered Career Platform — Now in Beta
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
                        Land Your Dream Job
                        <br />
                        <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                            with AI on Your Side
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Create professional, recruiter-vetted resumes in minutes. Our AI understands what hiring managers want and optimizes your profile for maximum visibility.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Link
                            to="/signup"
                            className="group flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
                        >
                            Start Building — It's Free
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/jobs"
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-7 py-3.5 rounded-xl transition-all"
                        >
                            Browse 50K+ Jobs
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                        {['Optimized for 12+ industry standards', 'ATS-tested with 500+ job descriptions', 'Used by 30K+ professionals'].map(t => (
                            <div key={t} className="flex items-center gap-1.5">
                                <CheckCircle size={14} className="text-emerald-500" />
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────────────── */}
            <section className="py-12 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map(s => (
                        <div key={s.label} className="text-center">
                            <div className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">{s.value}</div>
                            <div className="text-sm text-gray-500">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Feature Bento Grid ─────────────────────────────────── */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-3">The Bento Career Suite</p>
                        <h2 className="text-4xl font-extrabold">Everything You Need to Get Hired</h2>
                        <p className="text-gray-400 mt-4 max-w-xl mx-auto">Four powerful tools. One seamless platform. Zero guesswork.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.title}
                                className={`relative group rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-8 hover:scale-[1.01] transition-all duration-300 ${i === 0 ? 'md:col-span-2' : ''}`}
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-5 ${f.accent}`}>
                                    <f.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                                <p className="text-gray-400 leading-relaxed max-w-lg">{f.desc}</p>
                                <div className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${f.accent} group-hover:gap-2.5 transition-all`}>
                                    Learn more <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Employer CTA ─────────────────────────────────────── */}
            <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div>
                        <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-2">For Employers</p>
                        <h2 className="text-3xl font-extrabold mb-3">Hire Top Talent.<br />Post Jobs for Free.</h2>
                        <p className="text-gray-400 max-w-md">Access a curated pool of pre-screened professionals. Reach thousands of qualified candidates the day you post.</p>
                    </div>
                    <div className="flex flex-col gap-4 shrink-0">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5">
                            <Users size={20} className="text-emerald-400" />
                            <div>
                                <p className="text-sm font-semibold">Unified Pipeline Visibility</p>
                                <p className="text-xs text-gray-400">Track every candidate in one view</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5">
                            <Zap size={20} className="text-amber-400" />
                            <div>
                                <p className="text-sm font-semibold">AI Talent Matching</p>
                                <p className="text-xs text-gray-400">Surface the best-fit candidates instantly</p>
                            </div>
                        </div>
                        <Link to="/employer/register" className="text-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold px-6 py-3 rounded-xl transition-all">
                            Post a Job — It's Free →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ─────────────────────────────────────── */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="flex items-center justify-center gap-1 text-amber-400 mb-3">
                            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                        </div>
                        <h2 className="text-3xl font-extrabold">Loved by Professionals</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {TESTIMONIALS.map(t => (
                            <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors">
                                <p className="text-gray-300 leading-relaxed text-sm mb-5">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm font-bold shrink-0">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ─────────────────────────────────────────── */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[100px]" />
                </div>
                <div className="relative max-w-2xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
                        Ready to Land Your<br />
                        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Next Role?</span>
                    </h2>
                    <p className="text-gray-400 mb-8">Join 30,000+ professionals who use JobVault to accelerate their career.</p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
                    >
                        Create Free Account <ArrowRight size={20} />
                    </Link>
                    <p className="text-xs text-gray-600 mt-4">No credit card required · Free forever plan available</p>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                            <Briefcase size={12} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-400">JobVault</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
                        <Link to="/signup" className="hover:text-gray-300 transition-colors">Sign Up</Link>
                        <Link to="/employer/register" className="hover:text-gray-300 transition-colors">Employers</Link>
                    </div>
                    <p>© {new Date().getFullYear()} JobVault. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
