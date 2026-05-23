import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    SparklesIcon,
    CreditCardIcon,
    UserIcon,
    ShoppingBagIcon,
    BanknotesIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
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
    const tableNumber = orderInfo.tableNumber || orderInfo.tableId || '';
    const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);

    useEffect(() => {
        // Don't redirect if order was just placed successfully
        if (order) return;

        const hasValidOrderInfo =
            orderInfo.orderType &&
            (orderInfo.orderType === 'takeaway'
                ? orderInfo.pickupName?.trim().length > 0
                : !!orderInfo.tableId);

        if (cart.length === 0 || !hasValidOrderInfo) {
            toast.error('Pesanan tidak lengkap. Kembali ke keranjang.');
            navigate('/cart', { replace: true });
        }
    }, [
        order,
        cart.length,
        navigate,
        orderInfo.orderType,
        orderInfo.tableId,
        orderInfo.pickupName,
    ]);


    const handleConfirm = async () => {
        setLoading(true);
        try {
            const payload = {
                order_type: orderInfo.orderType,
                items: cart.map((c) => ({
                    menu_id: c.id,
                    quantity: c.qty,
                    notes: null,
                })),
            };

            if (orderInfo.orderType === 'dine-in') {
                payload.table_id = Number(orderInfo.tableId);
            } else {
                payload.pickup_name = orderInfo.pickupName;
            }

            const res = await api.post('/orders', payload);
            setOrder(res.data.data);

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
                <div className="bg-white border border-cream-300 rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="font-playfair text-2xl font-medium text-navy-900 mb-2">
                        Pesanan{' '}
                        <em className="italic text-cream-600">masuk!</em>
                    </h2>
                    <p className="text-sm text-navy-400 mb-6">
                        Pesananmu sedang diproses oleh barista. Tunggu sebentar
                        ya!
                    </p>

                    <div className="bg-navy-50 rounded-2xl p-5 mb-6 border border-navy-100">
                        <p className="text-xs text-navy-400 uppercase tracking-widest mb-1">
                            Nomor Pesanan
                        </p>
                        <p className="font-playfair text-2xl font-medium text-navy-800">
                            #HSH-{String(order.id).padStart(4, '0')}
                        </p>
                    </div>

                    <div className="text-left space-y-3 mb-6">
                        {[
                            [
                                'Tipe',
                                order.order_type === 'dine-in'
                                    ? `🪑 Dine-in · Meja ${order.table?.table_number || tableNumber}`
                                    : `🥤 Takeaway · ${order.pickup_name || orderInfo.pickupName}`,
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
                        className="w-full py-3.5 bg-navy-800 text-cream-100 rounded-full text-sm font-semibold hover:bg-navy-900 transition shadow-md mb-3"
                    >
                        Pantau Status Pesanan
                    </button>
                    <button
                        onClick={() => navigate('/menu')}
                        className="w-full py-3.5 border border-cream-300 text-navy-400 rounded-full text-sm font-medium hover:border-navy-400 hover:text-navy-800 transition"
                    >
                        Pesan Lagi
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col">
            {/* ========== HEADER (konsisten dengan Orders & Cart) ========== */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cream-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                    {/* Kiri: logo (bisa klik ke menu) */}
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-11 h-11 bg-navy-800 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-navy-900 transition">
                            <SparklesIcon className="w-6 h-6 text-cream-100" />
                        </div>
                        <span className="font-playfair text-xl font-bold text-navy-900">
                            Hush <span className="text-cream-600">&</span> Co.
                        </span>
                    </button>

                    {/* Kanan: tombol kembali ke Keranjang */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 text-sm font-medium text-navy-400 hover:text-navy-800 transition"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Keranjang</span>
                    </button>
                </div>
            </header>

            {/* ========== STEP INDICATOR (konsisten dengan Cart) ========== */}
            <div className="bg-white border-b border-cream-300 px-6 md:px-12 py-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    {[
                        { label: 'Keranjang', active: false, done: true },
                        { label: 'Checkout', active: true, done: false },
                        { label: 'Konfirmasi', active: false, done: false },
                    ].map((step, i) => (
                        <React.Fragment key={step.label}>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                                        step.active
                                            ? 'bg-navy-800 text-cream-100 shadow-md'
                                            : step.done
                                              ? 'bg-navy-800 text-cream-100'
                                              : 'bg-cream-200 text-navy-400'
                                    }`}
                                >
                                    {step.done ? '✓' : i + 1}
                                </div>
                                <span
                                    className={`text-sm font-semibold hidden sm:inline ${
                                        step.active
                                            ? 'text-navy-900'
                                            : step.done
                                              ? 'text-navy-400'
                                              : 'text-navy-400'
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {i < 2 && (
                                <div className="flex-1 h-0.5 bg-cream-300 mx-4 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-navy-800 transition-all duration-500 ${
                                            i === 0 ? 'w-full' : 'w-0'
                                        }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ========== MAIN CONTENT ========== */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-12 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT – Form Checkout */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Informasi Pelanggan */}
                        <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                            <h3 className="font-playfair text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-navy-800" />
                                Informasi Pelanggan
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    ['Nama', user?.name],
                                    ['Email', user?.email],
                                ].map(([label, val]) => (
                                    <div key={label}>
                                        <label className="text-xs font-semibold text-navy-400 uppercase tracking-wider block mb-2">
                                            {label}
                                        </label>
                                        <div className="px-4 py-3 bg-cream-100 border border-cream-300 rounded-xl text-sm text-navy-800 font-medium">
                                            {val}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detail Pesanan */}
                        <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                            <h3 className="font-playfair text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
                                <ShoppingBagIcon className="w-5 h-5 text-navy-800" />
                                Detail Pesanan
                            </h3>
                            <div className="flex gap-3 mb-4">
                                <div
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium ${
                                        orderInfo.orderType === 'dine-in'
                                            ? 'border-navy-800 bg-navy-50 text-navy-800'
                                            : 'border-cream-300 text-navy-400'
                                    }`}
                                >
                                    🪑 Dine-in
                                </div>
                                <div
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium ${
                                        orderInfo.orderType === 'takeaway'
                                            ? 'border-navy-800 bg-navy-50 text-navy-800'
                                            : 'border-cream-300 text-navy-400'
                                    }`}
                                >
                                    🥤 Takeaway
                                </div>
                            </div>
                            <div className="bg-navy-50 border border-navy-100 rounded-xl px-4 py-3 text-sm font-medium text-navy-800">
                                {orderInfo.orderType === 'dine-in'
                                    ? `🪑 Meja ${tableNumber}`
                                    : `👤 ${orderInfo.pickupName}`}
                            </div>
                        </div>

                        {/* Pembayaran */}
                        <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                            <h3 className="font-playfair text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
                                <BanknotesIcon className="w-5 h-5 text-navy-800" />
                                Metode Pembayaran
                            </h3>
                            <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-navy-800 bg-navy-50">
                                <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
                                    <BanknotesIcon className="w-5 h-5 text-cream-100" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-navy-800">
                                        Cash / Tunai
                                    </p>
                                    <p className="text-xs text-navy-400 mt-0.5">
                                        Bayar langsung di kasir setelah pesanan
                                        selesai
                                    </p>
                                </div>
                                <CheckCircleIcon className="w-5 h-5 text-navy-800 ml-auto" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT – Ringkasan & Konfirmasi */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-28 bg-white border border-cream-300 rounded-3xl overflow-hidden shadow-md">
                            <div className="bg-navy-800 px-6 py-5">
                                <h3 className="font-playfair text-lg font-medium text-cream-100 flex items-center gap-2">
                                    <CreditCardIcon className="w-5 h-5" />
                                    Ringkasan
                                </h3>
                                <p className="text-xs text-cream-200 mt-1">
                                    {orderInfo.orderType === 'dine-in'
                                        ? `Dine-in · Meja ${orderInfo.tableId}`
                                        : `Takeaway · ${orderInfo.pickupName}`}
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3 mb-4">
                                    {cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0 text-lg">
                                                ☕
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-navy-800 font-medium truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-navy-400">
                                                    {item.qty}× item
                                                </p>
                                            </div>
                                            <span className="text-navy-800 font-medium whitespace-nowrap">
                                                Rp{' '}
                                                {(
                                                    item.price * item.qty
                                                ).toLocaleString('id')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-cream-200 pt-4 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-navy-900">
                                        Total
                                    </span>
                                    <span className="text-xl font-bold text-navy-900">
                                        Rp {subtotal.toLocaleString('id')}
                                    </span>
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    disabled={loading || cart.length === 0}
                                    className="mt-6 w-full py-3.5 bg-navy-800 text-cream-100 rounded-full font-bold hover:bg-navy-900 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-cream-200 border-t-transparent rounded-full animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Konfirmasi Pesanan
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-navy-400 text-center mt-4 leading-relaxed">
                                    Dengan mengkonfirmasi, pesanan tidak bisa
                                    dibatalkan setelah diproses.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ========== FOOTER (konsisten dengan Orders & Cart) ========== */}
            <footer className="bg-navy-800 text-cream-200 mt-auto">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2">
                            <h3 className="font-playfair text-2xl font-medium mb-3">
                                Hush <span className="text-cream-600">&</span>{' '}
                                Co.
                            </h3>
                            <p className="text-navy-200 text-sm leading-relaxed max-w-xs">
                                Tempat yang tenang untuk minum kopi, bekerja,
                                dan menikmati waktu sendiri maupun bersama.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-4">
                                Menu
                            </p>
                            <ul className="space-y-2 text-sm text-navy-200">
                                <li>
                                    <button
                                        onClick={() => navigate('/menu')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Lihat Menu
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => navigate('/orders')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Riwayat Pesanan
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => navigate('/cart')}
                                        className="hover:text-cream-100 transition"
                                    >
                                        Keranjang
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-4">
                                Kontak
                            </p>
                            <ul className="space-y-2 text-sm text-navy-200">
                                <li>📍 Jakarta, Indonesia</li>
                                <li>📞 +62 812-3456-7890</li>
                                <li>✉️ halo@hushandco.id</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-cream-400/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-navy-400">
                        <p>
                            © {new Date().getFullYear()} Hush & Co. All rights
                            reserved.
                        </p>
                        <p className="font-playfair italic text-cream-600 mt-2 md:mt-0">
                            A quiet place to think, sip & stay.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
