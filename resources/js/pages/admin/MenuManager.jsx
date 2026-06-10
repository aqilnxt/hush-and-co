import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ShoppingBagIcon,
    CheckCircleIcon,
    XCircleIcon,
    TagIcon,
    MagnifyingGlassIcon,
    InboxIcon,
    BanknotesIcon,
    FunnelIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api, { backendBaseUrl } from '../../api/axios';

export default function MenuManager() {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [saving, setSaving] = useState(false);

    // Pagination states
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statsData, setStatsData] = useState({
        total: 0,
        available: 0,
        unavailable: 0,
    });

    // Image upload states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [form, setForm] = useState({
        category_id: '',
        name: '',
        description: '',
        price: '',
        is_available: true,
    });

    const [showToppingModal, setShowToppingModal] = useState(false);
    const [toppingMenu, setToppingMenu] = useState(null);
    const [toppingList, setToppingList] = useState([]);
    const [toppingFilter, setToppingFilter] = useState('all');

    // Search query debouncer
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Cleanup image preview URL on unmount
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch menus when dependencies change
    useEffect(() => {
        fetchMenus();
    }, [page, searchQuery, filterCat]);

    const fetchCategories = async () => {
        try {
            const catRes = await api.get('/categories');
            setCategories(catRes.data.data);
        } catch (err) {
            toast.error('Gagal memuat kategori');
        }
    };

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/menus', {
                params: {
                    paginate: true,
                    page: page,
                    search: searchQuery,
                    category_id: filterCat === 'all' ? '' : filterCat,
                },
            });
            setMenus(res.data.data);
            setLastPage(res.data.last_page || 1);
            setTotal(res.data.total || 0);
            if (res.data.stats) {
                setStatsData(res.data.stats);
            }
        } catch (err) {
            toast.error('Gagal memuat data menu');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditTarget(null);
        setImageFile(null);
        setImagePreview(null);
        setForm({
            category_id: categories[0]?.id || '',
            name: '',
            description: '',
            price: '',
            is_available: true,
        });
        setShowModal(true);
    };

    const openEdit = (menu) => {
        setEditTarget(menu);
        setImageFile(null);
        setImagePreview(null);
        setForm({
            category_id: menu.category_id,
            name: menu.name,
            description: menu.description || '',
            price: menu.price,
            is_available: menu.is_available,
        });
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            toast.error('File harus berupa gambar!');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Ukuran gambar tidak boleh lebih dari 10MB!');
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveSelectedImage = () => {
        setImageFile(null);
        setImagePreview(null);
        const fileInput = document.getElementById('menu-image-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            toast.error('Nama dan harga wajib diisi');
            return;
        }
        setSaving(true);

        const formData = new FormData();
        formData.append('category_id', form.category_id);
        formData.append('name', form.name);
        formData.append('description', form.description || '');
        formData.append('price', form.price);
        formData.append('is_available', form.is_available ? '1' : '0');
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (editTarget) {
                formData.append('_method', 'PUT');
                await api.post(`/menus/${editTarget.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Menu berhasil diupdate!');
            } else {
                await api.post('/menus', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Menu berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchMenus();
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
            fetchMenus();
        } catch (err) {
            toast.error('Gagal update status');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/menus/${deleteId}`);
            toast.success('Menu berhasil dihapus!');
            setShowDelete(false);
            fetchMenus();
        } catch (err) {
            toast.error('Gagal menghapus menu');
        }
    };

    const openManageToppings = async (menu) => {
        try {
            const [menuRes, allRes] = await Promise.all([
                api.get(`/menus/${menu.id}/toppings`),
                api.get('/admin/toppings'),
            ]);
            const menuItems = menuRes.data || menuRes.data.data || [];
            const menuById = new Map(menuItems.map((t) => [t.id, t]));
            const normalized = (allRes.data || allRes.data.data || []).map(
                (t) => {
                    const menuT = menuById.get(t.id);
                    const pivot = menuT?.pivot;
                    return {
                        topping_id: t.id,
                        name: t.name,
                        default_price: t.price,
                        assigned: !!pivot,
                        max_allowed: pivot?.max_allowed ?? 1,
                        is_required: !!pivot?.is_required,
                        price_override: pivot?.price_override ?? null,
                    };
                },
            );
            setToppingMenu(menu);
            setToppingList(normalized);
            setShowToppingModal(true);
        } catch (err) {
            toast.error('Gagal memuat daftar topping');
        }
    };

    const changeToppingField = (toppingId, field, value) => {
        setToppingList((prev) =>
            prev.map((t) =>
                t.topping_id === toppingId ? { ...t, [field]: value } : t,
            ),
        );
    };

    const toggleToppingAssigned = (toppingId) => {
        setToppingList((prev) =>
            prev.map((t) =>
                t.topping_id === toppingId
                    ? { ...t, assigned: !t.assigned }
                    : t,
            ),
        );
    };

    const saveToppingsForMenu = async () => {
        if (!toppingMenu) return;
        try {
            await api.post(`/admin/menus/${toppingMenu.id}/toppings`, {
                toppings: toppingList
                    .filter((t) => t.assigned)
                    .map((t) => ({
                        topping_id: t.topping_id,
                        max_allowed: t.max_allowed,
                        is_required: t.is_required ? 1 : 0,
                        price_override: t.price_override,
                    })),
            });
            toast.success('Topping berhasil disimpan');
            setShowToppingModal(false);
        } catch (err) {
            toast.error('Gagal menyimpan topping');
        }
    };

    const assignedCount = toppingList.filter((t) => t.assigned).length;
    const unassignedCount = toppingList.length - assignedCount;
    const filteredToppings = toppingList.filter((t) => {
        if (toppingFilter === 'assigned') return t.assigned;
        if (toppingFilter === 'unassigned') return !t.assigned;
        return true;
    });

    const filtered = menus;

    const stats = [
        {
            label: 'Total Menu',
            value: statsData.total,
            icon: ShoppingBagIcon,
            bg: 'bg-navy-50',
            text: 'text-navy-800',
        },
        {
            label: 'Tersedia',
            value: statsData.available,
            icon: CheckCircleIcon,
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
        },
        {
            label: 'Tidak Tersedia',
            value: statsData.unavailable,
            icon: XCircleIcon,
            bg: 'bg-red-50',
            text: 'text-red-500',
        },
        {
            label: 'Kategori',
            value: categories.length,
            icon: TagIcon,
            bg: 'bg-amber-50',
            text: 'text-amber-600',
        },
    ];

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
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="w-5 h-5 text-navy-400" />
                            <p className="text-sm font-semibold text-navy-900">
                                Filter Menu
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative w-full sm:w-64">
                                <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama menu..."
                                    className="w-full bg-white border border-cream-300 rounded-full pl-11 pr-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                />
                            </div>
                            <select
                                value={filterCat}
                                onChange={(e) => setFilterCat(e.target.value)}
                                className="w-full sm:w-48 rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition appearance-none cursor-pointer"
                            >
                                <option value="all">Semua Kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
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
                                        Kategori
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        Harga
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-navy-400 uppercase tracking-wider text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cream-200">
                                {filtered.map((menu) => (
                                    <tr
                                        key={menu.id}
                                        className="hover:bg-cream-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-navy-900">
                                            <div className="flex items-center gap-3">
                                                {menu.image ? (
                                                    <img
                                                        src={`${backendBaseUrl}/storage/${menu.image}`}
                                                        alt={menu.name}
                                                        className="w-10 h-10 object-cover rounded-xl border border-cream-300 shadow-sm shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-cream-100 flex items-center justify-center rounded-xl text-lg border border-cream-200 shrink-0">
                                                        {menu.category?.icon ||
                                                            '☕'}
                                                    </div>
                                                )}
                                                <span>{menu.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-navy-600">
                                            {menu.category?.name || 'Belum ada'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 text-navy-800 font-medium">
                                                <BanknotesIcon className="w-4 h-4 text-navy-400" />
                                                Rp{' '}
                                                {Number(
                                                    menu.price,
                                                ).toLocaleString('id')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                                    menu.is_available
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {menu.is_available ? (
                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                ) : (
                                                    <XCircleIcon className="w-3.5 h-3.5" />
                                                )}
                                                {menu.is_available
                                                    ? 'Tersedia'
                                                    : 'Tidak tersedia'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                                <button
                                                    onClick={() =>
                                                        openEdit(menu)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-cream-100 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-200 transition"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openManageToppings(menu)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-cream-100 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-200 transition"
                                                >
                                                    Toppings
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleToggle(menu)
                                                    }
                                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                                        menu.is_available
                                                            ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                                                            : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                                    }`}
                                                >
                                                    {menu.is_available ? (
                                                        <EyeSlashIcon className="w-4 h-4" />
                                                    ) : (
                                                        <EyeIcon className="w-4 h-4" />
                                                    )}
                                                    {menu.is_available
                                                        ? 'Nonaktifkan'
                                                        : 'Aktifkan'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeleteId(menu.id);
                                                        setShowDelete(true);
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
                                                    Tidak ada menu yang cocok
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-navy-600">
                        Menampilkan{' '}
                        <span className="font-semibold text-navy-900">
                            {menus.length}
                        </span>{' '}
                        dari{' '}
                        <span className="font-semibold text-navy-900">
                            {total}
                        </span>{' '}
                        menu
                    </div>
                    {lastPage > 1 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(p - 1, 1))
                                }
                                disabled={page === 1}
                                className="px-4 py-2 rounded-full border border-cream-300 text-sm font-medium text-navy-600 hover:bg-cream-100 disabled:opacity-50 transition cursor-pointer"
                            >
                                Sebelumnya
                            </button>
                            {Array.from(
                                { length: lastPage },
                                (_, i) => i + 1,
                            ).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-full text-sm font-medium transition cursor-pointer ${
                                        page === p
                                            ? 'bg-navy-800 text-cream-100'
                                            : 'bg-white text-navy-600 border border-cream-300 hover:bg-cream-100'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(p + 1, lastPage))
                                }
                                disabled={page === lastPage}
                                className="px-4 py-2 rounded-full border border-cream-300 text-sm font-medium text-navy-600 hover:bg-cream-100 disabled:opacity-50 transition cursor-pointer"
                            >
                                Berikutnya
                            </button>
                        </div>
                    )}
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
                                    {editTarget
                                        ? 'Edit Menu'
                                        : 'Tambah Menu Baru'}
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
                                        placeholder="Contoh: Hush Latte"
                                        required
                                        className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-navy-800 mb-2">
                                        Foto Menu
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-cream-50 border border-cream-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : editTarget?.image ? (
                                                <img
                                                    src={`${backendBaseUrl}/storage/${editTarget.image}`}
                                                    alt={form.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-3xl text-navy-300">
                                                    📸
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="menu-image-upload"
                                            />
                                            <label
                                                htmlFor="menu-image-upload"
                                                className="inline-flex items-center justify-center px-4 py-2 bg-cream-100 border border-cream-300 text-navy-800 rounded-xl text-xs font-semibold hover:bg-cream-200 cursor-pointer transition"
                                            >
                                                Pilih Foto
                                            </label>
                                            <p className="text-[10px] text-navy-400 mt-1">
                                                Format: JPG, JPEG, PNG (Maks.
                                                2MB)
                                            </p>
                                            {imageFile && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRemoveSelectedImage
                                                    }
                                                    className="text-red-500 text-xs font-semibold mt-1 block hover:underline"
                                                >
                                                    Hapus pilihan
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-navy-800 mb-2">
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
                                            className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition appearance-none cursor-pointer"
                                        >
                                            <option value="">
                                                Pilih kategori
                                            </option>
                                            {categories.map((cat) => (
                                                <option
                                                    key={cat.id}
                                                    value={cat.id}
                                                >
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-navy-800 mb-2">
                                            Harga
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
                                            placeholder="Rp"
                                            required
                                            className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-navy-800 mb-2">
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
                                        placeholder="Deskripsi singkat menu..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition resize-none"
                                    />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={form.is_available}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                is_available: e.target.checked,
                                            })
                                        }
                                        className="w-5 h-5 rounded-md border-cream-300 text-navy-800 focus:ring-navy-400"
                                    />
                                    <span className="text-sm font-medium text-navy-800">
                                        Tersedia untuk dipesan
                                    </span>
                                </label>
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
                                              : 'Tambah Menu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Hapus */}
                {showDelete && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) =>
                            e.target === e.currentTarget && setShowDelete(false)
                        }
                    >
                        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <TrashIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="font-playfair text-xl font-semibold text-navy-900 mb-2">
                                Hapus Menu?
                            </h3>
                            <p className="text-sm text-navy-400 mb-6">
                                Tindakan ini tidak dapat dibatalkan. Semua data
                                terkait menu ini akan dihapus.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDelete(false)}
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

                {showToppingModal && toppingMenu && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) =>
                            e.target === e.currentTarget &&
                            setShowToppingModal(false)
                        }
                    >
                        <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_40px_120px_rgba(10,25,47,0.12)]">
                            <div className="flex flex-col gap-4 p-6 border-b border-cream-200 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                    <h2 className="font-playfair text-2xl font-semibold text-navy-950">
                                        Manage Toppings · {toppingMenu.name}
                                    </h2>
                                    <p className="max-w-2xl text-sm text-navy-500">
                                        Atur topping yang tersedia untuk menu
                                        ini. Sesuaikan kuantitas maksimal,
                                        status required, dan harga override.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowToppingModal(false)}
                                    className="h-10 w-10 rounded-2xl bg-cream-100 text-navy-700 hover:bg-cream-200 transition flex items-center justify-center"
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setToppingFilter('all')
                                            }
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                toppingFilter === 'all'
                                                    ? 'bg-navy-900 text-cream-100'
                                                    : 'bg-cream-100 text-navy-700 hover:bg-cream-200'
                                            }`}
                                        >
                                            Semua ({toppingList.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setToppingFilter('assigned')
                                            }
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                toppingFilter === 'assigned'
                                                    ? 'bg-emerald-900 text-cream-100'
                                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                            }`}
                                        >
                                            Assigned ({assignedCount})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setToppingFilter('unassigned')
                                            }
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                toppingFilter === 'unassigned'
                                                    ? 'bg-slate-900 text-cream-100'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            Not assigned ({unassignedCount})
                                        </button>
                                    </div>
                                    <div className="text-sm text-navy-500">
                                        Pilih topping mana yang ingin dipakai di
                                        menu ini.
                                    </div>
                                </div>
                                <div className="grid grid-cols-[minmax(300px,1.5fr)_96px_120px_170px] gap-4 rounded-3xl bg-cream-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-navy-400 border border-cream-200">
                                    <div>Nama Topping</div>
                                    <div className="text-center">Max qty</div>
                                    <div className="text-center">Required</div>
                                    <div className="text-center">
                                        Override Harga
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {filteredToppings.map((t) => (
                                        <div
                                            key={t.topping_id}
                                            className={`grid grid-cols-[minmax(300px,1.5fr)_96px_120px_170px] items-center gap-3 rounded-3xl border p-3 ${
                                                t.assigned
                                                    ? 'border-emerald-200 bg-emerald-50/70'
                                                    : 'border-cream-200 bg-cream-50'
                                            }`}
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="font-medium text-navy-950 break-words">
                                                        {t.name}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleToppingAssigned(
                                                                t.topping_id,
                                                            )
                                                        }
                                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                                            t.assigned
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {t.assigned
                                                            ? 'Remove'
                                                            : 'Add to menu'}
                                                    </button>
                                                </div>
                                                <div className="mt-2 text-xs text-navy-400">
                                                    Harga default: Rp{' '}
                                                    {Number(
                                                        t.default_price ?? 0,
                                                    ).toLocaleString('id')}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-400 text-center mb-1">
                                                    max qty
                                                </div>
                                                <input
                                                    type="number"
                                                    value={t.max_allowed}
                                                    min={0}
                                                    disabled={!t.assigned}
                                                    onChange={(e) =>
                                                        changeToppingField(
                                                            t.topping_id,
                                                            'max_allowed',
                                                            parseInt(
                                                                e.target
                                                                    .value || 0,
                                                            ),
                                                        )
                                                    }
                                                    className="w-full rounded-2xl border border-cream-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-navy-400"
                                                />
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-400 mb-1">
                                                    required
                                                </div>
                                                <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={t.is_required}
                                                        disabled={!t.assigned}
                                                        onChange={(e) =>
                                                            changeToppingField(
                                                                t.topping_id,
                                                                'is_required',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-cream-300 text-navy-800 focus:ring-navy-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                    />
                                                    Required
                                                </label>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-400 text-center mb-1">
                                                    override harga
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="Rp"
                                                    value={
                                                        t.price_override ?? ''
                                                    }
                                                    disabled={!t.assigned}
                                                    onChange={(e) => {
                                                        const overrideValue =
                                                            e.target.value ===
                                                            ''
                                                                ? null
                                                                : parseFloat(
                                                                      e.target
                                                                          .value,
                                                                  );
                                                        changeToppingField(
                                                            t.topping_id,
                                                            'price_override',
                                                            overrideValue,
                                                        );
                                                    }}
                                                    className="w-full rounded-2xl border border-cream-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-navy-400"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-3 border-t border-cream-200 pt-4 sm:flex-row sm:justify-end">
                                    <button
                                        onClick={() =>
                                            setShowToppingModal(false)
                                        }
                                        className="rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-cream-100 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={saveToppingsForMenu}
                                        className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-cream-100 hover:bg-navy-800 transition"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
