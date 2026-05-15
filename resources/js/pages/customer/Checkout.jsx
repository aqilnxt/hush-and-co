import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const orderInfo = JSON.parse(localStorage.getItem('orderInfo') || '{}');
    const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
    
    const handleConfirm = async () => {
        setLoading(true);
        try {
            const payload = {
                order_type: orderInfo.orderType,
                table_id: orderInfo.tableId,
                pickup_name: orderInfo.pickupName,
                items: cart.map((c) => ({
                    menu_id: c.id,
                    quantity: c.qty,
                    notes: null,
                })),
            };

            const res = await api.post('/orders', payload);
            setOrder(res.data.data);

            // Clear cart
            localStorage.removeItem('cart');
            localStorage.removeItem('orderInfo');

            toast.success('Pesanan berhasil dibuat!');
        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Gagal membuat pesanan!',
            );
        } finally {
            setLoading(false);
        }
    };

    // SUCCESS STATE
    if (order)
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
                <div className="bg-white border border-cream-300 rounded-2xl p-10 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="font-playfair text-2xl font-medium text-navy-900 mb-2">
                        Pesanan{' '}
                        <em className="italic text-cream-600">masuk!</em>
                    </h2>
                    <p className="text-sm text-navy-400 mb-6">
                        Pesananmu sedang diproses oleh barista. Tunggu sebentar
                        ya!
                    </p>

                    <div className="bg-navy-100 rounded-xl p-4 mb-6">
                        <p className="text-xs text-navy-400 uppercase tracking-widest mb-1">
                            Nomor Pesanan
                        </p>
                        <p className="font-playfair text-2xl font-medium text-navy-800">
                            #HSH-{String(order.id).padStart(4, '0')}
                        </p>
                    </div>

                    <div className="text-left space-y-2 mb-6">
                        {[
                            [
                                'Tipe',
                                orderInfo.orderType === 'dine-in'
                                    ? `🪑 Dine-in · Meja ${orderInfo.tableId}`
                                    : `🥤 Takeaway · ${orderInfo.pickupName}`,
                            ],
                            [
                                'Total',
                                `Rp ${order.total_price?.toLocaleString('id')}`,
                            ],
                            ['Pembayaran', 'Cash di kasir'],
                            ['Status', '⏳ Pending'],
                        ].map(([label, val]) => (
                            <div
                                key={label}
                                className="flex justify-between text-sm"
                            >
                                <span className="text-navy-400">{label}</span>
                                <span className="text-navy-800 font-medium">
                                    {val}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full py-3 bg-navy-800 text-cream-200 rounded-xl text-sm font-medium hover:bg-navy-900 transition"
                    >
                        Pantau Status Pesanan
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full mt-2 py-3 border border-cream-300 text-navy-400 rounded-xl text-sm hover:border-navy-200 hover:text-navy-800 transition"
                    >
                        Pesan Lagi
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-cream-100">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-cream-100/90 backdrop-blur border-b border-cream-300 px-6 md:px-12 h-16 flex items-center gap-4">
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-sm text-navy-400 hover:text-navy-800 transition"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Keranjang
                </button>
                <span className="font-playfair text-xl font-medium text-navy-800 ml-auto">
                    Hush <span className="text-cream-600">&</span> Co.
                </span>
            </nav>

            {/* STEPS */}
            <div className="bg-white border-b border-cream-300 px-6 md:px-12 py-4 flex items-center gap-3">
                {['Keranjang', 'Checkout', 'Konfirmasi'].map((s, i) => (
                    <React.Fragment key={s}>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                                    i === 0
                                        ? 'bg-navy-800 text-cream-200'
                                        : i === 1
                                          ? 'bg-navy-100 text-navy-800 border border-navy-800'
                                          : 'bg-cream-200 text-navy-400'
                                }`}
                            >
                                {i === 0 ? '✓' : i + 1}
                            </div>
                            <span
                                className={`text-sm font-medium ${
                                    i === 1
                                        ? 'text-navy-800'
                                        : i === 0
                                          ? 'text-navy-400'
                                          : 'text-navy-200'
                                }`}
                            >
                                {s}
                            </span>
                        </div>
                        {i < 2 && (
                            <div
                                className={`flex-1 h-px ${i === 0 ? 'bg-navy-800' : 'bg-cream-300'}`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-4">
                    {/* INFO PELANGGAN */}
                    <div className="bg-white border border-cream-300 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-7 h-7 rounded-full bg-navy-800 text-cream-200 text-xs font-semibold flex items-center justify-center">
                                1
                            </div>
                            <div>
                                <p className="text-sm font-medium text-navy-900">
                                    Informasi Pelanggan
                                </p>
                                <p className="text-xs text-navy-400">
                                    Data akun yang terdaftar
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {[
                                ['Nama', user?.name],
                                ['Email', user?.email],
                            ].map(([label, val]) => (
                                <div key={label}>
                                    <label className="text-xs font-medium text-navy-800 block mb-1.5">
                                        {label}
                                    </label>
                                    <div className="px-4 py-2.5 bg-cream-200 border border-cream-300 rounded-xl text-sm text-navy-800">
                                        {val}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DETAIL PESANAN */}
                    <div className="bg-white border border-cream-300 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-7 h-7 rounded-full bg-navy-800 text-cream-200 text-xs font-semibold flex items-center justify-center">
                                2
                            </div>
                            <div>
                                <p className="text-sm font-medium text-navy-900">
                                    Detail Pesanan
                                </p>
                                <p className="text-xs text-navy-400">
                                    Tipe order dan lokasi
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium ${
                                    orderInfo.orderType === 'dine-in'
                                        ? 'border-navy-800 bg-navy-100 text-navy-800'
                                        : 'border-cream-300 text-navy-400'
                                }`}
                            >
                                🪑 Dine-in
                            </div>
                            <div
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium ${
                                    orderInfo.orderType === 'takeaway'
                                        ? 'border-navy-800 bg-navy-100 text-navy-800'
                                        : 'border-cream-300 text-navy-400'
                                }`}
                            >
                                🥤 Takeaway
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-cream-300 flex items-center gap-3">
                            <div className="bg-navy-800 text-cream-200 px-4 py-2 rounded-lg text-sm font-medium">
                                {orderInfo.orderType === 'dine-in'
                                    ? `🪑 Meja ${orderInfo.tableId}`
                                    : `👤 ${orderInfo.pickupName}`}
                            </div>
                        </div>
                    </div>

                    {/* PEMBAYARAN */}
                    <div className="bg-white border border-cream-300 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-7 h-7 rounded-full bg-navy-800 text-cream-200 text-xs font-semibold flex items-center justify-center">
                                3
                            </div>
                            <div>
                                <p className="text-sm font-medium text-navy-900">
                                    Metode Pembayaran
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-navy-800 bg-navy-100">
                            <span className="text-xl">💵</span>
                            <div>
                                <p className="text-sm font-medium text-navy-800">
                                    Cash / Tunai
                                </p>
                                <p className="text-xs text-navy-400">
                                    Bayar langsung di kasir setelah pesanan
                                    selesai
                                </p>
                            </div>
                            <span className="ml-auto w-5 h-5 rounded-full bg-navy-800 text-white text-xs flex items-center justify-center">
                                ✓
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-cream-300 rounded-2xl overflow-hidden sticky top-24">
                        <div className="bg-navy-800 px-5 py-4">
                            <h3 className="font-playfair text-lg font-medium text-cream-200">
                                Ringkasan Pesanan
                            </h3>
                        </div>
                        <div className="p-5">
                            <div className="space-y-2 mb-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                                            ☕
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-navy-800 font-medium">
                                                {item.name}
                                            </p>
                                            <p className="text-navy-400">
                                                {item.qty}× item
                                            </p>
                                        </div>
                                        <span className="text-navy-800 font-medium">
                                            Rp{' '}
                                            {(
                                                item.price * item.qty
                                            ).toLocaleString('id')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-cream-300 pt-3 flex justify-between mb-4">
                                <span className="text-sm font-medium text-navy-900">
                                    Total
                                </span>
                                <span className="text-lg font-medium text-navy-800">
                                    Rp {subtotal.toLocaleString('id')}
                                </span>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={loading || cart.length === 0}
                                className="w-full py-3 bg-navy-800 text-cream-200 rounded-xl text-sm font-medium hover:bg-navy-900 transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-cream-200 border-t-transparent rounded-full animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    '✓ Konfirmasi Pesanan'
                                )}
                            </button>

                            <p className="text-xs text-navy-400 text-center mt-3 leading-relaxed">
                                Dengan mengkonfirmasi, pesanan tidak bisa
                                dibatalkan setelah diproses.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
