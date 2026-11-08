import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function AuthLayout() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                        <BookOpen className="h-9 w-9 text-indigo-500" />
                        <span className="text-2xl font-bold tracking-tight text-white">PolkaDocs</span>
                    </Link>
                    <p className="mt-2 text-sm text-slate-400">RAG Document Knowledge Assistant</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-sm">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}