import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
    FileText, Briefcase, Target, TrendingUp, Plus, ArrowRight,
    Clock, CheckCircle, Sparkles, Edit3, Bookmark, Activity
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { jobsAPI, resumeAPI } from '../../services/api'

export default function DashboardPage() {
    const { user } = useAuthStore()

    const { data: jobsData } = useQuery({
        queryKey: ['jobs', 'dashboard'],
        queryFn: () => jobsAPI.getAll({ limit: 4, sort: '-postedDate' }),
    })

    const { data: resumesData } = useQuery({
        queryKey: ['resumes'],
        queryFn: () => resumeAPI.getAll(),
    })

    const resumes = resumesData?.data?.resumes || []
    const jobs = jobsData?.data?.jobs || []
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

    const stats = [
        { label: 'My Resumes', value: resumes.length, icon: FileText, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/20' },
        { label: 'Downloads Left', value: Math.max(0, 2 - (user?.resumeDownloadsUsed || 0)), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
        { label: 'Saved Jobs', value: user?.savedJobs?.length || 0, icon: Bookmark, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
        { label: 'Profile Score', value: `${user?.profileCompleteness || 0}%`, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
    ]

    return (
        <div className="space-y-6 page-enter">
            {/* ── Welcome Hero ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f0a1a] via-[#1a1033] to-[#0d1117] p-8 md:p-10 border border-purple-900/40 shadow-xl shadow-purple-900/10">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(124,59,237,0.2) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(59,130,246,0.15) 0%, transparent 50%)' }} />
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-violet-600/20 blur-[80px]" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-200 text-xs font-semibold mb-4">
                        <Sparkles size={14} className="text-violet-400" /> Welcome back to JobVault Pro
                    </div>
                    <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">{user?.fullName?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-purple-200/70 mt-3 text-sm md:text-base max-w-xl leading-relaxed">
                        {resumes.length === 0
                            ? "Your career journey starts here. Build an AI-optimized resume and unlock top opportunities."
                            : "Your profile is active. Leverage our AI tools to tailor your resume and stand out to recruiters."}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link to="/dashboard/resume/builder"
                            className="btn-primary px-6 py-3 rounded-xl shadow-lg shadow-violet-600/25 flex items-center gap-2 group border-none">
                            <Plus size={18} className="text-white drop-shadow-md" />
                            <span className="font-semibold text-white">Create Resume</span>
                        </Link>
                        <Link to="/dashboard/jobs"
                            className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 group backdrop-blur-sm">
                            Explore Roles <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border ${s.border} shadow-sm flex items-center gap-4 hover:shadow-md transition-all`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                            <s.icon size={24} className={s.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ── Left Column: Activity & Resumes ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Tools */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6">
                        <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                            <Target size={20} className="text-violet-500" /> Pro Tools
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Link to="/dashboard/resume/ats-check" className="group rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-violet-300 dark:hover:border-violet-700/60 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                                    <Target size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">ATS Analyzer</p>
                                    <p className="text-xs text-gray-500 mt-1">Score your resume against any job description instantly.</p>
                                </div>
                            </Link>
                            <Link to="/dashboard/resume/builder" className="group rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-sky-300 dark:hover:border-sky-700/60 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
                                    <Edit3 size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">AI Builder</p>
                                    <p className="text-xs text-gray-500 mt-1">Generate tailored bullet points and summaries with AI.</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Resumes */}
                    {resumes.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText size={20} className="text-blue-500" /> Recent Resumes
                                </h2>
                                <Link to="/dashboard/resume" className="text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-1">
                                    Manage <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {resumes.slice(0, 3).map(r => (
                                    <Link key={r._id} to={`/dashboard/resume/builder/${r._id}`}
                                        className="group rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between hover:border-violet-200 dark:hover:border-violet-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{r.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Updated {new Date(r.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {r.lastAtsScore ? (
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                                                    ATS: {r.lastAtsScore}
                                                </div>
                                            </div>
                                        ) : (
                                            <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-violet-500 transition-colors" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Column: Recommended Jobs ── */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <Briefcase size={20} className="text-emerald-500" /> New Roles
                        </h2>
                        <Link to="/dashboard/jobs" className="text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400">
                            See all
                        </Link>
                    </div>

                    <div className="flex-1 space-y-4">
                        {jobs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                                <Clock size={32} className="mb-3 opacity-40" />
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No active roles</p>
                                <p className="text-xs mt-1">Check back later for new matches.</p>
                            </div>
                        ) : jobs.map(job => (
                            <Link key={job._id} to={`/dashboard/jobs/${job._id}`}
                                className="group block rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-emerald-200 dark:hover:border-emerald-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        {job.company?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">{job.title}</p>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{job.company}</p>
                                        <div className="flex gap-2 mt-2">
                                            {job.remote && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 uppercase tracking-wider">{job.remote}</span>}
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase tracking-wider">{job.jobType}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
