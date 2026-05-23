import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShoppingCartIcon,
    MagnifyingGlassIcon,
    BellIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightIcon,
    HomeIcon,
    ClipboardDocumentListIcon,
    ArrowLeftOnRectangleIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Menu() {
    // --- Data & State ---
    const [categories, setCategories] = useState([]);
    const [menus, setMenus] = useState([]);
    const [activecat, setActiveCat] = useState('all');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(true);

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const searchInputRef = useRef(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // --- Logout ---
    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, menuRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/menus'),
                ]);
                setCategories(catRes.data.data);
                setMenus(menuRes.data.data);
            } catch (err) {
                toast.error('Gagal memuat menu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Sync Cart ---
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // --- Filter Menu ---
    const filtered = menus.filter((m) => {
        const matchCat = activecat === 'all' || m.category_id === activecat;
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // --- Cart Functions ---
    const getQty = (id) => cart.find((c) => c.id === id)?.qty || 0;

    const addToCart = (menu) => {
        if (!menu.is_available) return;
        setCart((prev) => {
            const exists = prev.find((c) => c.id === menu.id);
            if (exists)
                return prev.map((c) =>
                    c.id === menu.id ? { ...c, qty: c.qty + 1 } : c,
                );
            return [
                ...prev,
                { id: menu.id, name: menu.name, price: menu.price, qty: 1 },
            ];
        });
        toast.success(`${menu.name} ditambahkan!`);
    };

    const removeFromCart = (id) => {
        setCart((prev) => {
            const exists = prev.find((c) => c.id === id);
            if (exists?.qty === 1) return prev.filter((c) => c.id !== id);
            return prev.map((c) =>
                c.id === id ? { ...c, qty: c.qty - 1 } : c,
            );
        });
    };

    const totalItems = cart.reduce((a, c) => a + c.qty, 0);

    // --- Global Search (Ctrl+K) ---
    const openSearchModal = useCallback(() => {
        setSearchModalOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 10);
    }, []);

    const closeSearchModal = useCallback(() => {
        setSearchModalOpen(false);
        setGlobalSearch('');
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearchModal();
            }
            if (e.key === 'Escape' && searchModalOpen) {
                closeSearchModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchModalOpen, openSearchModal, closeSearchModal]);

    // Pencarian global
    const globalResults = globalSearch
        ? menus.filter(
              (m) =>
                  m.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
                  m.description
                      ?.toLowerCase()
                      .includes(globalSearch.toLowerCase()),
          )
        : [];

    // --- Loading State ---
    if (loading)
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    // --- Render ---
    return (
        <div className="min-h-screen bg-cream-100 flex">
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ========== SIDEBAR (FIXED) ========== */}
            <aside
                className={`flex flex-col w-[280px] shrink-0 h-screen fixed inset-y-0 left-0 z-50 bg-white border-r border-cream-300 transform transition-transform duration-300 overflow-y-auto
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between border-b border-cream-300 h-[90px] px-5 gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-navy-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                            <SparklesIcon className="w-6 h-6 text-cream-200" />
                        </div>
                        <h1 className="font-playfair font-bold text-xl text-navy-900 tracking-tight">
                            Hush <span className="text-cream-600">&</span> Co.
                        </h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden size-11 flex shrink-0 bg-white rounded-xl p-[10px] items-center justify-center ring-1 ring-cream-300 hover:ring-navy-800 transition-all duration-300 cursor-pointer"
                    >
                        <XMarkIcon className="size-6 text-navy-400" />
                    </button>
                </div>

                {/* Navigasi */}
                <div className="flex flex-col p-5 gap-6 overflow-y-auto flex-1">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-medium text-xs text-navy-400 uppercase tracking-wider px-2">
                            Main Menu
                        </h3>
                        <div className="flex flex-col gap-1">
                            <Link
                                to="/dashboard"
                                className="group cursor-pointer"
                            >
                                <div className="flex items-center rounded-2xl p-4 gap-3 bg-white hover:bg-cream-200 transition-all duration-300">
                                    <HomeIcon className="size-6 text-navy-400 group-hover:text-navy-900 transition-all" />
                                    <span className="font-medium text-navy-400 group-hover:text-navy-900 transition-all">
                                        Dashboard
                                    </span>
                                </div>
                            </Link>
                            <Link
                                to="/menu"
                                className="group active cursor-pointer"
                            >
                                <div className="flex items-center rounded-2xl p-4 gap-3 bg-cream-200 transition-all duration-300">
                                    <ClipboardDocumentListIcon className="size-6 text-navy-800" />
                                    <span className="font-bold text-navy-900">
                                        Menu
                                    </span>
                                </div>
                            </Link>
                            <Link to="/orders" className="group cursor-pointer">
                                <div className="flex items-center rounded-2xl p-4 gap-3 bg-white hover:bg-cream-200 transition-all duration-300">
                                    <ShoppingCartIcon className="size-6 text-navy-400 group-hover:text-navy-900 transition-all" />
                                    <span className="font-medium text-navy-400 group-hover:text-navy-900 transition-all">
                                        Riwayat Pesanan
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="p-5 border-t border-cream-300 bg-white shrink-0">
                    <div className="flex items-center justify-between p-3 rounded-2xl ring-1 ring-cream-300 hover:ring-red-400/50 hover:bg-red-50/50 transition-all duration-300 cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-full bg-navy-800 flex items-center justify-center text-cream-200 font-bold text-sm shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-navy-900 truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs font-medium text-navy-400 truncate">
                                    {user?.role || 'Customer'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="size-8 rounded-xl bg-white flex items-center justify-center shrink-0 hover:bg-red-50 transition-colors"
                            title="Logout"
                        >
                            <ArrowLeftOnRectangleIcon className="size-4 text-navy-400 hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ========== MAIN CONTENT (SCROLLABLE) ========== */}
            <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen w-full">
                {/* Header */}
                <header className="flex items-center justify-between w-full h-[90px] shrink-0 border-b border-cream-300 bg-white px-5 md:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden size-11 flex items-center justify-center rounded-xl ring-1 ring-cream-300 hover:ring-navy-800 transition-all duration-300 cursor-pointer"
                        >
                            <Bars3Icon className="size-6 text-navy-900" />
                        </button>
                        <div>
                            <h2 className="font-playfair font-bold text-2xl text-navy-900 hidden sm:block">
                                Menu
                            </h2>
                            <p className="text-sm text-navy-400 font-medium hidden sm:block">
                                Pilih yang terbaik untukmu
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Tombol Search (Ctrl+K) */}
                        <button
                            onClick={openSearchModal}
                            className="size-11 flex items-center justify-center rounded-xl ring-1 ring-cream-300 hover:ring-navy-800 transition-all duration-300 cursor-pointer bg-cream-100/50"
                            title="Cari (Ctrl+K)"
                        >
                            <MagnifyingGlassIcon className="size-5 text-navy-900" />
                        </button>

                        {/* Notifikasi */}
                        <button
                            className="size-11 flex items-center justify-center rounded-xl ring-1 ring-cream-300 hover:ring-navy-800 transition-all duration-300 cursor-pointer relative bg-cream-100/50"
                            title="Notifikasi"
                        >
                            <BellIcon className="size-5 text-navy-900" />
                            <span className="absolute top-2 right-2 size-2.5 rounded-full bg-red-500 border-2 border-white" />
                        </button>

                        {/* Keranjang (mobile) */}
                        <button
                            onClick={() => navigate('/cart')}
                            className="flex sm:hidden items-center justify-center gap-2 px-4 py-2.5 bg-navy-800 text-cream-200 rounded-full font-bold hover:bg-navy-900 transition-all duration-300 cursor-pointer shadow-sm relative"
                        >
                            <ShoppingCartIcon className="size-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-cream-400 text-navy-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {/* Keranjang (desktop) */}
                        <button
                            onClick={() => navigate('/cart')}
                            className="hidden sm:flex items-center justify-center gap-2 px-5 py-2.5 bg-navy-800 text-cream-200 rounded-full font-bold hover:bg-navy-900 transition-all duration-300 cursor-pointer shadow-sm"
                        >
                            <ShoppingCartIcon className="size-5" />
                            <span>Keranjang</span>
                            {totalItems > 0 && (
                                <span className="bg-cream-400 text-navy-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Area Konten Scrollable */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8">
                    {/* Banner */}
                    <div className="bg-navy-800 rounded-3xl px-6 md:px-10 py-10 mb-8 shadow-md">
                        <p className="text-cream-400 text-xs font-medium tracking-widest uppercase mb-2">
                            Menu Hush & Co.
                        </p>
                        <h1 className="font-playfair text-3xl font-medium text-cream-200 mb-2">
                            Pilih yang{' '}
                            <em className="italic text-cream-400">terbaik</em>{' '}
                            untukmu
                        </h1>
                        <p className="text-navy-200 text-sm">
                            Semua dibuat segar setiap hari.
                        </p>
                    </div>

                    <div className="flex gap-8">
                        {/* Sidebar Kategori (desktop) */}
                        <aside className="hidden md:block w-52 flex-shrink-0">
                            <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-3">
                                Kategori
                            </p>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => setActiveCat('all')}
                                    className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                                        activecat === 'all'
                                            ? 'bg-navy-100 text-navy-800 font-medium'
                                            : 'text-navy-400 hover:bg-cream-200 hover:text-navy-800'
                                    }`}
                                >
                                    ✦ Semua Menu
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCat(cat.id)}
                                        className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                                            activecat === cat.id
                                                ? 'bg-navy-100 text-navy-800 font-medium'
                                                : 'text-navy-400 hover:bg-cream-200 hover:text-navy-800'
                                        }`}
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* Konten Utama */}
                        <div className="flex-1">
                            {/* Pencarian lokal */}
                            <div className="relative mb-6">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-navy-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari menu..."
                                    className="w-full max-w-sm pl-10 pr-4 py-2.5 bg-white border border-cream-300 rounded-xl text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                                />
                            </div>

                            {/* Kategori di mobile */}
                            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                                <button
                                    onClick={() => setActiveCat('all')}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                        activecat === 'all'
                                            ? 'bg-navy-800 text-cream-200'
                                            : 'bg-white text-navy-400 border border-cream-300'
                                    }`}
                                >
                                    Semua
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCat(cat.id)}
                                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                            activecat === cat.id
                                                ? 'bg-navy-800 text-cream-200'
                                                : 'bg-white text-navy-400 border border-cream-300'
                                        }`}
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Menu Grid */}
                            {filtered.length === 0 ? (
                                <div className="text-center py-16 text-navy-400">
                                    <p className="text-5xl mb-3">☕</p>
                                    <p className="font-medium">
                                        Menu tidak ditemukan
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filtered.map((menu) => (
                                        <div
                                            key={menu.id}
                                            className={`bg-white border border-cream-300 rounded-2xl overflow-hidden transition hover:-translate-y-1 hover:shadow-lg ${
                                                !menu.is_available
                                                    ? 'opacity-50'
                                                    : ''
                                            }`}
                                        >
                                            {/* Image area */}
                                            <div className="relative h-40 w-full overflow-hidden bg-cream-100 flex items-center justify-center text-5xl">
                                                {menu.image ? (
                                                    <img
                                                        src={`http://localhost:8000/storage/${menu.image}`}
                                                        alt={menu.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`w-full h-full flex items-center justify-center
                                                        ${
                                                            menu.category?.slug ===
                                                            'signature'
                                                                ? 'bg-gradient-to-br from-navy-800 to-navy-600 text-cream-200'
                                                                : menu.category
                                                                        ?.slug ===
                                                                    'coffee'
                                                                  ? 'bg-gradient-to-br from-navy-900 to-navy-800 text-cream-200'
                                                                  : menu.category
                                                                          ?.slug ===
                                                                      'non-coffee'
                                                                    ? 'bg-gradient-to-br from-navy-600 to-navy-400 text-cream-200'
                                                                    : 'bg-gradient-to-br from-cream-600 to-cream-400 text-cream-800'
                                                        }`}
                                                    >
                                                        {menu.category?.icon || '☕'}
                                                    </div>
                                                )}
                                                {!menu.is_available && (
                                                    <div className="absolute inset-0 bg-cream-100/60 flex items-center justify-center z-10">
                                                        <span className="text-xs font-medium text-navy-800 uppercase tracking-widest px-3 py-1 bg-white/95 rounded-full shadow-sm">
                                                            Habis
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Body */}
                                            <div className="p-4">
                                                <p className="text-xs font-medium tracking-widest uppercase text-cream-600 mb-1">
                                                    {menu.category?.name}
                                                </p>
                                                <h3 className="font-playfair text-lg font-medium text-navy-900 mb-1">
                                                    {menu.name}
                                                </h3>
                                                <p className="text-xs text-navy-400 leading-relaxed mb-4">
                                                    {menu.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-navy-800">
                                                        Rp{' '}
                                                        {menu.price.toLocaleString(
                                                            'id',
                                                        )}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {getQty(menu.id) >
                                                            0 && (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        removeFromCart(
                                                                            menu.id,
                                                                        )
                                                                    }
                                                                    className="w-7 h-7 rounded-full border border-cream-300 bg-white text-navy-800 text-base flex items-center justify-center hover:bg-cream-200 transition"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="text-sm font-medium text-navy-800 w-5 text-center">
                                                                    {getQty(
                                                                        menu.id,
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                addToCart(menu)
                                                            }
                                                            disabled={
                                                                !menu.is_available
                                                            }
                                                            className="w-7 h-7 rounded-full bg-navy-800 text-cream-200 text-base flex items-center justify-center hover:bg-navy-900 transition disabled:opacity-40"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ========== SEARCH MODAL (Ctrl+K) ========== */}
            {searchModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeSearchModal();
                    }}
                >
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-cream-300 shrink-0">
                            <div className="flex items-center gap-3 bg-cream-100/50 rounded-2xl px-4 ring-1 ring-cream-300 focus-within:ring-navy-800 transition-all">
                                <MagnifyingGlassIcon className="size-5 text-navy-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={globalSearch}
                                    onChange={(e) =>
                                        setGlobalSearch(e.target.value)
                                    }
                                    placeholder="Cari menu, kategori..."
                                    className="flex-1 py-4 bg-transparent outline-none text-navy-900 font-medium placeholder:text-navy-400"
                                />
                                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-bold text-navy-400 border border-cream-300 shadow-sm">
                                    ESC
                                </kbd>
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            {globalSearch && globalResults.length > 0 ? (
                                <>
                                    <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-3 px-2">
                                        Hasil Pencarian
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        {globalResults
                                            .slice(0, 8)
                                            .map((menu) => (
                                                <button
                                                    key={menu.id}
                                                    onClick={() => {
                                                        setSearch(menu.name);
                                                        setActiveCat('all');
                                                        closeSearchModal();
                                                    }}
                                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-cream-100 transition-all cursor-pointer group"
                                                >
                                                    <div className="size-10 bg-navy-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-navy-200 transition-colors">
                                                        <span className="text-lg">
                                                            {menu.category
                                                                ?.icon || '☕'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <p className="font-bold text-navy-900 truncate">
                                                            {menu.name}
                                                        </p>
                                                        <p className="text-xs font-medium text-navy-400 truncate">
                                                            {
                                                                menu.category
                                                                    ?.name
                                                            }{' '}
                                                            • Rp{' '}
                                                            {menu.price.toLocaleString(
                                                                'id',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <ArrowRightIcon className="size-4 text-navy-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                    </div>
                                </>
                            ) : globalSearch ? (
                                <div className="text-center py-8 text-navy-400">
                                    <p className="text-4xl mb-2">🔍</p>
                                    <p className="font-medium">
                                        Tidak ditemukan
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-3 px-2">
                                        Menu Populer
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        {menus.slice(0, 5).map((menu) => (
                                            <button
                                                key={menu.id}
                                                onClick={() => {
                                                    setSearch(menu.name);
                                                    setActiveCat('all');
                                                    closeSearchModal();
                                                }}
                                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-cream-100 transition-all cursor-pointer group"
                                            >
                                                <div className="size-10 bg-navy-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-navy-200 transition-colors">
                                                    <span className="text-lg">
                                                        {menu.category?.icon ||
                                                            '☕'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="font-bold text-navy-900 truncate">
                                                        {menu.name}
                                                    </p>
                                                    <p className="text-xs font-medium text-navy-400 truncate">
                                                        {menu.category?.name}
                                                    </p>
                                                </div>
                                                <ArrowRightIcon className="size-4 text-navy-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
