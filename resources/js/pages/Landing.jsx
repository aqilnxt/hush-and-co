import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingProfileDropdown from '../components/common/LandingProfileDropdown';
import api from '../api/axios';
import {
    ArrowRightIcon,
    ArrowRightOnRectangleIcon,
    CakeIcon,
    BoltIcon,
    GiftIcon,
} from '@heroicons/react/24/outline';

const useReveal = () => {
    useEffect(() => {
        const revealElements = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    } else {
                        entry.target.classList.remove('visible');
                    }
                });
            },
            { threshold: 0.15 },
        );

        revealElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
};

export default function Landing() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    const [menuStats, setMenuStats] = useState({
        total: '12+',
        available: '0',
        categoryCount: '0',
    });

    const [cartCount, setCartCount] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            const parsed = saved ? JSON.parse(saved) : [];
            return parsed.reduce((a, c) => a + (c.qty || 0), 0);
        } catch (e) {
            return 0;
        }
    });
    const [testimonials] = useState([
        {
            id: 1,
            quote: 'Pertama kali ke sini buat ngerjain tugas — sekarang jadi tempat langganan tiap minggu. Suasananya beda, tenang tapi nggak bikin ngantuk.',
            name: 'Aira Rahmadani',
            role: 'Mahasiswi, Unpad',
            initials: 'AR',
        },
        {
            id: 2,
            quote: 'QR ordering-nya bikin proses pesan jadi mulus. Nggak perlu nunggu pelayan, cukup pilih dan nikmati.',
            name: 'Bagas Hendriawan',
            role: 'Freelance designer',
            initials: 'BH',
        },
        {
            id: 3,
            quote: 'Latte-nya harum dan makanan rotinya selalu hangat. Suasana sore di sini jadi favorit saya.',
            name: 'Dita Suryaningrum',
            role: 'Content creator',
            initials: 'DS',
        },
    ]);

    const loyaltyPerks = [
        {
            id: 1,
            icon: <span className="text-xl">☕</span>,
            title: 'Kopi ke-10 gratis',
            desc: 'Setiap 10 kali transaksi, ambil satu minuman favorit tanpa biaya tambahan.',
        },
        {
            id: 2,
            icon: <CakeIcon className="h-6 w-6" />,
            title: 'Birthday treat',
            desc: 'Datang di hari ulang tahunmu dan nikmati sambutan khusus dari kami.',
        },
        {
            id: 3,
            icon: <BoltIcon className="h-6 w-6" />,
            title: 'Priority order',
            desc: 'Pesananmu diproses lebih cepat saat loyalty sudah aktif.',
        },
        {
            id: 4,
            icon: <GiftIcon className="h-6 w-6" />,
            title: 'Early access',
            desc: 'Dapatkan info menu baru dan pastry spesial lebih awal.',
        },
    ];

    const orderSteps = [
        {
            number: '01',
            title: 'Scan QR',
            desc: 'Arahkan kamera ke QR di mejamu untuk mulai pesan tanpa antre.',
        },
        {
            number: '02',
            title: 'Pilih Menu',
            desc: 'Telusuri kopi dan camilan dengan cara yang sederhana.',
        },
        {
            number: '03',
            title: 'Konfirmasi',
            desc: 'Cek pesanan, pilih metode pembayaran, lalu kirim ke dapur.',
        },
        {
            number: '04',
            title: 'Santai & Tunggu',
            desc: 'Nikmati suasana, pesanan akan dibawa ke meja atau siap dibawa pulang.',
        },
    ];

    const serviceTypes = [
        {
            id: 'dinein',
            tag: 'Dine-in',
            title: 'Pesan dari meja, tanpa antri.',
            desc: 'Pesanan dikirim langsung ke mejamu setelah QR discan. Lebih cepat, lebih tenang.',
            cta: 'Pesan dari meja sekarang →',
        },
        {
            id: 'takeaway',
            tag: 'Takeaway',
            title: 'Bawa pulang, tanpa repot.',
            desc: 'Pesan lebih awal, ambil saat siap, dan nikmati kopi favorit di luar kafe.',
            cta: 'Pesan untuk dibawa →',
        },
    ];

    const menuBadges = ['Bestseller', 'Baru', 'Signature'];

    const heroStats = [
        { value: '0', label: 'antrian kasir' },
        { value: menuStats.total || '12+', label: 'pilihan kopi & camilan' },
        { value: '100%', label: 'specialty beans' },
        { value: '07–22', label: 'buka setiap hari' },
    ];

    const aboutStats = [
        { value: menuStats.total || '12+', label: 'Pilihan menu' },
        { value: menuStats.categoryCount || '0', label: 'Kategori' },
        { value: menuStats.available || '0', label: 'Tersedia sekarang' },
        { value: '0', label: 'Antrian kasir' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 24);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useReveal();

    useEffect(() => {
        const handleCartChange = (e) => {
            if (e?.detail?.count !== undefined) {
                setCartCount(e.detail.count);
                return;
            }
            try {
                const saved = localStorage.getItem('cart');
                const parsed = saved ? JSON.parse(saved) : [];
                setCartCount(parsed.reduce((a, c) => a + (c.qty || 0), 0));
            } catch (err) {
                setCartCount(0);
            }
        };

        window.addEventListener('cartchange', handleCartChange);
        window.addEventListener('storage', handleCartChange);

        return () => {
            window.removeEventListener('cartchange', handleCartChange);
            window.removeEventListener('storage', handleCartChange);
        };
    }, []);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const [menuRes, categoryRes] = await Promise.all([
                    api.get('/menus', {
                        params: { paginate: true, per_page: 100 },
                    }),
                    api.get('/categories'),
                ]);

                const menus = Array.isArray(menuRes.data?.data)
                    ? menuRes.data.data
                    : [];
                const items = menus.slice(0, 3).map((menu) => ({
                    ...menu,
                    price: menu.price,
                    category: menu.category || { name: 'Menu' },
                }));

                setMenuItems(items);
                setMenuStats({
                    total: menuRes.data?.total ?? menus.length,
                    available:
                        menuRes.data?.stats?.available ??
                        menus.filter((m) => m.is_available).length,
                    categoryCount: categoryRes.data?.data?.length ?? 0,
                });
            } catch (err) {
                // keep fallback menu
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const handleOrderNow = () => {
        if (user?.role === 'customer') navigate('/menu');
        else if (user?.role === 'staff') navigate('/staff');
        else if (user?.role === 'admin') navigate('/admin');
        else navigate('/login');
    };

    const getPrimaryCTAText = () => {
        if (!user) return 'Pesan Sekarang';
        if (user.role === 'customer') return 'Menu';
        if (user.role === 'staff') return 'Dashboard';
        if (user.role === 'admin') return 'Dashboard';
        return 'Pesan Sekarang';
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const profileMenuItems = [
        {
            label: 'Profile',
            onClick: () => {
                navigate(
                    user?.role === 'staff'
                        ? '/staff/profile'
                        : user?.role === 'admin'
                          ? '/admin/profile'
                          : '/profile',
                );
            },
        },
        {
            label: 'Pesanan Saya',
            onClick: () => {
                navigate(user?.role === 'staff' ? '/staff/orders' : '/orders');
            },
        },
        {
            label: 'Logout',
            icon: ArrowRightOnRectangleIcon,
            onClick: handleLogout,
        },
    ];

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const menuCards = menuItems;

    return (
        <div className="min-h-screen bg-cream-100 text-navy-900 font-sans overflow-x-hidden">
            <nav
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
                    scrolled
                        ? 'bg-cream-100/90 backdrop-blur-md border-b border-cream-300/40'
                        : 'bg-navy-900/10'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => scrollTo('hero')}
                        aria-label="Kembali ke atas"
                        className="flex items-center gap-3 text-left cursor-pointer transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cream-300"
                    >
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-navy-800">
                            <img
                                src="/images/hush-co-logo.png"
                                alt="Hush & Co"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.innerHTML =
                                        '<span class="font-playfair text-sm text-cream-100 w-full h-full flex items-center justify-center">H</span>';
                                }}
                            />
                        </div>
                        <span
                            className={`font-playfair text-lg font-medium tracking-[-0.02em] transition-colors duration-300 ${
                                scrolled ? 'text-navy-900' : 'text-cream-100'
                            }`}
                        >
                            Hush & Co
                        </span>
                    </button>

                    <div className="hidden lg:flex items-center gap-8">
                        {[
                            { label: 'Menu', id: 'menu-section' },
                            { label: 'Suasana', id: 'atmosphere-section' },
                            { label: 'Cara Pesan', id: 'qr-section' },
                            { label: 'Rewards', id: 'loyalty-section' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => scrollTo(item.id)}
                                className={`text-sm font-medium tracking-[0.06em] transition-colors duration-300 relative group ${
                                    scrolled
                                        ? 'text-navy-600 hover:text-navy-900'
                                        : 'text-cream-200/80 hover:text-cream-100'
                                }`}
                            >
                                {item.label}
                                <span
                                    className={`absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300 ${
                                        scrolled
                                            ? 'bg-navy-900'
                                            : 'bg-cream-100'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {!user ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                                        scrolled
                                            ? 'bg-transparent border border-navy-200 text-navy-700 hover:bg-navy-900 hover:text-cream-100 hover:border-navy-900'
                                            : 'bg-transparent border border-cream-100/30 text-cream-100 hover:bg-white/10'
                                    }`}
                                >
                                    Masuk
                                </button>
                                <button
                                    type="button"
                                    onClick={handleOrderNow}
                                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 shadow-sm ${
                                        scrolled
                                            ? 'bg-navy-900 text-cream-100 hover:bg-navy-800'
                                            : 'bg-cream-100 text-navy-900 hover:bg-cream-200'
                                    }`}
                                >
                                    <span className="hidden sm:inline">
                                        Pesan Sekarang
                                    </span>
                                    <span className="sm:hidden">Pesan</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleOrderNow}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 shadow-sm ${
                                        scrolled
                                            ? 'bg-navy-900 text-cream-100 hover:bg-navy-800'
                                            : 'bg-cream-100 text-navy-900 hover:bg-cream-200'
                                    }`}
                                >
                                    {getPrimaryCTAText()}
                                </button>
                                <LandingProfileDropdown
                                    name={
                                        user?.name?.split(' ')[0] || user?.name
                                    }
                                    email={user?.email}
                                    role={user?.role}
                                    avatar={user?.avatar}
                                    menuItems={profileMenuItems}
                                />
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="pt-0">
                <section
                    id="hero"
                    className="relative min-h-[calc(100vh-0px)] overflow-hidden bg-gradient-to-br from-[#0d0a03] via-navy-900 to-navy-800"
                >
                    <div className="absolute inset-0 grain-pattern opacity-[0.04] pointer-events-none" />
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(201,146,43,0.12),transparent_65%)]" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03),transparent_70%)]" />
                    </div>
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.035]"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
                            backgroundSize: '80px 80px',
                        }}
                    />

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-36 pb-20 lg:pt-40 lg:pb-24 grid lg:grid-cols-2 gap-16 items-center min-h-screen">
                        <div className="space-y-8 text-cream-100">
                            <div className="inline-flex items-center gap-2.5 bg-white/[0.07] border border-white/[0.1] rounded-full px-4 py-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-[11px] uppercase tracking-[0.2em] text-cream-300 font-medium">
                                    Specialty Coffee Cafe
                                </span>
                            </div>
                            <div>
                                <h1 className="font-playfair text-5xl sm:text-6xl lg:text-[72px] leading-[0.94] tracking-[-0.03em] text-white">
                                    Kopi yang tenang.
                                    <br />
                                    Meja yang pas.
                                    <br />
                                    Hari yang lebih baik.
                                </h1>
                                <p className="mt-7 max-w-lg text-[15px] text-cream-200/80 leading-[1.75] font-light">
                                    Pesan langsung dari meja via QR. Tanpa
                                    aplikasi, tanpa antre — cukup dari handphone
                                    kamu.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleOrderNow}
                                    className="inline-flex items-center gap-2.5 rounded-full bg-cream-100 px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-lg transition hover:bg-cream-200 hover:-translate-y-0.5"
                                >
                                    Pesan Sekarang
                                    <ArrowRightIcon className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/menu')}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-cream-100/90 transition hover:text-cream-50"
                                >
                                    Lihat Menu
                                    <ArrowRightIcon className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-8 pt-2 border-t border-white/[0.08]">
                                {heroStats.map((s) => (
                                    <div key={s.label} className="pt-6">
                                        <p className="font-playfair text-2xl font-medium text-white tracking-[-0.02em]">
                                            {s.value}
                                        </p>
                                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-cream-400/70">
                                            {s.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="w-full max-w-[420px] rounded-[40px] border border-white/10 bg-navy-900 shadow-[0_40px_80px_rgba(0,0,0,0.35)] overflow-hidden">
                                <div className="relative h-[520px] bg-[linear-gradient(180deg,#1f3253_0%,#111827_100%)] p-8">
                                    <div className="absolute inset-0 bg-[url('/images/hero-lifestyle-placeholder.jpg')] bg-cover bg-center opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
                                    <div className="relative h-full rounded-[32px] border border-white/10 bg-black/10 backdrop-blur-sm" />
                                </div>
                                <div className="bg-navy-800/90 px-8 py-6">
                                    <p className="text-sm uppercase tracking-[0.3em] text-cream-400">
                                        Hush & Co · Bandung
                                    </p>
                                    <h2 className="mt-4 font-playfair text-3xl font-semibold text-cream-100">
                                        Sebuah sudut kopi yang hangat.
                                    </h2>
                                    <p className="mt-3 text-sm leading-relaxed text-cream-300">
                                        Meja, suasana, dan rasa yang dibuat agar
                                        setiap kunjungan terasa lebih tenang.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-navy-900 overflow-hidden py-6">
                    <div className="marquee-strip overflow-hidden">
                        <div className="marquee-track flex items-center gap-8 whitespace-nowrap px-6 lg:px-12">
                            {[
                                'Specialty Coffee',
                                'Single Origin Beans',
                                'Fresh Bakery Daily',
                                'Dine-in & Takeaway',
                                'Open 07.00–22.00',
                                'Bandung',
                                'Scan. Pesan. Santai.',
                            ]
                                .concat([
                                    'Specialty Coffee',
                                    'Single Origin Beans',
                                    'Fresh Bakery Daily',
                                    'Dine-in & Takeaway',
                                    'Open 07.00–22.00',
                                    'Bandung',
                                    'Scan. Pesan. Santai.',
                                ])
                                .map((item, index) => (
                                    <span
                                        key={`${item}-${index}`}
                                        className="inline-flex items-center gap-4 text-cream-400 text-xs uppercase tracking-[0.2em]"
                                    >
                                        {item}
                                        <span className="h-1.5 w-1.5 rounded-full bg-cream-600" />
                                    </span>
                                ))}
                        </div>
                    </div>
                </section>
                <section
                    id="about-section"
                    className="reveal bg-cream-100 py-24 lg:py-32"
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-16 lg:grid-cols-[1.15fr_0.85fr] items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.26em] text-navy-400">
                                <span className="block h-px w-12 bg-navy-400" />
                                Sebuah Cerita Hush
                            </div>
                            <div>
                                <h2 className="font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight">
                                    Sebuah ruang untuk memperlambat langkah.
                                </h2>
                                <p className="mt-6 max-w-xl text-base text-navy-500 leading-relaxed">
                                    Hush & Co adalah rumah kopi di tengah
                                    Bandung yang merayakan biji spesial, suasana
                                    hangat, dan layanan tanpa ribet. Kami ingin
                                    setiap kunjungan terasa seperti jeda yang
                                    penuh rasa.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {aboutStats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-3xl border border-navy-200 bg-white p-6"
                                    >
                                        <p className="text-3xl font-semibold text-navy-900">
                                            {stat.value}
                                        </p>
                                        <p className="mt-3 text-sm uppercase tracking-[0.18em] text-navy-500">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-[40px] bg-navy-900 shadow-[0_40px_80px_rgba(14,26,46,0.22)]">
                            <div className="aspect-[3/4] bg-[linear-gradient(180deg,#1c2b49_0%,#101821_100%)] p-8">
                                <div className="relative h-full rounded-[32px] border border-white/10 bg-[url('/images/about-placeholder.jpg')] bg-cover bg-center">
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
                                </div>
                            </div>
                            <div className="absolute right-6 top-6 rounded-3xl bg-cream-100 px-5 py-4 text-navy-900 shadow-xl">
                                <p className="text-xs uppercase tracking-[0.24em] text-navy-500">
                                    Rating
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    4.9 ★
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section
                    id="menu-section"
                    className="reveal bg-navy-900 py-24 lg:py-32"
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-14">
                            <div>
                                <span className="text-xs uppercase tracking-[0.24em] text-cream-400">
                                    Signature Collection
                                </span>
                                <h2 className="mt-4 font-playfair text-4xl lg:text-5xl font-medium text-cream-100 leading-tight">
                                    Yang paling sering dipesan.
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate('/menu')}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-cream-100/90 transition hover:text-cream-50"
                            >
                                Lihat semua menu
                                <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {loading
                                ? Array.from({ length: 3 }).map((_, index) => (
                                      <div
                                          key={index}
                                          className="animate-pulse rounded-[32px] bg-navy-800 p-6"
                                      >
                                          <div className="mb-5 h-48 rounded-3xl bg-navy-700" />
                                          <div className="h-5 w-2/4 rounded-full bg-navy-700 mb-4" />
                                          <div className="h-4 w-3/4 rounded-full bg-navy-700 mb-4" />
                                          <div className="h-5 w-1/3 rounded-full bg-navy-700" />
                                      </div>
                                  ))
                                : menuCards.map((item, index) => (
                                      <article
                                          key={item.id || index}
                                          className="group rounded-[32px] border border-white/10 bg-navy-900 p-6 transition duration-300 hover:-translate-y-2 hover:border-cream-400/20"
                                      >
                                          <div className="mb-6 h-52 overflow-hidden rounded-[28px] bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600" />
                                          <div className="mb-4 inline-flex rounded-full border border-cream-300/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cream-300">
                                              {item.category?.name ||
                                                  menuBadges[index] ||
                                                  'Menu'}
                                          </div>
                                          <h3 className="font-playfair text-2xl font-medium text-cream-100 mb-3">
                                              {item.name}
                                          </h3>
                                          <p className="text-sm leading-relaxed text-cream-300 mb-6">
                                              {item.description}
                                          </p>
                                          <div className="flex items-center justify-between gap-4">
                                              <p className="text-lg font-semibold text-cream-100">
                                                  Rp{' '}
                                                  {Number(
                                                      item.price,
                                                  ).toLocaleString('id')}
                                              </p>
                                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-navy-900">
                                                  +
                                              </span>
                                          </div>
                                      </article>
                                  ))}
                        </div>
                    </div>
                </section>

                <section
                    id="qr-section"
                    className="reveal bg-cream-200 py-24 lg:py-32"
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-16 lg:grid-cols-[0.95fr_0.9fr] items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-navy-600">
                                <span className="block h-px w-12 bg-navy-600" />
                                QR Ordering
                            </div>
                            <div>
                                <h2 className="font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight">
                                    Pesan dari mejamu, sekarang.
                                </h2>
                                <p className="mt-6 max-w-xl text-base text-navy-500 leading-relaxed">
                                    Tanpa aplikasi. Tanpa antri. Langsung dari
                                    HP kamu, untuk Dine-in dan Takeaway.
                                </p>
                            </div>
                            <div className="space-y-5">
                                {orderSteps.map((item) => (
                                    <div
                                        key={item.number}
                                        className="border-b border-navy-200/30 pb-5 last:border-b-0 last:pb-0"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-navy-900 text-cream-100 font-playfair text-lg font-semibold">
                                                {item.number}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-navy-900">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 text-sm text-navy-500 leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-[32px] border border-navy-200/60 bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-navy-600">
                                    Cocok untuk Dine-in & Takeaway
                                </p>
                            </div>
                        </div>
                        <div className="relative rounded-[44px] border border-navy-200/30 bg-navy-900 p-4 shadow-[0_40px_80px_rgba(14,26,46,0.18)]">
                            <div className="rounded-[40px] bg-cream-100 p-5">
                                <div className="flex items-center justify-between pb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.24em] text-navy-500">
                                            Meja
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-navy-900">
                                            07
                                        </p>
                                    </div>
                                    <div className="rounded-3xl bg-navy-900 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cream-100">
                                        QR Order
                                    </div>
                                </div>
                                <div className="rounded-[32px] bg-navy-900 p-5 text-cream-100">
                                    {menuCards.slice(0, 3).map((menu) => (
                                        <div
                                            key={menu.id}
                                            className="mb-4 flex items-center justify-between text-sm text-cream-100"
                                        >
                                            <span>{menu.name}</span>
                                            <span>
                                                Rp{' '}
                                                {Number(
                                                    menu.price,
                                                ).toLocaleString('id')}
                                            </span>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="mt-4 w-full rounded-3xl bg-cream-100 py-4 text-sm font-semibold text-navy-900 transition hover:bg-cream-200"
                                    >
                                        Checkout Pesanan
                                    </button>
                                </div>
                                <div className="mt-5 rounded-3xl border border-navy-200/40 bg-white/80 p-4 text-sm text-navy-700">
                                    <div className="flex items-center gap-2 text-navy-900 font-semibold mb-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Sedang diproses
                                    </div>
                                    <p>Pesanan akan siap dalam 4 menit.</p>
                                </div>
                            </div>
                            <div className="absolute left-1/2 top-3 -translate-x-1/2 h-1.5 w-20 rounded-full bg-cream-200/50" />
                        </div>
                    </div>
                </section>

                <section
                    id="atmosphere-section"
                    className="reveal bg-cream-100 py-24 lg:py-32"
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-14">
                            <div>
                                <span className="text-xs uppercase tracking-[0.24em] text-navy-400">
                                    Dirancang untukmu
                                </span>
                                <h2 className="mt-4 font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight">
                                    Lihat sendiri tempatnya.
                                </h2>
                            </div>
                            <p className="max-w-xl text-sm leading-relaxed text-navy-500">
                                Ruang kami dibuat untuk memberi ruang bagi
                                setiap momen: belajar, ngobrol pelan, atau hanya
                                menikmati secangkir kopi sendirian.
                            </p>
                        </div>
                        <div className="grid gap-6 lg:grid-cols-4 lg:grid-rows-2">
                            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#1c2b49_0%,#0f1623_100%)] min-h-[400px] lg:min-h-0">
                                <div className="absolute inset-0 bg-[url('/images/gallery-1.jpg')] bg-cover bg-center opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />
                                <p className="absolute bottom-6 left-6 text-sm italic text-cream-200/80">
                                    Ruang utama & jendela besar
                                </p>
                            </div>
                            <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#1c2b49_0%,#0f1623_100%)] h-48 lg:h-auto">
                                <div className="absolute inset-0 bg-[url('/images/gallery-2.jpg')] bg-cover bg-center opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />
                                <p className="absolute bottom-6 left-6 text-sm italic text-cream-200/80">
                                    Bar counter
                                </p>
                            </div>
                            <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#1c2b49_0%,#0f1623_100%)] h-48 lg:h-auto">
                                <div className="absolute inset-0 bg-[url('/images/gallery-3.jpg')] bg-cover bg-center opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />
                                <p className="absolute bottom-6 left-6 text-sm italic text-cream-200/80">
                                    Pojok kerja
                                </p>
                            </div>
                            <div className="relative col-span-2 overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#1c2b49_0%,#0f1623_100%)] h-48 lg:h-64">
                                <div className="absolute inset-0 bg-[url('/images/gallery-4.jpg')] bg-cover bg-center opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />
                                <p className="absolute bottom-6 left-6 text-sm italic text-cream-200/80">
                                    Outdoor terrace
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="loyalty-section"
                    className="reveal bg-cream-100 py-24 lg:py-32"
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-16 lg:grid-cols-[1fr_0.9fr] items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-navy-500">
                                <span className="block h-px w-12 bg-navy-500" />
                                Program Loyalti
                            </div>
                            <div>
                                <h2 className="font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight">
                                    Setiap kopi ada hadiahnya.
                                </h2>
                                <p className="mt-6 max-w-xl text-base text-navy-600 leading-relaxed">
                                    Kumpulkan poin setiap kali memesan, dan
                                    nikmati keuntungan khusus yang dibuat untuk
                                    tamu setia kami.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {loyaltyPerks.map((perk) => (
                                    <div
                                        key={perk.id}
                                        className="rounded-[32px] border border-navy-200/40 bg-white p-6"
                                    >
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-navy-900 text-cream-100">
                                            {perk.icon}
                                        </div>
                                        <h3 className="text-lg font-semibold text-navy-900 mb-2">
                                            {perk.title}
                                        </h3>
                                        <p className="text-sm text-navy-600 leading-relaxed">
                                            {perk.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="rounded-[40px] bg-navy-900 p-8 text-cream-100 shadow-[0_40px_90px_rgba(14,26,46,0.18)]">
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-xs uppercase tracking-[0.2em] text-cream-300">
                                        Loyalty Card
                                    </p>
                                    <p className="text-sm font-medium">
                                        7 / 10
                                    </p>
                                </div>
                                <div className="flex items-center justify-between rounded-[32px] bg-white/10 p-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.22em] text-cream-300">
                                            Member
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-cream-100">
                                            Aqil
                                        </p>
                                    </div>
                                    <p className="text-3xl font-semibold text-cream-100">
                                        530 pts
                                    </p>
                                </div>
                                <div className="mt-10 grid grid-cols-10 gap-3">
                                    {Array.from({ length: 10 }).map(
                                        (_, idx) => (
                                            <span
                                                key={idx}
                                                className={`h-3 rounded-full ${idx < 7 ? 'bg-cream-400' : 'bg-cream-100/30'}`}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                            <div className="rounded-[32px] border border-navy-200/40 bg-white p-6">
                                <p className="text-sm text-navy-500">
                                    3 transaksi lagi menuju kopi gratis!
                                </p>
                                <div className="mt-5 h-4 overflow-hidden rounded-full bg-navy-100">
                                    <div className="h-full w-[70%] rounded-full bg-navy-900 transition-all duration-300" />
                                </div>
                                <p className="mt-3 text-sm text-navy-700">
                                    Progress: 7/10
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate('/menu')}
                                className="rounded-full bg-navy-900 px-8 py-4 text-sm font-semibold text-cream-100 transition hover:bg-navy-800"
                            >
                                Daftar sekarang untuk mulai kumpulkan poin
                            </button>
                        </div>
                    </div>
                </section>

                <section className="reveal bg-cream-200 py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-8 lg:grid-cols-2">
                        {serviceTypes.map((service) => (
                            <div
                                key={service.id}
                                className="rounded-[32px] border border-cream-300 bg-white p-10 transition hover:shadow-md"
                            >
                                <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-navy-500 mb-6">
                                    <span className="block h-px w-12 bg-navy-500" />
                                    {service.tag}
                                </div>
                                <h3 className="font-playfair text-3xl font-medium text-navy-900 mb-4">
                                    {service.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-navy-600 mb-8">
                                    {service.desc}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (service.id === 'dinein') {
                                            navigate('/menu?type=dinein');
                                        } else {
                                            navigate('/menu?type=takeaway');
                                        }
                                    }}
                                    className="text-sm font-semibold text-navy-900 hover:underline"
                                >
                                    {service.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="reveal bg-cream-200 py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="text-center mb-14">
                            <span className="text-xs uppercase tracking-[0.24em] text-navy-500">
                                Testimoni
                            </span>
                            <h2 className="mt-4 font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight">
                                Cerita dari tamu kami.
                            </h2>
                        </div>
                        <div className="grid gap-6 lg:grid-cols-3">
                            {testimonials.map((item) => (
                                <div
                                    key={item.id}
                                    className="group rounded-[32px] border border-navy-200/30 bg-white p-8 transition hover:border-cream-400 hover:shadow-xl"
                                >
                                    <div className="mb-5 text-cream-600">
                                        ★★★★★
                                    </div>
                                    <p className="text-lg italic text-navy-900 leading-relaxed mb-8">
                                        “{item.quote}”
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-cream-100 font-semibold">
                                            {item.initials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-navy-900">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-navy-500">
                                                {item.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="location-section"
                    className="reveal bg-cream-200 py-24 lg:py-32"
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 grid gap-16 lg:grid-cols-[1fr_0.95fr] items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-navy-500">
                                <span className="block h-px w-12 bg-navy-500" />
                                Lokasi
                            </div>
                            <div>
                                <h2 className="font-playfair text-4xl lg:text-5xl font-medium text-navy-900 leading-tight">
                                    Temukan kami.
                                </h2>
                                <p className="mt-6 max-w-xl text-base text-navy-600 leading-relaxed">
                                    Datang pagi untuk suasana yang lebih tenang.
                                    Kami ada di jantung Bandung, siap menyajikan
                                    kopi dan camilan segar setiap hari.
                                </p>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[32px] border border-navy-200 bg-white p-6 shadow-sm">
                                    <p className="text-sm uppercase tracking-[0.2em] text-navy-500 mb-3">
                                        Alamat
                                    </p>
                                    <p className="text-base text-navy-900 leading-relaxed">
                                        Jl. Braga No.12, Braga, Kec. Sumur
                                        Bandung, Kota Bandung, Jawa Barat
                                    </p>
                                </div>
                                <div className="rounded-[32px] border border-navy-200 bg-white p-6 shadow-sm">
                                    <p className="text-sm uppercase tracking-[0.2em] text-navy-500 mb-3">
                                        Jam buka
                                    </p>
                                    <div className="space-y-2 text-sm text-navy-600">
                                        <p>Senin – Minggu: 07.00 – 22.00</p>
                                        <p>
                                            Datang pagi untuk suasana lebih
                                            tenang
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    window.open(
                                        'https://maps.google.com?q=Hush+%26+Co+Bandung',
                                        '_blank',
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-cream-100 transition hover:bg-navy-800"
                            >
                                Lihat di Google Maps
                                <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="relative overflow-hidden rounded-[40px] bg-navy-900 p-10 shadow-[0_40px_90px_rgba(14,26,46,0.22)]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_55%)]" />
                            <div className="relative rounded-[32px] bg-navy-800 p-10 text-cream-100">
                                <div className="mb-8 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-cream-300">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-cream-100"
                                    >
                                        <path
                                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="9"
                                            r="2.5"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Lokasi kafe
                                </div>
                                <p className="text-2xl font-semibold text-cream-100 mb-4">
                                    Hush & Co Bandung
                                </p>
                                <p className="text-sm text-cream-200 leading-relaxed">
                                    Jl. Braga No.12, Braga, Kec. Sumur Bandung,
                                    Kota Bandung. Dekat dengan pusat kreatif dan
                                    tempat berkumpul favorit.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="reveal bg-navy-900 py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                        <span className="text-xs uppercase tracking-[0.26em] text-cream-400">
                            Final CTA
                        </span>
                        <h2 className="mt-4 font-playfair text-4xl lg:text-5xl font-medium text-cream-100 leading-tight">
                            Mejamu sudah menunggu.
                            <br />
                            <em className="italic text-cream-300">
                                Kopi tinggal di-scan.
                            </em>
                        </h2>
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <button
                                type="button"
                                onClick={handleOrderNow}
                                className="rounded-full bg-cream-100 px-8 py-4 text-sm font-semibold text-navy-900 shadow-lg transition hover:bg-cream-200"
                            >
                                Pesan Sekarang
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/menu')}
                                className="rounded-full border border-cream-300 px-8 py-4 text-sm font-medium text-cream-100 transition hover:bg-white/10"
                            >
                                Lihat Menu →
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <style>{`
                .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.75s ease, transform 0.75s ease; }
                .reveal.visible { opacity: 1; transform: translateY(0); }
                .marquee-strip { position: relative; overflow: hidden; }
                .marquee-track { display: inline-flex; animation: marquee 28s linear infinite; }
                .marquee-track span:last-child { margin-right: 3rem; }
                @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
                .grain-pattern { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath fill='none' stroke='%23ffffff' stroke-opacity='0.06' d='M0 20h120M0 40h120M0 60h120M0 80h120M0 100h120'/%3E%3C/svg%3E"); }
            `}</style>
        </div>
    );
}
