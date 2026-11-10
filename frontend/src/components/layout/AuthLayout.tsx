import { Outlet, Link } from 'react-router-dom';
import polkadocsLogo from '../../assets/polkadocs-logo.svg';

export function AuthLayout() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F5F7] px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <Link to="/" className="flex items-center transition opacity-95 hover:opacity-100">
                        <img src={polkadocsLogo} alt="PolkaDocs Logo" className="h-12 w-auto" />
                    </Link>
                    <p className="mt-3 text-sm font-medium text-[#67788A]">RAG Document Knowledge Assistant</p>
                </div>
                <div className="rounded-2xl border border-[#D5DBE2] bg-white p-8 shadow-xl">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
