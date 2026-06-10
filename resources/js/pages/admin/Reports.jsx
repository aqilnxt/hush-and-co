import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import {
    CalendarDaysIcon,
    FunnelIcon,
    ArrowPathIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    TableCellsIcon,
    BanknotesIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    ArrowDownTrayIcon,
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

    // Data chart
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

    // Statistik summary
    const summaryStats = report
        ? [
              {
                  label: 'Total Pendapatan',
                  value: `Rp ${report.summary.total_revenue?.toLocaleString('id')}`,
                  icon: BanknotesIcon,
                  bg: 'bg-emerald-50',
                  text: 'text-emerald-600',
              },
              {
                  label: 'Total Order',
                  value: report.summary.total_orders,
                  icon: ShoppingBagIcon,
                  bg: 'bg-sky-50',
                  text: 'text-sky-600',
              },
              {
                  label: 'Dine-in',
                  value: report.summary.dine_in_count,
                  icon: UserGroupIcon,
                  bg: 'bg-amber-50',
                  text: 'text-amber-600',
              },
              {
                  label: 'Takeaway',
                  value: report.summary.takeaway_count,
                  icon: ArrowDownTrayIcon,
                  bg: 'bg-purple-50',
                  text: 'text-purple-600',
              },
          ]
        : [];

    return (
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-8">
            <div className="space-y-6">
                {/* Filter Section */}
                <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <CalendarDaysIcon className="w-4 h-4" />
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 w-full rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <CalendarDaysIcon className="w-4 h-4" />
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 w-full rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <FunnelIcon className="w-4 h-4" />
                                Tipe Order
                            </label>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="mt-1 w-full rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition appearance-none cursor-pointer"
                            >
                                <option value="">Semua</option>
                                <option value="dine-in">Dine-in</option>
                                <option value="takeaway">Takeaway</option>
                            </select>
                        </div>
                        <div>
                            <button
                                onClick={fetchReport}
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-navy-800 px-6 py-2.5 text-sm font-semibold text-cream-100 hover:bg-navy-900 transition disabled:opacity-60 shadow-sm"
                            >
                                {loading ? (
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FunnelIcon className="w-4 h-4" />
                                )}
                                {loading ? 'Memuat...' : 'Terapkan'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {!report && !loading && (
                    <div className="bg-white border border-dashed border-cream-300 rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-4">
                            <DocumentTextIcon className="w-10 h-10 text-navy-400" />
                        </div>
                        <h3 className="font-playfair text-xl font-semibold text-navy-900 mb-2">
                            Belum ada laporan
                        </h3>
                        <p className="text-navy-400 text-sm max-w-md mx-auto">
                            Pilih rentang tanggal dan klik{' '}
                            <strong>Terapkan</strong> untuk menampilkan
                            ringkasan performa dan grafik pendapatan.
                        </p>
                    </div>
                )}

                {/* Hasil Report */}
                {report && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {summaryStats.map((stat) => (
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
                                    <p className="font-playfair text-2xl font-bold text-navy-900">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
                            {/* Bar Chart Pendapatan per Hari */}
                            <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="font-playfair text-lg font-semibold text-navy-900">
                                        Pendapatan per Hari
                                    </h3>
                                    <p className="text-xs text-navy-400 mt-1">
                                        Total pendapatan dalam ribuan Rupiah
                                    </p>
                                </div>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height={240}
                                    >
                                        <BarChart data={chartData} barSize={18}>
                                            <XAxis
                                                dataKey="date"
                                                tick={{
                                                    fill: '#6B7B95',
                                                    fontSize: 11,
                                                }}
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
                                                    `Rp ${value.toLocaleString('id')}`,
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
                                        Belum ada data pendapatan harian
                                    </div>
                                )}
                            </div>

                            {/* Pie Chart Tipe Order */}
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
                                        <ResponsiveContainer
                                            width="100%"
                                            height={200}
                                        >
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
                                                                [
                                                                    '#1B2A4A',
                                                                    '#C8B99A',
                                                                ][index % 2]
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

                        {/* Revenue per Jam (opsional, jika ada data) */}
                        {barData.length > 0 && (
                            <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="font-playfair text-lg font-semibold text-navy-900">
                                        Pendapatan per Jam
                                    </h3>
                                    <p className="text-xs text-navy-400 mt-1">
                                        Hari ini · dalam ribuan Rupiah
                                    </p>
                                </div>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={barData} barSize={14}>
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
                                                background: '#FFFFFF',
                                                border: '1px solid #E8E0D0',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                color: '#0E1A2E',
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
                            </div>
                        )}

                        {/* Export Buttons */}
                        <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-playfair text-lg font-semibold text-navy-900 flex items-center gap-2">
                                        <DocumentArrowDownIcon className="w-5 h-5 text-navy-800" />
                                        Ekspor Laporan
                                    </h3>
                                    <p className="text-xs text-navy-400 mt-1">
                                        Unduh ringkasan dalam format PDF atau
                                        Excel
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        disabled={exporting || !report}
                                        className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                                    >
                                        <DocumentTextIcon className="w-4 h-4" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => handleExport('excel')}
                                        disabled={exporting || !report}
                                        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 transition disabled:opacity-50"
                                    >
                                        <TableCellsIcon className="w-4 h-4" />
                                        Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
