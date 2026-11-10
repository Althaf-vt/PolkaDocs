import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { FileText, MessageSquare, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api/auth.api';
import { cn } from '../../lib/utils';
import polkadocsLogo from '../../assets/polkadocs-logo.svg';

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
        { name: 'Profile', href: '/profile', icon: UserIcon },
    ];

    const userInitial = user?.name
        ? user.name.trim()[0].toUpperCase()
        : user?.email
            ? user.email[0].toUpperCase()
            : 'U';

    return (
        <div className="flex min-h-screen flex-col bg-[#F3F5F7] text-[#34424F]">
            <header className="sticky top-0 z-40 border-b border-[#D5DBE2] bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link to="/documents" className="flex items-center transition opacity-95 hover:opacity-100">
                            <img src={polkadocsLogo} alt="PolkaDocs Logo" className="h-8 w-auto" />
                        </Link>
                        <nav className="flex items-center space-x-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                                                isActive
                                                    ? 'bg-[#F4EAEB] text-[#8C221A] shadow-xs'
                                                    : 'text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921]',
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

                    <div className="flex items-center gap-3">
                        <Link
                            to="/profile"
                            title="View Profile"
                            className="flex items-center gap-2 rounded-lg border border-[#D5DBE2] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#34424F] hover:bg-[#EAEEF2] hover:text-[#121921] hover:border-[#8C221A]/30 transition-colors shadow-xs"
                        >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4EAEB] text-[#8C221A] text-[10px] font-bold">
                                {userInitial}
                            </div>
                            <span className="hidden sm:inline-block max-w-[150px] truncate">
                                {user?.name || user?.email}
                            </span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg border border-[#D5DBE2] bg-white px-3 py-1.5 text-xs font-semibold text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#8C221A] transition-colors shadow-xs cursor-pointer"
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
