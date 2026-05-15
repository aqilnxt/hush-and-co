import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

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
            navigate('/');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors)
                    .flat()
                    .forEach((msg) => toast.error(msg));
            } else {
                toast.error('Registrasi gagal!');
            }
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
                        — Join us
                    </p>
                    <h1 className="font-playfair text-5xl font-medium text-cream-200 leading-tight mb-6">
                        Start your
                        <br />
                        <em className="italic text-cream-400">journey</em>
                        <br />
                        with us.
                    </h1>
                    <p className="text-navy-200 text-sm leading-relaxed max-w-sm">
                        Daftar dan mulai nikmati pengalaman memesan di Hush &
                        Co. — lebih mudah, lebih menyenangkan.
                    </p>
                </div>
                <p className="font-playfair italic text-cream-400 text-sm">
                    "A quiet place to think, sip & stay."
                </p>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex items-center justify-center p-8 bg-cream-100">
                <div className="w-full max-w-md">
                    <h2 className="font-playfair text-3xl font-medium text-navy-900 mb-1">
                        Buat <em className="italic text-cream-600">akun</em>{' '}
                        baru
                    </h2>
                    <p className="text-navy-400 text-sm mb-8">
                        Daftar dan mulai nikmati pengalaman memesan di Hush &
                        Co.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-navy-800 mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Ahmad Fauzi"
                                required
                                className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-navy-800 mb-2">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="kamu@email.com"
                                required
                                className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-navy-800 mb-2">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 8 karakter"
                                required
                                className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-navy-800 mb-2">
                                Konfirmasi Password
                            </label>
                            <input
                                name="password_confirmation"
                                type="password"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                placeholder="Ulangi password"
                                required
                                className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-navy-800 text-cream-200 rounded-xl text-sm font-medium hover:bg-navy-900 transition disabled:opacity-60 mt-2"
                        >
                            {loading ? 'Membuat akun...' : 'Buat Akun'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-navy-400 mt-6">
                        Sudah punya akun?{' '}
                        <Link
                            to="/login"
                            className="text-navy-800 font-medium border-b border-navy-200 hover:border-navy-800 transition"
                        >
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
