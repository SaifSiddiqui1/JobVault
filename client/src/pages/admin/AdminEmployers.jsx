import { useState, useEffect } from 'react';
import { adminEmployerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Building2, CheckCircle, XCircle, Clock, RefreshCw, Search, ChevronDown } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const map = {
        pending: { cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock, label: 'Pending' },
        verified: { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle, label: 'Verified' },
        rejected: { cls: 'bg-red-50 text-red-700 border border-red-200', icon: XCircle, label: 'Rejected' },
    };
    const { cls, icon: Icon, label } = map[status] || map.pending;
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}><Icon size={11} />{label}</span>;
};

export default function AdminEmployers() {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

    const load = () => {
        setLoading(true);
        const params = {};
        if (filter) params.status = filter;
        if (search) params.search = search;
        adminEmployerAPI.getEmployers(params)
            .then(res => setEmployers(res.data || []))
            .catch(() => toast.error('Failed to load employers'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [filter]);

    const handleVerify = async (id) => {
        try {
            await adminEmployerAPI.verifyEmployer(id);
            toast.success('Employer verified! They can now post jobs.');
            load();
        } catch {
            toast.error('Failed to verify employer.');
        }
    };

    const handleReject = async () => {
        if (!rejectModal.reason.trim()) { toast.error('Please provide a rejection reason.'); return; }
        try {
            await adminEmployerAPI.rejectEmployer(rejectModal.id, rejectModal.reason);
            toast.success('Employer rejected.');
            setRejectModal({ open: false, id: null, reason: '' });
            load();
        } catch {
            toast.error('Failed to reject employer.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Employers</h1>
                    <p className="text-gray-500 mt-1">Approve or reject company registrations to allow job posting</p>
                </div>
                <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {['', 'pending', 'verified', 'rejected'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
                        {s || 'All'}
                    </button>
                ))}
                <div className="relative ml-auto">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
                        placeholder="Search company..." className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white" />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin border-4 border-red-200 border-t-red-600 rounded-full w-10 h-10" />
                </div>
            ) : employers.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Building2 size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No employers registered yet.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {employers.map(emp => (
                                    <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                                    {emp.companyLogo
                                                        ? <img src={emp.companyLogo} alt="" className="w-full h-full object-cover rounded-xl" />
                                                        : <Building2 size={16} className="text-indigo-600" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{emp.companyName}</p>
                                                    {emp.companyWebsite && <a href={emp.companyWebsite} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">Website</a>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900 dark:text-white">{emp.contactName}</p>
                                            <p className="text-xs text-gray-500">{emp.email}</p>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{emp.industry || '—'}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{emp.companySize}</td>
                                        <td className="px-4 py-4"><StatusBadge status={emp.verificationStatus} /></td>
                                        <td className="px-4 py-4 text-sm text-gray-500">{new Date(emp.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {emp.verificationStatus !== 'verified' && (
                                                    <button onClick={() => handleVerify(emp._id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors">
                                                        <CheckCircle size={12} /> Verify
                                                    </button>
                                                )}
                                                {emp.verificationStatus !== 'rejected' && (
                                                    <button onClick={() => setRejectModal({ open: true, id: emp._id, reason: '' })}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
                                                        <XCircle size={12} /> Reject
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-2">Reject Employer</h3>
                        <p className="text-gray-500 text-sm mb-4">Please provide a reason. This will be shown to the employer.</p>
                        <textarea value={rejectModal.reason} onChange={e => setRejectModal(p => ({ ...p, reason: e.target.value }))} rows={3}
                            placeholder="e.g. Company details are incomplete..."
                            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 mb-4" />
                        <div className="flex gap-3">
                            <button onClick={() => setRejectModal({ open: false, id: null, reason: '' })}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                                Cancel
                            </button>
                            <button onClick={handleReject}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold">
                                Reject Employer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
