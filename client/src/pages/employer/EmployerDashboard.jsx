import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employerAPI } from '../../services/api';
import useEmployerAuthStore from '../../store/employerAuthStore';
import {
    Briefcase, Eye, Users, PlusSquare, Clock,
    CheckCircle, XCircle, AlertTriangle, ArrowRight, TrendingUp
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const map = {
        pending: { cls: 'badge-warning', icon: Clock, label: 'Pending Review' },
        approved: { cls: 'badge-success', icon: CheckCircle, label: 'Live' },
        rejected: { cls: 'badge-danger', icon: XCircle, label: 'Rejected' },
    };
    const { cls, icon: Icon, label } = map[status] || map.pending;
    return (
        <span className={cls}>
            <Icon size={11} className="mr-1" />{label}
        </span>
    );
};

export default function EmployerDashboard() {
    const { employer } = useEmployerAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        employerAPI.getDashboard()
            .then(res => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const stats = data?.stats || {};
    const recentJobs = data?.recentJobs || [];

    const statCards = [
        { label: 'Jobs Posted', value: stats.totalJobs || 0, icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
        { label: 'Live Jobs', value: stats.activeJobs || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Total Views', value: stats.totalViews || 0, icon: Eye, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
        { label: 'Applications', value: stats.totalApplications || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin border-4 border-primary-200 border-t-primary-600 rounded-full w-10 h-10" />
        </div>
    );

    return (
        <div className="space-y-8 page-enter">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {employer?.contactName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        Overview for <span className="font-medium text-primary-600">{employer?.companyName}</span>
                    </p>
                </div>
                <Link to="/employer/post-job"
                    className="btn-primary flex items-center gap-2 text-sm w-fit">
                    <PlusSquare size={18} /> Post a New Job
                </Link>
            </div>

            {/* ── Verification Banners ── */}
            {employer?.verificationStatus === 'pending' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/60">
                    <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Account Pending Verification</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Our team is reviewing your company. You'll receive an email once verified. Usually within 24 hours.</p>
                    </div>
                </div>
            )}
            {employer?.verificationStatus === 'rejected' && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/60">
                    <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-800 dark:text-red-200 text-sm">Verification Rejected</p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">Please update your company profile and resubmit, or contact support.</p>
                    </div>
                </div>
            )}

            {/* ── Stats ── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className={`stat-icon ${bg}`}>
                            <Icon size={22} className={color} />
                        </div>
                        <div>
                            <p className="stat-value">{value.toLocaleString()}</p>
                            <p className="stat-label">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Recent Jobs ── */}
            <div className="card-flat">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="section-title">Recent Job Posts</h2>
                    <Link to="/employer/jobs" className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center gap-1">
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
                {recentJobs.length === 0 ? (
                    <div className="text-center py-14 text-gray-400">
                        <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No jobs posted yet.</p>
                        <Link to="/employer/post-job" className="text-primary-600 hover:text-primary-500 text-sm font-medium mt-2 inline-block">
                            Post your first job →
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800 -mx-6">
                        {recentJobs.map(job => (
                            <div key={job._id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{job.location} · {job.jobType}</p>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Eye size={13} /> {job.viewCount || 0}
                                    </div>
                                    <StatusBadge status={job.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
