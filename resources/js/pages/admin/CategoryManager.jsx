import React, { useContext, useEffect, useState } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    TagIcon,
    MagnifyingGlassIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { AdminHeaderActionContext } from '../../components/layouts/AdminLayout';

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const setHeaderActions = useContext(AdminHeaderActionContext);
    const [form, setForm] = useState({
        name: '',
        slug: '',
        icon: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data || []);
        } catch (err) {
            toast.error('Gagal memuat kategori');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditTarget(null);
        setForm({ name: '', slug: '', icon: '' });
        setShowModal(true);
    };

    useEffect(() => {
        if (!setHeaderActions) return;
        setHeaderActions(
            <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 rounded-2xl bg-navy-900 px-4 py-3 text-sm font-semibold text-cream-100 shadow-sm transition hover:bg-navy-800"
            >
                <PlusIcon className="w-4 h-4" />
                Tambah Kategori
            </button>,
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions]);

    const openEdit = (category) => {
        setEditTarget(category);
        setForm({
            name: category.name || '',
            slug: category.slug || '',
            icon: category.icon || '',
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name || !form.slug) {
            toast.error('Nama dan slug wajib diisi');
            return;
        }
        setSaving(true);

        try {
            if (editTarget) {
                await api.put(`/categories/${editTarget.id}`, form);
                toast.success('Kategori berhasil diupdate!');
            } else {
                await api.post('/categories', form);
                toast.success('Kategori berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors)
                    .flat()
                    .forEach((m) => toast.error(m));
            } else {
                toast.error('Gagal menyimpan kategori');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/categories/${deleteId}`);
            toast.success('Kategori berhasil dihapus!');
            setShowDelete(false);
            fetchCategories();
        } catch (err) {
            toast.error('Gagal menghapus kategori');
        }
    };

    const filteredCategories = categories.filter(
        (category) =>
            category.name.toLowerCase().includes(search.toLowerCase()) ||
            category.slug.toLowerCase().includes(search.toLowerCase()),
    );

    const totalMenuCount = categories.reduce(
        (sum, category) => sum + (category.menus_count || 0),
        0,
    );

    const stats = [
        {
            label: 'Total Kategori',
            value: categories.length,
            icon: TagIcon,
            bg: 'bg-navy-50',
            text: 'text-navy-800',
        },
        {
            label: 'Item Menu',
            value: totalMenuCount,
            icon: TagIcon,
            bg: 'bg-amber-50',
            text: 'text-amber-600',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-3xl border border-cream-300 bg-white p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-400">
                                {stat.label}
                            </p>
                            <div
                                className={`w-11 h-11 rounded-3xl ${stat.bg} flex items-center justify-center`}
                            >
                                <stat.icon className={`w-5 h-5 ${stat.text}`} />
                            </div>
                        </div>
                        <p className="text-3xl font-semibold text-navy-900">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
                    <div className="relative w-full lg:max-w-sm">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kategori..."
                            className="w-full rounded-full border border-cream-300 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                        />
                    </div>
                    <p className="text-sm text-navy-500">
                        {filteredCategories.length} dari {categories.length}{' '}
                        kategori
                    </p>
                </div>
            </div>

            <div className="bg-white border border-cream-300 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-cream-200 bg-cream-50">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-navy-400">
                                    Nama
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-navy-400">
                                    Slug
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-navy-400">
                                    Ikon
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-navy-400">
                                    Menu
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-navy-400 text-right">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-200">
                            {filteredCategories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="hover:bg-cream-50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-semibold text-navy-900">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 text-navy-600">
                                        {category.slug}
                                    </td>
                                    <td className="px-6 py-4 text-navy-600">
                                        {category.icon || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-navy-600">
                                        {category.menus_count ?? 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEdit(category)
                                                }
                                                className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-100 px-3 py-2 text-xs font-semibold text-navy-900 transition hover:bg-cream-200"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleteId(category.id);
                                                    setShowDelete(true);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-navy-500"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <InboxIcon className="w-12 h-12 text-navy-300" />
                                            <p className="text-sm">
                                                Tidak ada kategori yang cocok.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl ring-1 ring-black/5">
                        <div className="flex items-center justify-between gap-4 pb-4 border-b border-cream-200">
                            <div>
                                <h2 className="text-xl font-semibold text-navy-900">
                                    {editTarget
                                        ? 'Edit Kategori'
                                        : 'Tambah Kategori'}
                                </h2>
                                <p className="text-sm text-navy-500">
                                    Kelola nama, slug, dan ikon kategori menu.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-navy-500 hover:text-navy-900"
                            >
                                Batal
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-5 mt-6">
                            <div className="grid gap-4 lg:grid-cols-3">
                                <label className="space-y-2 text-sm text-navy-700">
                                    Nama kategori
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-3xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                    />
                                </label>
                                <label className="space-y-2 text-sm text-navy-700">
                                    Slug
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                slug: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-3xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                    />
                                </label>
                                <label className="space-y-2 text-sm text-navy-700">
                                    Ikon
                                    <input
                                        type="text"
                                        value={form.icon}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                icon: e.target.value,
                                            }))
                                        }
                                        placeholder="Contoh: ☕"
                                        className="w-full rounded-3xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                    />
                                </label>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-full border border-cream-300 bg-white px-5 py-3 text-sm font-semibold text-navy-700 transition hover:bg-cream-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-cream-100 transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 px-4 py-6">
                    <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl ring-1 ring-black/5">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-navy-900">
                                    Hapus kategori?
                                </h3>
                                <p className="text-sm text-navy-500">
                                    Kategori yang dihapus tidak dapat
                                    dikembalikan.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDelete(false)}
                                    className="rounded-full border border-cream-300 bg-white px-5 py-3 text-sm font-semibold text-navy-700 transition hover:bg-cream-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
