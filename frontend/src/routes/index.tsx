import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { DocumentsPage } from '../features/documents/pages/DocumentsPage';
import { ChatPage } from '../features/chat/Pages/ChatPage';
import { ProtectedRoute, PublicRoute } from './guards';

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
            { path: 'chat', element: <ChatPage /> },
        ],
    },
]);