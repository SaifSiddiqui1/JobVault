import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusSquare, Briefcase, Building2, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import useEmployerAuthStore from '../../store/employerAuthStore';

const navItems = [
    { to: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/employer/post-job', label: 'Post a Job', icon: PlusSquare },
    { to: '/employer/jobs', label: 'My Jobs', icon: Briefcase },
    { to: '/employer/profile', label: 'Company Profile', icon: Building2 },
];

const VerificationBadge = ({ status }) => {
    const map = {
        pending: { icon: Clock, color: 'text-amber-400 bg-amber-500/10', label: 'Pending Review' },
        verified: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10', label: 'Verified' },
        rejected: { icon: AlertCircle, color: 'text-red-400 bg-red-500/10', label: 'Rejected' },
    };
    const { icon: Icon, color, label } = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
            <Icon size={11} /> {label}
        </span>
    );
};

export default function EmployerLayout() {
    const { employer, employerLogout } = useEmployerAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        employerLogout();
        navigate('/employer/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col flex-shrink-0">
                {/* Logo + Company */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center cursor-pointer mb-4" onClick={() => navigate('/employer/dashboard')}>
                        <img src="/logo.png" alt="JobVault Logo" className="h-8 w-auto object-contain" />
                        <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Employers</span>
                    </div>
                    {employer && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {employer.companyLogo
                                    ? <img src={employer.companyLogo} alt={employer.companyName} className="w-full h-full object-cover" />
                                    : <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                                }
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{employer.companyName}</p>
                                <VerificationBadge status={employer.verificationStatus} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink key={to} to={to} end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`
                            }>
                            <Icon size={17} />{label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all">
                        <LogOut size={17} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
}
