import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
    FileText, Briefcase, Target, TrendingUp, Plus, ArrowRight,
    Clock, CheckCircle, Sparkles, BookOpen, Wrench
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { jobsAPI, resumeAPI } from '../../services/api'

export default function DashboardPage() {
    const { user } = useAuthStore()

    const { data: jobsData } = useQuery({
        queryKey: ['jobs', 'dashboard'],
        queryFn: () => jobsAPI.getAll({ limit: 5, sort: '-postedDate' }),
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
        { label: 'My Resumes', value: resumes.length, icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
        { label: 'Downloads Left', value: Math.max(0, 2 - (user?.resumeDownloadsUsed || 0)), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Saved Jobs', value: user?.savedJobs?.length || 0, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Profile', value: `${user?.profileCompleteness || 0}%`, icon: CheckCircle, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    ]

    const quickActions = [
        { to: '/dashboard/resume/builder', label: 'Create Resume', icon: Plus, desc: 'Build ATS-ready resumes', gradient: 'from-primary-600 to-primary-500' },
        { to: '/dashboard/resume/ats-check', label: 'ATS Check', icon: Target, desc: 'Score your resume instantly', gradient: 'from-amber-500 to-orange-500' },
        { to: '/dashboard/jobs', label: 'Browse Jobs', icon: Briefcase, desc: 'Find your next role', gradient: 'from-emerald-500 to-teal-500' },
    ]

    return (
        <div className="space-y-8 page-enter">
            {/* ── Welcome ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8">
                <div className="absolute inset-0 mesh-bg opacity-40" />
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
                <div className="relative">
                    <p className="text-primary-200 text-sm font-medium">{greeting} 👋</p>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mt-1">{user?.fullName}</h1>
                    <p className="text-primary-200/80 mt-2 text-sm max-w-md">
                        {resumes.length === 0
                            ? "Let's get started — create your first resume and begin applying!"
                            : `You have ${resumes.length} resume${resumes.length > 1 ? 's' : ''}. Keep building and applying!`}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link to="/dashboard/resume/builder"
                            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-all shadow-lg shadow-black/10">
                            <Plus size={16} /> New Resume
                        </Link>
                        <Link to="/dashboard/jobs"
                            className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/25 transition-all border border-white/10">
                            Browse Jobs <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className={`stat-icon ${s.bg}`}>
                            <s.icon size={22} className={s.color} />
                        </div>
                        <div>
                            <p className="stat-value">{s.value}</p>
                            <p className="stat-label">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Quick Actions ── */}
            <div>
                <h2 className="section-title mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    {quickActions.map(({ to, label, icon: Icon, desc, gradient }) => (
                        <Link key={to} to={to}
                            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]`}>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:bg-white/15 transition-all" />
                            <Icon size={24} className="mb-3" />
                            <p className="font-heading font-bold text-lg">{label}</p>
                            <p className="text-sm text-white/75 mt-1">{desc}</p>
                            <ArrowRight size={16} className="mt-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Latest Jobs ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title">Latest Jobs</h2>
                    <Link to="/dashboard/jobs" className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center gap-1">
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="space-y-3">
                    {jobs.length === 0 ? (
                        <div className="card-flat text-center py-12 text-gray-400">
                            <Clock size={32} className="mx-auto mb-3 opacity-40" />
                            <p className="text-sm">New jobs will appear here once approved by admins.</p>
                        </div>
                    ) : jobs.map(job => (
                        <Link key={job._id} to={`/dashboard/jobs/${job._id}`}
                            className="card flex items-center gap-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {job.company?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company} · {job.location}</p>
                            </div>
                            <span className={`badge ${job.remote === 'remote' ? 'badge-success' : 'badge-primary'}`}>
                                {job.remote === 'remote' ? 'Remote' : job.jobType}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── My Resumes ── */}
            {resumes.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title">My Resumes</h2>
                        <Link to="/dashboard/resume" className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center gap-1">
                            Manage <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resumes.slice(0, 3).map(r => (
                            <Link key={r._id} to={`/dashboard/resume/builder/${r._id}`}
                                className="card hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                        <FileText size={18} className="text-primary-600" />
                                    </div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{r.title}</p>
                                </div>
                                {r.lastAtsScore && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{ width: `${r.lastAtsScore}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-primary-600 tabular-nums">ATS {r.lastAtsScore}</span>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-3">Updated {new Date(r.updatedAt).toLocaleDateString()}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
