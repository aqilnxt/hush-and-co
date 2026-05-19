import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function TableManager() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [showDel, setShowDel] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [qrTarget, setQrTarget] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [areaFilter, setAreaFilter] = useState('all');
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        table_number: '',
        capacity: 2,
        status: 'available',
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await api.get('/tables');
            setTables(res.data.data);
        } catch (err) {
            toast.error('Gagal memuat data meja');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditTarget(null);
        setForm({ table_number: '', capacity: 2, status: 'available' });
        setShowModal(true);
    };

    const openEdit = (table) => {
        setEditTarget(table);
        setForm({
            table_number: table.table_number,
            capacity: table.capacity,
            status: table.status,
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editTarget) {
                await api.put(`/tables/${editTarget.id}`, form);
                toast.success('Meja berhasil diupdate!');
            } else {
                await api.post('/tables', form);
                toast.success('Meja berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchTables();
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors)
                    .flat()
                    .forEach((m) => toast.error(m));
            } else {
                toast.error(
                    err.response?.data?.message || 'Gagal menyimpan meja',
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/tables/${deleteId}`);
            toast.success('Meja berhasil dihapus!');
            setShowDel(false);
            fetchTables();
        } catch (err) {
            toast.error('Gagal menghapus meja');
        }
    };

    const handleRegenerateQr = async (id) => {
        try {
            await api.post(`/tables/${id}/regenerate-qr`);
            toast.success('QR Code berhasil diupdate!');
            fetchTables();
        } catch (err) {
            toast.error('Gagal update QR Code');
        }
    };

    // Ambil area dari nomor meja (A, B, C)
    const getArea = (num) => num?.charAt(0) || '?';
    const areas = [
        ...new Set(tables.map((t) => getArea(t.table_number))),
    ].sort();

    const filtered =
        areaFilter === 'all'
            ? tables
            : tables.filter((t) => getArea(t.table_number) === areaFilter);

    const statusConfig = {
        available: {
            label: 'Tersedia',
            color: 'bg-green-500/10 text-green-400 border-green-500/20',
            dot: 'bg-green-400',
        },
        occupied: {
            label: 'Terisi',
            color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            dot: 'bg-blue-400',
        },
        reserved: {
            label: 'Dipesan',
            color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            dot: 'bg-yellow-400',
        },
        unavailable: {
            label: 'Tidak Tersedia',
            color: 'bg-red-500/10 text-red-400 border-red-500/20',
            dot: 'bg-red-400',
        },
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/menus', label: 'Kelola Menu', icon: '📋' },
        { path: '/admin/tables', label: 'Meja & QR', icon: '🪑', active: true },
        { path: '/admin/users', label: 'User & Staff', icon: '👥' },
        { path: '/admin/reports', label: 'Laporan', icon: '📈' },
    ];

    if (loading)
        return (
            <div className="min-h-screen bg-navy-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cream-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="min-h-screen bg-navy-900 flex">
            {/* SIDEBAR */}
            <aside className="w-56 bg-navy-800 flex flex-col py-7 border-r border-white/10 flex-shrink-0">
                <div className="px-6 mb-1">
                    <p className="font-playfair text-lg font-medium text-cream-200">
                        Hush <span className="text-cream-400">&</span> Co.
                    </p>
                    <p className="text-xs text-navy-400 tracking-widest uppercase mt-0.5">
                        Admin Panel
                    </p>
                </div>
                <div className="mt-8 flex-1 px-3">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition ${
                                item.active
                                    ? 'bg-cream-400/10 text-cream-200 border-l-2 border-cream-400'
                                    : 'text-navy-200 hover:bg-white/5 hover:text-cream-200'
                            }`}
                        >
                            <span>{item.icon}</span> {item.label}
                        </button>
                    ))}
                </div>
                <div className="px-6 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-cream-400 flex items-center justify-center text-navy-900 font-bold text-sm">
                            {user?.name?.[0]}
                        </div>
                        <div>
                            <p className="text-sm text-cream-200 font-medium">
                                {user?.name}
                            </p>
                            <p className="text-xs text-navy-400">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="text-xs text-navy-400 hover:text-cream-200 transition"
                    >
                        → Logout
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOPBAR */}
                <div className="bg-navy-800 px-8 h-14 flex items-center justify-between border-b border-white/10">
                    <span className="text-sm font-medium text-cream-200">
                        Kelola Meja & QR Code
                    </span>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-1.5 bg-cream-400 text-navy-900 rounded-lg text-sm font-semibold hover:bg-cream-200 transition"
                    >
                        <PlusIcon className="w-4 h-4" /> Tambah Meja
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* STATS */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Meja', val: tables.length },
                            {
                                label: 'Tersedia',
                                val: tables.filter(
                                    (t) => t.status === 'available',
                                ).length,
                            },
                            {
                                label: 'Terisi',
                                val: tables.filter(
                                    (t) => t.status === 'occupied',
                                ).length,
                            },
                            {
                                label: 'Tidak Tersedia',
                                val: tables.filter(
                                    (t) => t.status === 'unavailable',
                                ).length,
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="bg-navy-800 border border-white/10 rounded-xl p-4"
                            >
                                <p className="text-xs text-navy-400 uppercase tracking-widest mb-1">
                                    {s.label}
                                </p>
                                <p className="font-playfair text-2xl font-medium text-cream-200">
                                    {s.val}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* AREA FILTER */}
                    <div className="flex gap-2 mb-6">
                        {['all', ...areas].map((area) => (
                            <button
                                key={area}
                                onClick={() => setAreaFilter(area)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition ${
                                    areaFilter === area
                                        ? 'bg-cream-200 text-navy-900 border-cream-200'
                                        : 'bg-transparent text-navy-400 border-white/15 hover:border-cream-400 hover:text-cream-200'
                                }`}
                            >
                                {area === 'all' ? 'Semua' : `Area ${area}`}
                            </button>
                        ))}
                    </div>

                    {/* TABLE GRID */}
                    <div className="grid grid-cols-4 gap-4">
                        {filtered.map((table) => (
                            <div
                                key={table.id}
                                className="bg-navy-800 border border-white/10 rounded-xl p-5 text-center hover:border-cream-400/25 transition"
                            >
                                <p className="font-playfair text-3xl font-medium text-cream-200 mb-1">
                                    {table.table_number}
                                </p>
                                <p className="text-xs text-navy-400 mb-3">
                                    Area {getArea(table.table_number)}
                                </p>
                                <span
                                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
                                        statusConfig[table.status]?.color
                                    }`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${statusConfig[table.status]?.dot}`}
                                    />
                                    {statusConfig[table.status]?.label}
                                </span>
                                <p className="text-xs text-navy-400 mt-2">
                                    👥 {table.capacity} kursi
                                </p>

                                {/* QR Preview kecil */}
                                <div className="my-3 flex justify-center">
                                    <div className="bg-white p-2 rounded-lg">
                                        <QRCodeSVG
                                            value={
                                                table.qr_code ||
                                                `http://localhost:8000/order?table=${table.table_number}`
                                            }
                                            size={60}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => {
                                            setQrTarget(table);
                                            setShowQR(true);
                                        }}
                                        className="flex-1 py-1.5 bg-cream-400/10 border border-cream-400/15 text-cream-200 rounded-lg text-xs hover:bg-cream-400/20 transition"
                                    >
                                        📷 QR
                                    </button>
                                    <button
                                        onClick={() => openEdit(table)}
                                        className="py-1.5 px-2 bg-cream-400/10 border border-cream-400/15 text-cream-200 rounded-lg text-xs hover:bg-cream-400/20 transition"
                                    >
                                        <PencilIcon className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDeleteId(table.id);
                                            setShowDel(true);
                                        }}
                                        className="py-1.5 px-2 bg-red-500/10 border border-red-500/15 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-navy-800 border border-white/15 rounded-2xl p-8 w-full max-w-sm">
                        <h3 className="font-playfair text-xl font-medium text-cream-200 mb-6">
                            {editTarget
                                ? `Edit — Meja ${editTarget.table_number}`
                                : 'Tambah Meja Baru'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Nomor Meja
                                    </label>
                                    <input
                                        type="text"
                                        value={form.table_number}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                table_number:
                                                    e.target.value.toUpperCase(),
                                            })
                                        }
                                        placeholder="A1"
                                        required
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Kapasitas
                                    </label>
                                    <select
                                        value={form.capacity}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                capacity: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none"
                                    >
                                        {[2, 4, 6, 8].map((n) => (
                                            <option key={n} value={n}>
                                                {n} kursi
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            status: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none"
                                >
                                    <option value="available">Tersedia</option>
                                    <option value="unavailable">
                                        Tidak Tersedia
                                    </option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-white/15 text-navy-400 rounded-lg text-sm hover:text-cream-200 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-cream-400 text-navy-900 rounded-lg text-sm font-semibold hover:bg-cream-200 transition disabled:opacity-60"
                                >
                                    {saving ? 'Menyimpan...' : '💾 Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR MODAL */}
            {showQR && qrTarget && (
                <div className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-navy-800 border border-white/15 rounded-2xl p-8 max-w-sm w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-playfair text-xl font-medium text-cream-200">
                                QR Code — Meja {qrTarget.table_number}
                            </h3>
                            <button
                                onClick={() => setShowQR(false)}
                                className="w-8 h-8 rounded-full border border-white/15 text-navy-400 flex items-center justify-center hover:text-cream-200 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* QR Code besar */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-5 rounded-2xl">
                                <QRCodeSVG
                                    value={
                                        qrTarget.qr_code ||
                                        `http://localhost:8000/order?table=${qrTarget.table_number}`
                                    }
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <p className="font-playfair text-2xl font-medium text-cream-200 mb-1">
                                Meja {qrTarget.table_number}
                            </p>
                            <p className="text-xs text-navy-400 font-mono break-all">
                                {qrTarget.qr_code}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQR(false)}
                                className="flex-1 py-2.5 border border-white/15 text-navy-400 rounded-lg text-sm hover:text-cream-200 transition"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    handleRegenerateQr(qrTarget.id);
                                    setShowQR(false);
                                }}
                                className="flex-1 py-2.5 bg-cream-400 text-navy-900 rounded-lg text-sm font-semibold hover:bg-cream-200 transition"
                            >
                                🔄 Update QR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM */}
            {showDel && (
                <div className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-navy-800 border border-red-500/20 rounded-2xl p-8 max-w-sm w-full text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-cream-200 mb-2">
                            Hapus meja ini?
                        </h3>
                        <p className="text-sm text-navy-400 mb-6">
                            Meja akan dihapus permanen.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDel(false)}
                                className="flex-1 py-2.5 border border-white/15 text-navy-400 rounded-lg text-sm hover:text-cream-200 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/25 transition"
                            >
                                🗑 Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
