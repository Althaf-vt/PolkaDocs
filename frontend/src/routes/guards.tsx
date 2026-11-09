import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Loader2 } from 'lucide-react';

interface GuardProps {
    children: ReactNode;
}

// Blocks unauthenticated users and redirects them to login
export function ProtectedRoute({ children }: GuardProps) {
    const { isAuthenticated, isInitialized } = useAuthStore();
    const location = useLocation();

    if (!isInitialized) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

// Redirects already authenticated users directly into the dashboard
export function PublicRoute({ children }: GuardProps) {
    const { isAuthenticated, isInitialized } = useAuthStore();

    if (!isInitialized) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/documents" replace />;
    }

    return <>{children}</>;
}