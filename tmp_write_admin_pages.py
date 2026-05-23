from pathlib import Path

pages = {
    'resources/js/pages/admin/Dashboard.jsx': """import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layouts/AdminLayout';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('today');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setData(res.data);
        } catch (err) {
            toast.error('Gagal memuat dashboard');
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊', active: true },
        { path: '/admin/menus', label: 'Kelola Menu', icon: '📋' },
        { path: '/admin/tables', label: 'Meja & QR', icon: '🪑' },
        { path: '/admin/users', label: 'User & Staff', icon: '👥' },
        { path: '/admin/reports', label: 'Laporan', icon: '📈' },
    ];

    const searchResults = (query) => {
        if (!query || !data?.top_menus?.length) return [];
        return data.top_menus
            .filter((item) =>
                item.menu?.name
                    .toLowerCase()
                    .includes(query.toLowerCase()),
            )
            .slice(0, 6)
            .map((item) => ({
                title: item.menu?.name,
                subtitle: `Terjual ${item.total_sold}×`,
                icon: '☕',
                path: '/admin/menus',
            }));
    };

    const pieData =
        data?.orders_by_type?.map((t) => ({
            name: t.order_type === 'dine-in' ? 'Dine-in' : 'Takeaway',
            value: t.total,
        })) || [];

    const barData =
        data?.revenue_per_hour?.map((r) => ({
            hour: `${String(r.hour).padStart(2, '0')}:00`,
            revenue: Math.round(r.revenue / 1000),
        })) || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <AdminLayout
            sidebarItems={navItems}
            title="Dashboard"
            subtitle="Ringkasan performa Hush & Co."
            onSearch={searchResults}
            headerActions={
                <button
                    type="button"
                    onClick={() => navigate('/admin/menus')}
                    className="hidden md:inline-flex items-center gap-2 rounded-2xl bg-navy-900 px-4 py-3 text-sm font-semibold text-cream-100 hover:bg-navy-800 transition"
                >
                    Tambah Menu
                </button>
            }
        >
            <div className="space-y-8">
                <div className="rounded-3xl bg-white border border-cream-200 p-6 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-navy-500 uppercase tracking-[0.2em] font-medium">
                                Ringkasan
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold text-navy-900">
                                Selamat datang, Admin
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-navy-500">
                            <span>{period === 'today' ? 'Hari ini' : '7 hari terakhir'}</span>
                            <div className="inline-flex gap-2 rounded-full bg-cream-100 p-2">
                                {['today', 'week'].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setPeriod(value)}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                            period === value
                                                ? 'bg-navy-900 text-cream-100'
                                                : 'bg-white text-navy-700 hover:bg-cream-50'
                                        }`}
                                    >
                                        {value === 'today' ? 'Hari Ini' : '7 Hari'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        {
                            label: 'Pendapatan',
                            value: `Rp ${(data?.stats?.today_revenue / 1000000).toFixed(1)}jt`,
                            hint: 'Performa hari ini',
                        },
                        {
                            label: 'Total Order',
                            value: data?.stats?.today_orders,
                            hint: 'Pesanan hari ini',
                        },
                        {
                            label: 'Customer Aktif',
                            value: data?.stats?.active_customers,
                            hint: 'Customer dalam 24 jam',
                        },
                        {
                            label: 'Rata-rata Order',
                            value: `Rp ${data?.stats?.avg_order_value?.toLocaleString('id')}`,
                            hint: 'Per order',
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm"
                        >
                            <p className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold mb-2">
                                {item.label}
                            </p>
                            <p className="text-3xl font-semibold text-navy-900">
                                {item.value}
                            </p>
                            <p className="mt-2 text-sm text-navy-500">{item.hint}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="xl:col-span-2 rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-navy-900">Pendapatan per jam</p>
                                <p className="text-xs text-navy-400">Dalam ribuan Rupiah</p>
                            </div>
                        </div>
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={barData} barSize={16}>
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fill: '#6B7B95', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#FFFFFF',
                                            border: '1px solid #E8E0D0',
                                            borderRadius: 12,
                                            fontSize: 12,
                                            color: '#0E1A2E',
                                        }}
                                        formatter={(value) => [`Rp ${value}k`, 'Pendapatan']}
                                    />
                                    <Bar dataKey="revenue" fill="#1B2A4A" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-56 flex items-center justify-center text-navy-400">
                                Belum ada data
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-navy-900">Tipe Order</p>
                            <p className="text-xs text-navy-400">Dine-in vs Takeaway</p>
                        </div>
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            dataKey="value"
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={['#1B2A4A', '#C8B99A'][index % 2]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E8E0D0',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                color: '#0E1A2E',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2 text-sm text-navy-500">
                                    {pieData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <span>{item.name}</span>
                                            <span className="font-semibold text-navy-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-navy-400">
                                Belum ada data
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-navy-900 mb-4">Pesanan Terbaru</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-cream-200 text-navy-400 uppercase tracking-[0.16em] text-xs">
                                    <tr>
                                        {['Order ID', 'Customer', 'Total', 'Status'].map((label) => (
                                            <th key={label} className="px-4 py-3">{label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cream-200">
                                    {data?.recent_orders?.slice(0, 5).map((order) => (
                                        <tr key={order.id} className="hover:bg-cream-50 transition-colors">
                                            <td className="px-4 py-3 text-navy-800 font-medium">#HSH-{String(order.id).padStart(4, '0')}</td>
                                            <td className="px-4 py-3 text-navy-600">{order.user?.name}</td>
                                            <td className="px-4 py-3 text-navy-800">Rp {order.total_price?.toLocaleString('id')}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    order.status === 'selesai'
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : order.status === 'diproses'
                                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                        : order.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                        : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {data?.recent_orders?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-10 text-center text-navy-400">
                                                Belum ada pesanan hari ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-navy-900 mb-4">Menu Terlaris</p>
                        {data?.top_menus?.length > 0 ? (
                            <div className="space-y-4">
                                {data.top_menus.map((menuItem, index) => (
                                    <div key={menuItem.menu?.id || index} className="flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-3xl bg-navy-50 grid place-items-center text-navy-800 font-semibold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-navy-900 truncate">{menuItem.menu?.name}</p>
                                            <p className="text-sm text-navy-500">Terjual {menuItem.total_sold}×</p>
                                        </div>
                                        <span className="text-sm text-navy-500">{menuItem.total_sold}×</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-navy-400">
                                Belum ada data menu terlaris
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
""",
    'resources/js/pages/admin/MenuManager.jsx': """import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminLayout from '../../components/layouts/AdminLayout';

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
            filterCat === 'all' || m.category_id === parseInt(filterCat, 10);
        return matchSearch && matchCat;
    });

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/menus', label: 'Kelola Menu', icon: '📋', active: true },
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
        <AdminLayout
            sidebarItems={navItems}
            title="Kelola Menu"
            subtitle="Tambahkan dan atur item menu"
            headerActions={
                <button
                    type="button"
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-2xl bg-navy-900 px-4 py-3 text-sm font-semibold text-cream-100 hover:bg-navy-800 transition"
                >
                    <PlusIcon className="w-4 h-4" />
                    Tambah Menu
                </button>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { label: 'Total Menu', value: menus.length },
                        { label: 'Tersedia', value: menus.filter((m) => m.is_available).length },
                        { label: 'Tidak Tersedia', value: menus.filter((m) => !m.is_available).length },
                        { label: 'Kategori', value: categories.length },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold mb-2">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-semibold text-navy-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-navy-900">Filter Menu</p>
                                <p className="text-sm text-navy-500">Gunakan pencarian dan kategori untuk mempersempit hasil.</p>
                            </div>
                            <button
                                type="button"
                                onClick={openAdd}
                                className="inline-flex items-center gap-2 rounded-2xl bg-cream-100 px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-cream-200 transition"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Tambah Baru
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium uppercase tracking-[0.18em] text-navy-400">Cari menu</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama menu..."
                                    className="mt-2 w-full rounded-3xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-[0.18em] text-navy-400">Kategori</label>
                                <select
                                    value={filterCat}
                                    onChange={(e) => setFilterCat(e.target.value)}
                                    className="mt-2 w-full rounded-3xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-navy-900 mb-3">Ringkasan Cepat</p>
                        <div className="space-y-3">
                            <div className="rounded-3xl bg-cream-50 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-navy-400">Menu tersedia</p>
                                <p className="mt-2 text-2xl font-semibold text-navy-900">{menus.filter((m) => m.is_available).length}</p>
                            </div>
                            <div className="rounded-3xl bg-cream-50 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-navy-400">Menu tidak tersedia</p>
                                <p className="mt-2 text-2xl font-semibold text-navy-900">{menus.filter((m) => !m.is_available).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-navy-700">
                        <thead className="border-b border-cream-200 text-navy-400 uppercase tracking-[0.18em] text-xs">
                            <tr>
                                <th className="px-4 py-3">Nama</th>
                                <th className="px-4 py-3">Kategori</th>
                                <th className="px-4 py-3">Harga</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-200">
                            {filtered.map((menu) => (
                                <tr key={menu.id} className="hover:bg-cream-50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-navy-900">{menu.name}</td>
                                    <td className="px-4 py-4 text-navy-600">{menu.category?.name || 'Belum ada'}</td>
                                    <td className="px-4 py-4 text-navy-700">Rp {Number(menu.price).toLocaleString('id')}</td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${menu.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {menu.is_available ? 'Tersedia' : 'Tidak tersedia'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(menu)}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-cream-200 bg-cream-50 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-100 transition"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleteId(menu.id);
                                                setShowDelete(true);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            Hapus
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(menu)}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-cream-200 bg-white px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-50 transition"
                                        >
                                            {menu.is_available ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-navy-400">
                                        Tidak ada menu yang cocok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
""",
    'resources/js/pages/admin/TableManager.jsx': """import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminLayout from '../../components/layouts/AdminLayout';

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
                toast.error(err.response?.data?.message || 'Gagal menyimpan meja');
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
    const areas = [...new Set(tables.map((t) => getArea(t.table_number)))].sort();
    const filtered =
        areaFilter === 'all'
            ? tables
            : tables.filter((t) => getArea(t.table_number) === areaFilter);

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
        <AdminLayout
            sidebarItems={navItems}
            title="Meja & QR Code"
            subtitle="Kelola meja dan QR menu"
            headerActions={
                <button
                    type="button"
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-2xl bg-navy-900 px-4 py-3 text-sm font-semibold text-cream-100 hover:bg-navy-800 transition"
                >
                    <PlusIcon className="w-4 h-4" />
                    Tambah Meja
                </button>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { label: 'Total Meja', value: tables.length },
                        {
                            label: 'Tersedia',
                            value: tables.filter((t) => t.status === 'available').length,
                        },
                        {
                            label: 'Terisi',
                            value: tables.filter((t) => t.status === 'occupied').length,
                        },
                        {
                            label: 'Tidak Tersedia',
                            value: tables.filter((t) => t.status === 'unavailable').length,
                        },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold mb-2">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-semibold text-navy-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-navy-900">Filter Area</p>
                                <p className="text-sm text-navy-500">Pilih area untuk menampilkan meja tertentu.</p>
                            </div>
                            <button
                                type="button"
                                onClick={openAdd}
                                className="inline-flex items-center gap-2 rounded-2xl bg-cream-100 px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-cream-200 transition"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Tambah Meja
                            </button>
                        </div>
                        <div className="mt-6">
                            <label className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold">Area</label>
                            <select
                                value={areaFilter}
                                onChange={(e) => setAreaFilter(e.target.value)}
                                className="mt-2 w-full rounded-3xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500"
                            >
                                <option value="all">Semua Area</option>
                                {areas.map((area) => (
                                    <option key={area} value={area}>{`Area ${area}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-navy-900 mb-3">Ringkasan Cepat</p>
                        <div className="space-y-3">
                            <div className="rounded-3xl bg-cream-50 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-navy-400">Area yang tersedia</p>
                                <p className="mt-2 text-2xl font-semibold text-navy-900">{areas.length}</p>
                            </div>
                            <div className="rounded-3xl bg-cream-50 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-navy-400">QR aktif</p>
                                <p className="mt-2 text-2xl font-semibold text-navy-900">{tables.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-navy-700">
                        <thead className="border-b border-cream-200 text-navy-400 uppercase tracking-[0.18em] text-xs">
                            <tr>
                                <th className="px-4 py-3">Nomor Meja</th>
                                <th className="px-4 py-3">Kapasitas</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">QR Code</th>
                                <th className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-200">
                            {filtered.map((table) => (
                                <tr key={table.id} className="hover:bg-cream-50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-navy-900">{table.table_number}</td>
                                    <td className="px-4 py-4 text-navy-600">{table.capacity}</td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                            table.status === 'available'
                                                ? 'bg-green-100 text-green-700'
                                                : table.status === 'occupied'
                                                ? 'bg-blue-100 text-blue-700'
                                                : table.status === 'reserved'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {table.status === 'available'
                                                ? 'Tersedia'
                                                : table.status === 'occupied'
                                                ? 'Terisi'
                                                : table.status === 'reserved'
                                                ? 'Dipesan'
                                                : 'Tidak tersedia'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQrTarget(table);
                                                setShowQR(true);
                                            }}
                                            className="inline-flex rounded-2xl bg-cream-50 px-3 py-2 text-xs font-semibold text-navy-900 hover:bg-cream-100 transition"
                                        >
                                            Lihat QR
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(table)}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-cream-200 bg-cream-50 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-100 transition"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRegenerateQr(table.id)}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-cream-200 bg-white px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-cream-50 transition"
                                        >
                                            QR Ulang
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleteId(table.id);
                                                setShowDel(true);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-navy-400">
                                        Tidak ada meja di area ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
""",
    'resources/js/pages/admin/UserManager.jsx': """import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminLayout from '../../components/layouts/AdminLayout';

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
        const matchTab = u.role === tab || (tab === 'staff' && u.role === 'staff');
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
        { path: '/admin/users', label: 'User & Staff', icon: '👥', active: true },
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
        <AdminLayout
            sidebarItems={navItems}
            title="User & Staff"
            subtitle="Kelola akun dan peran"
            headerActions={
                <button
                    type="button"
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-2xl bg-navy-900 px-4 py-3 text-sm font-semibold text-cream-100 hover:bg-navy-800 transition"
                >
                    <PlusIcon className="w-4 h-4" />
                    Tambah Staff
                </button>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { label: 'Customer', value: customers.length },
                        { label: 'Staff', value: staff.length },
                        {
                            label: 'Bergabung Bulan Ini',
                            value: users.filter((u) => {
                                const d = new Date(u.created_at);
                                const now = new Date();
                                return (
                                    d.getMonth() === now.getMonth() &&
                                    d.getFullYear() === now.getFullYear()
                                );
                            }).length,
                        },
                        { label: 'Total Pengguna', value: users.length },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold mb-2">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-semibold text-navy-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-navy-900">Filter & Tab</p>
                            <p className="text-sm text-navy-500">Lihat pengguna berdasarkan peran.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'customer', label: `Customer (${customers.length})` },
                                { value: 'staff', label: `Staff (${staff.length})` },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setTab(item.value)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        tab === item.value
                                            ? 'bg-navy-900 text-cream-100'
                                            : 'bg-cream-100 text-navy-700 hover:bg-cream-200'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 max-w-sm">
                        <label className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold">Cari pengguna</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nama atau email..."
                            className="mt-2 w-full rounded-3xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500"
                        />
                    </div>
                </div>

                <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-navy-700">
                        <thead className="border-b border-cream-200 text-navy-400 uppercase tracking-[0.18em] text-xs">
                            <tr>
                                <th className="px-4 py-3">Nama</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Peran</th>
                                <th className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-200">
                            {filtered.map((user) => (
                                <tr key={user.id} className="hover:bg-cream-50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-navy-900">{user.name}</td>
                                    <td className="px-4 py-4 text-navy-600">{user.email}</td>
                                    <td className="px-4 py-4 text-navy-700 uppercase tracking-[0.1em] text-xs">{user.role}</td>
                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(user)}
                                            className="rounded-2xl bg-cream-100 px-4 py-2 text-xs font-semibold text-navy-900 hover:bg-cream-200 transition"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-navy-400">
                                        Tidak ada pengguna yang cocok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
""",
    'resources/js/pages/admin/Reports.jsx': """import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminLayout from '../../components/layouts/AdminLayout';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

export default function Reports() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [orderType, setOrderType] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/menus', label: 'Kelola Menu', icon: '📋' },
        { path: '/admin/tables', label: 'Meja & QR', icon: '🪑' },
        { path: '/admin/users', label: 'User & Staff', icon: '👥' },
        { path: '/admin/reports', label: 'Laporan', icon: '📈', active: true },
    ];

    const fetchReport = async () => {
        if (!startDate || !endDate) {
            toast.error('Pilih rentang tanggal dulu!');
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/admin/report', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    order_type: orderType || undefined,
                },
            });
            setReport(res.data);
            toast.success('Laporan berhasil dimuat!');
        } catch (err) {
            toast.error('Gagal memuat laporan');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        if (!startDate || !endDate) {
            toast.error('Pilih rentang tanggal dulu!');
            return;
        }
        setExporting(true);
        try {
            const endpoint =
                type === 'pdf'
                    ? '/admin/report/export-pdf'
                    : '/admin/report/export-excel';

            const res = await api.get(endpoint, {
                params: { start_date: startDate, end_date: endDate },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            const ext = type === 'pdf' ? 'pdf' : 'csv';
            link.href = url;
            link.setAttribute('download', `laporan-hush-${startDate}-${endDate}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Laporan ${type.toUpperCase()} berhasil didownload!`);
        } catch (err) {
            toast.error(`Gagal export ${type.toUpperCase()}`);
        } finally {
            setExporting(false);
        }
    };

    const chartData =
        report?.orders?.reduce((acc, order) => {
            const date = new Date(order.created_at).toLocaleDateString('id', {
                day: '2-digit',
                month: 'short',
            });
            const existing = acc.find((a) => a.date === date);
            if (existing) {
                existing.revenue += order.total_price;
                existing.orders += 1;
            } else {
                acc.push({ date, revenue: order.total_price, orders: 1 });
            }
            return acc;
        }, []) || [];

    const pieData =
        report?.orders_by_type?.map((t) => ({
            name: t.order_type === 'dine-in' ? 'Dine-in' : 'Takeaway',
            value: t.total,
        })) || [];

    const barData =
        report?.revenue_per_hour?.map((r) => ({
            hour: `${String(r.hour).padStart(2, '0')}:00`,
            revenue: Math.round(r.revenue / 1000),
        })) || [];

    return (
        <AdminLayout
            sidebarItems={navItems}
            title="Laporan"
            subtitle="Lihat performance dan export data"
        >
            <div className="space-y-6">
                <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-4">
                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold">Dari Tanggal</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-2 w-full rounded-3xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-2 w-full rounded-3xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold">Tipe Order</label>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="mt-2 w-full rounded-3xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-navy-900 outline-none focus:border-navy-500"
                            >
                                <option value="">Semua</option>
                                <option value="dine-in">Dine-in</option>
                                <option value="takeaway">Takeaway</option>
                            </select>
                        </div>
                        <div className="flex items-end justify-end">
                            <button
                                type="button"
                                onClick={fetchReport}
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-3xl bg-navy-900 px-5 py-3 text-sm font-semibold text-cream-100 hover:bg-navy-800 transition disabled:opacity-60"
                            >
                                {loading ? 'Memuat...' : 'Terapkan'}
                            </button>
                        </div>
                    </div>
                </div>

                {!report && !loading ? (
                    <div className="rounded-3xl border border-cream-200 bg-cream-50 p-12 text-center text-navy-500">
                        Pilih rentang tanggal dan klik Terapkan untuk melihat laporan.
                    </div>
                ) : null}

                {report ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {[
                                {
                                    label: 'Total Pendapatan',
                                    value: `Rp ${report.summary.total_revenue?.toLocaleString('id')}`,
                                },
                                {
                                    label: 'Total Order',
                                    value: report.summary.total_orders,
                                },
                                {
                                    label: 'Dine-in',
                                    value: report.summary.dine_in_count,
                                },
                                {
                                    label: 'Takeaway',
                                    value: report.summary.takeaway_count,
                                },
                            ].map((item) => (
                                <div key={item.label} className="rounded-3xl border border-cream-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs uppercase tracking-[0.18em] text-navy-400 font-semibold mb-2">{item.label}</p>
                                    <p className="text-2xl font-semibold text-navy-900">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                            <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-navy-900">Pendapatan per hari</p>
                                    <p className="text-xs text-navy-400">Nilai dalam ribuan.</p>
                                </div>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={chartData} barSize={16}>
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#6B7B95', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#FFFFFF',
                                                    border: '1px solid #E8E0D0',
                                                    borderRadius: 12,
                                                    fontSize: 12,
                                                    color: '#0E1A2E',
                                                }}
                                                formatter={(value) => [`Rp ${value}`, 'Pendapatan']}
                                            />
                                            <Bar dataKey="revenue" fill="#1B2A4A" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-52 flex items-center justify-center text-navy-400">Belum ada data</div>
                                )}
                            </div>

                            <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-navy-900">Tipe Order</p>
                                    <p className="text-xs text-navy-400">Dine-in vs Takeaway</p>
                                </div>
                                {pieData.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((_, index) => (
                                                        <Cell
                                                            key={index}
                                                            fill={['#1B2A4A', '#C8B99A'][index % 2]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        background: '#FFFFFF',
                                                        border: '1px solid #E8E0D0',
                                                        borderRadius: 12,
                                                        fontSize: 12,
                                                        color: '#0E1A2E',
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="mt-4 space-y-3 text-sm text-navy-500">
                                            {pieData.map((item) => (
                                                <div key={item.name} className="flex items-center justify-between">
                                                    <span>{item.name}</span>
                                                    <span className="font-semibold text-navy-900">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-52 flex items-center justify-center text-navy-400">Belum ada data</div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-cream-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-navy-900">Export Laporan</p>
                                    <p className="text-xs text-navy-400">Unduh sebagai PDF atau CSV.</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleExport('pdf')}
                                        disabled={exporting || !report}
                                        className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                                    >
                                        Export PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleExport('excel')}
                                        disabled={exporting || !report}
                                        className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-200 transition disabled:opacity-50"
                                    >
                                        Export Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </AdminLayout>
    );
}
""",
}

for path, content in pages.items():
    Path(path).write_text(content)
print('written', len(pages), 'files')
