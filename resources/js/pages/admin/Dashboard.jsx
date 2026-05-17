import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
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

    const { user, logout } = useAuth();
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
        { path: '/admin/tables', label: 'Meja & QR Code', icon: '🪑' },
        { path: '/admin/users', label: 'User & Staff', icon: '👥' },
        { path: '/admin/reports', label: 'Laporan', icon: '📈' },
    ];

    const PIE_COLORS = ['#1B2A4A', '#C8B99A'];

    if (loading)
        return (
            <div className="min-h-screen bg-navy-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cream-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );

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
                    <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 px-3 mb-2">
                        Overview
                    </p>
                    {navItems.slice(0, 1).map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 bg-cream-400/10 text-cream-200 border-l-2 border-cream-400"
                        >
                            <span>{item.icon}</span> {item.label}
                        </button>
                    ))}

                    <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 px-3 mb-2 mt-4">
                        Manajemen
                    </p>
                    {navItems.slice(1, 4).map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 text-navy-200 hover:bg-white/5 hover:text-cream-200 transition"
                        >
                            <span>{item.icon}</span> {item.label}
                        </button>
                    ))}

                    <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 px-3 mb-2 mt-4">
                        Laporan
                    </p>
                    {navItems.slice(4).map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 text-navy-200 hover:bg-white/5 hover:text-cream-200 transition"
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
                        className="w-full text-left text-xs text-navy-400 hover:text-cream-200 transition"
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
                        Dashboard
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Live
                        </div>
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="px-4 py-1.5 bg-cream-400/15 border border-cream-400/20 text-cream-200 rounded-lg text-xs font-medium hover:bg-cream-400/25 transition"
                        >
                            📥 Export Laporan
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* GREETING */}
                    <div className="mb-8">
                        <h1 className="font-playfair text-2xl font-medium text-cream-200 mb-1">
                            Selamat datang,{' '}
                            <em className="italic text-cream-400">Admin</em> 👋
                        </h1>
                        <p className="text-sm text-navy-400">
                            Berikut ringkasan performa Hush & Co. hari ini.
                        </p>
                    </div>

                    {/* KPI */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {[
                            {
                                label: 'Pendapatan',
                                val: `Rp ${(data?.stats?.today_revenue / 1000000).toFixed(1)}jt`,
                                change: data?.stats?.revenue_change,
                                icon: '💰',
                            },
                            {
                                label: 'Total Order',
                                val: data?.stats?.today_orders,
                                change: null,
                                icon: '📦',
                            },
                            {
                                label: 'Customer Aktif',
                                val: data?.stats?.active_customers,
                                change: null,
                                icon: '👥',
                            },
                            {
                                label: 'Rata-rata Order',
                                val: `Rp ${data?.stats?.avg_order_value?.toLocaleString('id')}`,
                                change: null,
                                icon: '⭐',
                            },
                        ].map((kpi, i) => (
                            <div
                                key={i}
                                className="bg-navy-800 border border-white/10 rounded-xl p-5"
                            >
                                <div className="text-xl mb-3">{kpi.icon}</div>
                                <p className="text-xs text-navy-400 uppercase tracking-widest mb-2">
                                    {kpi.label}
                                </p>
                                <p className="font-playfair text-2xl font-medium text-cream-200 mb-1">
                                    {kpi.val}
                                </p>
                                {kpi.change !== null && (
                                    <p
                                        className={`text-xs ${kpi.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                                    >
                                        {kpi.change >= 0 ? '↑' : '↓'}{' '}
                                        {Math.abs(kpi.change)}% vs kemarin
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="grid grid-cols-4 gap-3 mb-8">
                        {[
                            {
                                label: 'Tambah Menu',
                                icon: '➕',
                                path: '/admin/menus',
                            },
                            {
                                label: 'Generate QR',
                                icon: '📷',
                                path: '/admin/tables',
                            },
                            {
                                label: 'Tambah Staff',
                                icon: '👤',
                                path: '/admin/users',
                            },
                            {
                                label: 'Lihat Laporan',
                                icon: '📊',
                                path: '/admin/reports',
                            },
                        ].map((a) => (
                            <button
                                key={a.label}
                                onClick={() => navigate(a.path)}
                                className="bg-navy-800 border border-white/10 rounded-xl p-4 text-center hover:bg-white/5 hover:border-cream-400/30 transition"
                            >
                                <div className="text-2xl mb-2">{a.icon}</div>
                                <p className="text-xs font-medium text-cream-200">
                                    {a.label}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* CHARTS */}
                    <div className="grid grid-cols-3 gap-5 mb-6">
                        {/* Bar Chart */}
                        <div className="col-span-2 bg-navy-800 border border-white/10 rounded-xl p-6">
                            <p className="text-sm font-medium text-cream-200 mb-1">
                                Pendapatan per Jam
                            </p>
                            <p className="text-xs text-navy-400 mb-5">
                                Hari ini · dalam ribuan Rupiah
                            </p>
                            {barData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={140}>
                                    <BarChart data={barData} barSize={16}>
                                        <XAxis
                                            dataKey="hour"
                                            tick={{
                                                fill: '#6B7B95',
                                                fontSize: 10,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{
                                                background: '#0E1A2E',
                                                border: '1px solid rgba(200,185,154,.2)',
                                                borderRadius: 8,
                                                fontSize: 12,
                                                color: '#F5EFE0',
                                            }}
                                            formatter={(v) => [
                                                `Rp ${v}k`,
                                                'Pendapatan',
                                            ]}
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#C8B99A"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-36 flex items-center justify-center text-navy-400 text-sm">
                                    Belum ada data hari ini
                                </div>
                            )}
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-navy-800 border border-white/10 rounded-xl p-6">
                            <p className="text-sm font-medium text-cream-200 mb-1">
                                Tipe Order
                            </p>
                            <p className="text-xs text-navy-400 mb-5">
                                Dine-in vs Takeaway
                            </p>
                            {pieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={100}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={48}
                                                dataKey="value"
                                            >
                                                {pieData.map((_, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={
                                                            PIE_COLORS[
                                                                i %
                                                                    PIE_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#0E1A2E',
                                                    border: '1px solid rgba(200,185,154,.2)',
                                                    borderRadius: 8,
                                                    fontSize: 12,
                                                    color: '#F5EFE0',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 mt-3">
                                        {pieData.map((d, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 text-xs"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-sm"
                                                    style={{
                                                        background:
                                                            PIE_COLORS[i],
                                                    }}
                                                />
                                                <span className="text-navy-200 flex-1">
                                                    {d.name}
                                                </span>
                                                <span className="text-cream-200 font-medium">
                                                    {d.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-36 flex items-center justify-center text-navy-400 text-sm">
                                    Belum ada data
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RECENT ORDERS & TOP MENU */}
                    <div className="grid grid-cols-2 gap-5">
                        {/* Recent Orders */}
                        <div className="bg-navy-800 border border-white/10 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
                                <p className="text-sm font-medium text-cream-200">
                                    Pesanan Terbaru
                                </p>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        {[
                                            'Order ID',
                                            'Customer',
                                            'Total',
                                            'Status',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-2.5 text-left text-xs font-medium text-navy-400 uppercase tracking-wider"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.recent_orders
                                        ?.slice(0, 5)
                                        .map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b border-white/5 hover:bg-white/2"
                                            >
                                                <td className="px-4 py-3 text-xs font-medium text-cream-200">
                                                    #HSH-
                                                    {String(order.id).padStart(
                                                        4,
                                                        '0',
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-navy-200">
                                                    {order.user?.name}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-cream-200">
                                                    Rp{' '}
                                                    {order.total_price?.toLocaleString(
                                                        'id',
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full border ${
                                                            order.status ===
                                                            'selesai'
                                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                                : order.status ===
                                                                    'diproses'
                                                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                  : order.status ===
                                                                      'pending'
                                                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Top Menu */}
                        <div className="bg-navy-800 border border-white/10 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/10">
                                <p className="text-sm font-medium text-cream-200">
                                    Menu Terlaris
                                </p>
                            </div>
                            <div className="p-5 space-y-4">
                                {data?.top_menus?.length > 0 ? (
                                    data.top_menus.map((m, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="font-playfair text-lg text-cream-400 w-5">
                                                {i + 1}
                                            </span>
                                            <span className="text-base">
                                                ☕
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm text-cream-200 font-medium">
                                                    {m.menu?.name}
                                                </p>
                                                <div className="h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full bg-cream-400 rounded-full"
                                                        style={{
                                                            width: `${(m.total_sold / data.top_menus[0]?.total_sold) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-xs text-navy-400">
                                                {m.total_sold}×
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-navy-400 text-center py-8">
                                        Belum ada data hari ini
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
