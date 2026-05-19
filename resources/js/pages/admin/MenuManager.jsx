import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function MenuManager() {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        category_id: '',
        name: '',
        description: '',
        price: '',
        is_available: true,
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [menuRes, catRes] = await Promise.all([
                api.get('/menus'),
                api.get('/categories'),
            ]);
            setMenus(menuRes.data.data);
            setCategories(catRes.data.data);
        } catch (err) {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditTarget(null);
        setForm({
            category_id: '',
            name: '',
            description: '',
            price: '',
            is_available: true,
        });
        setShowModal(true);
    };

    const openEdit = (menu) => {
        setEditTarget(menu);
        setForm({
            category_id: menu.category_id,
            name: menu.name,
            description: menu.description || '',
            price: menu.price,
            is_available: menu.is_available,
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editTarget) {
                await api.put(`/menus/${editTarget.id}`, form);
                toast.success('Menu berhasil diupdate!');
            } else {
                await api.post('/menus', form);
                toast.success('Menu berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors)
                    .flat()
                    .forEach((m) => toast.error(m));
            } else {
                toast.error('Gagal menyimpan menu');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (menu) => {
        try {
            await api.patch(`/menus/${menu.id}/toggle`);
            toast.success(
                `Menu ${menu.is_available ? 'dinonaktifkan' : 'diaktifkan'}!`,
            );
            fetchData();
        } catch (err) {
            toast.error('Gagal update status');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/menus/${deleteId}`);
            toast.success('Menu berhasil dihapus!');
            setShowDelete(false);
            fetchData();
        } catch (err) {
            toast.error('Gagal menghapus menu');
        }
    };

    const filtered = menus.filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchCat =
            filterCat === 'all' || m.category_id === parseInt(filterCat);
        return matchSearch && matchCat;
    });

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        {
            path: '/admin/menus',
            label: 'Kelola Menu',
            icon: '📋',
            active: true,
        },
        { path: '/admin/tables', label: 'Meja & QR', icon: '🪑' },
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
                        Kelola Menu
                    </span>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-1.5 bg-cream-400 text-navy-900 rounded-lg text-sm font-semibold hover:bg-cream-200 transition"
                    >
                        <PlusIcon className="w-4 h-4" /> Tambah Menu
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* STATS */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Menu', val: menus.length },
                            {
                                label: 'Tersedia',
                                val: menus.filter((m) => m.is_available).length,
                            },
                            {
                                label: 'Tidak Tersedia',
                                val: menus.filter((m) => !m.is_available)
                                    .length,
                            },
                            { label: 'Kategori', val: categories.length },
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

                    {/* TOOLBAR */}
                    <div className="flex gap-3 mb-6">
                        <div className="relative flex-1 max-w-xs">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari menu..."
                                className="w-full pl-9 pr-4 py-2 bg-navy-800 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40 placeholder-navy-400"
                            />
                        </div>
                        <select
                            value={filterCat}
                            onChange={(e) => setFilterCat(e.target.value)}
                            className="px-3 py-2 bg-navy-800 border border-white/15 rounded-lg text-sm text-cream-200 outline-none"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* MENU GRID */}
                    <div className="grid grid-cols-3 gap-4">
                        {filtered.map((menu) => (
                            <div
                                key={menu.id}
                                className={`bg-navy-800 border border-white/10 rounded-xl overflow-hidden hover:border-cream-400/25 transition ${
                                    !menu.is_available ? 'opacity-60' : ''
                                }`}
                            >
                                {/* Image */}
                                <div className="h-32 bg-gradient-to-br from-navy-900 to-navy-600 flex items-center justify-center text-4xl relative">
                                    {menu.category?.icon || '☕'}
                                    {!menu.is_available && (
                                        <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
                                            <span className="text-xs text-navy-200 uppercase tracking-widest">
                                                Tidak Tersedia
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4">
                                    <p className="text-xs text-cream-600 uppercase tracking-widest mb-1">
                                        {menu.category?.name}
                                    </p>
                                    <h3 className="font-playfair text-base font-medium text-cream-200 mb-1">
                                        {menu.name}
                                    </h3>
                                    <p className="text-xs text-navy-400 mb-3 line-clamp-2">
                                        {menu.description}
                                    </p>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-cream-200">
                                            Rp{' '}
                                            {menu.price?.toLocaleString('id')}
                                        </span>
                                        {/* Toggle */}
                                        <button
                                            onClick={() => handleToggle(menu)}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${
                                                menu.is_available
                                                    ? 'bg-green-500'
                                                    : 'bg-white/20'
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                                    menu.is_available
                                                        ? 'translate-x-5'
                                                        : 'translate-x-0.5'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-3 border-t border-white/10">
                                        <button
                                            onClick={() => openEdit(menu)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-cream-400/10 border border-cream-400/15 text-cream-200 rounded-lg text-xs font-medium hover:bg-cream-400/20 transition"
                                        >
                                            <PencilIcon className="w-3 h-3" />{' '}
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeleteId(menu.id);
                                                setShowDelete(true);
                                            }}
                                            className="py-1.5 px-3 bg-red-500/10 border border-red-500/15 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-navy-800 border border-white/15 rounded-2xl p-8 w-full max-w-md">
                        <h3 className="font-playfair text-xl font-medium text-cream-200 mb-6">
                            {editTarget
                                ? `Edit — ${editTarget.name}`
                                : 'Tambah Menu Baru'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Nama Menu
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Kategori
                                    </label>
                                    <select
                                        value={form.category_id}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                category_id: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none"
                                    >
                                        <option value="">Pilih kategori</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none resize-none focus:border-cream-400/40"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Harga (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                price: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={form.is_available}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                is_available:
                                                    e.target.value === 'true',
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none"
                                    >
                                        <option value="true">Tersedia</option>
                                        <option value="false">
                                            Tidak Tersedia
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-white/15 text-navy-400 rounded-lg text-sm hover:border-cream-400/30 hover:text-cream-200 transition"
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

            {/* DELETE CONFIRM */}
            {showDelete && (
                <div className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-navy-800 border border-red-500/20 rounded-2xl p-8 max-w-sm w-full text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-cream-200 mb-2">
                            Hapus menu ini?
                        </h3>
                        <p className="text-sm text-navy-400 mb-6">
                            Menu akan dihapus permanen dan tidak bisa
                            dikembalikan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDelete(false)}
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
