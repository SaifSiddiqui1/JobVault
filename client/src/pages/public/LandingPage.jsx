import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Zap, Target, BookOpen, Wrench, Stars, FileText, Briefcase } from 'lucide-react'

const features = [
    { icon: FileText, title: 'AI Resume Builder', desc: 'Build ATS-friendly resumes with AI suggestions, beautiful templates, and instant PDF download.' },
    { icon: Target, title: 'ATS Score Checker', desc: 'Upload your resume + job description. Our AI gives you a real ATS score and fixes in seconds.' },
    { icon: Briefcase, title: 'Curated Job Board', desc: 'Jobs aggregated from 4+ platforms, hand-reviewed by admins, and personalized for your profile.' },
    { icon: BookOpen, title: 'Study Materials', desc: 'Prep resources, interview guides, and field-specific notes — all in one place.' },
    { icon: Zap, title: 'AI Cover Letters', desc: 'Generate job-specific cover letters with one click using your resume data and the job description.' },
    { icon: Wrench, title: 'Utility Tools', desc: 'Bio creator, photo resizer, salary calculator, file converter — free tools you actually need.' },
]

const stats = [
    { label: 'Resumes Built', value: '10,000+' },
    { label: 'Jobs Listed', value: '5,000+' },
    { label: 'ATS Checks Done', value: '25,000+' },
    { label: 'Success Rate', value: '87%' },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* ── Navbar ── */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                    <Link to="/" className="flex items-center">
                        <img src="/logo.png" alt="JobVault" className="h-10 w-auto object-contain" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="btn-ghost text-sm">Log In</Link>
                        <Link to="/signup" className="btn-primary text-sm">Get Started Free</Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="pt-28 pb-24 px-4 relative overflow-hidden bg-gradient-to-b from-gray-950 via-primary-950 to-primary-900">
                {/* Mesh background */}
                <div className="absolute inset-0"
                    style={{ backgroundImage: 'radial-gradient(circle at 25% 40%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 60%, rgba(249,115,22,0.15) 0%, transparent 45%)' }} />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/70 text-sm font-medium mb-8">
                        <Stars size={14} className="text-amber-400" />
                        AI-Powered Career Platform
                    </div>

                    <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6">
                        Land Your Dream Job<br />
                        <span className="gradient-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">with AI on Your Side</span>
                    </h1>

                    <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Build ATS-friendly resumes, check your resume score, and discover curated jobs — all in one powerful, <strong className="text-white font-semibold">100% free</strong> platform.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center shadow-xl shadow-primary-600/30">
                            Build My Resume <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2 justify-center bg-white/10 border-white/15 text-white hover:bg-white/15">
                            View Jobs
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map(s => (
                            <div key={s.label} className="glass rounded-2xl p-5 text-center">
                                <p className="font-heading font-bold text-3xl text-white">{s.value}</p>
                                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
            </section>

            {/* ── Features ── */}
            <section className="py-24 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Everything You Need to <span className="text-primary-600">Get Hired</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        From resume building to job discovery — JobVault covers your entire job search journey with AI.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <div key={i} className="group card hover:border-primary-200 dark:hover:border-primary-800">
                            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                                <f.icon size={22} className="text-primary-600" />
                            </div>
                            <h3 className="font-heading font-semibold text-base text-gray-900 dark:text-white mb-2">{f.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── For Employers ── */}
            <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' }} />
                <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm font-semibold mb-6">
                            🏢 For Employers & Recruiters
                        </div>
                        <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                            Hire Top Talent.<br />
                            <span className="gradient-text bg-gradient-to-r from-amber-300 to-yellow-200">Post Jobs for Free.</span>
                        </h2>
                        <p className="text-primary-200 text-base max-w-lg mb-8 leading-relaxed">
                            Reach thousands of qualified job seekers daily. Free posting for startups & early-stage companies. Jobs go live within hours after a quick verification.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <Link to="/signup" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl text-sm flex items-center justify-center gap-2">
                                Post a Job Free <ArrowRight size={16} />
                            </Link>
                            <Link to="/login" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                                Employer Login
                            </Link>
                        </div>
                    </div>
                    <div className="flex-shrink-0 grid grid-cols-1 gap-3 w-full md:w-72">
                        {[
                            { emoji: '⚡', t: 'Quick Setup', d: 'Listed in under 5 minutes' },
                            { emoji: '🎯', t: 'Targeted Reach', d: 'Job seekers actively looking' },
                            { emoji: '✅', t: 'Admin Verified', d: 'Quality-checked job board' },
                        ].map(item => (
                            <div key={item.t} className="glass rounded-xl p-4 flex items-center gap-4">
                                <div className="text-2xl">{item.emoji}</div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{item.t}</p>
                                    <p className="text-primary-300 text-xs mt-0.5">{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">How JobVault Works</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { step: '01', title: 'Create Your Profile', desc: 'Sign up and complete your profile. Our AI personalizes the experience for you.' },
                            { step: '02', title: 'Build Your Resume', desc: 'Use our AI-powered builder to craft an ATS-optimized resume. Check your score instantly.' },
                            { step: '03', title: 'Find & Apply', desc: 'Browse curated jobs matched to your profile. Apply with one click.' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/25">
                                    <span className="font-heading font-bold text-lg text-white">{s.step}</span>
                                </div>
                                <h3 className="font-heading font-semibold text-base text-gray-900 dark:text-white mb-2">{s.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to Land Your Dream Job?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Join thousands of job seekers who already use JobVault.</p>
                    <Link to="/signup" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2 shadow-xl shadow-primary-600/25">
                        Start For Free <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-gray-100 dark:border-gray-800/60 py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <Link to="/" className="flex items-center">
                        <img src="/logo.png" alt="JobVault" className="h-8 w-auto object-contain opacity-70" />
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} JobVault. Built with ❤️ for job seekers.</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
