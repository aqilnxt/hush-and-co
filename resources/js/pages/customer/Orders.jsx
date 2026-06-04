import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    FireIcon,
    XCircleIcon,
    ShoppingBagIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data.data);
        } catch (err) {
            toast.error('Gagal memuat riwayat pesanan');
        } finally {
            setLoading(false);
        }
    };

    const filtered = orders.filter((o) => {
        if (filter === 'all') return true;
        return o.status === filter;
    });

    const statusConfig = {
        pending: {
            label: 'Pending',
            color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            icon: ClockIcon,
        },
        diproses: {
            label: 'Diproses',
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: FireIcon,
        },
        selesai: {
            label: 'Selesai',
            color: 'bg-green-100 text-green-700 border-green-200',
            icon: CheckCircleIcon,
        },
        dibatalkan: {
            label: 'Dibatalkan',
            color: 'bg-red-100 text-red-500 border-red-200',
            icon: XCircleIcon,
        },
    };

    const trackingSteps = [
        { key: 'pending', label: 'Diterima', icon: ClockIcon },
        { key: 'diproses', label: 'Diproses', icon: FireIcon },
        { key: 'selesai', label: 'Selesai', icon: CheckCircleIcon },
    ];

    const getStepIndex = (status) => {
        if (status === 'pending') return 0;
        if (status === 'diproses') return 1;
        if (status === 'selesai') return 2;
        return -1;
    };

    if (loading)
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="min-h-[calc(100vh-90px)] flex flex-col justify-between w-full">
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Judul halaman */}
                <div className="mb-8">
                    <p className="text-sm text-navy-400 mb-3">
                        {orders.length} pesanan
                    </p>
                    <p className="text-sm text-navy-400">
                        Lihat status pesananmu kapan saja.
                    </p>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {[
                        'all',
                        'pending',
                        'diproses',
                        'selesai',
                        'dibatalkan',
                    ].map((val) => (
                        <button
                            key={val}
                            onClick={() => setFilter(val)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                                filter === val
                                    ? 'bg-navy-800 text-cream-100 border-navy-800 shadow-md'
                                    : 'bg-white text-navy-400 border-cream-300 hover:border-navy-300 hover:text-navy-800'
                            }`}
                        >
                            {val === 'all'
                                ? 'Semua'
                                : statusConfig[val]?.label || val}
                        </button>
                    ))}
                </div>

                {/* Empty state */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-cream-300 shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-5 text-4xl">
                            🛒
                        </div>
                        <p className="text-navy-400 text-sm font-medium">
                            Belum ada pesanan
                        </p>
                        <button
                            onClick={() => navigate('/menu')}
                            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-navy-800 text-cream-100 rounded-full text-sm font-semibold hover:bg-navy-900 transition shadow-md"
                        >
                            <ShoppingBagIcon className="w-4 h-4" />
                            Pesan Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((order) => {
                            const StatusIcon = statusConfig[order.status]?.icon;
                            const isExpanded = selected?.id === order.id;
                            const orderItems =
                                order.order_items || order.orderItems || [];

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                                        isExpanded
                                            ? 'border-navy-400 shadow-lg'
                                            : 'border-cream-300 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    {/* Card header (klik untuk expand) */}
                                    <div className="w-full text-left">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelected(
                                                    isExpanded ? null : order,
                                                )
                                            }
                                            className="w-full"
                                        >
                                            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                                            statusConfig[
                                                                order.status
                                                            ]?.color
                                                        }`}
                                                    >
                                                        {StatusIcon && (
                                                            <StatusIcon className="w-6 h-6" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 text-left">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-bold text-navy-900">
                                                                #HSH-
                                                                {String(
                                                                    order.id,
                                                                ).padStart(
                                                                    4,
                                                                    '0',
                                                                )}
                                                            </h3>
                                                            <span
                                                                className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${
                                                                    statusConfig[
                                                                        order
                                                                            .status
                                                                    ]?.color
                                                                }`}
                                                            >
                                                                {
                                                                    statusConfig[
                                                                        order
                                                                            .status
                                                                    ]?.label
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-400">
                                                            <span>
                                                                {new Date(
                                                                    order.created_at,
                                                                ).toLocaleDateString(
                                                                    'id',
                                                                    {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    },
                                                                )}
                                                            </span>
                                                            <span className="hidden sm:inline">
                                                                •
                                                            </span>
                                                            <span>
                                                                {order.order_type ===
                                                                'dine-in'
                                                                    ? `🪑 Meja ${order.table?.table_number || '—'}`
                                                                    : `🥤 ${order.pickup_name}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-cream-200/60 sm:border-t-0 pt-3 sm:pt-0">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm font-bold text-navy-900">
                                                            Rp{' '}
                                                            {order.total_price?.toLocaleString(
                                                                'id',
                                                            )}
                                                        </p>
                                                        <p
                                                            className={`text-xs mt-0.5 ${
                                                                order.payment_status ===
                                                                'paid'
                                                                    ? 'text-green-600'
                                                                    : 'text-amber-600'
                                                            }`}
                                                        >
                                                            {order.payment_status ===
                                                            'paid'
                                                                ? '✓ Lunas'
                                                                : '⏳ Belum bayar'}
                                                        </p>
                                                    </div>

                                                    <div className="text-navy-400 shrink-0">
                                                        {isExpanded ? (
                                                            <ChevronUpIcon className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDownIcon className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mini item preview */}
                                            <div className="px-4 sm:px-6 pb-4 flex items-center gap-3">
                                                <div className="flex -space-x-2">
                                                    {orderItems
                                                        .slice(0, 4)
                                                        .map((item, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-8 h-8 rounded-lg bg-navy-100 border border-cream-300 flex items-center justify-center text-sm"
                                                            >
                                                                ☕
                                                            </div>
                                                        ))}
                                                    {orderItems.length > 4 && (
                                                        <div className="w-8 h-8 rounded-lg bg-navy-100 border border-cream-300 flex items-center justify-center text-xs font-semibold text-navy-800">
                                                            +
                                                            {orderItems.length -
                                                                4}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-navy-400">
                                                    {orderItems.length} item
                                                </span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Expanded content */}
                                    {isExpanded && (
                                        <div className="border-t border-cream-200 bg-cream-50/60 px-4 py-6 sm:px-6">
                                            {order.status !== 'dibatalkan' ? (
                                                <div className="mb-6">
                                                    <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-5">
                                                        Tracking Pesanan
                                                    </p>
                                                    <div className="relative flex items-center justify-between w-full max-w-md mx-auto px-4 py-2">
                                                        {/* Background track line */}
                                                        <div className="absolute left-8 right-8 top-[18px] sm:top-[20px] h-0.5 bg-cream-300 -translate-y-1/2 z-0">
                                                            <div
                                                                className="h-full bg-navy-800 transition-all duration-500"
                                                                style={{
                                                                    width: `${
                                                                        getStepIndex(
                                                                            order.status,
                                                                        ) === 0
                                                                            ? 0
                                                                            : getStepIndex(
                                                                                    order.status,
                                                                                ) ===
                                                                                1
                                                                              ? 50
                                                                              : 100
                                                                    }%`,
                                                                }}
                                                            />
                                                        </div>

                                                        {trackingSteps.map(
                                                            (step, i) => {
                                                                const current =
                                                                    getStepIndex(
                                                                        order.status,
                                                                    );
                                                                const isDone =
                                                                    i <=
                                                                    current;
                                                                const isActive =
                                                                    i ===
                                                                    current;
                                                                const StepIcon =
                                                                    step.icon;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            step.key
                                                                        }
                                                                        className="relative flex flex-col items-center gap-2 z-10"
                                                                    >
                                                                        <div
                                                                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                                                isDone
                                                                                    ? 'bg-navy-800 text-cream-100 shadow-md'
                                                                                    : 'bg-cream-200 text-navy-400'
                                                                            } ${isActive ? 'ring-4 ring-navy-100 scale-105' : ''}`}
                                                                        >
                                                                            <StepIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                                                                        </div>
                                                                        <span
                                                                            className={`text-[10px] sm:text-xs font-semibold ${isDone ? 'text-navy-800' : 'text-navy-400'}`}
                                                                        >
                                                                            {
                                                                                step.label
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-6 bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                                                    <XCircleIcon className="w-10 h-10 text-red-400 mx-auto mb-2" />
                                                    <p className="text-sm font-medium text-red-500">
                                                        Pesanan ini telah
                                                        dibatalkan
                                                    </p>
                                                </div>
                                            )}

                                            {/* Detail items */}
                                            <div>
                                                <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-4">
                                                    Rincian Pesanan
                                                </p>
                                                <div className="space-y-3">
                                                    {orderItems.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex justify-between items-center text-sm"
                                                        >
                                                            <span className="text-navy-400 flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded-md bg-navy-100 flex items-center justify-center text-xs">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                {
                                                                    item.menu
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span className="font-medium text-navy-800">
                                                                Rp{' '}
                                                                {item.subtotal?.toLocaleString(
                                                                    'id',
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-cream-200/60 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/orders/${order.id}`,
                                                        )
                                                    }
                                                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-navy-800 bg-white px-6 py-2.5 text-sm font-bold text-navy-800 hover:bg-navy-50 transition shadow-sm"
                                                >
                                                    Detail Pesanan
                                                </button>
                                                <div className="flex justify-between sm:block text-right text-sm text-navy-500">
                                                    <span className="sm:block">
                                                        Total Pembayaran
                                                    </span>
                                                    <span className="text-base sm:text-lg font-bold text-navy-900 sm:block sm:mt-0.5">
                                                        Rp{' '}
                                                        {order.total_price?.toLocaleString(
                                                            'id',
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
