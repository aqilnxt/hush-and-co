import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
    ShoppingBagIcon,
    ShoppingCartIcon,
    ClipboardDocumentListIcon,
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function CustomerLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [cartCount, setCartCount] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            const parsed = saved ? JSON.parse(saved) : [];
            return parsed.reduce((a, c) => a + (c.qty || 0), 0);
        } catch (e) {
            return 0;
        }
    });

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
        // storage for other tabs
        window.addEventListener('storage', handleCartChange);
        return () => {
            window.removeEventListener('cartchange', handleCartChange);
            window.removeEventListener('storage', handleCartChange);
        };
    }, []);

    const currentPath = location.pathname.startsWith('/orders/')
        ? '/orders/:id'
        : location.pathname;

    const navItems = [
        {
            path: '/menu',
            label: 'Menu',
            icon: ShoppingBagIcon,
            active: currentPath === '/menu',
        },
        {
            path: '/cart',
            label: 'Keranjang',
            icon: ShoppingCartIcon,
            active: currentPath === '/cart',
            badge: cartCount > 0 ? cartCount : undefined,
        },
        ...(user
            ? [
                  {
                      path: '/orders',
                      label: 'Riwayat',
                      icon: ClipboardDocumentListIcon,
                      active:
                          currentPath === '/orders' ||
                          currentPath === '/orders/:id',
                  },
                  {
                      path: '/profile',
                      label: 'Profil',
                      icon: UserCircleIcon,
                      active: currentPath === '/profile',
                  },
              ]
            : []),
    ];

    const openMenuSearch = () => {
        window.dispatchEvent(new Event('open-menu-search'));
    };

    const guestAction = !user ? (
        <button
            onClick={() => navigate('/login')}
            className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:border-navy-400 hover:text-navy-900 transition"
        >
            Masuk untuk riwayat & poin
        </button>
    ) : null;

    const routeMeta = {
        '/menu': {
            title: 'Menu',
            subtitle: 'Pilih sajian favoritmu dan langsung pesan.',
            action: (
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={openMenuSearch}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:border-navy-400 hover:text-navy-900 transition"
                        title="Cari menu"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        Cari Menu
                    </button>
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative inline-flex items-center gap-2 rounded-full bg-navy-800 px-4 py-2 text-sm font-semibold text-cream-100 hover:bg-navy-900 transition"
                    >
                        <ShoppingCartIcon className="w-5 h-5" />
                        Keranjang
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cream-100 px-1 text-xs font-bold text-navy-900">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            ),
        },
        '/cart': {
            title: 'Keranjang',
            subtitle: 'Periksa pesananmu sebelum lanjut checkout.',
            action: guestAction,
        },
        '/checkout': {
            title: 'Checkout',
            subtitle: 'Lengkapi informasi agar pesanan segera diproses.',
            action: (
                <button
                    onClick={() => navigate('/cart')}
                    className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:border-navy-400 hover:text-navy-900 transition"
                >
                    Kembali ke Keranjang
                </button>
            ),
        },
        '/orders': {
            title: 'Riwayat Pesanan',
            subtitle: 'Lihat status pesananmu kapan saja.',
            action: (
                <button
                    onClick={() => navigate('/menu')}
                    className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:border-navy-400 hover:text-navy-900 transition"
                >
                    Kembali ke Menu
                </button>
            ),
        },
        '/orders/:id': {
            title: 'Detail Pesanan',
            subtitle: 'Detail pesanan lengkap dan status terkini.',
            action: (
                <button
                    onClick={() => navigate('/orders')}
                    className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:border-navy-400 hover:text-navy-900 transition"
                >
                    Kembali ke Riwayat
                </button>
            ),
        },
        '/profile': {
            title: 'Profil',
            subtitle: 'Lihat detail akun dan informasi profil.',
            action: (
                <button
                    onClick={() => navigate('/menu')}
                    className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:border-navy-400 hover:text-navy-900 transition"
                >
                    Kembali ke Menu
                </button>
            ),
        },
    };

    const route = routeMeta[currentPath] || routeMeta['/menu'];

    return (
        <DashboardLayout
            title={route.title}
            subtitle={route.subtitle}
            navItems={navItems}
            searchItems={[]}
            showSearch={false}
            showTime={false}
            logoPath="/"
            headerActions={route.action}
        />
    );
}
