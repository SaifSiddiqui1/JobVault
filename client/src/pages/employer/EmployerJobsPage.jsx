import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Briefcase, Eye, Pencil, Trash2, Clock, CheckCircle, XCircle, PlusSquare, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const map = {
        pending: { cls: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800', icon: Clock, label: 'Pending Review' },
        approved: { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800', icon: CheckCircle, label: 'Live' },
        rejected: { cls: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: XCircle, label: 'Rejected' },
    };
    const { cls, icon: Icon, label } = map[status] || map.pending;
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}><Icon size={11} />{label}</span>;
};

export default function EmployerJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const load = () => {
        const params = filter ? { status: filter } : {};
        employerAPI.getJobs(params)
            .then(res => setJobs(res.data?.jobs || []))
            .catch(() => toast.error('Failed to load jobs.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [filter]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;
        try {
            await employerAPI.deleteJob(id);
            toast.success('Job deleted.');
            load();
        } catch {
            toast.error('Failed to delete job.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">My Job Posts</h1>
                    <p className="text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={filter} onChange={e => setFilter(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Status</option>
                        <option value="pending">Pending Review</option>
                        <option value="approved">Live</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <Link to="/employer/post-job" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
                        <PlusSquare size={16} /> Post Job
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin border-4 border-indigo-200 border-t-indigo-600 rounded-full w-10 h-10" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Briefcase size={40} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-2">No jobs posted yet</h2>
                    <p className="text-gray-500 mb-6">Post your first job and start receiving applications today!</p>
                    <Link to="/employer/post-job" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2">
                        <PlusSquare size={18} /> Post First Job
                    </Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {jobs.map(job => (
                            <div key={job._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                                            <StatusBadge status={job.status} />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {job.location || 'Remote'} · {job.jobType} · {job.category}
                                        </p>
                                        {job.status === 'rejected' && job.rejectionReason && (
                                            <div className="mt-2 flex items-start gap-1.5 text-sm text-red-600 dark:text-red-400">
                                                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                                <span>Rejection reason: {job.rejectionReason}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Eye size={14} /> {job.viewCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleDelete(job._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
