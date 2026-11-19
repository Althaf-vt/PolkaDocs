import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../stores/auth.store';
import { Magnet } from '@/components/ui/magnet';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            <h2 className="text-xl font-bold tracking-tight text-[#121921]">Sign in to your account</h2>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-[#34424F]">Email address</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1.5 block w-full rounded-lg border border-[#D5DBE2] bg-white px-3.5 py-2.5 text-sm text-[#121921] placeholder-[#96A3B2] transition focus:border-[#8C221A] focus:outline-none focus:ring-2 focus:ring-[#8C221A]/15"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-[#34424F]">Password</label>
                <div className="relative mt-1.5">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full rounded-lg border border-[#D5DBE2] bg-white py-2.5 pl-3.5 pr-10 text-sm text-[#121921] placeholder-[#96A3B2] transition focus:border-[#8C221A] focus:outline-none focus:ring-2 focus:ring-[#8C221A]/15"
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#67788A] hover:text-[#121921] transition cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <Magnet padding={45} magnetStrength={2.5} maxOffset={6} wrapperClassName="w-full" innerClassName="w-full" disabled={isLoading}>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-tactile flex w-full items-center justify-center rounded-lg bg-[#8C221A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#731A13] focus:outline-none focus:ring-2 focus:ring-[#8C221A]/20 disabled:opacity-50 cursor-pointer"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
                </button>
            </Magnet>

            <p className="text-center text-xs text-[#67788A]">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-[#8C221A] hover:underline">
                    Create one now
                </Link>
            </p>
        </form>
    );
}
