<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    // GET /api/admin/dashboard
    public function index(): JsonResponse
    {
        $today     = Carbon::today();
        $yesterday = Carbon::yesterday();

        // ── STATS HARI INI ──
        $todayRevenue = Order::whereDate('created_at', $today)
            ->where('status', 'selesai')
            ->sum('total_price');

        $yesterdayRevenue = Order::whereDate('created_at', $yesterday)
            ->where('status', 'selesai')
            ->sum('total_price');

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $yesterdayOrders = Order::whereDate('created_at', $yesterday)->count();

        $activeCustomers = Order::whereDate('created_at', $today)
            ->distinct('user_id')
            ->count('user_id');

        $avgOrderValue = Order::whereDate('created_at', $today)
            ->where('status', 'selesai')
            ->avg('total_price') ?? 0;

        // ── ORDER BY STATUS ──
        $ordersByStatus = Order::whereDate('created_at', $today)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        // ── ORDER BY TYPE ──
        $ordersByType = Order::whereDate('created_at', $today)
            ->select('order_type', DB::raw('count(*) as total'))
            ->groupBy('order_type')
            ->get();

        // ── TOP 5 MENU TERLARIS HARI INI ──
        $topMenus = OrderItem::with('menu')
            ->whereHas('order', function ($q) use ($today) {
                $q->whereDate('created_at', $today)
                  ->where('status', 'selesai');
            })
            ->select('menu_id', DB::raw('SUM(quantity) as total_sold'),
                                DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('menu_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // ── PENDAPATAN PER JAM ──
        $revenuePerHour = Order::whereDate('created_at', $today)
            ->where('status', 'selesai')
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // ── PESANAN TERBARU ──
        $recentOrders = Order::with(['user', 'table', 'orderItems.menu'])
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => [
                'today_revenue'    => $todayRevenue,
                'yesterday_revenue'=> $yesterdayRevenue,
                'revenue_change'   => $yesterdayRevenue > 0
                    ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
                    : 0,
                'today_orders'     => $todayOrders,
                'yesterday_orders' => $yesterdayOrders,
                'active_customers' => $activeCustomers,
                'avg_order_value'  => round($avgOrderValue),
            ],
            'orders_by_status'  => $ordersByStatus,
            'orders_by_type'    => $ordersByType,
            'top_menus'         => $topMenus,
            'revenue_per_hour'  => $revenuePerHour,
            'recent_orders'     => $recentOrders,
        ]);
    }
}