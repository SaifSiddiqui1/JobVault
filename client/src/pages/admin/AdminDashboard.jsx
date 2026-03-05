import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, Briefcase, Clock, CheckCircle, FileText, RefreshCw, Building2, ArrowRight } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
    const qc = useQueryClient()
    const { data } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminAPI.getStats() })
    const stats = data?.data || {}

    const fetchMutation = useMutation({
        mutationFn: () => adminAPI.fetchJobs(),
        onSuccess: (res) => { toast.success(`Fetched! ${res.data.saved} new jobs added`); qc.invalidateQueries(['admin-stats']) },
        onError: () => toast.error('Job fetch failed'),
    })

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
        { label: 'Pending Jobs', value: stats.pendingJobs || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Approved Jobs', value: stats.approvedJobs || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Total Resumes', value: stats.totalResumes || 0, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    ]

    const quickActions = [
        {
            to: '/admin/jobs', icon: Clock,
            title: 'Review Pending Jobs',
            desc: `${stats.pendingJobs || 0} awaiting review`,
            color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800/60',
        },
        {
            to: '/admin/users', icon: Users,
            title: 'Manage Users',
            desc: `${stats.totalUsers || 0} registered users`,
            color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/10', border: 'border-sky-200 dark:border-sky-800/60',
        },
        {
            to: '/admin/employers', icon: Building2,
            title: 'Manage Employers',
            desc: 'Review employer accounts',
            color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/10', border: 'border-violet-200 dark:border-violet-800/60',
        },
        {
            to: '/admin/study', icon: FileText,
            title: 'Study Materials',
            desc: 'Upload resources for users',
            color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800/60',
        },
    ]

    return (
        <div className="space-y-8 page-enter">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform overview and controls</p>
                </div>
                <button onClick={() => fetchMutation.mutate()} disabled={fetchMutation.isPending}
                    className="btn-primary flex items-center gap-2 text-sm">
                    <RefreshCw size={15} className={fetchMutation.isPending ? 'animate-spin' : ''} />
                    {fetchMutation.isPending ? 'Fetching...' : 'Fetch New Jobs'}
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className={`stat-icon ${bg}`}>
                            <Icon size={22} className={color} />
                        </div>
                        <div>
                            <p className="stat-value">{value}</p>
                            <p className="stat-label">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Quick Actions ── */}
            <div>
                <h2 className="section-title mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map(({ to, icon: Icon, title, desc, color, bg, border }) => (
                        <Link key={to} to={to}
                            className={`group rounded-xl ${bg} border ${border} p-5 hover:shadow-md transition-all duration-200`}>
                            <Icon size={22} className={`${color} mb-3`} />
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{title}</p>
                            <p className={`text-xs mt-1 ${color} opacity-80`}>{desc}</p>
                            <ArrowRight size={14} className={`mt-3 ${color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
