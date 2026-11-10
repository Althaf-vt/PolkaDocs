import { useState, type FormEvent, useEffect } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { usersApi } from '../../../api/users.api';
import { formatDate } from '../../../lib/utils';
import { Magnet } from '@/components/ui/magnet';
import {
    User as UserIcon,
    Mail,
    Calendar,
    Clock,
    ShieldCheck,
    Check,
    Copy,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    KeyRound,
} from 'lucide-react';

export function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState(false);

    // Track whether personal information has been modified
    const initialName = user?.name ?? '';
    const isDirty = name.trim() !== initialName.trim();

    useEffect(() => {
        if (user?.name !== undefined && user.name !== null) {
            setName(user.name);
        }
    }, [user?.name]);

    const handleCopyId = () => {
        if (!user?.id) return;
        void navigator.clipboard.writeText(user.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const updatedUser = await usersApi.updateProfile({ name: name.trim() });
            setUser(updatedUser);
            setSuccessMessage('Profile information successfully updated.');
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch {
            setErrorMessage('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to get initials
    const getInitials = () => {
        if (user?.name && user.name.trim().length > 0) {
            return user.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
        }
        return user?.email ? user.email[0].toUpperCase() : 'U';
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#121921] sm:text-3xl">
                    Account Profile
                </h1>
                <p className="mt-1 text-sm text-[#67788A]">
                    Manage your personal identity, display name, and inspect your PolkaDocs account details.
                </p>
            </div>

            {/* Success / Error Banners */}
            {successMessage && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-xs animate-in fade-in">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}

            {errorMessage && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-xs animate-in fade-in">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                    <p className="font-medium">{errorMessage}</p>
                </div>
            )}

            {/* Profile Overview Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#D5DBE2] bg-white p-6 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F4EAEB] border border-[#8C221A]/20 text-[#8C221A] text-xl font-bold shadow-xs">
                        {getInitials()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-[#121921]">
                                {user?.name || 'Unnamed Account'}
                            </h2>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Active
                            </span>
                        </div>
                        <p className="text-xs text-[#67788A] mt-0.5">{user?.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-[#F3F5F7] px-3.5 py-2 border border-[#E5E9EE] text-xs font-medium text-[#34424F]">
                    <span className="text-[#67788A]">User ID:</span>
                    <span className="font-mono text-[#121921] max-w-[120px] sm:max-w-none truncate">{user?.id}</span>
                    <button
                        onClick={handleCopyId}
                        title="Copy User ID"
                        className="rounded-md p-1 hover:bg-[#EAEEF2] text-[#67788A] hover:text-[#121921] transition cursor-pointer"
                    >
                        {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Edit Form (2 cols) */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-[#D5DBE2] bg-white p-6 sm:p-8 shadow-md">
                        <div className="border-b border-[#E5E9EE] pb-4 mb-6">
                            <h3 className="text-base font-bold text-[#121921]">Personal Information</h3>
                            <p className="text-xs text-[#67788A] mt-0.5">
                                Update how your name appears across the workspace and document audit logs.
                            </p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#34424F] mb-1.5">
                                    Display Name
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#67788A]">
                                        <UserIcon className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        maxLength={100}
                                        className="block w-full rounded-xl border border-[#D5DBE2] bg-white py-2.5 pl-10 pr-4 text-sm text-[#121921] placeholder-[#96A3B2] shadow-xs focus:border-[#8C221A] focus:outline-none focus:ring-2 focus:ring-[#8C221A]/15 transition"
                                    />
                                </div>
                                <p className="text-xs text-[#67788A] mt-1.5">
                                    This name will be displayed in conversations and document management records.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#34424F] mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#67788A]">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="block w-full rounded-xl border border-[#D5DBE2] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-[#67788A] cursor-not-allowed shadow-xs"
                                    />
                                </div>
                                <p className="text-xs text-[#67788A] mt-1.5">
                                    Your email address is your unique system identifier and cannot be altered directly.
                                </p>
                            </div>

                            {/* Save Changes - only displayed when input data has been modified */}
                            {(isDirty || isSaving) && (
                                <div className="pt-2 flex items-center justify-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() => setName(user?.name || '')}
                                        className="btn-tactile-secondary rounded-xl border border-[#D5DBE2] bg-white px-4 py-2.5 text-sm font-semibold text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921] shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <Magnet padding={35} magnetStrength={2.5} maxOffset={5} disabled={isSaving}>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="btn-tactile flex items-center gap-2 rounded-xl bg-[#8C221A] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#731A13] focus:outline-none focus:ring-2 focus:ring-[#8C221A] focus:ring-offset-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Saving Changes...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </button>
                                    </Magnet>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Account Details & Metadata (1 col) */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-[#D5DBE2] bg-white p-6 shadow-md">
                        <div className="border-b border-[#E5E9EE] pb-3 mb-4">
                            <h3 className="text-sm font-bold text-[#121921]">Account Details</h3>
                            <p className="text-xs text-[#67788A] mt-0.5">Metadata and security status.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-[#F4EAEB] p-2 text-[#8C221A] shrink-0">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#121921]">Member Since</p>
                                    <p className="text-xs text-[#67788A]">
                                        {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-[#F3F5F7] p-2 text-[#67788A] shrink-0 border border-[#E5E9EE]">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#121921]">Last Updated</p>
                                    <p className="text-xs text-[#67788A]">
                                        {user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-[#F3F5F7] p-2 text-[#67788A] shrink-0 border border-[#E5E9EE]">
                                    <KeyRound className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#121921]">Security Protocol</p>
                                    <p className="text-xs text-[#67788A]">Bcrypt + JWT Cookie Session</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

