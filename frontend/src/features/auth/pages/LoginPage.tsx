import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../stores/auth.store';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await authApi.login({ email, password });
            setAuth(response.user, response.accessToken);
            navigate('/documents');
        } catch (err: unknown) {
            const message =
                typeof err === 'object' && err !== null && 'response' in err
                    ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                    : 'Failed to sign in. Please check your credentials.';
            setError(message || 'An unexpected error occurred during authentication.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-xl font-semibold text-white">Sign in to your account</h2>

            {error && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-xs font-medium text-slate-300">Email address</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
            </button>

            <p className="text-center text-xs text-slate-400">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
                    Create one now
                </Link>
            </p>
        </form>
    );
}