import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    FireIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';

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

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data.data);
        } catch (err) {
            toast.error('Gagal memuat detail pesanan');
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    if (!order)
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center text-navy-700">
                Pesanan tidak ditemukan.
            </div>
        );

    const orderItems = order.order_items || order.orderItems || [];
    const StatusIcon = statusConfig[order.status]?.icon;

    return (
        <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden">
                    <div className="px-6 py-6 sm:px-10 sm:py-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-navy-400 mb-3">
                                    Detail Pesanan
                                </p>
                                <h1 className="text-3xl font-semibold text-navy-900">
                                    #{String(order.id).padStart(4, '0')}
                                </h1>
                                <p className="mt-2 text-sm text-navy-500">
                                    {new Date(order.created_at).toLocaleString(
                                        'id',
                                        {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        },
                                    )}
                                </p>
                            </div>

                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border ${statusConfig[order.status]?.color}`}
                            >
                                {StatusIcon && (
                                    <StatusIcon className="w-4 h-4" />
                                )}
                                {statusConfig[order.status]?.label ||
                                    order.status}
                            </span>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5">
                                <p className="text-xs uppercase tracking-widest text-navy-400 mb-2">
                                    Tipe Pesanan
                                </p>
                                <p className="text-sm font-semibold text-navy-900 capitalize">
                                    {order.order_type.replace('-', ' ')}
                                </p>
                            </div>
                            <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5">
                                <p className="text-xs uppercase tracking-widest text-navy-400 mb-2">
                                    Metode
                                </p>
                                <p className="text-sm font-semibold text-navy-900">
                                    {order.payment_status === 'paid'
                                        ? 'Lunas'
                                        : 'Belum Bayar'}
                                </p>
                            </div>
                            <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5">
                                <p className="text-xs uppercase tracking-widest text-navy-400 mb-2">
                                    Lokasi
                                </p>
                                <p className="text-sm font-semibold text-navy-900">
                                    {order.order_type === 'dine-in'
                                        ? `Meja ${order.table?.table_number || '—'}`
                                        : `Ambil atas nama ${order.pickup_name}`}
                                </p>
                            </div>
                        </div>

                        <section className="mt-10">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-navy-400">
                                        Rincian Item
                                    </p>
                                    <p className="text-sm text-navy-500">
                                        {orderItems.length} item
                                    </p>
                                </div>
                                <p className="text-sm font-semibold text-navy-900">
                                    Total Rp{' '}
                                    {order.total_price?.toLocaleString('id')}
                                </p>
                            </div>
                            <div className="space-y-4">
                                {orderItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-3xl border border-cream-200 p-5 bg-white"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-sm font-semibold text-navy-900">
                                                    {item.menu?.name ||
                                                        'Menu tidak tersedia'}
                                                </div>
                                                <div className="mt-2 text-xs text-navy-400 flex flex-wrap gap-2">
                                                    <span>
                                                        Jumlah: {item.quantity}
                                                    </span>
                                                    <span>
                                                        Harga: Rp{' '}
                                                        {item.price?.toLocaleString(
                                                            'id',
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-navy-900">
                                                Rp{' '}
                                                {item.subtotal?.toLocaleString(
                                                    'id',
                                                )}
                                            </div>
                                        </div>
                                        {item.notes && (
                                            <p className="mt-3 text-sm text-navy-500">
                                                Catatan: {item.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
    );
}
