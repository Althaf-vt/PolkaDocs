import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, MessageSquare, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api/auth.api';
import { cn } from '../../lib/utils';

export function DashboardLayout() {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Continue client-side session cleanup even if remote invalidation fails
        } finally {
            clearAuth();
            navigate('/login');
        }
    };

    const navItems = [
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Chat Assistant', href: '/chat', icon: MessageSquare },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
            <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-indigo-500" />
                            <span className="text-lg font-bold tracking-tight text-white">PolkaDocs</span>
                        </div>
                        <nav className="flex items-center space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-slate-800 text-indigo-400 shadow-sm'
                                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                                            )
                                        }
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.name}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                            {user?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}