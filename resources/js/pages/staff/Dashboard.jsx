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

// ==========================================
// Web Audio API Sound Synthesizer
// ==========================================
function playChime(type = 'new-order') {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        if (type === 'new-order') {
            // Elegant digital chime melody: C6 (1046.50Hz), E6 (1318.51Hz), G6 (1567.98Hz)
            const playNote = (freq, start, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
                
                gain.gain.setValueAtTime(0, ctx.currentTime + start);
                gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
                
                osc.start(ctx.currentTime + start);
                osc.stop(ctx.currentTime + start + duration);
            };
            
            playNote(1046.50, 0, 0.4);       // C6
            playNote(1318.51, 0.08, 0.4);    // E6
            playNote(1567.98, 0.16, 0.5);    // G6
        } else if (type === 'warning') {
            // High-priority dual alarm beep for delayed pending orders
            const playAlertNote = (freq, start) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
                
                gain.gain.setValueAtTime(0, ctx.currentTime + start);
                gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.18);
                
                osc.start(ctx.currentTime + start);
                osc.stop(ctx.currentTime + start + 0.25);
            };
            
            playAlertNote(440, 0);    // A4
            playAlertNote(440, 0.25); // A4
        } else if (type === 'action') {
            // Subtle pop sound for immediate action click feedback
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        }
    } catch (e) {
        console.error('Audio synthesizer error:', e);
    }
}

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

    // ==========================================
    // PREMIUM KDS STATE: Division Filter
    // ==========================================
    const [division, setDivision] = useState('all'); // 'all' | 'dapur' | 'bar'
    
    // Delayed Transaction Action Queue
    const pendingActions = useRef({});

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
            // Clear any outstanding timeouts on unmount
            Object.values(pendingActions.current).forEach((act) => clearTimeout(act.timeoutId));
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
                    playChime('new-order');
                }
            }
            firstLoad.current = false;
            ordersRef.current = newOrders;
            setOrders(newOrders);

            // Check if any pending orders are waiting >= 15 mins (Warning Chime)
            const hasDelayed = newOrders.some(
                (o) => o.status === 'pending' && waitingMinutes(o) >= 15,
            );
            if (hasDelayed) {
                const now = Date.now();
                if (!window.lastWarningTime || now - window.lastWarningTime > 30000) {
                    window.lastWarningTime = now;
                    playChime('warning');
                }
            }
        } catch (err) {
            toast.error('Gagal memuat order');
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // UPDATE STATUS (With Optimistic Undo Queue)
    // ==========================================
    async function updateStatus(id, newStatus) {
        const order = orders.find((o) => o.id === id);
        if (!order) return;

        const originalStatus = order.status;

        // Clear existing timeout if any for this order
        if (pendingActions.current[id]) {
            clearTimeout(pendingActions.current[id].timeoutId);
        }

        // Apply instant optimistic update in frontend state
        setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
        );

        playChime('action');

        // Delay commit for 4 seconds to allow undo action
        const timeoutId = setTimeout(async () => {
            try {
                await api.patch(`/orders/${id}/status`, { status: newStatus });
                delete pendingActions.current[id];
            } catch {
                // Rollback if database update fails
                setOrders((prev) =>
                    prev.map((o) => (o.id === id ? { ...o, status: originalStatus } : o)),
                );
                toast.error(`Gagal mengupdate status pesanan #${String(id).padStart(4, '0')}`);
            }
        }, 4000);

        pendingActions.current[id] = { timeoutId, originalStatus };

        toast.dismiss(`undo-toast-${id}`);
        toast((t) => (
            <div className="flex items-center justify-between gap-4 w-full">
                <span className="text-xs font-medium text-cream-100">
                    Order #{String(id).padStart(4, '0')} dipindah ke <strong>{newStatus}</strong>
                </span>
                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                        if (pendingActions.current[id]) {
                            clearTimeout(pendingActions.current[id].timeoutId);
                            setOrders((prev) =>
                                prev.map((o) => (o.id === id ? { ...o, status: originalStatus } : o)),
                            );
                            delete pendingActions.current[id];
                            toast.success('Perubahan status dibatalkan', { id: `undo-success-${id}` });
                        }
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cream-200 text-navy-800 hover:bg-cream-300 transition shrink-0"
                >
                    Undo
                </button>
            </div>
        ), {
            id: `undo-toast-${id}`,
            duration: 4000,
        });
    }

    async function confirmPayment(id) {
        const order = orders.find((o) => o.id === id);
        if (!order) return;

        const originalPaymentStatus = order.payment_status;

        if (pendingActions.current[`pay-${id}`]) {
            clearTimeout(pendingActions.current[`pay-${id}`].timeoutId);
        }

        // Apply instant optimistic update in frontend state
        setOrders((prev) =>
            prev.map((o) =>
                o.id === id ? { ...o, payment_status: 'paid' } : o,
            ),
        );

        playChime('action');

        const timeoutId = setTimeout(async () => {
            try {
                await api.patch(`/orders/${id}/payment`);
                delete pendingActions.current[`pay-${id}`];
            } catch {
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === id ? { ...o, payment_status: originalPaymentStatus } : o,
                    ),
                );
                toast.error(`Gagal konfirmasi pembayaran order #${String(id).padStart(4, '0')}`);
            }
        }, 4000);

        pendingActions.current[`pay-${id}`] = { timeoutId, originalPaymentStatus };

        toast.dismiss(`undo-pay-${id}`);
        toast((t) => (
            <div className="flex items-center justify-between gap-4 w-full">
                <span className="text-xs font-medium text-cream-100">
                    Order #{String(id).padStart(4, '0')} ditandai Lunas
                </span>
                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                        if (pendingActions.current[`pay-${id}`]) {
                            clearTimeout(pendingActions.current[`pay-${id}`].timeoutId);
                            setOrders((prev) =>
                                prev.map((o) =>
                                    o.id === id ? { ...o, payment_status: originalPaymentStatus } : o,
                                ),
                            );
                            delete pendingActions.current[`pay-${id}`];
                            toast.success('Konfirmasi bayar dibatalkan', { id: `undo-pay-success-${id}` });
                        }
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cream-200 text-navy-800 hover:bg-cream-300 transition shrink-0"
                >
                    Undo
                </button>
            </div>
        ), {
            id: `undo-pay-${id}`,
            duration: 4000,
        });
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

    // ==========================================
    // FILTERING & DIVISION FILTERING
    // ==========================================
    const processedOrders = useMemo(() => {
        let result = [...orders];

        // 1. Order Type Filter (dine-in / takeaway)
        if (filter === 'dinein')
            result = result.filter((o) => o.order_type === 'dine-in');
        if (filter === 'takeaway')
            result = result.filter((o) => o.order_type === 'takeaway');

        // 2. Keyword Search
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

        // 3. Division filtering (Kitchen / Bar)
        if (division !== 'all') {
            result = result.map((o) => {
                const filteredItems = o.order_items?.filter((item) => {
                    const isFood = item.menu?.category?.slug === 'food';
                    return division === 'dapur' ? isFood : !isFood;
                }) || [];
                return { ...o, order_items: filteredItems };
            });

            // Only show orders containing items matching that division
            result = result.filter((o) => o.order_items.length > 0);
        }

        return result;
    }, [orders, filter, search, division]);

    const pending = useMemo(
        () => processedOrders.filter((o) => o.status === 'pending'),
        [processedOrders],
    );
    const diproses = useMemo(
        () => processedOrders.filter((o) => o.status === 'diproses'),
        [processedOrders],
    );
    const selesai = useMemo(
        () => processedOrders.filter((o) => o.status === 'selesai'),
        [processedOrders],
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
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-8 text-navy-900">
            
            {/* Top Control Bar: Division Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-6 border-cream-300">
                {/* Division Filter */}
                <div className="flex gap-1.5 p-1 rounded-full w-fit max-w-full bg-cream-200/50">
                    {[
                        { label: 'Semua Divisi', value: 'all' },
                        { label: 'Dapur (Food)', value: 'dapur' },
                        { label: 'Bar (Drinks)', value: 'bar' },
                    ].map((div) => {
                        const isActive = division === div.value;
                        return (
                            <button
                                key={div.value}
                                onClick={() => setDivision(div.value)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                                    isActive
                                        ? 'bg-navy-800 text-cream-100 shadow'
                                        : 'text-navy-400 hover:text-navy-700'
                                }`}
                            >
                                {div.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {[
                    {
                        title: 'Pending',
                        value: pending.length,
                        icon: BellAlertIcon,
                        bg: 'bg-amber-50',
                        text: 'text-amber-500',
                    },
                    {
                        title: 'Diproses',
                        value: diproses.length,
                        icon: FireIcon,
                        bg: 'bg-sky-50',
                        text: 'text-sky-500',
                    },
                    {
                        title: 'Selesai',
                        value: selesai.length,
                        icon: CheckBadgeIcon,
                        bg: 'bg-emerald-50',
                        text: 'text-emerald-500',
                    },
                    {
                        title: 'Total',
                        value: processedOrders.length,
                        icon: ChartBarIcon,
                        bg: 'bg-navy-50',
                        text: 'text-navy-800',
                    },
                ].map((item) => (
                    <motion.div
                        whileHover={{ y: -2 }}
                        key={item.title}
                        className="border rounded-3xl p-5 shadow-sm transition-all duration-300 bg-white border-cream-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                                {item.title}
                            </p>
                            <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.bg}`}
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
                    ].map((f) => {
                        const isActive = filter === f.value;
                        return (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${
                                    isActive
                                        ? 'bg-navy-800 text-cream-100 border-navy-800 shadow'
                                        : 'bg-white text-navy-400 border-cream-300 hover:border-navy-300'
                                }`}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>
                <div className="relative w-full sm:w-72">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Cari order... (Ctrl+K)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border rounded-full pl-4 pr-4 py-2.5 text-sm outline-none transition bg-white border-cream-300 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
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
                            className="w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden bg-white border-cream-200"
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
                                        className="w-full rounded-full border pl-12 pr-4 py-3 text-sm outline-none transition bg-cream-50 border-cream-300 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
                                    />
                                </div>
                                <div className="mt-5 max-h-80 overflow-y-auto space-y-3">
                                    {search ? (
                                        processedOrders.length > 0 ? (
                                            processedOrders.map((order) => (
                                                <button
                                                    key={order.id}
                                                    onClick={closeSearchModal}
                                                    className="w-full text-left rounded-3xl border p-4 transition border-cream-200 bg-white hover:bg-navy-50 text-navy-900"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold">
                                                            #{String(order.id).padStart(4, '0')}
                                                        </span>
                                                        <span className="text-xs uppercase text-navy-400">
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm mt-2 text-navy-505">
                                                        {order.pickup_name || `Table ${order.table?.table_number || '-'}`}
                                                    </p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="rounded-3xl border p-5 text-sm border-cream-200 bg-cream-50 text-navy-500">
                                                Tidak ada order yang cocok.
                                            </div>
                                        )
                                    ) : (
                                        <div className="rounded-3xl border p-5 text-sm border-cream-200 bg-cream-50 text-navy-500">
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
                <div className="flex gap-1 rounded-full p-1 mb-6 bg-cream-200">
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
                <h3 className="uppercase tracking-[0.2em] text-xs font-semibold text-navy-400">
                    {title}
                </h3>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-full border bg-cream-100 border-cream-300 text-navy-400">
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
                            className="rounded-3xl border border-dashed p-10 text-center transition-colors border-cream-300 bg-white text-navy-400"
                        >
                            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-cream-100">
                                <InboxIcon className="w-8 h-8 text-navy-400" />
                            </div>
                            <p className="text-sm">
                                Belum ada order
                            </p>
                        </motion.div>
                    )}

                    {orders.map((order) => {
                        const waiting = waitingMinutes(order);
                        const progress = Math.min((waiting / 30) * 100, 100);

                        // Dynamic card border glows based on waiting status (urgent colors)
                        let borderClass = 'border-cream-200 bg-white';
                        if (status === 'pending') {
                            if (waiting >= 15) {
                                borderClass = 'bg-white border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.12)] animate-pulse';
                            } else if (waiting >= 5) {
                                borderClass = 'bg-white border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
                            } else {
                                borderClass = 'bg-white border-emerald-200';
                            }
                        } else if (status === 'diproses') {
                            borderClass = 'bg-white border-sky-200';
                        }

                        return (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ y: -2 }}
                                className={`rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${borderClass}`}
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
                                        <span className="text-xs px-3 py-1 rounded-full border transition-colors bg-cream-100 border-cream-300 text-navy-600">
                                            {order.order_type === 'dine-in'
                                                ? `🪑 Table ${order.table?.table_number || '-'}`
                                                : `🥤 ${order.pickup_name}`}
                                        </span>
                                    </div>
                                    
                                    {/* Order Items list */}
                                    <div className="space-y-2.5 mt-2">
                                        {order.order_items?.map((item) => (
                                            <div key={item.id} className="text-sm">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-semibold text-navy-800">
                                                        {item.menu?.name}{' '}
                                                        <span className="text-navy-400 font-normal">
                                                            ×{item.quantity}
                                                        </span>
                                                    </span>
                                                </div>
                                                {/* Toppings list if any */}
                                                {item.toppings && item.toppings.length > 0 && (
                                                    <div className="pl-4 mt-0.5 space-y-0.5">
                                                        {item.toppings.map((t) => (
                                                            <div
                                                                key={t.id}
                                                                className="text-xs flex items-center gap-1 text-navy-500"
                                                            >
                                                                <span className="text-navy-300">•</span>
                                                                <span>{t.name}</span>
                                                                {t.pivot?.qty > 1 && (
                                                                    <span className="px-1 py-0.2 rounded text-[10px] font-medium bg-cream-100 text-navy-600">
                                                                        x{t.pivot.qty}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Order Item Notes if any */}
                                                {item.notes && (
                                                    <div className="pl-4 mt-0.5 text-xs text-amber-600 italic">
                                                        Catatan: "{item.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {status === 'pending' && (
                                        <div className="mt-5">
                                            <div className="flex justify-between text-xs mb-2 text-navy-400">
                                                <span>Waiting</span>
                                                <span>{waiting} min</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full overflow-hidden bg-cream-200">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${progress}%`,
                                                    }}
                                                    className="h-full rounded-full bg-navy-800"
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
                                                    className="flex-1 py-2.5 rounded-2xl font-medium text-sm transition bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 cursor-pointer"
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
                                                    className="px-4 rounded-2xl transition bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 cursor-pointer"
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
                                                        className="flex-1 py-2.5 rounded-2xl font-semibold transition bg-navy-800 text-cream-100 hover:bg-navy-900 cursor-pointer"
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
                                                    className="flex-1 py-2.5 rounded-2xl font-medium text-sm transition bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                                                >
                                                    Done
                                                </button>
                                            </>
                                        )}
                                        {status === 'selesai' && (
                                            <div className="w-full py-2.5 rounded-2xl border text-center text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-700">
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
