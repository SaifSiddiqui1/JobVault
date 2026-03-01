import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Zap, Target, BookOpen, Wrench, Stars, ChevronDown } from 'lucide-react'

const features = [
    { icon: FileText, title: 'AI Resume Builder', desc: 'Build ATS-friendly resumes with AI suggestions, beautiful templates, and instant PDF download.' },
    { icon: Target, title: 'ATS Score Checker', desc: 'Upload your resume + job description. Our AI gives you a real ATS score and fixes in seconds.' },
    { icon: Briefcase, title: 'Curated Job Board', desc: 'Jobs aggregated from 4+ platforms, hand-reviewed by admins, and personalized for your profile.' },
    { icon: BookOpen, title: 'Study Materials', desc: 'Prep resources, interview guides, and field-specific notes — all in one place.' },
    { icon: Zap, title: 'AI Cover Letters', desc: 'Generate job-specific cover letters with one click using your resume data and the job description.' },
    { icon: Wrench, title: 'Utility Tools', desc: 'Bio creator, photo resizer, salary calculator, file converter — free tools you actually need.' },
]

import { FileText, Briefcase } from 'lucide-react'

const stats = [
    { label: 'Resumes Built', value: '10,000+' },
    { label: 'Jobs Listed', value: '5,000+' },
    { label: 'ATS Checks Done', value: '25,000+' },
    { label: 'Success Rate', value: '87%' },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="JobVault Logo" className="h-12 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn-ghost text-sm">Log In</Link>
                        <Link to="/signup" className="btn-primary text-sm">Get Started Free</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-28 pb-20 px-4 bg-hero-gradient relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #818cf8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f97316 0%, transparent 40%)' }} />
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6 animate-fade-in">
                        <Stars size={14} className="text-amber-400" />
                        AI-Powered Career Platform
                    </div>
                    <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
                        Land Your Dream Job<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">with AI on Your Side</span>
                    </h1>
                    <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-10 animate-slide-up">
                        Build ATS-friendly resumes, check your resume score, and discover curated jobs — all in one powerful, <strong className="text-white">100% free</strong> platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                        <Link to="/signup" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
                            Build My Resume <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
                            View Jobs
                        </Link>
                    </div>
                    {/* Quick stats */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map(stat => (
                            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                                <p className="font-heading font-bold text-3xl text-white">{stat.value}</p>
                                <p className="text-primary-300 text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
            </section>

            {/* Features */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Everything You Need to <span className="text-primary-600">Get Hired</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        From resume building to job discovery — JobVault covers your entire job search journey with AI.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="card group hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                                <f.icon size={22} className="text-primary-600" />
                            </div>
                            <h3 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-2">{f.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── FOR EMPLOYERS ─── */}
            <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%)' }} />
                <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white/90 text-sm font-semibold mb-6">
                            🏢 For Employers &amp; Recruiters
                        </div>
                        <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                            Hire Top Talent.<br />
                            <span className="text-yellow-300">Post Jobs for Free.</span>
                        </h2>
                        <p className="text-indigo-200 text-lg max-w-lg mb-8">
                            Reach thousands of qualified job seekers daily. Free posting for startups &amp; early-stage companies. Jobs go live within hours after a quick verification.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link to="/employer/signup" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2">
                                Post a Job Free →
                            </Link>
                            <Link to="/employer/login" className="border-2 border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                                Employer Login
                            </Link>
                        </div>
                    </div>
                    <div className="flex-shrink-0 grid grid-cols-1 gap-4 w-full md:w-72">
                        {[{ emoji: '⚡', t: 'Quick Setup', d: 'Listed in under 5 minutes' }, { emoji: '🎯', t: 'Targeted Reach', d: 'Job seekers actively looking' }, { emoji: '✅', t: 'Admin Verified', d: 'Quality-checked job board' }].map(item => (
                            <div key={item.t} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center gap-4">
                                <div className="text-2xl">{item.emoji}</div>
                                <div><p className="font-semibold text-white text-sm">{item.t}</p><p className="text-indigo-200 text-xs mt-0.5">{item.d}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">How JobVault Works</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Create Your Profile', desc: 'Sign up and complete your profile. Our AI personalizes the experience for you.' },
                            { step: '02', title: 'Build Your Resume', desc: 'Use our AI-powered builder to craft an ATS-optimized resume. Check your score instantly.' },
                            { step: '03', title: 'Find & Apply to Jobs', desc: 'Browse curated jobs matched to your profile. Apply with one click.' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                                    <span className="font-heading font-bold text-xl text-white">{s.step}</span>
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{s.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to Land Your Dream Job?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Join thousands of job seekers who already use JobVault.</p>
                    <Link to="/signup" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
                        Start For Free <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="JobVault Logo" className="h-8 w-auto object-contain opacity-80" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 JobVault. Built with ❤️ for job seekers.</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <a href="#" className="hover:text-primary-600">Privacy</a>
                        <a href="#" className="hover:text-primary-600">Terms</a>
                        <a href="#" className="hover:text-primary-600">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
