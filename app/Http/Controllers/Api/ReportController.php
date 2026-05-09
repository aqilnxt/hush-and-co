<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    // GET /api/admin/report
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'order_type' => 'nullable|in:dine-in,takeaway',
            'status'     => 'nullable|in:selesai,dibatalkan',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate   = Carbon::parse($request->end_date)->endOfDay();

        $query = Order::with(['user', 'table', 'orderItems.menu'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->order_type) {
            $query->where('order_type', $request->order_type);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'selesai');
        }

        $orders = $query->latest()->get();

        // Summary
        $summary = [
            'total_orders'   => $orders->count(),
            'total_revenue'  => $orders->sum('total_price'),
            'avg_per_order'  => $orders->count() > 0
                ? round($orders->avg('total_price'))
                : 0,
            'dine_in_count'  => $orders->where('order_type', 'dine-in')->count(),
            'takeaway_count' => $orders->where('order_type', 'takeaway')->count(),
        ];

        // Top menus dalam periode
        $topMenus = OrderItem::with('menu')
            ->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate])
                  ->where('status', 'selesai');
            })
            ->select('menu_id',
                DB::raw('SUM(quantity) as total_sold'),
                DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('menu_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return response()->json([
            'period'    => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
            ],
            'summary'   => $summary,
            'top_menus' => $topMenus,
            'orders'    => $orders,
        ]);
    }

    // GET /api/admin/report/export-pdf
    public function exportPdf(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate   = Carbon::parse($request->end_date)->endOfDay();

        $orders = Order::with(['user', 'orderItems.menu'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'selesai')
            ->latest()
            ->get();

        $summary = [
            'total_orders'  => $orders->count(),
            'total_revenue' => $orders->sum('total_price'),
            'start_date'    => $startDate->format('d M Y'),
            'end_date'      => $endDate->format('d M Y'),
        ];

        $pdf = Pdf::loadView('reports.sales', compact('orders', 'summary'))
                  ->setPaper('a4', 'portrait');

        return $pdf->download('laporan-hush-and-co-' . now()->format('Ymd') . '.pdf');
    }

    // GET /api/admin/report/export-excel
    public function exportExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate   = Carbon::parse($request->end_date)->endOfDay();

        $orders = Order::with(['user', 'orderItems.menu'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'selesai')
            ->latest()
            ->get();

        // Format data untuk Excel
        $data   = [];
        $data[] = ['No', 'Order ID', 'Customer', 'Tipe', 'Total', 'Status Bayar', 'Tanggal'];

        foreach ($orders as $i => $order) {
            $data[] = [
                $i + 1,
                '#HSH-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                $order->user->name,
                $order->order_type,
                $order->total_price,
                $order->payment_status,
                $order->created_at->format('d/m/Y H:i'),
            ];
        }

        // Generate CSV (simple Excel-compatible)
        $filename = 'laporan-hush-and-co-' . now()->format('Ymd') . '.csv';
        $handle   = fopen('php://temp', 'r+');

        foreach ($data as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}