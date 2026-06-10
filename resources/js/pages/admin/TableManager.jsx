import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    TableCellsIcon,
    CheckCircleIcon,
    UserGroupIcon,
    XCircleIcon,
    QrCodeIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

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
        if (!form.table_number || !form.capacity) {
            toast.error('Nomor meja dan kapasitas harus diisi');
            return;
        }
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

    const getArea = (num) => num?.charAt(0) || '?';
    const areas = [
        ...new Set(tables.map((t) => getArea(t.table_number))),
    ].sort();
    const filtered =
        areaFilter === 'all'
            ? tables
            : tables.filter((t) => getArea(t.table_number) === areaFilter);

    const stats = [
        {
            label: 'Total Meja',
            value: tables.length,
            icon: TableCellsIcon,
            bg: 'bg-navy-50',
            text: 'text-navy-800',
        },
        {
            label: 'Tersedia',
            value: tables.filter((t) => t.status === 'available').length,
            icon: CheckCircleIcon,
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
        },
        {
            label: 'Terisi',
            value: tables.filter((t) => t.status === 'occupied').length,
            icon: UserGroupIcon,
            bg: 'bg-sky-50',
            text: 'text-sky-600',
        },
        {
            label: 'Tidak Tersedia',
            value: tables.filter((t) => t.status === 'unavailable').length,
            icon: XCircleIcon,
            bg: 'bg-red-50',
            text: 'text-red-500',
        },
    ];

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/menus', label: 'Kelola Menu', icon: '📋' },
        { path: '/admin/tables', label: 'Meja & QR', icon: '🪑', active: true },
        { path: '/admin/users', label: 'User & Staff', icon: '👥' },
        { path: '/admin/reports', label: 'Laporan', icon: '📈' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-8">
            <div className="space-y-6">
                {/* Statistik */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white border border-cream-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
                                    {stat.label}
                                </p>
                                <div
                                    className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center`}
                                >
                                    <stat.icon
                                        className={`w-5 h-5 ${stat.text}`}
                                    />
                                </div>
                            </div>
                            <p className="font-playfair text-3xl font-bold text-navy-900">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Filter & Ringkasan */}
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <h3 className="font-playfair text-lg font-semibold text-navy-900 mb-1">
                                    Filter Area
                                </h3>
                                <p className="text-sm text-navy-400">
                                    Pilih area untuk menampilkan meja tertentu.
                                </p>
                            </div>
                            <button
                                onClick={openAdd}
                                className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2.5 text-sm font-semibold text-navy-800 hover:bg-cream-200 transition border border-cream-300"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Tambah Meja
                            </button>
                        </div>
                        <div className="mt-6 relative">
                            <select
                                value={areaFilter}
                                onChange={(e) => setAreaFilter(e.target.value)}
                                className="w-full rounded-full border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition appearance-none cursor-pointer"
                            >
                                <option value="all">Semua Area</option>
                                {areas.map((area) => (
                                    <option
                                        key={area}
                                        value={area}
                                    >{`Area ${area}`}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="w-5 h-5 text-navy-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-playfair text-lg font-semibold text-navy-900 mb-4">
                            Ringkasan Cepat
                        </h3>
                        <div className="space-y-3">
                            <div className="rounded-2xl bg-cream-50 p-4 border border-cream-200">
                                <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
                                    Area Tersedia
                                </p>
                                <p className="mt-2 text-2xl font-bold text-navy-900">
                                    {areas.length}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-cream-50 p-4 border border-cream-200">
                                <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
                                    QR Aktif
                                </p>
                                <p className="mt-2 text-2xl font-bold text-navy-900">
                                    {tables.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabel */}
                <div className="bg-white border border-cream-300 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-cream-200 bg-cream-50">
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        Nomor Meja
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        Kapasitas
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        QR Code
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cream-200">
                                {filtered.map((table) => (
                                    <tr
                                        key={table.id}
                                        className="hover:bg-cream-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-navy-900">
                                            {table.table_number}
                                        </td>
                                        <td className="px-6 py-4 text-navy-600">
                                            {table.capacity} orang
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    table.status === 'available'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : table.status ===
                                                            'occupied'
                                                          ? 'bg-blue-100 text-blue-700'
                                                          : table.status ===
                                                              'reserved'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {table.status === 'available'
                                                    ? 'Tersedia'
                                                    : table.status ===
                                                        'occupied'
                                                      ? 'Terisi'
                                                      : table.status ===
                                                          'reserved'
                                                        ? 'Dipesan'
                                                        : 'Tidak tersedia'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setQrTarget(table);
                                                    setShowQR(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-cream-100 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-200 transition"
                                            >
                                                <QrCodeIcon className="w-4 h-4" />
                                                Lihat QR
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                                <button
                                                    onClick={() =>
                                                        openEdit(table)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-cream-100 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-200 transition"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRegenerateQr(
                                                            table.id,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-cream-300 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-50 transition"
                                                >
                                                    <ArrowPathIcon className="w-4 h-4" />
                                                    QR Ulang
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeleteId(table.id);
                                                        setShowDel(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center text-navy-400">
                                                <InboxIcon className="w-12 h-12 mb-3" />
                                                <p className="text-sm">
                                                    Tidak ada meja di area ini
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Tambah/Edit Meja */}
                {showModal && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) =>
                            e.target === e.currentTarget && setShowModal(false)
                        }
                    >
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-cream-200">
                                <h2 className="font-playfair text-xl font-semibold text-navy-900">
                                    {editTarget
                                        ? 'Edit Meja'
                                        : 'Tambah Meja Baru'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center hover:bg-cream-200 transition"
                                >
                                    <XCircleIcon className="w-5 h-5 text-navy-600" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleSave}
                                className="p-6 space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-navy-800 mb-2">
                                        Nomor Meja
                                    </label>
                                    <input
                                        type="text"
                                        value={form.table_number}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                table_number: e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: A1"
                                        required
                                        className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-navy-800 mb-2">
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
                                        className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition appearance-none cursor-pointer"
                                    >
                                        {[2, 4, 6, 8, 10, 12].map((n) => (
                                            <option key={n} value={n}>
                                                {n} orang
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-navy-800 mb-2">
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
                                        className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition appearance-none cursor-pointer"
                                    >
                                        <option value="available">
                                            Tersedia
                                        </option>
                                        <option value="occupied">Terisi</option>
                                        <option value="reserved">
                                            Dipesan
                                        </option>
                                        <option value="unavailable">
                                            Tidak tersedia
                                        </option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 rounded-full border border-cream-300 text-navy-600 font-semibold hover:bg-cream-100 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-full bg-navy-800 text-cream-100 font-semibold hover:bg-navy-900 transition disabled:opacity-60 flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <div className="w-4 h-4 border-2 border-cream-100 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <PlusIcon className="w-4 h-4" />
                                        )}
                                        {saving
                                            ? 'Menyimpan...'
                                            : editTarget
                                              ? 'Simpan Perubahan'
                                              : 'Tambah Meja'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Lihat QR */}
                {showQR && qrTarget && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) =>
                            e.target === e.currentTarget && setShowQR(false)
                        }
                    >
                        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center">
                            <h3 className="font-playfair text-lg font-semibold text-navy-900 mb-2">
                                QR Code - {qrTarget.table_number}
                            </h3>
                            <p className="text-sm text-navy-400 mb-6">
                                Scan untuk memesan langsung dari meja ini
                            </p>
                            <div className="bg-cream-50 rounded-2xl p-6 inline-flex items-center justify-center mb-6">
                                <QRCodeSVG
                                    value={`${window.location.origin}/order/${qrTarget.table_number}`}
                                    size={160}
                                    bgColor="#FDFAF5"
                                    fgColor="#1B2A4A"
                                    level="M"
                                />
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="px-5 py-2.5 rounded-full border border-cream-300 text-navy-600 font-semibold hover:bg-cream-100 transition"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => {
                                        handleRegenerateQr(qrTarget.id);
                                        setShowQR(false);
                                    }}
                                    className="px-5 py-2.5 rounded-full bg-navy-800 text-cream-100 font-semibold hover:bg-navy-900 transition flex items-center gap-2"
                                >
                                    <ArrowPathIcon className="w-4 h-4" />
                                    QR Ulang
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Hapus */}
                {showDel && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) =>
                            e.target === e.currentTarget && setShowDel(false)
                        }
                    >
                        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <TrashIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="font-playfair text-xl font-semibold text-navy-900 mb-2">
                                Hapus Meja?
                            </h3>
                            <p className="text-sm text-navy-400 mb-6">
                                Tindakan ini tidak dapat dibatalkan. Semua data
                                terkait meja ini akan dihapus.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDel(false)}
                                    className="flex-1 py-2.5 rounded-full border border-cream-300 text-navy-600 font-semibold hover:bg-cream-100 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
