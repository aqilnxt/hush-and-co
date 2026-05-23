import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    FireIcon,
    MapPinIcon,
    SparklesIcon,
    PhoneIcon,
    ClockIcon,
    GiftIcon,
    CameraIcon,
    StarIcon,
    UserGroupIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

const fallbackMenu = [
    {
        id: 1,
        name: 'Hush Latte',
        description:
            'Espresso double shot dengan susu oat, notes karamel dan hazelnut yang lembut.',
        price: 32000,
        category: { name: 'Signature' },
    },
    {
        id: 2,
        name: 'Cold Brew Navy',
        description:
            'Cold brew 18 jam dengan sentuhan vanilla dan es batu serut yang menyegarkan.',
        price: 35000,
        category: { name: 'Cold Series' },
    },
    {
        id: 3,
        name: 'Matcha Cream',
        description:
            'Matcha grade ceremonial Jepang, susu full cream, topped dengan whipped cream.',
        price: 30000,
        category: { name: 'Non-Coffee' },
    },
];

export default function Landing() {
    const [menuItems, setMenuItems] = useState(fallbackMenu);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await api.get('/menus');
                const items = res.data.data.slice(0, 3).map((menu) => ({
                    ...menu,
                    price: menu.price,
                    category: menu.category || { name: 'Menu' },
                }));
                if (items.length > 0) setMenuItems(items);
            } catch (err) {
                // keep fallback
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const handleOrderNow = () => {
        if (user?.role === 'customer') {
            navigate('/menu');
        } else if (user?.role === 'staff') {
            navigate('/staff');
        } else if (user?.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/login');
        }
    };

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const menuCards = loading ? fallbackMenu : menuItems;

    return (
        <div className="min-h-screen bg-cream-100 text-navy-900 font-sans overflow-x-hidden">
            {/* Sticky Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-cream-300/80">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                    <button
                        onClick={() => scrollTo('hero')}
                        className="font-playfair text-2xl font-bold text-navy-800 tracking-wide"
                    >
                        Hush <span className="text-cream-600">&</span> Co.
                    </button>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-navy-400">
                        <button
                            onClick={() => scrollTo('menu-section')}
                            className="hover:text-navy-800 transition"
                        >
                            Menu
                        </button>
                        <button
                            onClick={() => scrollTo('how-section')}
                            className="hover:text-navy-800 transition"
                        >
                            Tentang
                        </button>
                        <button
                            onClick={() => scrollTo('cta-section')}
                            className="hover:text-navy-800 transition"
                        >
                            Lokasi
                        </button>
                        <button
                            onClick={handleOrderNow}
                            className="ml-4 px-6 py-2.5 bg-navy-800 text-cream-100 rounded-full text-sm font-semibold hover:bg-navy-900 transition shadow-md"
                        >
                            Pesan Sekarang
                        </button>
                    </div>
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={handleOrderNow}
                            className="px-4 py-2 bg-navy-800 text-cream-100 rounded-full text-xs font-semibold"
                        >
                            Pesan
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-20">
                {/* Hero Section */}
                <section
                    id="hero"
                    className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2 overflow-hidden"
                >
                    {/* Left */}
                    <div className="flex flex-col justify-center px-6 lg:px-16 py-20 lg:py-28">
                        <span className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-cream-600 mb-6">
                            <span className="w-8 h-px bg-cream-400"></span>{' '}
                            Coffee · Jakarta
                        </span>
                        <h1 className="font-playfair text-5xl lg:text-7xl font-medium text-navy-900 leading-[1.08] mb-8">
                            A quiet place <br />
                            to <em className="italic text-cream-600">think,</em>
                            <br />
                            sip & stay.
                        </h1>
                        <p className="text-navy-400 text-lg leading-relaxed max-w-xl mb-10">
                            Hush & Co. hadir untuk kamu yang butuh jeda — kopi
                            yang baik, suasana yang tenang, dan tempat yang
                            terasa seperti rumah kedua.
                        </p>
                        <div className="flex flex-wrap items-center gap-5">
                            <button
                                onClick={() => scrollTo('menu-section')}
                                className="px-8 py-4 bg-navy-800 text-cream-100 rounded-full font-semibold hover:bg-navy-900 transition shadow-lg inline-flex items-center gap-2"
                            >
                                Lihat Menu{' '}
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scrollTo('how-section')}
                                className="group flex items-center gap-3 text-navy-800 font-medium"
                            >
                                Cara pesan
                                <span className="w-10 h-10 rounded-full border border-cream-300 flex items-center justify-center group-hover:border-navy-800 transition">
                                    <ArrowRightIcon className="w-4 h-4" />
                                </span>
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-10 mt-16 pt-10 border-t border-cream-200">
                            {[
                                { value: '1.2K+', label: 'Pelanggan' },
                                {
                                    value: '4.8',
                                    label: 'Rating',
                                    icon: StarIcon,
                                },
                                { value: '2', label: 'Cabang' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-2"
                                >
                                    {stat.icon && (
                                        <stat.icon className="w-5 h-5 text-cream-600" />
                                    )}
                                    <div>
                                        <p className="text-2xl font-bold text-navy-800">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-navy-400">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Right - Visual */}
                    <div className="relative bg-navy-800 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(200,185,154,0.15),transparent_50%)]" />
                        <div className="relative z-10 flex flex-col items-center justify-center">
                            <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-cream-200/90 flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-full border border-cream-400/30 scale-110" />
                                <div className="absolute inset-0 rounded-full border border-cream-400/20 scale-125" />
                                <FireIcon className="w-24 h-24 text-navy-800" />
                            </div>
                            <div className="absolute bottom-10 left-10 bg-cream-100/95 backdrop-blur rounded-2xl px-6 py-4 shadow-xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
                                    <MapPinIcon className="w-5 h-5 text-cream-100" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-navy-900">
                                        Scan QR Meja
                                    </p>
                                    <p className="text-xs text-navy-400">
                                        Langsung pesan dari mejamu
                                    </p>
                                </div>
                            </div>
                            <div className="absolute top-10 right-10 bg-navy-900/80 backdrop-blur rounded-full px-5 py-2 text-xs text-cream-200 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4" /> Open 07.00
                                – 22.00
                            </div>
                        </div>
                    </div>
                </section>

                {/* Marquee */}
                <div className="bg-navy-800 border-y border-navy-600/50 overflow-hidden py-4">
                    <div className="marquee flex whitespace-nowrap gap-8">
                        {[
                            'Espresso',
                            'Cold Brew',
                            'Caramel Latte',
                            'Matcha',
                            'Croissant',
                            'Dine-in & Takeaway',
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="inline-flex items-center gap-6 text-cream-400 text-xs font-medium uppercase tracking-[0.2em]"
                            >
                                {item}{' '}
                                <span className="w-1.5 h-1.5 rounded-full bg-cream-600" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Menu Section */}
                <section
                    id="menu-section"
                    className="py-24 lg:py-32 px-6 lg:px-16 max-w-7xl mx-auto"
                >
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16">
                        <div>
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-cream-600 flex items-center gap-3 mb-4">
                                <span className="w-6 h-px bg-cream-400" /> Menu
                                Pilihan
                            </span>
                            <h2 className="font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight">
                                Yang selalu jadi <br />
                                <em className="italic text-cream-600">
                                    favorit.
                                </em>
                            </h2>
                        </div>
                        <button
                            onClick={handleOrderNow}
                            className="mt-6 lg:mt-0 text-sm font-medium text-navy-800 hover:underline underline-offset-4"
                        >
                            Lihat semua menu →
                        </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {menuCards.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="group bg-white rounded-2xl border border-cream-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer"
                            >
                                <div
                                    className={`h-48 flex items-center justify-center ${
                                        index === 0
                                            ? 'bg-gradient-to-br from-navy-800 to-navy-600'
                                            : index === 1
                                              ? 'bg-gradient-to-br from-cream-600 to-cream-400'
                                              : 'bg-gradient-to-br from-navy-600 to-navy-400'
                                    }`}
                                >
                                    <FireIcon className="w-16 h-16 text-cream-100/70" />
                                </div>
                                <div className="p-6">
                                    <p className="text-xs font-medium uppercase tracking-widest text-cream-600 mb-2">
                                        {item.category?.name}
                                    </p>
                                    <h3 className="font-playfair text-xl font-medium text-navy-900 mb-2">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-navy-400 leading-relaxed mb-5">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold text-navy-800">
                                            Rp{' '}
                                            {Number(item.price).toLocaleString(
                                                'id',
                                            )}
                                        </span>
                                        <button className="w-10 h-10 rounded-full bg-navy-800 text-cream-100 flex items-center justify-center hover:bg-navy-900 transition">
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section
                    id="how-section"
                    className="py-24 lg:py-32 bg-navy-800 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-navy-900/30 to-navy-800/10" />
                    <div className="relative max-w-7xl mx-auto px-6 lg:px-16">
                        <div className="text-center mb-16">
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-cream-400 flex items-center justify-center gap-3 mb-4">
                                <span className="w-6 h-px bg-cream-600" />{' '}
                                Kenapa Hush & Co.
                            </span>
                            <h2 className="font-playfair text-4xl lg:text-5xl font-medium text-cream-200 leading-tight">
                                Lebih dari sekadar
                                <br />
                                <em className="italic text-cream-400">
                                    secangkir kopi.
                                </em>
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-0 border border-cream-400/20 rounded-2xl overflow-hidden">
                            {[
                                {
                                    icon: PhoneIcon,
                                    title: 'Pesan via QR',
                                    text: 'Scan QR di mejamu, pilih menu, konfirmasi — pesanan langsung masuk ke dapur tanpa perlu antri.',
                                },
                                {
                                    icon: ClockIcon,
                                    title: 'Lacak Pesanan',
                                    text: 'Pantau status pesananmu secara real-time — dari dapur sampai siap di mejamu.',
                                },
                                {
                                    icon: GiftIcon,
                                    title: 'Loyalty Points',
                                    text: 'Setiap transaksi kamu kumpulkan poin yang bisa ditukar jadi diskon di kunjungan berikutnya.',
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-8 lg:p-12 bg-white/5 hover:bg-white/10 transition border-r border-cream-400/20 last:border-r-0 flex flex-col items-start text-left"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-cream-400/10 flex items-center justify-center mb-8">
                                        <item.icon className="w-7 h-7 text-cream-300" />
                                    </div>
                                    <h3 className="font-playfair text-xl font-medium text-cream-200 mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-navy-200 text-sm leading-relaxed">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Steps */}
                <section className="py-24 lg:py-32 bg-cream-200">
                    <div className="max-w-7xl mx-auto px-6 lg:px-16">
                        <div className="text-center mb-16">
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-cream-600 flex items-center justify-center gap-3 mb-4">
                                <span className="w-6 h-px bg-cream-600" /> Cara
                                Pesan
                            </span>
                            <h2 className="font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight">
                                Semudah{' '}
                                <em className="italic text-cream-600">
                                    empat langkah.
                                </em>
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-4 gap-8 relative">
                            {[
                                {
                                    number: '01',
                                    title: 'Scan QR Meja',
                                    desc: 'Arahkan kamera HP ke QR di mejamu, langsung masuk ke halaman order.',
                                },
                                {
                                    number: '02',
                                    title: 'Pilih Menu',
                                    desc: 'Browse menu lengkap, tambahkan ke keranjang sesuka hati.',
                                },
                                {
                                    number: '03',
                                    title: 'Konfirmasi',
                                    desc: 'Cek pesanan, gunakan poin jika ada, dan konfirmasi ordermu.',
                                },
                                {
                                    number: '04',
                                    title: 'Tunggu & Nikmati',
                                    desc: 'Santai di mejamu, pesanan datang sendiri saat sudah siap.',
                                },
                            ].map((step, i) => (
                                <div
                                    key={i}
                                    className="relative flex flex-col items-start text-left"
                                >
                                    <span className="font-playfair text-7xl font-normal text-cream-300 leading-none mb-4">
                                        {step.number}
                                    </span>
                                    <h4 className="text-lg font-semibold text-navy-800 mb-2">
                                        {step.title}
                                    </h4>
                                    <p className="text-navy-400 text-sm leading-relaxed">
                                        {step.desc}
                                    </p>
                                    {i < 3 && (
                                        <div className="hidden md:block absolute top-8 -right-4 text-cream-400 text-2xl">
                                            →
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section
                    id="cta-section"
                    className="py-24 lg:py-32 px-6 lg:px-16 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center"
                >
                    <div>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-cream-600 flex items-center gap-3 mb-4">
                            <span className="w-6 h-px bg-cream-400" /> Mulai
                            hari ini
                        </span>
                        <h2 className="font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight mb-6">
                            Sudah siap mampir ke{' '}
                            <em className="italic text-cream-600">Hush?</em>
                        </h2>
                        <p className="text-navy-400 text-lg leading-relaxed mb-10 max-w-lg">
                            Daftar sekarang dan nikmati pengalaman memesan kopi
                            yang berbeda — lebih tenang, lebih mudah, lebih
                            menyenangkan.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="px-8 py-4 bg-navy-800 text-cream-100 rounded-full font-semibold hover:bg-navy-900 transition shadow-lg"
                            >
                                Buat Akun Gratis
                            </button>
                            <button
                                onClick={() => scrollTo('menu-section')}
                                className="px-8 py-4 border border-cream-300 rounded-full text-navy-800 font-medium hover:bg-cream-100 transition"
                            >
                                Lihat Lokasi
                            </button>
                        </div>
                    </div>
                    <div className="bg-navy-800 rounded-3xl p-10 relative overflow-hidden shadow-xl">
                        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-cream-400/5 blur-xl" />
                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-2 text-cream-400 text-xs font-medium uppercase tracking-widest mb-6">
                                <SparklesIcon className="w-4 h-4" /> Dine-in
                            </span>
                            <div className="w-28 h-28 bg-cream-200 rounded-2xl flex items-center justify-center mb-8">
                                <CameraIcon className="w-16 h-16 text-navy-800" />
                            </div>
                            <h3 className="font-playfair text-2xl font-medium text-cream-200 mb-4">
                                Scan, Pesan, Santai.
                            </h3>
                            <p className="text-navy-200 text-sm leading-relaxed">
                                Setiap meja punya QR Code unik. Tidak perlu
                                download app — langsung scan dari browser.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-navy-900 text-cream-200 pt-20 pb-10 px-6 lg:px-16">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 mb-16">
                        <div>
                            <h3 className="font-playfair text-2xl font-medium mb-4">
                                Hush <span className="text-cream-600">&</span>{' '}
                                Co.
                            </h3>
                            <p className="text-navy-200 text-sm leading-relaxed max-w-xs">
                                Tempat yang tenang untuk minum kopi, bekerja,
                                dan menikmati waktu sendiri maupun bersama.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-6">
                                Navigasi
                            </p>
                            <ul className="space-y-3 text-sm text-navy-200">
                                <li>
                                    <button
                                        onClick={() => scrollTo('hero')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Beranda
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollTo('menu-section')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Menu
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollTo('how-section')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Tentang
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollTo('cta-section')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Lokasi
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-6">
                                Akun
                            </p>
                            <ul className="space-y-3 text-sm text-navy-200">
                                <li>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Daftar
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Masuk
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => navigate('/menu')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Pesan Sekarang
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto border-t border-cream-400/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-navy-400">
                        <p>© 2025 Hush & Co. All rights reserved.</p>
                        <p className="font-playfair italic text-cream-600 mt-2 md:mt-0">
                            A quiet place to think, sip & stay.
                        </p>
                    </div>
                </footer>
            </main>

            {/* Marquee animation style */}
            <style>{`
                .marquee { animation: marquee 25s linear infinite; }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
