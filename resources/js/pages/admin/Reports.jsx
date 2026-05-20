import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function Reports() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [orderType, setOrderType] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

            // Download file
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            const ext = type === 'pdf' ? 'pdf' : 'csv';
            link.href = url;
            link.setAttribute(
                'download',
                `laporan-hush-${startDate}-${endDate}.${ext}`,
            );
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

    // Chart data dari orders per hari
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
                        Laporan & Export
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={exporting || !report}
                            className="px-4 py-1.5 bg-red-500/15 border border-red-500/25 text-red-300 rounded-lg text-xs font-medium hover:bg-red-500/25 transition disabled:opacity-40"
                        >
                            📄 Export PDF
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={exporting || !report}
                            className="px-4 py-1.5 bg-green-500/15 border border-green-500/25 text-green-300 rounded-lg text-xs font-medium hover:bg-green-500/25 transition disabled:opacity-40"
                        >
                            📊 Export Excel
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* FILTER BAR */}
                    <div className="bg-navy-800 border border-white/10 rounded-xl p-5 mb-6 flex items-end gap-4 flex-wrap">
                        <div>
                            <label className="text-xs font-medium text-navy-400 uppercase tracking-widest block mb-2">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-navy-400 uppercase tracking-widest block mb-2">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none focus:border-cream-400/40"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-navy-400 uppercase tracking-widest block mb-2">
                                Tipe Order
                            </label>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="px-3 py-2 bg-navy-900 border border-white/15 rounded-lg text-sm text-cream-200 outline-none"
                            >
                                <option value="">Semua</option>
                                <option value="dine-in">Dine-in</option>
                                <option value="takeaway">Takeaway</option>
                            </select>
                        </div>

                        {/* Shortcuts */}
                        <div className="flex gap-2">
                            {[
                                { label: '7 Hari', days: 7 },
                                { label: '30 Hari', days: 30 },
                                { label: '3 Bulan', days: 90 },
                            ].map((s) => (
                                <button
                                    key={s.label}
                                    onClick={() => {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setDate(start.getDate() - s.days);
                                        setEndDate(
                                            end.toISOString().split('T')[0],
                                        );
                                        setStartDate(
                                            start.toISOString().split('T')[0],
                                        );
                                    }}
                                    className="px-3 py-2 bg-transparent border border-white/15 text-navy-400 rounded-lg text-xs hover:border-cream-400/40 hover:text-cream-200 transition"
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="px-6 py-2 bg-cream-400 text-navy-900 rounded-lg text-sm font-semibold hover:bg-cream-200 transition disabled:opacity-60 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />{' '}
                                    Memuat...
                                </>
                            ) : (
                                '🔍 Terapkan'
                            )}
                        </button>
                    </div>

                    {/* EMPTY STATE */}
                    {!report && !loading && (
                        <div className="text-center py-20">
                            <p className="text-5xl mb-4">📊</p>
                            <p className="text-navy-400 text-sm">
                                Pilih rentang tanggal dan klik Terapkan untuk
                                melihat laporan
                            </p>
                        </div>
                    )}

                    {report && (
                        <>
                            {/* KPI */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {[
                                    {
                                        label: 'Total Pendapatan',
                                        val: `Rp ${report.summary.total_revenue?.toLocaleString('id')}`,
                                    },
                                    {
                                        label: 'Total Order',
                                        val: report.summary.total_orders,
                                    },
                                    {
                                        label: 'Dine-in',
                                        val: report.summary.dine_in_count,
                                    },
                                    {
                                        label: 'Takeaway',
                                        val: report.summary.takeaway_count,
                                    },
                                ].map((k) => (
                                    <div
                                        key={k.label}
                                        className="bg-navy-800 border border-white/10 rounded-xl p-5"
                                    >
                                        <p className="text-xs text-navy-400 uppercase tracking-widest mb-2">
                                            {k.label}
                                        </p>
                                        <p className="font-playfair text-2xl font-medium text-cream-200">
                                            {k.val}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* CHARTS */}
                            <div className="grid grid-cols-3 gap-5 mb-6">
                                {/* Line Chart */}
                                <div className="col-span-2 bg-navy-800 border border-white/10 rounded-xl p-6">
                                    <p className="text-sm font-medium text-cream-200 mb-1">
                                        Tren Pendapatan
                                    </p>
                                    <p className="text-xs text-navy-400 mb-5">
                                        {report.period.start} —{' '}
                                        {report.period.end}
                                    </p>
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={140}
                                        >
                                            <LineChart data={chartData}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="rgba(255,255,255,.05)"
                                                />
                                                <XAxis
                                                    dataKey="date"
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
                                                        `Rp ${v?.toLocaleString('id')}`,
                                                        'Pendapatan',
                                                    ]}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#C8B99A"
                                                    strokeWidth={2}
                                                    dot={{
                                                        fill: '#C8B99A',
                                                        r: 3,
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-36 flex items-center justify-center text-navy-400 text-sm">
                                            Tidak ada data
                                        </div>
                                    )}
                                </div>

                                {/* Top Menu */}
                                <div className="bg-navy-800 border border-white/10 rounded-xl p-6">
                                    <p className="text-sm font-medium text-cream-200 mb-5">
                                        Menu Terlaris
                                    </p>
                                    <div className="space-y-3">
                                        {report.top_menus?.length > 0 ? (
                                            report.top_menus.map((m, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="font-playfair text-cream-400 w-4 text-sm">
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-cream-200 font-medium mb-1">
                                                            {m.menu?.name}
                                                        </p>
                                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-cream-400 rounded-full"
                                                                style={{
                                                                    width: `${(m.total_sold / report.top_menus[0]?.total_sold) * 100}%`,
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
                                            <p className="text-xs text-navy-400">
                                                Tidak ada data
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* TRANSACTION TABLE */}
                            <div className="bg-navy-800 border border-white/10 rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
                                    <p className="text-sm font-medium text-cream-200">
                                        Riwayat Transaksi
                                    </p>
                                    <p className="text-xs text-navy-400">
                                        {report.orders?.length} transaksi
                                    </p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                {[
                                                    'Order ID',
                                                    'Customer',
                                                    'Tipe',
                                                    'Item',
                                                    'Total',
                                                    'Status',
                                                    'Tanggal',
                                                ].map((h) => (
                                                    <th
                                                        key={h}
                                                        className="px-4 py-3 text-left text-xs font-medium text-navy-400 uppercase tracking-wider whitespace-nowrap"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.orders
                                                ?.slice(0, 20)
                                                .map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        className="border-b border-white/5 hover:bg-white/2 transition"
                                                    >
                                                        <td className="px-4 py-3 text-xs font-medium text-cream-200">
                                                            #HSH-
                                                            {String(
                                                                order.id,
                                                            ).padStart(4, '0')}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-navy-200">
                                                            {order.user?.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-navy-400">
                                                            {order.order_type ===
                                                            'dine-in'
                                                                ? '🪑 Dine-in'
                                                                : '🥤 Takeaway'}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-navy-400">
                                                            {
                                                                order
                                                                    .order_items
                                                                    ?.length
                                                            }{' '}
                                                            item
                                                        </td>
                                                        <td className="px-4 py-3 text-xs font-medium text-cream-200">
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
                                                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                }`}
                                                            >
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-navy-400 whitespace-nowrap">
                                                            {new Date(
                                                                order.created_at,
                                                            ).toLocaleDateString(
                                                                'id',
                                                                {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Export section */}
                                <div className="px-5 py-5 border-t border-white/10 bg-navy-900/30">
                                    <p className="text-sm font-medium text-cream-200 mb-2">
                                        📥 Export Laporan
                                    </p>
                                    <p className="text-xs text-navy-400 mb-4">
                                        Download laporan sesuai filter yang
                                        dipilih
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleExport('pdf')}
                                            disabled={exporting}
                                            className="py-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm font-medium hover:bg-red-500/20 transition disabled:opacity-60"
                                        >
                                            📄 Download PDF
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleExport('excel')
                                            }
                                            disabled={exporting}
                                            className="py-3 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl text-sm font-medium hover:bg-green-500/20 transition disabled:opacity-60"
                                        >
                                            📊 Download Excel (CSV)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
