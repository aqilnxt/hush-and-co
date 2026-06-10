import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    UserGroupIcon,
    UserPlusIcon,
    CalendarDaysIcon,
    UsersIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';

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

    const openEdit = (user) => {
        setEditTarget(user);
        setForm({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || (!editTarget && !form.password)) {
            toast.error('Harap isi semua field yang diperlukan');
            return;
        }
        if (!editTarget && form.password !== form.password_confirmation) {
            toast.error('Password tidak cocok');
            return;
        }

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
        const matchTab = tab === 'all' || u.role === tab;
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const customers = users.filter((u) => u.role === 'customer');
    const staff = users.filter((u) => u.role === 'staff');
    const newThisMonth = users.filter((u) => {
        const d = new Date(u.created_at);
        const now = new Date();
        return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
        );
    });

    const stats = [
        {
            label: 'Total Customer',
            value: customers.length,
            icon: UserGroupIcon,
            bg: 'bg-sky-50',
            text: 'text-sky-600',
        },
        {
            label: 'Total Staff',
            value: staff.length,
            icon: UserPlusIcon,
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
        },
        {
            label: 'Baru Bulan Ini',
            value: newThisMonth.length,
            icon: CalendarDaysIcon,
            bg: 'bg-amber-50',
            text: 'text-amber-600',
        },
        {
            label: 'Total Pengguna',
            value: users.length,
            icon: UsersIcon,
            bg: 'bg-navy-50',
            text: 'text-navy-800',
        },
    ];

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

                {/* Filter & Pencarian */}
                <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex gap-2 flex-wrap">
                            {[
                                {
                                    value: 'customer',
                                    label: `Customer (${customers.length})`,
                                },
                                {
                                    value: 'staff',
                                    label: `Staff (${staff.length})`,
                                },
                                {
                                    value: 'all',
                                    label: `Semua (${users.length})`,
                                },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setTab(item.value)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${
                                        tab === item.value
                                            ? 'bg-navy-800 text-cream-100 border-navy-800 shadow-md'
                                            : 'bg-white text-navy-400 border-cream-300 hover:border-navy-300'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-72">
                            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau email..."
                                className="w-full bg-white border border-cream-300 rounded-full pl-11 pr-4 py-2.5 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                            />
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
                                        Nama
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        Peran
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        Bergabung
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cream-200">
                                {filtered.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-cream-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-navy-900">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-navy-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : user.role === 'staff'
                                                          ? 'bg-blue-100 text-blue-700'
                                                          : 'bg-green-100 text-green-700'
                                                }`}
                                            >
                                                {user.role === 'customer'
                                                    ? 'Customer'
                                                    : user.role === 'staff'
                                                      ? 'Staff'
                                                      : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-navy-600 text-sm">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString('id', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEdit(user)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-cream-100 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-cream-200 transition"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                                Edit
                                            </button>
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
                                                <UsersIcon className="w-12 h-12 mb-3" />
                                                <p className="text-sm">
                                                    Tidak ada pengguna yang
                                                    cocok
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Tambah/Edit */}
                {showModal && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) =>
                            e.target === e.currentTarget && setShowModal(false)
                        }
                    >
                        <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-cream-200">
                                <h2 className="font-playfair text-xl font-semibold text-navy-900">
                                    {editTarget ? 'Edit User' : 'Tambah Staff'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center hover:bg-cream-200 transition"
                                >
                                    <XMarkIcon className="w-5 h-5 text-navy-600" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleSave}
                                className="p-6 space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-navy-800 mb-2">
                                        Nama
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
                                        placeholder="Nama lengkap"
                                        required
                                        className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-navy-800 mb-2">
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
                                        placeholder="email@domain.com"
                                        required
                                        className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-navy-800 mb-2">
                                            Password{' '}
                                            {editTarget && (
                                                <span className="text-navy-400 font-normal">
                                                    (opsional)
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
                                            placeholder="Min. 8 karakter"
                                            className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy-800 mb-2">
                                            Konfirmasi Password
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
                                            placeholder="Ulangi password"
                                            className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-navy-800 mb-2">
                                        Peran
                                    </label>
                                    <select
                                        value={form.role}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                role: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition appearance-none"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="customer">
                                            Customer
                                        </option>
                                        {editTarget?.role === 'admin' && (
                                            <option value="admin">Admin</option>
                                        )}
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
                                        ) : editTarget ? (
                                            <PencilSquareIcon className="w-4 h-4" />
                                        ) : (
                                            <PlusIcon className="w-4 h-4" />
                                        )}
                                        {saving
                                            ? 'Menyimpan...'
                                            : editTarget
                                              ? 'Simpan Perubahan'
                                              : 'Buat Akun'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
