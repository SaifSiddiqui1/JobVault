import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employerAPI } from '../../services/api';
import useEmployerAuthStore from '../../store/employerAuthStore';
import { Briefcase, Eye, Users, TrendingUp, PlusSquare, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const map = {
        pending: { cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', icon: Clock, label: 'Pending Review' },
        approved: { cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle, label: 'Live' },
        rejected: { cls: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: XCircle, label: 'Rejected' },
    };
    const { cls, icon: Icon, label } = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
            <Icon size={11} />{label}
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
        { label: 'Total Jobs Posted', value: stats.totalJobs || 0, icon: Briefcase, color: 'from-indigo-500 to-indigo-600' },
        { label: 'Live Jobs', value: stats.activeJobs || 0, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Total Views', value: stats.totalViews || 0, icon: Eye, color: 'from-sky-500 to-sky-600' },
        { label: 'Applications', value: stats.totalApplications || 0, icon: Users, color: 'from-purple-500 to-purple-600' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin border-4 border-indigo-200 border-t-indigo-600 rounded-full w-10 h-10" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {employer?.contactName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Here's a quick overview of <span className="font-medium text-indigo-600">{employer?.companyName}</span></p>
                </div>
                <Link to="/employer/post-job"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25">
                    <PlusSquare size={18} /> Post a New Job
                </Link>
            </div>

            {/* Verification Banner */}
            {employer?.verificationStatus === 'pending' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-200">Account Pending Verification</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">Our admin team is reviewing your company. You'll receive an email once verified and can start posting jobs. (Usually within 24 hours)</p>
                    </div>
                </div>
            )}
            {employer?.verificationStatus === 'rejected' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <XCircle size={20} className="text-red-600 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-red-800 dark:text-red-200">Account Verification Rejected</p>
                        <p className="text-sm text-red-700 dark:text-red-300">Please contact support or update your company profile and resubmit.</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <p className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{value.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Jobs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Recent Job Posts</h2>
                    <Link to="/employer/jobs" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">View all →</Link>
                </div>
                {recentJobs.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
                        <p>No jobs posted yet.</p>
                        <Link to="/employer/post-job" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium mt-2 inline-block">Post your first job →</Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentJobs.map(job => (
                            <div key={job._id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                                    <p className="text-sm text-gray-500">{job.location} · {job.jobType}</p>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Eye size={14} /> {job.viewCount || 0}
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
