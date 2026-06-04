import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowRightIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import GoogleLogo from '../../components/common/GoogleLogo';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showPassConfirm, setShowPassConfirm] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleGoogleRegister = () => {
        toast.error(
            'Pendaftaran via Google sementara dinonaktifkan. Silakan gunakan email/password.',
        );
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.password_confirmation) {
            toast.error('Password tidak cocok!');
            return;
        }

        setLoading(true);
        try {
            await register(
                form.name,
                form.email,
                form.password,
                form.password_confirmation,
            );
            toast.success('Registrasi berhasil!');
            navigate('/menu');
        } catch (err) {
            const errors = err.response?.data?.errors;
            const message = err.response?.data?.message;
            if (errors) {
                Object.values(errors)
                    .flat()
                    .forEach((msg) => toast.error(msg));
            } else if (message) {
                toast.error(message);
            } else {
                toast.error('Registrasi gagal!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white rounded-3xl p-8 shadow-xl"
        >
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-navy-800">
                    Nama Lengkap
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="w-5 h-5 text-navy-400" />
                    </div>
                    <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ahmad Fauzi"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-navy-800">
                    Email
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <EnvelopeIcon className="w-5 h-5 text-navy-400" />
                    </div>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
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
                        name="password"
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 8 karakter"
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

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-navy-800">
                    Konfirmasi Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="w-5 h-5 text-navy-400" />
                    </div>
                    <input
                        name="password_confirmation"
                        type={showPassConfirm ? 'text' : 'password'}
                        value={form.password_confirmation}
                        onChange={handleChange}
                        placeholder="Ulangi password"
                        required
                        className="w-full pl-11 pr-12 py-3 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassConfirm(!showPassConfirm)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-navy-400 hover:text-navy-800 transition-colors"
                        title={
                            showPassConfirm
                                ? 'Sembunyikan password'
                                : 'Tampilkan password'
                        }
                    >
                        {showPassConfirm ? (
                            <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-navy-800 text-cream-100 rounded-full font-bold hover:bg-navy-900 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Membuat akun...</span>
                    </>
                ) : (
                    <>
                        <span>Buat Akun</span>
                        <ArrowRightIcon className="w-5 h-5" />
                    </>
                )}
            </button>

            <div className="flex flex-col gap-3 mt-5">
                <button
                    type="button"
                    onClick={handleGoogleRegister}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-cream-300 bg-white hover:bg-cream-200 transition-colors font-medium text-sm text-navy-800"
                >
                    <GoogleLogo className="h-5 w-5" />
                    Daftar dengan Google
                </button>
                <div className="flex items-center gap-3">
                    <div className="h-px bg-cream-200 flex-1" />
                    <span className="text-xs uppercase tracking-widest text-navy-400">
                        atau
                    </span>
                    <div className="h-px bg-cream-200 flex-1" />
                </div>
            </div>

            <p className="text-center text-sm text-navy-400 mt-8">
                Sudah punya akun?{' '}
                <Link
                    to="/login"
                    className="text-navy-800 font-medium border-b border-navy-200 hover:border-navy-800 transition"
                >
                    Masuk di sini
                </Link>
            </p>
        </form>
    );
}
