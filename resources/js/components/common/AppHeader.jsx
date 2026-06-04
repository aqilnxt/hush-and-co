import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bars3Icon,
    BellIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function AppHeader({
    title,
    subtitle,
    onOpenSidebar,
    showSearch = false,
    onOpenSearch,
    searchLabel = 'Cari',
    headerActions = null,
    showTime = false,
    timeText = '',
    notifications = [],
    notificationOpen = false,
    onToggleNotifications,
    onCloseNotifications,
    onSelectNotification,
    onMarkAllRead,
    unreadCount = 0,
    searchQuery = '',
    searchResults = [],
    onSearchSelect,
}) {
    const notificationRef = useRef(null);

    useEffect(() => {
        if (!notificationOpen || !notificationRef.current) return;

        function handleClickOutside(event) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                onCloseNotifications?.();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [notificationOpen, onCloseNotifications]);

    return (
        <header className="bg-white border-b border-cream-300 px-5 h-[90px] flex items-center gap-3 lg:justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3 min-w-0 h-full">
                <button
                    type="button"
                    onClick={onOpenSidebar}
                    className="lg:hidden w-11 h-11 rounded-2xl bg-white border border-cream-200 text-navy-700 flex items-center justify-center transition hover:border-navy-300"
                    aria-label="Open sidebar"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.22em] text-navy-500 font-medium truncate leading-tight">
                        {subtitle}
                    </p>
                    <h1 className="text-lg sm:text-xl font-semibold text-navy-900 truncate leading-tight">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end">
                {showSearch && (
                    <button
                        type="button"
                        onClick={onOpenSearch}
                        className="inline-flex items-center gap-2 rounded-2xl border border-cream-200 bg-white px-4 py-3 text-sm font-medium text-navy-700 hover:border-navy-300 transition"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        {searchLabel}
                    </button>
                )}

                {headerActions}

                {typeof onToggleNotifications === 'function' && (
                    <div className="relative" ref={notificationRef}>
                        <button
                            type="button"
                            onClick={onToggleNotifications}
                            className={`relative inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-navy-700 hover:border-navy-300 transition ${notificationOpen ? 'border-navy-400 bg-navy-50/50' : 'border-cream-200'}`}
                        >
                            <BellIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Notifikasi</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {notificationOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-cream-300 shadow-xl overflow-hidden z-50"
                                >
                                    <div className="p-5 border-b border-cream-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-navy-900 text-sm">
                                                Notifikasi
                                            </p>
                                            {unreadCount > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                                                    {unreadCount} baru
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={onMarkAllRead}
                                                className="text-xs text-navy-500 hover:text-navy-900 font-semibold transition"
                                            >
                                                Tandai semua dibaca
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-navy-400 text-xs font-medium">
                                                🔔 Tidak ada notifikasi saat
                                                ini.
                                            </div>
                                        ) : (
                                            notifications.map((item) => {
                                                const isRead = item.read;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() =>
                                                            onSelectNotification?.(
                                                                item,
                                                            )
                                                        }
                                                        className={`w-full text-left p-4 flex gap-3 hover:bg-cream-50 transition ${!isRead ? 'bg-navy-50/20' : ''}`}
                                                    >
                                                        <div
                                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}
                                                        >
                                                            {item.type ===
                                                            'order'
                                                                ? '☕'
                                                                : '⚠️'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-navy-900 truncate">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-xs text-navy-500 mt-1 line-clamp-2">
                                                                {item.message}
                                                            </p>
                                                            <p className="text-[11px] text-navy-400 mt-2">
                                                                {item.timeLabel}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {showTime && (
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-cream-100 border border-cream-300 text-xs text-navy-400">
                        {timeText}
                    </div>
                )}
            </div>
        </header>
    );
}
