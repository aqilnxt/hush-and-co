import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('customer');
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'staff',
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data);
        } catch (err) {
            toast.error('Gagal memuat data user');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditTarget(null);
        setForm({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'staff',
        });
        setShowModal(true);
    };

    const openEdit = (u) => {
        setEditTarget(u);
        setForm({
            name: u.name,
            email: u.email,
            password: '',
            password_confirmation: '',
            role: u.role,
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editTarget) {
                await api.put(`/admin/users/${editTarget.id}`, form);
                toast.success('User berhasil diupdate!');
            } else {
                await api.post('/admin/users', form);
                toast.success('Akun staff berhasil dibuat!');
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors)
                    .flat()
                    .forEach((m) => toast.error(m));
            } else {
                toast.error('Gagal menyimpan');
            }
        } finally {
            setSaving(false);
        }
    };

    const filtered = users.filter((u) => {
        const matchTab =
            u.role === tab || (tab === 'staff' && u.role === 'staff');
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const customers = users.filter((u) => u.role === 'customer');
    const staff = users.filter((u) => u.role === 'staff');

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/menus', label: 'Kelola Menu', icon: '📋' },
        { path: '/admin/tables', label: 'Meja & QR', icon: '🪑' },
        {
            path: '/admin/users',
            label: 'User & Staff',
            icon: '👥',
            active: true,
        },
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
                        Kelola User & Staff
                    </span>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-1.5 bg-cream-400 text-navy-900 rounded-lg text-sm font-semibold hover:bg-cream-200 transition"
                    >
                        <PlusIcon className="w-4 h-4" /> Tambah Staff
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* STATS */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Customer', val: customers.length },
                            { label: 'Staff Aktif', val: staff.length },
                            {
                                label: 'Bergabung Bulan Ini',
                                val: users.filter((u) => {
                                    const d = new Date(u.created_at);
                                    const now = new Date();
                                    return (
                                        d.getMonth() === now.getMonth() &&
                                        d.getFullYear() === now.getFullYear()
                                    );
                                }).length,
                            },
                            { label: 'Total Pengguna', val: users.length },
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

                    {/* TABS */}
                    <div className="flex gap-0 bg-navy-800 border border-white/10 rounded-xl overflow-hidden w-fit mb-6">
                        {[
                            {
                                val: 'customer',
                                label: `👥 Customer (${customers.length})`,
                            },
                            {
                                val: 'staff',
                                label: `👨‍🍳 Staff (${staff.length})`,
                            },
                        ].map((t) => (
                            <button
                                key={t.val}
                                onClick={() => setTab(t.val)}
                                className={`px-6 py-2.5 text-sm font-medium transition ${
                                    tab === t.val
                                        ? 'bg-cream-400/10 text-cream-200'
                                        : 'text-navy-400 hover:text-cream-200'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* SEARCH */}
                    <div className="relative mb-4 max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">
                            🔍
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau email..."
                            className="w-full pl-9 pr-4 py-2 bg-navy-800 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40 placeholder-navy-400"
                        />
                    </div>

                    {/* TABLE */}
                    <div className="bg-navy-800 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    {[
                                        'Pengguna',
                                        'Bergabung',
                                        tab === 'customer'
                                            ? 'Total Order'
                                            : 'Role',
                                        'Status',
                                        'Aksi',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-5 py-3 text-left text-xs font-medium text-navy-400 uppercase tracking-wider"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-12 text-center text-sm text-navy-400"
                                        >
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="border-b border-white/5 hover:bg-white/2 transition"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-cream-200 font-semibold text-sm flex-shrink-0">
                                                        {u.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-cream-200">
                                                            {u.name}
                                                        </p>
                                                        <p className="text-xs text-navy-400">
                                                            {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-navy-400">
                                                {new Date(
                                                    u.created_at,
                                                ).toLocaleDateString('id', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-navy-200">
                                                {tab === 'customer' ? (
                                                    `${u.orders_count || 0} order`
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                                                        👨‍🍳 Staff
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                                                    ● Aktif
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    {tab === 'staff' && (
                                                        <button
                                                            onClick={() =>
                                                                openEdit(u)
                                                            }
                                                            className="px-3 py-1 bg-cream-400/10 border border-cream-400/15 text-cream-200 rounded-lg text-xs hover:bg-cream-400/20 transition"
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            toast.success(
                                                                `Detail ${u.name} dilihat`,
                                                            )
                                                        }
                                                        className="px-3 py-1 bg-navy-600/30 border border-white/10 text-navy-200 rounded-lg text-xs hover:text-cream-200 transition"
                                                    >
                                                        👁 Detail
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
                                : 'Tambah Akun Staff'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Nama Lengkap
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
                                        Role
                                    </label>
                                    <select
                                        value={form.role}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                role: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Password{' '}
                                        {editTarget && (
                                            <span className="text-navy-400">
                                                (kosongkan jika tidak diubah)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password: e.target.value,
                                            })
                                        }
                                        required={!editTarget}
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-navy-200 block mb-1.5">
                                        Konfirmasi
                                    </label>
                                    <input
                                        type="password"
                                        value={form.password_confirmation}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password_confirmation:
                                                    e.target.value,
                                            })
                                        }
                                        required={!editTarget}
                                        className="w-full px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40"
                                    />
                                </div>
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
        </div>
    );
}
