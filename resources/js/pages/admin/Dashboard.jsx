import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    ShoppingBagIcon,
    BanknotesIcon,
    ShoppingCartIcon,
    UsersIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    HomeIcon,
    TableCellsIcon,
    UserGroupIcon,
    DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
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

    // ✅ NAV ITEMS DENGAN KOMPONEN IKON (BUKAN EMOJI)
    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: HomeIcon, active: true },
        { path: '/admin/menus', label: 'Kelola Menu', icon: ShoppingBagIcon },
        { path: '/admin/tables', label: 'Meja & QR', icon: TableCellsIcon },
        { path: '/admin/users', label: 'User & Staff', icon: UserGroupIcon },
        {
            path: '/admin/reports',
            label: 'Laporan',
            icon: DocumentChartBarIcon,
        },
    ];

    // Search handler untuk Ctrl+K
    const searchResults = (query) => {
        if (!query || !data?.top_menus?.length) return [];
        return data.top_menus
            .filter((item) =>
                item.menu?.name.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 6)
            .map((item) => ({
                title: item.menu?.name,
                subtitle: `Terjual ${item.total_sold}×`,
                icon: '☕',
                path: '/admin/menus',
            }));
    };

    // Admin: update order status
    const updateStatus = async (id, status) => {
        // simple confirmation for destructive/important actions
        if (status === 'dibatalkan') {
            if (!window.confirm('Yakin ingin membatalkan pesanan ini?')) return;
        }
        if (status === 'selesai') {
            if (!window.confirm('Tandai pesanan ini sebagai selesai?')) return;
        }

        try {
            await api.patch(`/orders/${id}/status`, { status });
            setData((prev) => ({
                ...prev,
                recent_orders: prev.recent_orders.map((o) =>
                    o.id === id ? { ...o, status } : o,
                ),
            }));
            toast.success('Status order berhasil diubah');
        } catch (err) {
            toast.error('Gagal mengubah status order');
        }
    };

    const confirmPayment = async (id) => {
        if (!window.confirm('Konfirmasi bahwa pembayaran telah diterima?'))
            return;
        try {
            await api.patch(`/orders/${id}/payment`);
            setData((prev) => ({
                ...prev,
                recent_orders: prev.recent_orders.map((o) =>
                    o.id === id ? { ...o, payment_status: 'paid' } : o,
                ),
            }));
            toast.success('Pembayaran dikonfirmasi');
        } catch (err) {
            toast.error('Gagal konfirmasi pembayaran');
        }
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

    const stats = [
        {
            label: 'Pendapatan',
            value: `Rp ${((data?.stats?.today_revenue || 0) / 1000000).toFixed(1)}jt`,
            icon: BanknotesIcon,
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            change: data?.stats?.revenue_change,
        },
        {
            label: 'Total Order',
            value: data?.stats?.today_orders || 0,
            icon: ShoppingCartIcon,
            bg: 'bg-sky-50',
            text: 'text-sky-600',
        },
        {
            label: 'Customer Aktif',
            value: data?.stats?.active_customers || 0,
            icon: UsersIcon,
            bg: 'bg-amber-50',
            text: 'text-amber-600',
        },
        {
            label: 'Rata-rata Order',
            value: `Rp ${(data?.stats?.avg_order_value || 0).toLocaleString('id')}`,
            icon: StarIcon,
            bg: 'bg-purple-50',
            text: 'text-purple-600',
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
                            {stat.change !== undefined &&
                                stat.change !== null && (
                                    <p
                                        className={`text-xs mt-2 font-medium ${stat.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
                                    >
                                        <ArrowTrendingUpIcon
                                            className={`w-3.5 h-3.5 inline mr-1 ${stat.change < 0 ? 'rotate-180' : ''}`}
                                        />
                                        {stat.change >= 0 ? '+' : ''}
                                        {stat.change}% vs kemarin
                                    </p>
                                )}
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="xl:col-span-2 bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="font-playfair text-lg font-semibold text-navy-900">
                                Pendapatan per Jam
                            </h3>
                            <p className="text-xs text-navy-400 mt-1">
                                Hari ini · dalam ribuan Rupiah
                            </p>
                        </div>
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={barData} barSize={18}>
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
                                        formatter={(value) => [
                                            `Rp ${value}k`,
                                            'Pendapatan',
                                        ]}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#1B2A4A"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-60 flex items-center justify-center text-navy-400 text-sm">
                                Belum ada data pendapatan per jam
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="font-playfair text-lg font-semibold text-navy-900">
                                Tipe Order
                            </h3>
                            <p className="text-xs text-navy-400 mt-1">
                                Dine-in vs Takeaway
                            </p>
                        </div>
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={75}
                                            dataKey="value"
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={
                                                        ['#1B2A4A', '#C8B99A'][
                                                            index % 2
                                                        ]
                                                    }
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
                                <div className="mt-4 space-y-2">
                                    {pieData.map((item) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-navy-600">
                                                {item.name}
                                            </span>
                                            <span className="font-semibold text-navy-900">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-60 flex items-center justify-center text-navy-400 text-sm">
                                Belum ada data tipe order
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders & Top Menu */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white border border-cream-300 rounded-3xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-cream-200">
                            <h3 className="font-playfair text-lg font-semibold text-navy-900">
                                Pesanan Terbaru
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-cream-200 bg-cream-50">
                                        <th className="px-6 py-3 text-xs font-bold text-navy-400 uppercase">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-navy-400 uppercase">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-navy-400 uppercase">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-navy-400 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-navy-400 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cream-200">
                                    {data?.recent_orders
                                        ?.slice(0, 5)
                                        .map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-cream-50"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-navy-900">
                                                    #HSH-
                                                    {String(order.id).padStart(
                                                        4,
                                                        '0',
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-navy-600">
                                                    {order.user?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-navy-800">
                                                    Rp{' '}
                                                    {order.total_price?.toLocaleString(
                                                        'id',
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                            order.status ===
                                                            'selesai'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : order.status ===
                                                                    'diproses'
                                                                  ? 'bg-blue-100 text-blue-700'
                                                                  : order.status ===
                                                                      'pending'
                                                                    ? 'bg-amber-100 text-amber-700'
                                                                    : 'bg-red-100 text-red-700'
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                updateStatus(
                                                                    order.id,
                                                                    'diproses',
                                                                )
                                                            }
                                                            disabled={
                                                                order.status !==
                                                                'pending'
                                                            }
                                                            className={`text-xs px-3 py-1 rounded-full border ${order.status !== 'pending' ? 'bg-cream-100 text-navy-300 border-cream-200' : 'bg-white text-navy-700 border-cream-300 hover:bg-cream-50'}`}
                                                        >
                                                            Diproses
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateStatus(
                                                                    order.id,
                                                                    'selesai',
                                                                )
                                                            }
                                                            disabled={
                                                                order.status ===
                                                                    'selesai' ||
                                                                order.status ===
                                                                    'dibatalkan'
                                                            }
                                                            className={`text-xs px-3 py-1 rounded-full border ${order.status === 'selesai' || order.status === 'dibatalkan' ? 'bg-cream-100 text-navy-300 border-cream-200' : 'bg-white text-navy-700 border-cream-300 hover:bg-cream-50'}`}
                                                        >
                                                            Selesai
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateStatus(
                                                                    order.id,
                                                                    'dibatalkan',
                                                                )
                                                            }
                                                            disabled={
                                                                order.status ===
                                                                    'selesai' ||
                                                                order.status ===
                                                                    'dibatalkan'
                                                            }
                                                            className={`text-xs px-3 py-1 rounded-full border ${order.status === 'selesai' || order.status === 'dibatalkan' ? 'bg-cream-100 text-navy-300 border-cream-200' : 'bg-white text-navy-700 border-cream-300 hover:bg-cream-50'}`}
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                confirmPayment(
                                                                    order.id,
                                                                )
                                                            }
                                                            disabled={
                                                                order.payment_status ===
                                                                'paid'
                                                            }
                                                            className={`text-xs px-3 py-1 rounded-full border ${order.payment_status === 'paid' ? 'bg-cream-100 text-navy-300 border-cream-200' : 'bg-white text-navy-700 border-cream-300 hover:bg-cream-50'}`}
                                                        >
                                                            Konfirmasi Bayar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    {data?.recent_orders?.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-10 text-center text-navy-400 text-sm"
                                            >
                                                Belum ada pesanan hari ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-playfair text-lg font-semibold text-navy-900 mb-4">
                            Menu Terlaris
                        </h3>
                        {data?.top_menus?.length > 0 ? (
                            <div className="space-y-4">
                                {data.top_menus.map((menuItem, index) => (
                                    <div
                                        key={menuItem.menu?.id || index}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center font-bold text-navy-800 text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-navy-900 truncate">
                                                {menuItem.menu?.name}
                                            </p>
                                            <div className="mt-1.5 h-2 bg-cream-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-navy-800 rounded-full"
                                                    style={{
                                                        width: `${(menuItem.total_sold / data.top_menus[0]?.total_sold) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-navy-600">
                                            {menuItem.total_sold}×
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-navy-400 text-sm">
                                Belum ada data menu terlaris
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
