import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const role = await login(email, password);

            toast.success('Login berhasil!');

            // Redirect sesuai role
            if (role === 'admin') navigate('/admin');
            else if (role === 'staff') navigate('/staff');
            else navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login gagal!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-900 flex">
            {/* LEFT PANEL */}
            <div className="hidden lg:flex w-[45%] bg-navy-800 flex-col justify-between p-12">
                <span className="font-playfair text-xl font-medium text-cream-200">
                    Hush <span className="text-cream-600">&</span> Co.
                </span>
                <div>
                    <p className="text-cream-400 text-xs font-medium tracking-widest uppercase mb-5">
                        — Welcome back
                    </p>
                    <h1 className="font-playfair text-5xl font-medium text-cream-200 leading-tight mb-6">
                        Your quiet
                        <br />
                        place is{' '}
                        <em className="italic text-cream-400">waiting</em>
                        <br />
                        for you.
                    </h1>
                    <p className="text-navy-200 text-sm leading-relaxed max-w-sm">
                        Masuk ke akun Hush & Co. dan nikmati pengalaman memesan
                        kopi yang lebih mudah.
                    </p>
                </div>
                <p className="font-playfair italic text-cream-400 text-sm">
                    "A quiet place to think, sip & stay."
                </p>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex items-center justify-center p-8 bg-cream-100">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <span className="font-playfair text-2xl font-medium text-navy-800">
                            Hush <span className="text-cream-600">&</span> Co.
                        </span>
                    </div>

                    <h2 className="font-playfair text-3xl font-medium text-navy-900 mb-1">
                        Selamat{' '}
                        <em className="italic text-cream-600">datang</em>
                    </h2>
                    <p className="text-navy-400 text-sm mb-8">
                        Masuk ke akun Hush & Co. untuk mulai memesan.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-navy-800 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="kamu@email.com"
                                required
                                className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-navy-800 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Masukkan password"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-800 transition"
                                >
                                    {showPass ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-navy-800 text-cream-200 rounded-xl text-sm font-medium hover:bg-navy-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Memproses...' : 'Masuk ke Akun'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-navy-400 mt-6">
                        Belum punya akun?{' '}
                        <Link
                            to="/register"
                            className="text-navy-800 font-medium border-b border-navy-200 hover:border-navy-800 transition"
                        >
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
    