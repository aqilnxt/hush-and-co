import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCartIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api, { backendBaseUrl } from '../../api/axios';

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
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const searchInputRef = useRef(null);

    const navigate = useNavigate();

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
        const exists = cart.find((c) => c.id === menu.id);
        let newCart;
        if (exists) {
            newCart = cart.map((c) =>
                c.id === menu.id ? { ...c, qty: c.qty + 1 } : c,
            );
        } else {
            newCart = [
                ...cart,
                { id: menu.id, name: menu.name, price: menu.price, qty: 1 },
            ];
        }
        setCart(newCart);
        try {
            localStorage.setItem('cart', JSON.stringify(newCart));
        } catch (e) {}
        const total = newCart.reduce((a, c) => a + (c.qty || 0), 0);
        window.dispatchEvent(
            new CustomEvent('cartchange', { detail: { count: total } }),
        );
        toast.success(`${menu.name} ditambahkan!`);
    };

    const removeFromCart = (id) => {
        const exists = cart.find((c) => c.id === id);
        let newCart;
        if (exists?.qty === 1) {
            newCart = cart.filter((c) => c.id !== id);
        } else {
            newCart = cart.map((c) =>
                c.id === id ? { ...c, qty: c.qty - 1 } : c,
            );
        }
        setCart(newCart);
        try {
            localStorage.setItem('cart', JSON.stringify(newCart));
        } catch (e) {}
        const total = newCart.reduce((a, c) => a + (c.qty || 0), 0);
        window.dispatchEvent(
            new CustomEvent('cartchange', { detail: { count: total } }),
        );
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

    useEffect(() => {
        const handleOpenSearch = () => openSearchModal();
        window.addEventListener('open-menu-search', handleOpenSearch);
        return () =>
            window.removeEventListener('open-menu-search', handleOpenSearch);
    }, [openSearchModal]);

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
        <div className="min-h-screen overflow-y-auto bg-cream-100">
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex-1 overflow-y-auto">
                    {/* Banner */}
                    <div className="bg-navy-800 rounded-3xl px-5 py-8 sm:px-8 sm:py-10 mb-8 shadow-md">
                        <p className="text-cream-400 text-[0.6rem] font-medium tracking-[0.35em] uppercase mb-2">
                            Menu Hush & Co.
                        </p>
                        <h1 className="font-playfair text-2xl font-semibold text-cream-200 mb-2 sm:text-3xl">
                            Pilih yang{' '}
                            <em className="italic text-cream-400">terbaik</em>{' '}
                            untukmu
                        </h1>
                        <p className="text-cream-200/80 text-sm sm:text-base max-w-xl">
                            Semua dibuat segar setiap hari.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Sidebar Kategori (desktop) */}
                        <aside className="hidden md:block w-52 shrink-0">
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
                                    className="w-full max-w-full sm:max-w-sm pl-10 pr-4 py-3 bg-white border border-cream-300 rounded-2xl text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                                        src={`${backendBaseUrl}/storage/${menu.image}`}
                                                        alt={menu.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`w-full h-full flex items-center justify-center
                                                        ${
                                                            menu.category
                                                                ?.slug ===
                                                            'signature'
                                                                ? 'bg-linear-to-br from-navy-800 to-navy-600 text-cream-200'
                                                                : menu.category
                                                                        ?.slug ===
                                                                    'coffee'
                                                                  ? 'bg-linear-to-br from-navy-900 to-navy-800 text-cream-200'
                                                                  : menu
                                                                          .category
                                                                          ?.slug ===
                                                                      'non-coffee'
                                                                    ? 'bg-linear-to-br from-navy-600 to-navy-400 text-cream-200'
                                                                    : 'bg-linear-to-br from-cream-600 to-cream-400 text-cream-800'
                                                        }`}
                                                    >
                                                        {menu.category?.icon ||
                                                            '☕'}
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
                    className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-4 backdrop-blur-sm"
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
