import React, { useState, useEffect, useMemo, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import toast from 'react-hot-toast';

import api from '../../api/axios';

import { useAuth } from '../../context/AuthContext';

import {
    QueueListIcon,
    BellAlertIcon,
    FireIcon,
    CheckBadgeIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon,
    UserCircleIcon,
    ShoppingBagIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    BanknotesIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';

export default function StaffDashboard() {
    const { user, logout } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const [profileOpen, setProfileOpen] = useState(false);

    const [time, setTime] = useState(new Date());

    const profileRef = useRef(null);

    const firstLoad = useRef(true);

    // =========================
    // FETCH ORDERS
    // =========================

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(fetchOrders, 5000);

        const clock = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(clock);
        };
    }, []);

    async function fetchOrders() {
        try {
            const res = await api.get('/staff/orders');

            const newOrders = res.data.data;

            // detect new order
            if (!firstLoad.current) {
                const existingIds = orders.map((o) => o.id);

                const incoming = newOrders.filter(
                    (o) => !existingIds.includes(o.id),
                );

                if (incoming.length > 0) {
                    toast.success(`${incoming.length} order baru masuk 🔥`);
                }
            }

            firstLoad.current = false;

            setOrders(newOrders);
        } catch (err) {
            toast.error('Gagal memuat order');
        } finally {
            setLoading(false);
        }
    }

    // =========================
    // UPDATE STATUS
    // =========================

    async function updateStatus(id, status) {
        try {
            await api.patch(`/orders/${id}/status`, {
                status,
            });

            setOrders((prev) =>
                prev.map((o) =>
                    o.id === id
                        ? {
                              ...o,
                              status,
                          }
                        : o,
                ),
            );

            toast.success(`Order ${status}`);
        } catch {
            toast.error('Gagal update status');
        }
    }

    // =========================
    // PAYMENT
    // =========================

    async function confirmPayment(id) {
        try {
            await api.patch(`/orders/${id}/payment`);

            setOrders((prev) =>
                prev.map((o) =>
                    o.id === id
                        ? {
                              ...o,
                              payment_status: 'paid',
                          }
                        : o,
                ),
            );

            toast.success('Pembayaran dikonfirmasi');
        } catch {
            toast.error('Gagal konfirmasi pembayaran');
        }
    }

    // =========================
    // OUTSIDE CLICK
    // =========================

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // =========================
    // FILTERING
    // =========================

    const filteredOrders = useMemo(() => {
        let result = [...orders];

        if (filter === 'dinein') {
            result = result.filter((o) => o.order_type === 'dine-in');
        }

        if (filter === 'takeaway') {
            result = result.filter((o) => o.order_type === 'takeaway');
        }

        if (search) {
            result = result.filter((o) => {
                const keyword = search.toLowerCase();

                return (
                    o.pickup_name?.toLowerCase().includes(keyword) ||
                    o.table?.table_number?.toString().includes(keyword) ||
                    String(o.id).includes(keyword)
                );
            });
        }

        return result;
    }, [orders, filter, search]);

    const pending = useMemo(
        () => filteredOrders.filter((o) => o.status === 'pending'),
        [filteredOrders],
    );

    const diproses = useMemo(
        () => filteredOrders.filter((o) => o.status === 'diproses'),
        [filteredOrders],
    );

    const selesai = useMemo(
        () => filteredOrders.filter((o) => o.status === 'selesai'),
        [filteredOrders],
    );

    // =========================
    // HELPERS
    // =========================

    function formatTime(date) {
        return new Date(date).toLocaleTimeString('id', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function waitingMinutes(order) {
        const created = new Date(order.created_at);

        return Math.floor((Date.now() - created.getTime()) / 60000);
    }

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#071018] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#D6C6A5] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#071018] flex text-white overflow-hidden">
            {/* ========================= */}
            {/* SIDEBAR */}
            {/* ========================= */}

            <aside className="w-72 bg-white/[0.02] border-r border-white/5 backdrop-blur-xl p-6 flex flex-col">
                {/* LOGO */}

                <div className="flex items-center gap-4 mb-12">
                    <div
                        className="
                        w-12 h-12 rounded-2xl
                        bg-gradient-to-br
                        from-[#D6C6A5]
                        to-[#F3E7D0]
                        flex items-center justify-center
                        text-black
                        shadow-lg
                    "
                    >
                        <ShoppingBagIcon className="w-6 h-6" />
                    </div>

                    <div>
                        <h1 className="font-semibold text-xl tracking-wide text-[#F5E9D8]">
                            Hush & Co.
                        </h1>

                        <p className="text-xs text-gray-500 uppercase tracking-[0.25em]">
                            Staff Panel
                        </p>
                    </div>
                </div>

                {/* MENU */}

                <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-4">
                        Dashboard
                    </p>

                    <div
                        className="
                        flex items-center gap-3
                        px-4 py-3
                        rounded-2xl
                        bg-[#D6C6A5]/10
                        border border-[#D6C6A5]/20
                    "
                    >
                        <QueueListIcon className="w-5 h-5 text-[#D6C6A5]" />

                        <span className="text-sm font-medium">Order Queue</span>

                        <span
                            className="
                            ml-auto
                            px-2 py-0.5
                            rounded-full
                            bg-[#D6C6A5]
                            text-black
                            text-[10px]
                            font-bold
                        "
                        >
                            {pending.length}
                        </span>
                    </div>
                </div>

                {/* PROFILE */}

                <div
                    ref={profileRef}
                    className="relative border-t border-white/5 pt-5"
                >
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="
                            w-full flex items-center gap-3
                            hover:bg-white/[0.03]
                            rounded-2xl
                            p-2
                            transition
                        "
                    >
                        <div
                            className="
                            w-10 h-10 rounded-full
                            bg-[#D6C6A5]
                            text-black
                            flex items-center justify-center
                            font-bold
                        "
                        >
                            {user?.name?.[0] || (
                                <UserCircleIcon className="w-6 h-6" />
                            )}
                        </div>

                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{user?.name}</p>

                            <p className="text-xs text-gray-500">Staff</p>
                        </div>

                        <ChevronDownIcon
                            className={`
                                w-4 h-4 text-gray-500 transition
                                ${profileOpen ? 'rotate-180' : ''}
                            `}
                        />
                    </button>

                    <AnimatePresence>
                        {profileOpen && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                className="
                                    absolute bottom-full mb-3
                                    left-0 right-0
                                    rounded-2xl
                                    bg-[#0F1722]
                                    border border-white/10
                                    overflow-hidden
                                    shadow-2xl
                                "
                            >
                                <div className="p-4 border-b border-white/5">
                                    <p className="text-xs text-gray-500">
                                        Signed in as
                                    </p>

                                    <p className="text-sm mt-1">
                                        {user?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={logout}
                                    className="
                                        w-full flex items-center gap-2
                                        px-4 py-3
                                        hover:bg-white/[0.03]
                                        text-sm
                                    "
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </aside>

            {/* ========================= */}
            {/* MAIN */}
            {/* ========================= */}

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOPBAR */}

                <header
                    className="
                    h-16 px-8
                    border-b border-white/5
                    bg-[#0B141D]/70
                    backdrop-blur-xl
                    flex items-center justify-between
                "
                >
                    <h2 className="text-lg font-semibold tracking-wide">
                        Live Order Dashboard
                    </h2>

                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Online
                        </div>

                        <div
                            className="
                            px-4 py-1.5 rounded-full
                            bg-white/[0.03]
                            border border-white/5
                            text-xs text-gray-400
                        "
                        >
                            {time.toLocaleString('id', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    </div>
                </header>

                {/* CONTENT */}

                <main className="flex-1 overflow-y-auto p-8">
                    {/* STATS */}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        {[
                            {
                                title: 'Pending',
                                value: pending.length,
                                icon: BellAlertIcon,
                                color: 'text-amber-400 bg-amber-400/10',
                            },

                            {
                                title: 'Diproses',
                                value: diproses.length,
                                icon: FireIcon,
                                color: 'text-sky-400 bg-sky-400/10',
                            },

                            {
                                title: 'Selesai',
                                value: selesai.length,
                                icon: CheckBadgeIcon,
                                color: 'text-emerald-400 bg-emerald-400/10',
                            },

                            {
                                title: 'Total',
                                value: orders.length,
                                icon: ChartBarIcon,
                                color: 'text-[#D6C6A5] bg-[#D6C6A5]/10',
                            },
                        ].map((item) => (
                            <motion.div
                                whileHover={{
                                    y: -3,
                                }}
                                key={item.title}
                                className="
                                    rounded-3xl
                                    border border-white/5
                                    bg-white/[0.03]
                                    p-6
                                    shadow-xl
                                "
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                                            {item.title}
                                        </p>

                                        <h3 className="text-4xl font-bold mt-3">
                                            {item.value}
                                        </h3>
                                    </div>

                                    <div
                                        className={`
                                            w-12 h-12 rounded-2xl
                                            flex items-center justify-center
                                            ${item.color}
                                        `}
                                    >
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* FILTER */}

                    <div className="flex flex-wrap gap-4 justify-between mb-8">
                        <div className="flex gap-3">
                            {[
                                {
                                    label: 'Semua',
                                    value: 'all',
                                },
                                {
                                    label: 'Dine In',
                                    value: 'dinein',
                                },
                                {
                                    label: 'Takeaway',
                                    value: 'takeaway',
                                },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setFilter(f.value)}
                                    className={`
                                        px-5 py-2 rounded-full
                                        text-sm transition
                                        border
                                        ${
                                            filter === f.value
                                                ? 'bg-[#D6C6A5] text-black border-[#D6C6A5]'
                                                : 'border-white/10 text-gray-400 hover:text-white'
                                        }
                                    `}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                            <input
                                type="text"
                                placeholder="Cari order..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="
                                    w-64
                                    bg-white/[0.03]
                                    border border-white/5
                                    rounded-full
                                    pl-11 pr-4 py-2.5
                                    text-sm
                                    placeholder:text-gray-500
                                    focus:outline-none
                                    focus:border-[#D6C6A5]/40
                                "
                            />
                        </div>
                    </div>

                    {/* KANBAN */}

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Pending',
                                orders: pending,
                                status: 'pending',
                                dot: 'bg-amber-400',
                            },

                            {
                                title: 'Diproses',
                                orders: diproses,
                                status: 'diproses',
                                dot: 'bg-sky-400',
                            },

                            {
                                title: 'Selesai',
                                orders: selesai,
                                status: 'selesai',
                                dot: 'bg-emerald-400',
                            },
                        ].map((column) => (
                            <div key={column.status}>
                                {/* HEADER */}

                                <div className="flex items-center gap-3 mb-5">
                                    <span
                                        className={`w-3 h-3 rounded-full ${column.dot}`}
                                    />

                                    <h3 className="uppercase tracking-[0.2em] text-xs text-gray-500 font-semibold">
                                        {column.title}
                                    </h3>

                                    <span
                                        className="
                                        ml-auto
                                        text-xs
                                        px-2.5 py-1
                                        rounded-full
                                        bg-white/[0.03]
                                        border border-white/5
                                        text-gray-400
                                    "
                                    >
                                        {column.orders.length}
                                    </span>
                                </div>

                                {/* CARDS */}

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {column.orders.length === 0 && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                }}
                                                className="
                                                    rounded-3xl
                                                    border border-dashed border-white/10
                                                    p-10
                                                    text-center
                                                "
                                            >
                                                <div
                                                    className="
                                                        w-16 h-16 rounded-full
                                                        bg-white/[0.03]
                                                        mx-auto
                                                        flex items-center justify-center
                                                        mb-4
                                                    "
                                                >
                                                    <InboxIcon className="w-8 h-8 text-gray-500" />
                                                </div>

                                                <p className="text-sm text-gray-400">
                                                    Belum ada order
                                                </p>
                                            </motion.div>
                                        )}

                                        {column.orders.map((order) => {
                                            const waiting =
                                                waitingMinutes(order);

                                            const progress = Math.min(
                                                (waiting / 30) * 100,
                                                100,
                                            );

                                            return (
                                                <motion.div
                                                    key={order.id}
                                                    layout
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.95,
                                                    }}
                                                    whileHover={{
                                                        y: -2,
                                                    }}
                                                    className="
                                                            rounded-3xl
                                                            border border-white/5
                                                            bg-white/[0.03]
                                                            overflow-hidden
                                                            shadow-xl
                                                        "
                                                >
                                                    {/* CARD HEADER */}

                                                    <div className="p-5 border-b border-white/5">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-semibold text-[#F5E9D8]">
                                                                #HSH-
                                                                {String(
                                                                    order.id,
                                                                ).padStart(
                                                                    4,
                                                                    '0',
                                                                )}
                                                            </h4>

                                                            <span className="text-xs text-gray-500">
                                                                {formatTime(
                                                                    order.created_at,
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span
                                                                className="
                                                                    text-[11px]
                                                                    px-3 py-1
                                                                    rounded-full
                                                                    bg-white/[0.04]
                                                                    border border-white/5
                                                                    text-gray-300
                                                                "
                                                            >
                                                                {order.order_type ===
                                                                'dine-in'
                                                                    ? `🪑 Table ${order.table?.table_number || '-'}`
                                                                    : `🥤 ${order.pickup_name}`}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-gray-400 leading-relaxed">
                                                            {order.order_items
                                                                ?.map(
                                                                    (item) =>
                                                                        `${item.menu?.name} ×${item.quantity}`,
                                                                )
                                                                .join(', ')}
                                                        </p>

                                                        {order.status ===
                                                            'pending' && (
                                                            <div className="mt-5">
                                                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                                    <span>
                                                                        Waiting
                                                                    </span>

                                                                    <span>
                                                                        {
                                                                            waiting
                                                                        }{' '}
                                                                        min
                                                                    </span>
                                                                </div>

                                                                <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
                                                                    <motion.div
                                                                        initial={{
                                                                            width: 0,
                                                                        }}
                                                                        animate={{
                                                                            width: `${progress}%`,
                                                                        }}
                                                                        className="h-full bg-amber-400"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* FOOTER */}

                                                    <div className="p-5">
                                                        <div className="flex justify-between items-center mb-5">
                                                            <h3 className="text-xl font-bold">
                                                                Rp{' '}
                                                                {order.total_price?.toLocaleString(
                                                                    'id',
                                                                )}
                                                            </h3>

                                                            <span
                                                                className={`
                                                                    text-xs font-medium
                                                                    ${
                                                                        order.payment_status ===
                                                                        'paid'
                                                                            ? 'text-emerald-400'
                                                                            : 'text-amber-400'
                                                                    }
                                                                `}
                                                            >
                                                                {order.payment_status ===
                                                                'paid'
                                                                    ? '✓ Paid'
                                                                    : '⏳ Unpaid'}
                                                            </span>
                                                        </div>

                                                        <div className="flex gap-3">
                                                            {order.status ===
                                                                'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            updateStatus(
                                                                                order.id,
                                                                                'diproses',
                                                                            )
                                                                        }
                                                                        className="
                                                                                flex-1 py-2.5 rounded-2xl
                                                                                bg-sky-400/10
                                                                                text-sky-400
                                                                                border border-sky-400/20
                                                                                hover:bg-sky-400/20
                                                                                transition
                                                                            "
                                                                    >
                                                                        Process
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            updateStatus(
                                                                                order.id,
                                                                                'dibatalkan',
                                                                            )
                                                                        }
                                                                        className="
                                                                                px-4 rounded-2xl
                                                                                bg-red-400/10
                                                                                border border-red-400/20
                                                                                text-red-400
                                                                            "
                                                                    >
                                                                        <XCircleIcon className="w-5 h-5" />
                                                                    </button>
                                                                </>
                                                            )}

                                                            {order.status ===
                                                                'diproses' && (
                                                                <>
                                                                    {order.payment_status ===
                                                                        'unpaid' && (
                                                                        <button
                                                                            onClick={() =>
                                                                                confirmPayment(
                                                                                    order.id,
                                                                                )
                                                                            }
                                                                            className="
                                                                                    flex-1 py-2.5 rounded-2xl
                                                                                    bg-[#D6C6A5]
                                                                                    text-black
                                                                                    font-semibold
                                                                                "
                                                                        >
                                                                            Paid
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        onClick={() =>
                                                                            updateStatus(
                                                                                order.id,
                                                                                'selesai',
                                                                            )
                                                                        }
                                                                        className="
                                                                                flex-1 py-2.5 rounded-2xl
                                                                                bg-emerald-400/10
                                                                                border border-emerald-400/20
                                                                                text-emerald-400
                                                                            "
                                                                    >
                                                                        Done
                                                                    </button>
                                                                </>
                                                            )}

                                                            {order.status ===
                                                                'selesai' && (
                                                                <div className="w-full py-2.5 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-center text-emerald-400 text-sm font-medium">
                                                                    Order
                                                                    Completed
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
