import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    BellIcon,
    Bars3Icon,
    ShoppingBagIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AdminHeader({
    title,
    subtitle,
    headerActions,
    onOpenSearch,
    onOpenSidebar,
}) {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    
    // Load read notification IDs from localStorage
    const [readIds, setReadIds] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_read_notifications');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Save read IDs to localStorage
    useEffect(() => {
        localStorage.setItem('admin_read_notifications', JSON.stringify(readIds));
    }, [readIds]);

    const prevIdsRef = useRef([]);

    // Fetch pending orders and stock status
    const fetchNotifications = async () => {
        try {
            const [ordersRes, menusRes] = await Promise.all([
                api.get('/staff/orders?status=pending'),
                api.get('/menus'),
            ]);

            const pendingOrders = ordersRes.data.data || [];
            const allMenus = menusRes.data.data || [];

            const list = [];

            // 1. Pending orders
            pendingOrders.forEach((order) => {
                list.push({
                    id: `order-${order.id}`,
                    type: 'order',
                    title: 'Pesanan Baru ☕',
                    message: `Order #HSH-${String(order.id).padStart(4, '0')} (${
                        order.order_type === 'dine-in' ? 'Dine-in' : 'Takeaway'
                    }) senilai Rp ${order.total_price?.toLocaleString('id')}`,
                    time: new Date(order.created_at),
                    link: '/admin',
                });
            });

            // 2. Out of stock menus
            allMenus.forEach((menu) => {
                if (!menu.is_available) {
                    list.push({
                        id: `menu-${menu.id}`,
                        type: 'stock',
                        title: 'Stok Habis ⚠️',
                        message: `Menu "${menu.name}" ditandai sebagai tidak tersedia.`,
                        time: new Date(menu.updated_at || new Date()),
                        link: '/admin/menus',
                    });
                }
            });

            // Sort by time descending
            list.sort((a, b) => b.time - a.time);
            setNotifications(list);
        } catch (err) {
            console.error('Gagal memuat data notifikasi', err);
        }
    };

    // Polling for updates
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 12000);
        return () => clearInterval(interval);
    }, []);

    // Push premium dark toast for new unseen notifications
    useEffect(() => {
        const currentIds = notifications.map((n) => n.id);
        const newNotifications = notifications.filter(
            (n) => !prevIdsRef.current.includes(n.id) && !readIds.includes(n.id),
        );

        if (prevIdsRef.current.length > 0 && newNotifications.length > 0) {
            newNotifications.forEach((n) => {
                toast(n.message, {
                    icon: n.type === 'order' ? '☕' : '⚠️',
                    duration: 5000,
                    style: {
                        borderRadius: '20px',
                        background: '#0F172A',
                        color: '#FDFBF7',
                        border: '1px solid #E2D4C9',
                    },
                });
            });
        }
        prevIdsRef.current = currentIds;
    }, [notifications, readIds]);

    // Handle click outside dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter unread
    const unreadNotifications = notifications.filter((n) => !readIds.includes(n.id));
    const unreadCount = unreadNotifications.length;

    const handleNotificationClick = (item) => {
        if (!readIds.includes(item.id)) {
            setReadIds((prev) => [...prev, item.id]);
        }
        setIsOpen(false);
        navigate(item.link);
    };

    const markAllRead = () => {
        const allIds = notifications.map((n) => n.id);
        setReadIds(allIds);
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Baru saja';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m yang lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}j yang lalu`;
        return date.toLocaleDateString('id', { day: 'numeric', month: 'short' });
    };

    return (
        <header className="bg-cream-50 border-b border-cream-200 px-5 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenSidebar}
                    className="lg:hidden w-11 h-11 rounded-2xl bg-white border border-cream-200 text-navy-700 flex items-center justify-center transition hover:border-navy-300"
                    aria-label="Open sidebar"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <div className="min-w-0">
                    <p className="hidden md:block text-[10px] sm:text-xs uppercase tracking-[.22em] text-navy-500 font-medium truncate leading-tight mb-0.5">
                        {subtitle}
                    </p>
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-navy-900 truncate leading-tight">
                        {title}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 justify-end shrink-0">
                <button
                    type="button"
                    onClick={onOpenSearch}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cream-200 bg-white p-2.5 sm:px-4 sm:py-3 text-sm font-medium text-navy-700 hover:border-navy-300 transition"
                    title="Cari"
                >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Cari</span>
                </button>
                
                {headerActions}
                
                {/* Notification Dropdown Container */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`relative inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-navy-700 hover:border-navy-300 transition ${
                            isOpen ? 'border-navy-400 bg-navy-50/50' : 'border-cream-200'
                        }`}
                    >
                        <BellIcon className="w-5 h-5 animate-none" />
                        <span className="hidden sm:inline">Notifikasi</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white/95 backdrop-blur-md border border-cream-300 shadow-xl overflow-hidden z-50 origin-top-right"
                            >
                                <div className="p-5 border-b border-cream-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-navy-900 text-sm">Notifikasi</h3>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                                                {unreadCount} baru
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-xs text-navy-500 hover:text-navy-950 font-semibold transition"
                                        >
                                            Tandai semua dibaca
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-navy-400 text-xs font-medium">
                                            🔔 Tidak ada notifikasi aktif saat ini.
                                        </div>
                                    ) : (
                                        notifications.map((item) => {
                                            const isRead = readIds.includes(item.id);
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleNotificationClick(item)}
                                                    className={`w-full text-left p-4 flex gap-3 hover:bg-cream-50 transition border-none outline-none ${
                                                        !isRead ? 'bg-navy-50/20' : ''
                                                    }`}
                                                >
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                        item.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {item.type === 'order' ? (
                                                            <ShoppingBagIcon className="w-5 h-5" />
                                                        ) : (
                                                            <ExclamationTriangleIcon className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                                            <p className="text-xs font-bold text-navy-800 truncate">{item.title}</p>
                                                            <p className="text-[10px] text-navy-400 whitespace-nowrap shrink-0">{formatTimeAgo(item.time)}</p>
                                                        </div>
                                                        <p className="text-xs text-navy-500 leading-relaxed font-medium line-clamp-2">{item.message}</p>
                                                    </div>

                                                    {!isRead && (
                                                        <div className="w-2 h-2 rounded-full bg-blue-600 self-center shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
