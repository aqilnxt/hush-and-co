import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Menu() {
    const [categories, setCategories] = useState([]);
    const [menus, setMenus] = useState([]);
    const [activecat, setActiveCat] = useState('all');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(true);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Fetch data
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

    // Sync cart ke localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Filter menu
    const filtered = menus.filter((m) => {
        const matchCat = activecat === 'all' || m.category_id === activecat;
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // Cart functions
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

    if (loading)
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="min-h-screen bg-cream-100">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-cream-100/90 backdrop-blur border-b border-cream-300 px-6 md:px-12 h-16 flex items-center justify-between">
                <span className="font-playfair text-xl font-medium text-navy-800">
                    Hush <span className="text-cream-600">&</span> Co.
                </span>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="text-sm text-navy-400 hover:text-navy-800 transition"
                    >
                        Riwayat
                    </button>
                    <span className="text-sm text-navy-800">{user?.name}</span>
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative bg-navy-800 text-cream-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-navy-900 transition"
                    >
                        <ShoppingCartIcon className="w-4 h-4" />
                        Keranjang
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-cream-400 text-navy-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* HERO BANNER */}
            <div className="bg-navy-800 px-6 md:px-12 py-10">
                <p className="text-cream-400 text-xs font-medium tracking-widest uppercase mb-2">
                    Menu Hush & Co.
                </p>
                <h1 className="font-playfair text-3xl font-medium text-cream-200 mb-2">
                    Pilih yang{' '}
                    <em className="italic text-cream-400">terbaik</em> untukmu
                </h1>
                <p className="text-navy-200 text-sm">
                    Semua dibuat segar setiap hari.
                </p>
            </div>

            <div className="flex px-6 md:px-12 gap-8 py-8">
                {/* SIDEBAR */}
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

                {/* CONTENT */}
                <div className="flex-1">
                    {/* SEARCH */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari menu..."
                            className="w-full max-w-sm pl-10 pr-4 py-2.5 bg-white border border-cream-300 rounded-xl text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 placeholder-navy-200 transition"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">
                            🔍
                        </span>
                    </div>

                    {/* MENU GRID */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-navy-400">
                            <p className="text-4xl mb-3">☕</p>
                            <p>Menu tidak ditemukan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((menu) => (
                                <div
                                    key={menu.id}
                                    className={`bg-white border border-cream-300 rounded-2xl overflow-hidden transition hover:-translate-y-1 hover:shadow-lg ${
                                        !menu.is_available ? 'opacity-50' : ''
                                    }`}
                                >
                                    {/* Image */}
                                    <div
                                        className={`h-40 flex items-center justify-center text-5xl
                                        ${
                                            menu.category?.slug === 'signature'
                                                ? 'bg-gradient-to-br from-navy-800 to-navy-600'
                                                : menu.category?.slug ===
                                                    'coffee'
                                                  ? 'bg-gradient-to-br from-navy-900 to-navy-800'
                                                  : menu.category?.slug ===
                                                      'non-coffee'
                                                    ? 'bg-gradient-to-br from-navy-600 to-navy-400'
                                                    : 'bg-gradient-to-br from-cream-600 to-cream-400'
                                        }`}
                                    >
                                        {menu.category?.icon || '☕'}
                                        {!menu.is_available && (
                                            <div className="absolute inset-0 bg-cream-100/60 flex items-center justify-center">
                                                <span className="text-xs font-medium text-navy-400 uppercase tracking-widest">
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
                                                {getQty(menu.id) > 0 && (
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
                                                            {getQty(menu.id)}
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
    );
}
