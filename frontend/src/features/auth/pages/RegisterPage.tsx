import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../stores/auth.store';
import { Magnet } from '@/components/ui/magnet';

// Registration form page with password validation
export function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must contain at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.register({ email, password });
            setAuth(response.user, response.accessToken);
            navigate('/documents');
        } catch (err: unknown) {
            const message =
                typeof err === 'object' && err !== null && 'response' in err
                    ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                    : 'Failed to create account.';
            setError(message || 'An unexpected error occurred during registration.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-xl font-bold tracking-tight text-[#121921]">Create a PolkaDocs account</h2>

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
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="mt-1.5 block w-full rounded-lg border border-[#D5DBE2] bg-white px-3.5 py-2.5 text-sm text-[#121921] placeholder-[#96A3B2] transition focus:border-[#8C221A] focus:outline-none focus:ring-2 focus:ring-[#8C221A]/15"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-[#34424F]">Confirm password</label>
                <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 block w-full rounded-lg border border-[#D5DBE2] bg-white px-3.5 py-2.5 text-sm text-[#121921] placeholder-[#96A3B2] transition focus:border-[#8C221A] focus:outline-none focus:ring-2 focus:ring-[#8C221A]/15"
                />
            </div>

            <Magnet padding={45} magnetStrength={2.5} maxOffset={6} wrapperClassName="w-full" innerClassName="w-full" disabled={isLoading}>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-tactile flex w-full items-center justify-center rounded-lg bg-[#8C221A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#731A13] focus:outline-none focus:ring-2 focus:ring-[#8C221A]/20 disabled:opacity-50 cursor-pointer"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register'}
                </button>
            </Magnet>

            <p className="text-center text-xs text-[#67788A]">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-[#8C221A] hover:underline">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
