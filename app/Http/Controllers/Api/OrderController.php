<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // GET /api/orders — riwayat order customer
    public function index(Request $request)
    {
        $orders = Order::with(['orderItems.menu', 'table'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders
        ]);
    }

    // GET /api/orders/{id} — detail order
    public function show(Request $request, $id)
    {
        $order = Order::with(['orderItems.menu', 'table', 'user'])
            ->findOrFail($id);

        // Customer hanya bisa lihat ordernya sendiri
        if ($request->user()->isCustomer() &&
            $order->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'data' => $order
        ]);
    }

    // POST /api/orders — buat order baru (customer)
    public function store(Request $request)
    {
        $request->validate([
            'order_type'  => 'required|in:dine-in,takeaway',
            'table_id'    => 'required_if:order_type,dine-in|exists:tables,id',
            'pickup_name' => 'required_if:order_type,takeaway|string|max:255',
            'items'       => 'required|array|min:1',
            'items.*.menu_id'  => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes'    => 'nullable|string',
        ]);

        // Pakai DB transaction biar aman
        $order = DB::transaction(function () use ($request) {

            // Hitung total harga
            $totalPrice = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $menu = Menu::findOrFail($item['menu_id']);

                // Cek menu tersedia
                if (!$menu->is_available) {
                    throw new \Exception("Menu {$menu->name} sedang tidak tersedia.");
                }

                $subtotal     = $menu->price * $item['quantity'];
                $totalPrice  += $subtotal;

                $orderItems[] = [
                    'menu_id'  => $menu->id,
                    'quantity' => $item['quantity'],
                    'price'    => $menu->price,
                    'subtotal' => $subtotal,
                    'notes'    => $item['notes'] ?? null,
                ];
            }

            // Buat order
            $order = Order::create([
                'user_id'        => $request->user()->id,
                'table_id'       => $request->order_type === 'dine-in'
                                    ? $request->table_id : null,
                'order_type'     => $request->order_type,
                'pickup_name'    => $request->order_type === 'takeaway'
                                    ? $request->pickup_name : null,
                'status'         => 'pending',
                'payment_status' => 'unpaid',
                'total_price'    => $totalPrice,
                'points_used'    => 0,
            ]);

            // Buat order items
            foreach ($orderItems as $item) {
                $order->orderItems()->create($item);
            }

            // Update status meja jadi occupied
            if ($request->order_type === 'dine-in') {
                Table::where('id', $request->table_id)
                     ->update(['status' => 'occupied']);
            }

            return $order;
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibuat!',
            'data'    => $order->load(['orderItems.menu', 'table']),
        ], 201);
    }

    // PATCH /api/orders/{id}/status — update status (staff & admin)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:diproses,selesai,dibatalkan',
        ]);

        $order = Order::with(['orderItems', 'table'])->findOrFail($id);

        // Cegah update kalau sudah selesai/dibatalkan
        if (in_array($order->status, ['selesai', 'dibatalkan'])) {
            return response()->json([
                'message' => 'Order sudah final, tidak bisa diubah.'
            ], 422);
        }

        $order->update(['status' => $request->status]);

        // Kalau selesai → bebaskan meja
        if ($request->status === 'selesai' && $order->table_id) {
            Table::where('id', $order->table_id)
                 ->update(['status' => 'available']);
        }

        // Kalau dibatalkan → bebaskan meja juga
        if ($request->status === 'dibatalkan' && $order->table_id) {
            Table::where('id', $order->table_id)
                 ->update(['status' => 'available']);
        }

        return response()->json([
            'message' => 'Status order berhasil diupdate!',
            'data'    => $order,
        ]);
    }

    // PATCH /api/orders/{id}/payment — konfirmasi bayar (staff)
    public function confirmPayment($id)
    {
        $order = Order::findOrFail($id);

        if ($order->payment_status === 'paid') {
            return response()->json([
                'message' => 'Order sudah lunas.'
            ], 422);
        }

        $order->update(['payment_status' => 'paid']);

        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi!',
            'data'    => $order,
        ]);
    }

    // GET /api/staff/orders — semua order untuk staff
    public function staffOrders(Request $request)
    {
        $query = Order::with(['orderItems.menu', 'table', 'user'])
            ->latest();

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by tipe
        if ($request->order_type) {
            $query->where('order_type', $request->order_type);
        }

        $orders = $query->get();

        return response()->json([
            'data' => $orders
        ]);
    }
}