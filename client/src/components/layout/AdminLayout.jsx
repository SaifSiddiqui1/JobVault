import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Users, BookOpen, ArrowLeft, LogOut, Building2 } from 'lucide-react'
import useAdminAuthStore from '../../store/adminAuthStore'

const adminNav = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/jobs', label: 'Job Approval', icon: Briefcase },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/employers', label: 'Employers', icon: Building2 },
    { to: '/admin/study', label: 'Study Materials', icon: BookOpen },
]

export default function AdminLayout() {
    const { adminUser, adminLogout } = useAdminAuthStore()
    const navigate = useNavigate()

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* Admin Sidebar */}
            <aside className="w-60 bg-gray-900 dark:bg-black flex flex-col flex-shrink-0">
                <div className="p-5 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="JobVault Logo" className="h-9 w-auto object-contain opacity-90" />
                        <div>
                            <p className="font-heading font-bold text-white text-sm whitespace-nowrap">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    {adminNav.map(({ to, label, icon: Icon, end }) => (
                        <NavLink key={to} to={to} end={end}
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <Icon size={17} />{label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-gray-800 space-y-1">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm py-2 px-3 rounded-xl hover:bg-gray-800 w-full transition-colors">
                        <ArrowLeft size={15} /> Back to User App
                    </button>
                    <button onClick={adminLogout} className="flex items-center justify-between w-full text-left text-sm py-2 px-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors group">
                        <div className="flex items-center gap-2">
                            <LogOut size={15} /> Admin Logout
                        </div>
                    </button>
                    <p className="text-xs text-gray-600 px-3 mt-3 pt-2 border-t border-gray-800">Logged in as: {adminUser?.fullName}</p>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="page-enter max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
