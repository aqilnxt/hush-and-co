import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
        // Auto refresh tiap 10 detik
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
            color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        },
        diproses: {
            label: 'Diproses',
            color: 'bg-blue-50 text-blue-600 border-blue-200',
        },
        selesai: {
            label: 'Selesai',
            color: 'bg-green-50 text-green-600 border-green-200',
        },
        dibatalkan: {
            label: 'Dibatalkan',
            color: 'bg-red-50 text-red-500 border-red-200',
        },
    };

    const trackingSteps = [
        { key: 'pending', label: 'Diterima', icon: '📋' },
        { key: 'diproses', label: 'Diproses', icon: '☕' },
        { key: 'selesai', label: 'Selesai', icon: '✓' },
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
        <div className="min-h-screen bg-cream-100">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-cream-100/90 backdrop-blur border-b border-cream-300 px-6 md:px-12 h-16 flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-navy-400 hover:text-navy-800 transition"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Menu
                </button>
                <span className="font-playfair text-xl font-medium text-navy-800">
                    Hush <span className="text-cream-600">&</span> Co.
                </span>
            </nav>

            <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="font-playfair text-3xl font-medium text-navy-900 mb-1">
                        Riwayat{' '}
                        <em className="italic text-cream-600">pesanan</em>
                    </h1>
                    <p className="text-sm text-navy-400">
                        {orders.length} pesanan · Auto refresh tiap 10 detik
                    </p>
                </div>

                {/* FILTER */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { val: 'all', label: 'Semua' },
                        { val: 'pending', label: 'Pending' },
                        { val: 'diproses', label: 'Diproses' },
                        { val: 'selesai', label: 'Selesai' },
                        { val: 'dibatalkan', label: 'Dibatalkan' },
                    ].map((f) => (
                        <button
                            key={f.val}
                            onClick={() => setFilter(f.val)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                                filter === f.val
                                    ? 'bg-navy-800 text-cream-200 border-navy-800'
                                    : 'bg-white text-navy-400 border-cream-300 hover:border-navy-200 hover:text-navy-800'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🛒</p>
                        <p className="text-navy-400 text-sm">
                            Belum ada pesanan
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-6 py-2 bg-navy-800 text-cream-200 rounded-xl text-sm font-medium hover:bg-navy-900 transition"
                        >
                            Pesan Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((order) => (
                            <div
                                key={order.id}
                                className={`bg-white border rounded-2xl overflow-hidden transition cursor-pointer hover:shadow-md ${
                                    selected?.id === order.id
                                        ? 'border-navy-800'
                                        : 'border-cream-300'
                                }`}
                                onClick={() =>
                                    setSelected(
                                        selected?.id === order.id
                                            ? null
                                            : order,
                                    )
                                }
                            >
                                {/* Card Header */}
                                <div className="px-5 py-4 flex items-center gap-3 border-b border-cream-300">
                                    <span className="text-sm font-semibold text-navy-800">
                                        #HSH-{String(order.id).padStart(4, '0')}
                                    </span>
                                    <span className="text-xs text-navy-400">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString('id', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    <span className="text-xs text-navy-400 ml-1">
                                        {order.order_type === 'dine-in'
                                            ? `🪑 Meja ${order.table?.table_number || '—'}`
                                            : `🥤 ${order.pickup_name}`}
                                    </span>
                                    <span
                                        className={`ml-auto text-xs font-medium px-3 py-1 rounded-full border ${
                                            statusConfig[order.status]?.color
                                        }`}
                                    >
                                        {statusConfig[order.status]?.label}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="px-5 py-4 flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        {order.order_items
                                            ?.slice(0, 3)
                                            .map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center text-lg"
                                                >
                                                    ☕
                                                </div>
                                            ))}
                                        {order.order_items?.length > 3 && (
                                            <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center text-xs font-semibold text-navy-800">
                                                +{order.order_items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-navy-800">
                                            {order.order_items?.length} item
                                        </p>
                                        <p className="text-xs text-navy-400">
                                            {order.order_items
                                                ?.map((i) => i.menu?.name)
                                                .join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-navy-800">
                                            Rp{' '}
                                            {order.total_price?.toLocaleString(
                                                'id',
                                            )}
                                        </p>
                                        <p
                                            className={`text-xs ${
                                                order.payment_status === 'paid'
                                                    ? 'text-green-500'
                                                    : 'text-yellow-500'
                                            }`}
                                        >
                                            {order.payment_status === 'paid'
                                                ? '✓ Lunas'
                                                : '⏳ Belum bayar'}
                                        </p>
                                    </div>
                                </div>

                                {/* TRACKING — muncul saat diklik */}
                                {selected?.id === order.id &&
                                    order.status !== 'dibatalkan' && (
                                        <div className="px-5 py-4 border-t border-cream-300 bg-cream-100">
                                            <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-4">
                                                Tracking Pesanan
                                            </p>
                                            <div className="flex items-center">
                                                {trackingSteps.map(
                                                    (step, i) => {
                                                        const current =
                                                            getStepIndex(
                                                                order.status,
                                                            );
                                                        const isDone =
                                                            i <= current;
                                                        const isActive =
                                                            i === current;

                                                        return (
                                                            <React.Fragment
                                                                key={step.key}
                                                            >
                                                                <div className="flex flex-col items-center gap-1.5">
                                                                    <div
                                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                                                                            isDone
                                                                                ? 'bg-navy-800 text-cream-200'
                                                                                : 'bg-cream-300 text-navy-400'
                                                                        } ${isActive ? 'ring-4 ring-navy-100' : ''}`}
                                                                    >
                                                                        {isDone
                                                                            ? step.icon
                                                                            : i +
                                                                              1}
                                                                    </div>
                                                                    <span
                                                                        className={`text-xs ${
                                                                            isDone
                                                                                ? 'text-navy-800 font-medium'
                                                                                : 'text-navy-400'
                                                                        }`}
                                                                    >
                                                                        {
                                                                            step.label
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {i <
                                                                    trackingSteps.length -
                                                                        1 && (
                                                                    <div
                                                                        className={`flex-1 h-0.5 mx-2 mb-5 ${
                                                                            i <
                                                                            current
                                                                                ? 'bg-navy-800'
                                                                                : 'bg-cream-300'
                                                                        }`}
                                                                    />
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            {/* Detail items */}
                                            <div className="mt-4 pt-4 border-t border-cream-300 space-y-2">
                                                {order.order_items?.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex justify-between text-xs"
                                                        >
                                                            <span className="text-navy-400">
                                                                <span className="text-navy-800 font-medium">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    ×
                                                                </span>{' '}
                                                                {
                                                                    item.menu
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span className="text-navy-800">
                                                                Rp{' '}
                                                                {item.subtotal?.toLocaleString(
                                                                    'id',
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Dibatalkan state */}
                                {selected?.id === order.id &&
                                    order.status === 'dibatalkan' && (
                                        <div className="px-5 py-4 border-t border-red-100 bg-red-50">
                                            <p className="text-xs text-red-500 text-center">
                                                Pesanan ini telah dibatalkan
                                            </p>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
