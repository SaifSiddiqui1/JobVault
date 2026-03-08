import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Briefcase, MapPin, Clock, Bookmark, BookmarkCheck, Filter, X, Wifi, Building2, Calendar } from 'lucide-react'
import { jobsAPI, userAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const CATEGORIES = ['recommended', '', 'sde', 'it', 'marketing', 'sales', 'customer_support', 'law', 'government', 'finance', 'healthcare']
const CAT_LABELS = { 'recommended': '✨ For You', '': 'All Jobs', sde: 'SDE', it: 'IT', marketing: 'Marketing', sales: 'Sales', customer_support: 'Support', law: 'Law', government: 'Government', finance: 'Finance', healthcare: 'Healthcare' }

// Helper for exact date and time formatting
const formatDateTime = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    return `on ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
        <div className="space-y-6 animate-fade-in page-enter">
            {/* Premium Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-800 p-8 py-10">
                <div className="absolute inset-0 mesh-bg opacity-20" />
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px]" />

                <div className="relative text-center max-w-2xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        <Sparkles size={14} /> Curated Tech Roles
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">breakthrough</span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Explore {pagination.total || 'thousands of'} hand-picked roles matched to your skills.
                    </p>
                </div>
                {/* Filter toggle */}
                <div className="flex justify-end mt-4">
                    <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2 text-sm">
                        <Filter size={15} /> Filters
                    </button>
                </div>

                {/* Category tabs (from PDF page 11) */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setFilters(p => ({ ...p, category: cat, page: 1 }))}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.category === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            {CAT_LABELS[cat]}
                        </button>
                    ))}
                </div>

                {/* Search + Filters */}
                <div className="card space-y-3">
                    <div className="relative">
                        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
                            placeholder="Search jobs, companies, skills..." className="input pl-10" />
                    </div>
                    {showFilters && (
                        <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
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

                {/* Job list */}
                {
                    isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="card text-center py-12">
                            <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500 font-medium">No jobs found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map(job => (
                                <div key={job._id} className="card flex items-start gap-4 group hover:border-primary-200 dark:hover:border-primary-800 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-lg font-bold text-gray-400">
                                        {job.companyLogo ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain rounded-xl" /> : job.company?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link to={`/dashboard/jobs/${job._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 text-sm">{job.title}</Link>
                                            <button onClick={() => saveMutation.mutate(job._id)} className="flex-shrink-0 text-gray-400 hover:text-primary-600 transition-colors">
                                                {savedJobIds.has(job._id) ? <BookmarkCheck size={18} className="text-primary-600" /> : <Bookmark size={18} />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {job.location && <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} />{job.location}</span>}
                                            {job.remote && <span className={`badge ${job.remote === 'remote' ? 'badge-success' : 'badge-primary'}`}>{job.remote}</span>}
                                            {job.jobType && <span className="badge badge-warning">{job.jobType}</span>}
                                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500 font-medium bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-md"><Clock size={11} /> Added {formatDateTime(job.approvedAt || job.createdAt)}</span>
                                            {job.deadline && <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-md"><Calendar size={11} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                                        </div>
                                        {job.skills?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {job.skills.slice(0, 4).map(skill => (
                                                    <span key={skill} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">{skill}</span>
                                                ))}
                                                {job.skills.length > 4 && <span className="text-xs text-gray-400">+{job.skills.length - 4}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }

                {/* Pagination */}
                {
                    pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} disabled={filters.page <= 1} className="btn-secondary text-sm px-3 py-2">← Prev</button>
                            <span className="text-sm text-gray-500">{filters.page} / {pagination.pages}</span>
                            <button onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} disabled={filters.page >= pagination.pages} className="btn-secondary text-sm px-3 py-2">Next →</button>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
