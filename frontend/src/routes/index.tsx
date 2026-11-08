import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { DocumentsPage } from '../features/documents/pages/DocumentsPage';
import { ProtectedRoute, PublicRoute } from './guards';

// Central application route definitions
export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/documents" replace />,
    },
    {
        element: (
            <PublicRoute>
                <AuthLayout />
            </PublicRoute>
        ),
        children: [
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
        ],
    },
    {
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { path: 'documents', element: <DocumentsPage /> },
            {
                path: 'chat',
                // Placeholder until Branch 2 wires the chat interface
                element: (
                    <div className="text-slate-400">
                        Chat Assistant interface will be activated in Branch 2.
                    </div>
                ),
            },
        ],
    },
]);