import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
    Search, Briefcase, MapPin, Clock, Bookmark, BookmarkCheck,
    Filter, X, Wifi, Building2, Calendar, Sparkles, TrendingUp,
    ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { jobsAPI, userAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const CATEGORIES = ['recommended', '', 'sde', 'it', 'marketing', 'sales', 'customer_support', 'law', 'government', 'finance', 'healthcare']
const CAT_LABELS = { 'recommended': '✨ For You', '': 'All Jobs', sde: 'SDE', it: 'IT', marketing: 'Marketing', sales: 'Sales', customer_support: 'Support', law: 'Law', government: 'Government', finance: 'Finance', healthcare: 'Healthcare' }

const formatDateTime = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function JobsPage() {
    const { user } = useAuthStore()
    const qc = useQueryClient()
    const [filters, setFilters] = useState({ search: '', category: 'recommended', remote: '', jobType: '', sector: '', page: 1 })
    const [showFilters, setShowFilters] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['jobs', filters],
        queryFn: () => jobsAPI.getAll(filters),
        keepPreviousData: true,
    })

    const saveMutation = useMutation({
        mutationFn: (jobId) => userAPI.toggleSavedJob(jobId),
        onSuccess: (res) => { toast.success(res.saved ? 'Job saved!' : 'Job unsaved'); qc.invalidateQueries(['auth']) },
    })

    const jobs = data?.data?.jobs || []
    const pagination = data?.data?.pagination || {}
    const savedJobIds = new Set(user?.savedJobs || [])

    return (
        <div className="space-y-6 page-enter">

            {/* ── Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f0a1a] via-[#1a1033] to-[#0d1117] p-8 md:p-10 border border-purple-900/30">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(at 30% 20%, rgba(124,59,237,0.15) 0%, transparent 50%), radial-gradient(at 70% 80%, rgba(59,130,246,0.1) 0%, transparent 50%)' }} />
                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-purple-600/10 blur-[80px]" />
                <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full bg-blue-500/10 blur-[60px]" />

                <div className="relative text-center max-w-2xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                        <Zap size={13} /> {pagination.total || '1000+'} Active Roles
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Engineering Roles
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
                        Found <span className="text-purple-300 font-semibold">{pagination.total || 'hundreds of'}</span> active roles matching your profile.
                    </p>
                </div>
            </div>

            {/* ── Category Pills ── */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mt-2">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setFilters(p => ({ ...p, category: cat, page: 1 }))}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                            ${filters.category === cat
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}>
                        {CAT_LABELS[cat]}
                    </button>
                ))}
            </div>

            {/* ── Search + Filters ── */}
            <div className="card space-y-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
                            placeholder="Search jobs, companies, skills..." className="input pl-11" />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary flex items-center gap-2 text-sm ${showFilters ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300' : ''}`}>
                        <Filter size={15} /> Filters
                        {showFilters && <X size={13} />}
                    </button>
                </div>

                {showFilters && (
                    <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <label className="label">Work Type</label>
                            <select value={filters.remote} onChange={e => setFilters(p => ({ ...p, remote: e.target.value, page: 1 }))} className="input">
                                <option value="">Any</option>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="on-site">On-site</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Job Type</label>
                            <select value={filters.jobType} onChange={e => setFilters(p => ({ ...p, jobType: e.target.value, page: 1 }))} className="input">
                                <option value="">Any</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="internship">Internship</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Sector</label>
                            <select value={filters.sector} onChange={e => setFilters(p => ({ ...p, sector: e.target.value, page: 1 }))} className="input">
                                <option value="">Any</option>
                                <option value="private">Private</option>
                                <option value="government">Government</option>
                                <option value="startup">Startup</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Job Listings ── */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="card h-28 animate-pulse bg-gray-100 dark:bg-gray-800/50" />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="card text-center py-16">
                    <Briefcase size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">No jobs found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {jobs.map(job => (
                        <div key={job._id}
                            className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">

                            <div className="flex items-start gap-4">
                                {/* Company Logo */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0 border border-purple-200/50 dark:border-purple-800/50">
                                    {job.companyLogo
                                        ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain rounded-xl" />
                                        : <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{job.company?.charAt(0)}</span>
                                    }
                                </div>

                                {/* Job Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <Link to={`/dashboard/jobs/${job._id}`}
                                                className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                                {job.title}
                                            </Link>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                                        </div>
                                        <button onClick={() => saveMutation.mutate(job._id)}
                                            className="flex-shrink-0 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                            {savedJobIds.has(job._id)
                                                ? <BookmarkCheck size={18} className="text-purple-600" />
                                                : <Bookmark size={18} className="text-gray-400 hover:text-purple-500" />
                                            }
                                        </button>
                                    </div>

                                    {/* Tags Row */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {job.location && (
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                                                <MapPin size={11} />{job.location}
                                            </span>
                                        )}
                                        {job.remote && (
                                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium
                                                ${job.remote === 'remote'
                                                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50'
                                                    : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50'}`}>
                                                <Wifi size={11} />{job.remote}
                                            </span>
                                        )}
                                        {job.jobType && (
                                            <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg font-medium border border-amber-200/50 dark:border-amber-800/50">
                                                {job.jobType}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                            <Clock size={11} />{formatDateTime(job.approvedAt || job.createdAt)}
                                        </span>
                                        {job.deadline && (
                                            <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-lg font-medium">
                                                <Calendar size={11} />Deadline: {new Date(job.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Skills */}
                                    {job.skills?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {job.skills.slice(0, 5).map(skill => (
                                                <span key={skill} className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-xs text-purple-700 dark:text-purple-300 font-medium border border-purple-200/50 dark:border-purple-800/50">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.skills.length > 5 && (
                                                <span className="text-xs text-gray-400 self-center">+{job.skills.length - 5} more</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} disabled={filters.page <= 1}
                        className="btn-secondary flex items-center gap-1.5 text-sm px-4 py-2.5 disabled:opacity-40">
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <div className="flex items-center gap-1 text-sm">
                        <span className="font-semibold text-gray-900 dark:text-white">{filters.page}</span>
                        <span className="text-gray-400">of</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{pagination.pages}</span>
                    </div>
                    <button onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} disabled={filters.page >= pagination.pages}
                        className="btn-secondary flex items-center gap-1.5 text-sm px-4 py-2.5 disabled:opacity-40">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}
