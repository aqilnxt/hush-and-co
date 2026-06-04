import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowRightIcon,
    ArrowPathIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import GoogleLogo from '../../components/common/GoogleLogo';

export default function Login({ variant = 'customer' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);

    const { login, user, setUser } = useAuth();
    const navigate = useNavigate();

    const isCustomer = variant === 'customer';
    const isStaff = variant === 'staff';
    const isAdmin = variant === 'admin';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const requestedRole = isStaff ? 'staff' : isAdmin ? 'admin' : null;
            const role = await login(email, password, requestedRole);
            toast.success('Login berhasil!');

            const nextRoute = localStorage.getItem('nextRoute');
            if (nextRoute) {
                localStorage.removeItem('nextRoute');
                navigate(nextRoute, { replace: true });
                return;
            }

            if (role === 'admin') navigate('/admin');
            else if (role === 'staff') navigate('/staff');
            else navigate('/menu');
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.errors?.email?.[0] ||
                'Login gagal!';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleContinueAsGuest = () => {
        const nextRoute = localStorage.getItem('nextRoute') || '/menu';
        localStorage.removeItem('nextRoute');

        const guestUser = {
            name: 'Tamu',
            email: '',
            role: 'guest',
            avatar: null,
        };

        try {
            localStorage.setItem('user', JSON.stringify(guestUser));
        } catch (e) {
            // ignore storage errors
        }
        setUser(guestUser);

        navigate(nextRoute, { replace: true });
    };

    const handleGoogleLogin = () => {
        toast.error(
            'Login via Google sementara dinonaktifkan. Silakan gunakan email/password atau lanjut sebagai tamu.',
        );
    };

    useEffect(() => {
        if (user) {
            const nextRoute = localStorage.getItem('nextRoute');
            if (nextRoute) {
                localStorage.removeItem('nextRoute');
                navigate(nextRoute, { replace: true });
                return;
            }

            if (user.role === 'admin') navigate('/admin', { replace: true });
            else if (user.role === 'staff')
                navigate('/staff', { replace: true });
            else navigate('/menu', { replace: true });
        }
    }, [user, navigate]);

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white rounded-3xl p-8 shadow-xl"
        >
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-navy-800">
                    Email
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <EnvelopeIcon className="w-5 h-5 text-navy-400" />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="kamu@email.com"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-navy-800">
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="w-5 h-5 text-navy-400" />
                    </div>
                    <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        required
                        className="w-full pl-11 pr-12 py-3 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-navy-400 hover:text-navy-800 transition-colors"
                        title={
                            showPass
                                ? 'Sembunyikan password'
                                : 'Tampilkan password'
                        }
                    >
                        {showPass ? (
                            <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {isCustomer && (
                <div className="flex items-center justify-between mt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="appearance-none h-4 w-4 border border-cream-300 rounded bg-white checked:bg-navy-800 checked:border-navy-800 focus:outline-none transition"
                        />
                        <span className="text-sm font-medium text-navy-400">
                            Ingat saya
                        </span>
                    </label>
                    <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-navy-800 hover:text-navy-900 transition-colors"
                    >
                        Lupa password?
                    </Link>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-navy-800 text-cream-100 rounded-full font-bold hover:bg-navy-900 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Memproses...</span>
                    </>
                ) : (
                    <>
                        <span>Masuk ke Akun</span>
                        <ArrowRightIcon className="w-5 h-5" />
                    </>
                )}
            </button>

            {isCustomer && (
                <>
                    <div className="flex items-center gap-4 my-8">
                        <div className="h-px bg-cream-200 flex-1" />
                        <span className="text-xs font-medium text-navy-400 uppercase tracking-wider">
                            Atau lanjutkan dengan
                        </span>
                        <div className="h-px bg-cream-200 flex-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-cream-300 bg-white hover:bg-cream-200 transition-colors cursor-pointer font-medium text-sm text-navy-800"
                        >
                            <GoogleLogo className="h-5 w-5" />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={handleContinueAsGuest}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-cream-300 bg-white hover:bg-cream-200 transition-colors cursor-pointer font-medium text-sm text-navy-800"
                        >
                            <UserIcon className="h-5 w-5" />
                            Sebagai Tamu
                        </button>
                    </div>
                </>
            )}

            <p className="text-center text-sm text-navy-400 mt-8">
                {isCustomer ? (
                    <>
                        Belum punya akun?{' '}
                        <Link
                            to="/register"
                            className="text-navy-800 font-medium border-b border-navy-200 hover:border-navy-800 transition"
                        >
                            Daftar sekarang
                        </Link>
                    </>
                ) : (
                    <>
                        Kembali ke{' '}
                        <Link
                            to="/login"
                            className="text-navy-800 font-medium border-b border-navy-200 hover:border-navy-800 transition"
                        >
                            login pelanggan
                        </Link>
                    </>
                )}
            </p>

            {isStaff && (
                <p className="text-center text-sm text-navy-400">
                    Ingin masuk sebagai admin?{' '}
                    <Link
                        to="/admin/login"
                        className="text-navy-800 font-medium border-b border-navy-200 hover:border-navy-800 transition"
                    >
                        Klik di sini
                    </Link>
                </p>
            )}

            {isAdmin && (
                <p className="text-center text-sm text-navy-400">
                    Ingin masuk sebagai staff?{' '}
                    <Link
                        to="/staff/login"
                        className="text-navy-800 font-medium border-b border-navy-200 hover:border-navy-800 transition"
                    >
                        Klik di sini
                    </Link>
                </p>
            )}
        </form>
    );
}
