import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrashIcon,
    ShoppingBagIcon,
    CreditCardIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function Cart() {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    const initialOrderInfo = (() => {
        const saved = localStorage.getItem('orderInfo');
        if (!saved)
            return {
                orderType: 'dine-in',
                tableId: '',
                tableNumber: '',
                pickupName: '',
            };
        const parsed = JSON.parse(saved);
        return {
            orderType: parsed.orderType || 'dine-in',
            tableId: parsed.tableId || '',
            tableNumber: parsed.tableNumber || '',
            pickupName: parsed.pickupName || '',
        };
    })();

    const [orderType, setOrderType] = useState(initialOrderInfo.orderType);
    // tableId = integer db id, tableNumber = display string (e.g. "A3")
    const [tableId, setTableId] = useState(initialOrderInfo.tableId);
    const [tableNumber, setTableNumber] = useState(
        initialOrderInfo.tableNumber,
    );
    const [pickupName, setPickupName] = useState(initialOrderInfo.pickupName);
    const [tables, setTables] = useState([]);
    const [tablesLoading, setTablesLoading] = useState(false);

    const navigate = useNavigate();

    // Fetch available tables when dine-in is selected
    useEffect(() => {
        if (orderType === 'dine-in') {
            setTablesLoading(true);
            api.get('/tables?status=available')
                .then((res) => setTables(res.data.data || []))
                .catch(() => toast.error('Gagal memuat daftar meja'))
                .finally(() => setTablesLoading(false));
        }
    }, [orderType]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem(
            'orderInfo',
            JSON.stringify({
                orderType,
                tableId: orderType === 'dine-in' ? tableId : null,
                tableNumber: orderType === 'dine-in' ? tableNumber : null,
                pickupName: orderType === 'takeaway' ? pickupName : null,
            }),
        );
    }, [orderType, tableId, tableNumber, pickupName]);

    const changeQty = (id, delta) => {
        const newCart = cart.map((c) =>
            c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c,
        );
        setCart(newCart);
        try {
            localStorage.setItem('cart', JSON.stringify(newCart));
        } catch (e) {}
        const total = newCart.reduce((a, c) => a + (c.qty || 0), 0);
        window.dispatchEvent(
            new CustomEvent('cartchange', { detail: { count: total } }),
        );
    };

    const removeItem = (id) => {
        const newCart = cart.filter((c) => c.id !== id);
        setCart(newCart);
        try {
            localStorage.setItem('cart', JSON.stringify(newCart));
        } catch (e) {}
        const total = newCart.reduce((a, c) => a + (c.qty || 0), 0);
        window.dispatchEvent(
            new CustomEvent('cartchange', { detail: { count: total } }),
        );
        toast.success('Item dihapus');
    };

    const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Keranjang masih kosong!');
            return;
        }
        if (orderType === 'dine-in' && !tableId) {
            toast.error('Pilih nomor meja terlebih dahulu!');
            return;
        }
        if (orderType === 'takeaway' && !pickupName.trim()) {
            toast.error('Masukkan nama pickup!');
            return;
        }

        localStorage.setItem(
            'orderInfo',
            JSON.stringify({
                orderType,
                tableId: orderType === 'dine-in' ? tableId : null,
                tableNumber: orderType === 'dine-in' ? tableNumber : null,
                pickupName: orderType === 'takeaway' ? pickupName : null,
            }),
        );

        navigate('/checkout');
    };

    return (
        <div className="flex-1 min-h-screen overflow-y-auto bg-cream-100 flex flex-col">
            {/* STEP INDICATOR */}
            <div className="bg-white border-b border-cream-300 px-4 sm:px-6 md:px-12 py-6 shrink-0">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    {[
                        { label: 'Keranjang', active: true },
                        { label: 'Checkout', active: false },
                        { label: 'Konfirmasi', active: false },
                    ].map((step, i) => (
                        <React.Fragment key={step.label}>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                                        step.active
                                            ? 'bg-navy-800 text-cream-100 shadow-md'
                                            : 'bg-cream-200 text-navy-400'
                                    }`}
                                >
                                    {i + 1}
                                </div>
                                <span
                                    className={`text-sm font-semibold hidden sm:inline ${
                                        step.active
                                            ? 'text-navy-900'
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

            {/* MAIN CONTENT */}
            <div className="flex-1 w-full px-4 sm:px-6 md:px-12 py-8 md:py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT – Cart Items & Order Type */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tipe Pesanan */}
                            <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                                <h3 className="font-playfair text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
                                    <ShoppingBagIcon className="w-5 h-5 text-navy-800" />
                                    Tipe Pesanan
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            val: 'dine-in',
                                            label: 'Dine-in',
                                            icon: '🪑',
                                            sub: 'Makan di tempat',
                                        },
                                        {
                                            val: 'takeaway',
                                            label: 'Takeaway',
                                            icon: '🥤',
                                            sub: 'Bawa pulang',
                                        },
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            onClick={() =>
                                                setOrderType(opt.val)
                                            }
                                            className={`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl border-2 transition ${
                                                orderType === opt.val
                                                    ? 'border-navy-800 bg-navy-50'
                                                    : 'border-cream-300 hover:border-navy-300 bg-white'
                                            }`}
                                        >
                                            <span className="text-2xl shrink-0">
                                                {opt.icon}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-navy-900 truncate">
                                                    {opt.label}
                                                </p>
                                                <p className="text-xs text-navy-400 mt-0.5 hidden xs:block">
                                                    {opt.sub}
                                                </p>
                                            </div>
                                            {orderType === opt.val && (
                                                <span className="hidden sm:flex shrink-0 w-5 h-5 rounded-full bg-navy-800 text-cream-100 text-[10px] items-center justify-center self-center">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {orderType === 'dine-in' && (
                                    <div className="mt-5 pt-5 border-t border-cream-200">
                                        <label className="text-xs font-semibold text-navy-800 block mb-2">
                                            Pilih Meja
                                        </label>
                                        {tablesLoading ? (
                                            <div className="flex items-center gap-2 px-4 py-3 bg-cream-100 border border-cream-300 rounded-xl text-sm text-navy-400">
                                                <div className="w-4 h-4 border-2 border-navy-400 border-t-transparent rounded-full animate-spin" />
                                                Memuat daftar meja...
                                            </div>
                                        ) : tables.length === 0 ? (
                                            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                                                ⚠️ Tidak ada meja tersedia saat
                                                ini
                                            </div>
                                        ) : (
                                            <select
                                                value={tableId}
                                                onChange={(e) => {
                                                    const selected =
                                                        tables.find(
                                                            (t) =>
                                                                String(t.id) ===
                                                                e.target.value,
                                                        );
                                                    setTableId(e.target.value);
                                                    setTableNumber(
                                                        selected?.table_number ||
                                                            '',
                                                    );
                                                }}
                                                className="w-full px-4 py-3 bg-cream-100 border border-cream-300 rounded-xl text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition appearance-none cursor-pointer"
                                            >
                                                <option value="">
                                                    — Pilih meja —
                                                </option>
                                                {tables.map((t) => (
                                                    <option
                                                        key={t.id}
                                                        value={t.id}
                                                    >
                                                        Meja {t.table_number} ·{' '}
                                                        {t.capacity} orang
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <p className="text-xs text-navy-400 mt-2">
                                            Scan QR Code di meja untuk isi
                                            otomatis
                                        </p>
                                    </div>
                                )}

                                {orderType === 'takeaway' && (
                                    <div className="mt-5 pt-5 border-t border-cream-200">
                                        <label className="text-xs font-semibold text-navy-800 block mb-2">
                                            Nama Pickup
                                        </label>
                                        <input
                                            type="text"
                                            value={pickupName}
                                            onChange={(e) =>
                                                setPickupName(e.target.value)
                                            }
                                            placeholder="Nama kamu"
                                            className="w-full px-4 py-3 bg-cream-100 border border-cream-300 rounded-xl text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Daftar Item */}
                            <div className="bg-white border border-cream-300 rounded-3xl overflow-hidden shadow-sm">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
                                    <h3 className="font-playfair text-lg font-medium text-navy-900">
                                        Item Pesanan ({cart.length})
                                    </h3>
                                    {cart.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setCart([]);
                                                try {
                                                    localStorage.setItem(
                                                        'cart',
                                                        JSON.stringify([]),
                                                    );
                                                } catch (e) {}
                                                window.dispatchEvent(
                                                    new CustomEvent(
                                                        'cartchange',
                                                        {
                                                            detail: {
                                                                count: 0,
                                                            },
                                                        },
                                                    ),
                                                );
                                                toast.success(
                                                    'Keranjang dikosongkan',
                                                );
                                            }}
                                            className="text-xs font-medium text-navy-400 hover:text-red-500 transition"
                                        >
                                            Hapus semua
                                        </button>
                                    )}
                                </div>

                                {cart.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-5 text-4xl">
                                            🛒
                                        </div>
                                        <p className="text-navy-400 text-sm font-medium">
                                            Keranjang masih kosong
                                        </p>
                                        <button
                                            onClick={() => navigate('/menu')}
                                            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-cream-100 rounded-full text-sm font-semibold hover:bg-navy-900 transition"
                                        >
                                            <ArrowLeftIcon className="w-4 h-4" />
                                            Lihat Menu
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-cream-200">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-5 px-6 py-5 hover:bg-cream-50 transition"
                                            >
                                                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-navy-800 to-navy-600 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                                                    ☕
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-navy-900 truncate">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-xs text-navy-400 mt-1">
                                                        Rp{' '}
                                                        {item.price.toLocaleString(
                                                            'id',
                                                        )}{' '}
                                                        / item
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() =>
                                                                changeQty(
                                                                    item.id,
                                                                    -1,
                                                                )
                                                            }
                                                            className="w-7 h-7 rounded-lg border border-cream-300 text-navy-800 flex items-center justify-center hover:bg-cream-200 transition"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-sm font-semibold w-6 text-center text-navy-900">
                                                            {item.qty}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                changeQty(
                                                                    item.id,
                                                                    1,
                                                                )
                                                            }
                                                            className="w-7 h-7 rounded-lg bg-navy-800 text-cream-100 flex items-center justify-center hover:bg-navy-900 transition"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-bold text-navy-900">
                                                        Rp{' '}
                                                        {(
                                                            item.price *
                                                            item.qty
                                                        ).toLocaleString('id')}
                                                    </p>
                                                    <button
                                                        onClick={() =>
                                                            removeItem(item.id)
                                                        }
                                                        className="mt-2 w-8 h-8 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT – Ringkasan & Checkout */}
                        <aside className="lg:col-span-1">
                            <div className="sticky top-28 bg-white border border-cream-300 rounded-3xl overflow-hidden shadow-md">
                                <div className="bg-navy-800 px-6 py-5">
                                    <h3 className="font-playfair text-lg font-medium text-cream-100 flex items-center gap-2">
                                        <CreditCardIcon className="w-5 h-5" />
                                        Ringkasan
                                    </h3>
                                    <p className="text-xs text-cream-200 mt-1">
                                        {orderType === 'dine-in'
                                            ? `Dine-in · Meja ${tableNumber || '—'}`
                                            : `Takeaway · ${pickupName || '—'}`}
                                    </p>
                                </div>
                                <div className="p-6">
                                    {cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-sm py-2"
                                        >
                                            <span className="text-navy-400 truncate mr-2">
                                                <span className="text-navy-800 font-semibold">
                                                    {item.qty}×
                                                </span>{' '}
                                                {item.name}
                                            </span>
                                            <span className="text-navy-800 font-medium">
                                                Rp{' '}
                                                {(
                                                    item.price * item.qty
                                                ).toLocaleString('id')}
                                            </span>
                                        </div>
                                    ))}

                                    <div className="border-t border-cream-200 mt-4 pt-4 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-navy-900">
                                            Total
                                        </span>
                                        <span className="text-xl font-bold text-navy-900">
                                            Rp {subtotal.toLocaleString('id')}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="mt-6 w-full py-3.5 bg-navy-800 text-cream-100 rounded-full font-bold hover:bg-navy-900 transition flex items-center justify-center gap-2 shadow-md"
                                    >
                                        Lanjut ke Checkout
                                        <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                                    </button>

                                    <p className="text-xs text-navy-400 text-center mt-4 leading-relaxed">
                                        Pembayaran dilakukan secara tunai di
                                        kasir.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
