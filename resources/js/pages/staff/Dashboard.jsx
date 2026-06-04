import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
} from 'react';
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
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    InboxIcon,
    SparklesIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';

export default function StaffDashboard() {
    const { user, logout } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState('all'); // 'all' | 'dinein' | 'takeaway'
    const [search, setSearch] = useState('');
    const [searchModalOpen, setSearchModalOpen] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Mobile tab
    const [mobileTab, setMobileTab] = useState('pending'); // 'pending' | 'diproses' | 'selesai'

    const [time, setTime] = useState(new Date());
    const searchInputRef = useRef(null);
    const searchModalInputRef = useRef(null);
    const firstLoad = useRef(true);
    const ordersRef = useRef([]);

    // =========================
    // FETCH ORDERS
    // =========================
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        const clock = setInterval(() => setTime(new Date()), 1000);
        return () => {
            clearInterval(interval);
            clearInterval(clock);
        };
    }, []);

    async function fetchOrders() {
        try {
            const res = await api.get('/staff/orders');
            const newOrders = res.data.data;
            if (!firstLoad.current) {
                const existingIds = ordersRef.current.map((o) => o.id);
                const incoming = newOrders.filter(
                    (o) => !existingIds.includes(o.id),
                );
                if (incoming.length > 0) {
                    toast.success(`${incoming.length} order baru masuk 🔥`);
                }
            }
            firstLoad.current = false;
            ordersRef.current = newOrders;
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
            await api.patch(`/orders/${id}/status`, { status });
            setOrders((prev) =>
                prev.map((o) => (o.id === id ? { ...o, status } : o)),
            );
            toast.success(`Order ${status}`);
        } catch {
            toast.error('Gagal update status');
        }
    }

    async function confirmPayment(id) {
        try {
            await api.patch(`/orders/${id}/payment`);
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === id ? { ...o, payment_status: 'paid' } : o,
                ),
            );
            toast.success('Pembayaran dikonfirmasi');
        } catch {
            toast.error('Gagal konfirmasi pembayaran');
        }
    }

    // =========================
    // OUTSIDE CLICK (dropdown profile)
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
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // =========================
    // SHORTCUT Ctrl+K
    // =========================
    const openSearch = useCallback(() => {
        setSearchModalOpen(true);
        setTimeout(() => searchModalInputRef.current?.focus(), 20);
    }, []);

    const closeSearchModal = useCallback(() => {
        setSearchModalOpen(false);
        setSearch('');
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            if (e.key === 'Escape') {
                if (searchModalOpen) {
                    closeSearchModal();
                } else {
                    setSearch('');
                    searchInputRef.current?.blur();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [openSearch, closeSearchModal, searchModalOpen]);

    // =========================
    // FILTERING & GROUPING
    // =========================
    const filteredOrders = useMemo(() => {
        let result = [...orders];
        if (filter === 'dinein')
            result = result.filter((o) => o.order_type === 'dine-in');
        if (filter === 'takeaway')
            result = result.filter((o) => o.order_type === 'takeaway');
        if (search) {
            const keyword = search.toLowerCase();
            result = result.filter((o) => {
                const orderCode = `#HSH-${String(o.id).padStart(4, '0')}`;
                const normalizedOrderCode = orderCode.toLowerCase();
                const normalizedTable = o.table?.table_number?.toString().toLowerCase();

                return (
                    o.pickup_name?.toLowerCase().includes(keyword) ||
                    normalizedTable?.includes(keyword) ||
                    String(o.id).includes(keyword) ||
                    normalizedOrderCode.includes(keyword) ||
                    normalizedOrderCode.replace('#', '').includes(keyword)
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

    const kanbanColumns = [
        {
            title: 'Pending',
            orders: pending,
            status: 'pending',
            dot: 'bg-amber-400',
            accent: 'text-amber-600',
        },
        {
            title: 'Diproses',
            orders: diproses,
            status: 'diproses',
            dot: 'bg-sky-400',
            accent: 'text-sky-600',
        },
        {
            title: 'Selesai',
            orders: selesai,
            status: 'selesai',
            dot: 'bg-emerald-400',
            accent: 'text-emerald-600',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {[
                    {
                        title: 'Pending',
                        value: pending.length,
                        icon: BellAlertIcon,
                        bg: 'bg-amber-50',
                        text: 'text-amber-600',
                    },
                    {
                        title: 'Diproses',
                        value: diproses.length,
                        icon: FireIcon,
                        bg: 'bg-sky-50',
                        text: 'text-sky-600',
                    },
                    {
                        title: 'Selesai',
                        value: selesai.length,
                        icon: CheckBadgeIcon,
                        bg: 'bg-emerald-50',
                        text: 'text-emerald-600',
                    },
                    {
                        title: 'Total',
                        value: orders.length,
                        icon: ChartBarIcon,
                        bg: 'bg-navy-50',
                        text: 'text-navy-800',
                    },
                ].map((item) => (
                    <motion.div
                        whileHover={{ y: -2 }}
                        key={item.title}
                        className="bg-white border border-cream-300 rounded-3xl p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
                                {item.title}
                            </p>
                            <div
                                className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center`}
                            >
                                <item.icon className={`w-5 h-5 ${item.text}`} />
                            </div>
                        </div>
                        <p className="font-playfair text-3xl font-bold text-navy-900">
                            {item.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
                <div className="flex gap-2 flex-wrap">
                    {[
                        { label: 'Semua', value: 'all' },
                        { label: 'Dine In', value: 'dinein' },
                        { label: 'Takeaway', value: 'takeaway' },
                    ].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${
                                filter === f.value
                                    ? 'bg-navy-800 text-cream-100 border-navy-800 shadow-md'
                                    : 'bg-white text-navy-400 border-cream-300 hover:border-navy-300'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Cari order... (Ctrl+K)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-full pl-4 pr-4 py-2.5 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                    />
                </div>
            </div>

            <AnimatePresence>
                {searchModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-6"
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-cream-200 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-cream-200">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-navy-400">
                                        Search orders
                                    </p>
                                    <h3 className="text-xl font-semibold text-navy-900">
                                        Tekan Esc untuk tutup
                                    </h3>
                                </div>
                                <button
                                    onClick={closeSearchModal}
                                    className="text-sm font-medium text-navy-500 hover:text-navy-800"
                                >
                                    Tutup
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                                    <input
                                        ref={searchModalInputRef}
                                        type="text"
                                        placeholder="Cari order..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full rounded-full border border-cream-300 bg-cream-50 pl-12 pr-4 py-3 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                    />
                                </div>
                                <div className="mt-5 max-h-80 overflow-y-auto space-y-3">
                                    {search ? (
                                        filteredOrders.length > 0 ? (
                                            filteredOrders.map((order) => (
                                                <button
                                                    key={order.id}
                                                    onClick={closeSearchModal}
                                                    className="w-full text-left rounded-3xl border border-cream-200 bg-white p-4 hover:bg-navy-50 transition"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-navy-900">
                                                            #{String(order.id).padStart(4, '0')}
                                                        </span>
                                                        <span className="text-xs text-navy-400 uppercase">
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-navy-500 mt-2">
                                                        {order.pickup_name || `Table ${order.table?.table_number || '-'}`}
                                                    </p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5 text-sm text-navy-500">
                                                Tidak ada order yang cocok.
                                            </div>
                                        )
                                    ) : (
                                        <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5 text-sm text-navy-500">
                                            Ketik nomor order, nama pelanggan, atau meja untuk mencari.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kanban Desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-6">
                {kanbanColumns.map((column) => (
                    <KanbanColumn
                        key={column.status}
                        column={column}
                        updateStatus={updateStatus}
                        confirmPayment={confirmPayment}
                        waitingMinutes={waitingMinutes}
                        formatTime={formatTime}
                    />
                ))}
            </div>

            {/* Mobile Tab Selector */}
            <div className="lg:hidden">
                <div className="flex gap-1 bg-cream-200 rounded-full p-1 mb-6">
                    {kanbanColumns.map((col) => (
                        <button
                            key={col.status}
                            onClick={() => setMobileTab(col.status)}
                            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                                mobileTab === col.status
                                    ? 'bg-navy-800 text-cream-100 shadow'
                                    : 'text-navy-400'
                            }`}
                        >
                            {col.title} ({col.orders.length})
                        </button>
                    ))}
                </div>
                <KanbanColumn
                    column={kanbanColumns.find((c) => c.status === mobileTab)}
                    updateStatus={updateStatus}
                    confirmPayment={confirmPayment}
                    waitingMinutes={waitingMinutes}
                    formatTime={formatTime}
                    mobile
                />
            </div>
        </div>
    );
}

// =========================
// KOMPONEN KOLOM KANBAN
// =========================
function KanbanColumn({
    column,
    updateStatus,
    confirmPayment,
    waitingMinutes,
    formatTime,
    mobile,
}) {
    const { title, orders, status, dot } = column;

    return (
        <div>
            <div className="flex items-center gap-3 mb-5">
                <span className={`w-3 h-3 rounded-full ${dot}`} />
                <h3 className="uppercase tracking-[0.2em] text-xs text-navy-400 font-semibold">
                    {title}
                </h3>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-cream-100 border border-cream-300 text-navy-400">
                    {orders.length}
                </span>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {orders.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-3xl border border-dashed border-cream-300 p-10 text-center bg-white"
                        >
                            <div className="w-16 h-16 rounded-full bg-cream-100 mx-auto flex items-center justify-center mb-4">
                                <InboxIcon className="w-8 h-8 text-navy-400" />
                            </div>
                            <p className="text-sm text-navy-400">
                                Belum ada order
                            </p>
                        </motion.div>
                    )}

                    {orders.map((order) => {
                        const waiting = waitingMinutes(order);
                        const progress = Math.min((waiting / 30) * 100, 100);

                        return (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ y: -2 }}
                                className="rounded-3xl border border-cream-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-5 border-b border-cream-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-navy-900">
                                            #HSH-
                                            {String(order.id).padStart(4, '0')}
                                        </h4>
                                        <span className="text-xs text-navy-400">
                                            {formatTime(order.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs px-3 py-1 rounded-full bg-cream-100 border border-cream-300 text-navy-600">
                                            {order.order_type === 'dine-in'
                                                ? `🪑 Table ${order.table?.table_number || '-'}`
                                                : `🥤 ${order.pickup_name}`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-navy-600 leading-relaxed">
                                        {order.order_items
                                            ?.map(
                                                (item) =>
                                                    `${item.menu?.name} ×${item.quantity}`,
                                            )
                                            .join(', ')}
                                    </p>
                                    {status === 'pending' && (
                                        <div className="mt-5">
                                            <div className="flex justify-between text-xs text-navy-400 mb-2">
                                                <span>Waiting</span>
                                                <span>{waiting} min</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${progress}%`,
                                                    }}
                                                    className="h-full bg-navy-800 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-xl font-bold text-navy-900">
                                            Rp{' '}
                                            {order.total_price?.toLocaleString(
                                                'id',
                                            )}
                                        </h3>
                                        <span
                                            className={`text-xs font-medium ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}
                                        >
                                            {order.payment_status === 'paid'
                                                ? '✓ Paid'
                                                : '⏳ Unpaid'}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        {status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            order.id,
                                                            'diproses',
                                                        )
                                                    }
                                                    className="flex-1 py-2.5 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition font-medium text-sm"
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
                                                    className="px-4 rounded-2xl bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition"
                                                >
                                                    <XCircleIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        {status === 'diproses' && (
                                            <>
                                                {order.payment_status ===
                                                    'unpaid' && (
                                                    <button
                                                        onClick={() =>
                                                            confirmPayment(
                                                                order.id,
                                                            )
                                                        }
                                                        className="flex-1 py-2.5 rounded-2xl bg-navy-800 text-cream-100 font-semibold hover:bg-navy-900 transition"
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
                                                    className="flex-1 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition font-medium text-sm"
                                                >
                                                    Done
                                                </button>
                                            </>
                                        )}
                                        {status === 'selesai' && (
                                            <div className="w-full py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-700 text-sm font-medium">
                                                Order Completed
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
    );
}
