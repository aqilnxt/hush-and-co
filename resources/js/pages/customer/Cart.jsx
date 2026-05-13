import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Cart() {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [orderType, setOrderType] = useState('dine-in');
    const [tableId, setTableId] = useState('');
    const [pickupName, setPickupName] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const changeQty = (id, delta) => {
        setCart((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c,
            ),
        );
    };

    const removeItem = (id) => {
        setCart((prev) => prev.filter((c) => c.id !== id));
        toast.success('Item dihapus');
    };

    const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Keranjang masih kosong!');
            return;
        }
        if (orderType === 'dine-in' && !tableId) {
            toast.error('Masukkan nomor meja!');
            return;
        }
        if (orderType === 'takeaway' && !pickupName.trim()) {
            toast.error('Masukkan nama pickup!');
            return;
        }

        // Simpan info order ke localStorage
        localStorage.setItem(
            'orderInfo',
            JSON.stringify({
                orderType,
                tableId: orderType === 'dine-in' ? tableId : null,
                pickupName: orderType === 'takeaway' ? pickupName : null,
            }),
        );

        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-cream-100">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-cream-100/90 backdrop-blur border-b border-cream-300 px-6 md:px-12 h-16 flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-navy-400 hover:text-navy-800 transition"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Menu
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
                                        ? 'bg-navy-100 text-navy-800 border-1.5 border-navy-800'
                                        : 'bg-cream-200 text-navy-400'
                                }`}
                            >
                                {i + 1}
                            </div>
                            <span
                                className={`text-sm font-medium ${i === 0 ? 'text-navy-800' : 'text-navy-200'}`}
                            >
                                {s}
                            </span>
                        </div>
                        {i < 2 && <div className="flex-1 h-px bg-cream-300" />}
                    </React.Fragment>
                ))}
            </div>

            <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-4">
                    {/* ORDER TYPE */}
                    <div className="bg-white border border-cream-300 rounded-2xl p-5">
                        <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-4">
                            Tipe Pesanan
                        </p>
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
                                    onClick={() => setOrderType(opt.val)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
                                        orderType === opt.val
                                            ? 'border-navy-800 bg-navy-100'
                                            : 'border-cream-300 hover:border-navy-200'
                                    }`}
                                >
                                    <span className="text-xl">{opt.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-navy-800">
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-navy-400">
                                            {opt.sub}
                                        </p>
                                    </div>
                                    {orderType === opt.val && (
                                        <span className="ml-auto w-5 h-5 rounded-full bg-navy-800 text-white text-xs flex items-center justify-center">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Dine-in input */}
                        {orderType === 'dine-in' && (
                            <div className="mt-4 pt-4 border-t border-cream-300">
                                <label className="text-xs font-medium text-navy-800 block mb-2">
                                    Nomor Meja
                                </label>
                                <input
                                    type="text"
                                    value={tableId}
                                    onChange={(e) => setTableId(e.target.value)}
                                    placeholder="Contoh: A3"
                                    className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm outline-none focus:border-navy-400 transition"
                                />
                                <p className="text-xs text-navy-400 mt-1">
                                    Scan QR Code di meja untuk isi otomatis
                                </p>
                            </div>
                        )}

                        {/* Takeaway input */}
                        {orderType === 'takeaway' && (
                            <div className="mt-4 pt-4 border-t border-cream-300">
                                <label className="text-xs font-medium text-navy-800 block mb-2">
                                    Nama Pickup
                                </label>
                                <input
                                    type="text"
                                    value={pickupName}
                                    onChange={(e) =>
                                        setPickupName(e.target.value)
                                    }
                                    placeholder="Nama kamu"
                                    className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm outline-none focus:border-navy-400 transition"
                                />
                            </div>
                        )}
                    </div>

                    {/* CART ITEMS */}
                    <div className="bg-white border border-cream-300 rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-300">
                            <h2 className="font-playfair text-lg font-medium text-navy-900">
                                Item Pesanan
                            </h2>
                            {cart.length > 0 && (
                                <button
                                    onClick={() => {
                                        setCart([]);
                                        toast.success('Keranjang dikosongkan');
                                    }}
                                    className="text-xs text-navy-400 hover:text-red-500 transition underline"
                                >
                                    Hapus semua
                                </button>
                            )}
                        </div>

                        {cart.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-4xl mb-3">🛒</p>
                                <p className="text-navy-400 text-sm">
                                    Keranjang masih kosong
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 text-sm text-navy-800 underline"
                                >
                                    Lihat menu
                                </button>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 px-5 py-4 border-b border-cream-300 last:border-0"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-navy-800 to-navy-600 flex items-center justify-center text-2xl flex-shrink-0">
                                        ☕
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-navy-900">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-navy-400">
                                            Rp {item.price.toLocaleString('id')}{' '}
                                            / item
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-navy-800">
                                            Rp{' '}
                                            {(
                                                item.price * item.qty
                                            ).toLocaleString('id')}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    changeQty(item.id, -1)
                                                }
                                                className="w-7 h-7 rounded-lg border border-cream-300 text-navy-800 flex items-center justify-center hover:bg-cream-200 transition"
                                            >
                                                −
                                            </button>
                                            <span className="text-sm font-medium w-6 text-center">
                                                {item.qty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    changeQty(item.id, 1)
                                                }
                                                className="w-7 h-7 rounded-lg bg-navy-800 text-cream-200 flex items-center justify-center hover:bg-navy-900 transition"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                                className="w-7 h-7 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition ml-1"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT — SUMMARY */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-cream-300 rounded-2xl overflow-hidden sticky top-24">
                        <div className="bg-navy-800 px-5 py-4">
                            <h3 className="font-playfair text-lg font-medium text-cream-200">
                                Ringkasan
                            </h3>
                            <p className="text-xs text-navy-200 mt-1">
                                {orderType === 'dine-in'
                                    ? `Dine-in · Meja ${tableId || '—'}`
                                    : `Takeaway · ${pickupName || '—'}`}
                            </p>
                        </div>
                        <div className="p-5">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between text-xs py-1.5"
                                >
                                    <span className="text-navy-400">
                                        <span className="text-navy-800 font-medium">
                                            {item.qty}×
                                        </span>{' '}
                                        {item.name}
                                    </span>
                                    <span className="text-navy-800">
                                        Rp{' '}
                                        {(item.price * item.qty).toLocaleString(
                                            'id',
                                        )}
                                    </span>
                                </div>
                            ))}

                            <div className="border-t border-cream-300 mt-3 pt-3 flex justify-between">
                                <span className="text-sm font-medium text-navy-900">
                                    Total
                                </span>
                                <span className="text-lg font-medium text-navy-800">
                                    Rp {subtotal.toLocaleString('id')}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full mt-4 py-3 bg-navy-800 text-cream-200 rounded-xl text-sm font-medium hover:bg-navy-900 transition"
                            >
                                Lanjut ke Checkout →
                            </button>

                            <p className="text-xs text-navy-400 text-center mt-3 leading-relaxed">
                                Pembayaran dilakukan secara tunai di kasir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
