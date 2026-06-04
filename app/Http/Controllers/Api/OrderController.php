<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use App\Models\Table;
use App\Models\User;
use App\Models\PointLog;
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
        if (
            $request->user()->isCustomer() &&
            $order->user_id !== $request->user()->id
        ) {
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
        // Resolve table_number to table_id if it's non-numeric
        if ($request->order_type === 'dine-in' && $request->table_id && !is_numeric($request->table_id)) {
            $table = Table::where('table_number', $request->table_id)->first();
            if ($table) {
                $request->merge(['table_id' => $table->id]);
            }
        }

        $request->validate([
            'order_type'  => 'required|in:dine-in,takeaway',
            'table_id'    => 'required_if:order_type,dine-in|nullable|integer|exists:tables,id',
            'pickup_name' => 'required_if:order_type,takeaway|nullable|string|max:255',
            'items'       => 'required|array|min:1',
            'items.*.menu_id'  => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes'    => 'nullable|string',
            'use_points'  => 'nullable|boolean',
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

            // Hitung potongan poin jika diaktifkan
            $user = $request->user('sanctum') ?: $request->user();
            $pointsUsed = 0;

            if ($request->use_points && $user) {
                $user = User::findOrFail($user->id);
                if ($user->points > 0) {
                    // 1 poin = Rp 1.000 diskon
                    // Maksimum poin yang bisa digunakan dibatasi total harga / 1000
                    $maxPointsPossible = floor($totalPrice / 1000);
                    $pointsUsed = min($user->points, $maxPointsPossible);

                    if ($pointsUsed > 0) {
                        $user->decrement('points', $pointsUsed);
                        $totalPrice -= ($pointsUsed * 1000);
                    }
                }
            }

            // Buat order
            $order = Order::create([
                'user_id'        => $user ? $user->id : null,
                'table_id'       => $request->order_type === 'dine-in'
                    ? $request->table_id : null,
                'order_type'     => $request->order_type,
                'pickup_name'    => $request->order_type === 'takeaway'
                    ? $request->pickup_name : null,
                'status'         => 'pending',
                'payment_status' => 'unpaid',
                'total_price'    => $totalPrice,
                'points_used'    => $pointsUsed,
            ]);

            // Buat log penukaran poin
            if ($pointsUsed > 0) {
                PointLog::create([
                    'user_id'       => $user->id,
                    'order_id'      => $order->id,
                    'points_change' => -$pointsUsed,
                    'type'          => 'redeem',
                ]);
            }

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

        // Berikan poin jika pesanan selesai dan sudah lunas
        $this->checkAndAwardPoints($order);

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

        // Berikan poin jika pesanan selesai dan sudah lunas
        $this->checkAndAwardPoints($order);

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

    // GET /api/points/history — riwayat poin customer
    public function pointHistory(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $logs = PointLog::with(['order'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $logs
        ]);
    }

    /**
     * Award points to the user if the order is completed and paid.
     * Award ratio: 1 point for every Rp 10.000 spent.
     */
    private function checkAndAwardPoints(Order $order)
    {
        if (!$order->user_id) {
            return;
        }

        // Segarkan data pesanan untuk memastikan status terkini
        $order->refresh();

        // Poin hanya diberikan jika pesanan SELESAI dan LUNAS (paid)
        if ($order->status !== 'selesai' || $order->payment_status !== 'paid') {
            return;
        }

        // Hindari double crediting: cek apakah point log earn untuk order ini sudah ada
        $alreadyEarned = PointLog::where('order_id', $order->id)
            ->where('type', 'earn')
            ->exists();

        if ($alreadyEarned) {
            return;
        }

        // Hitung poin yang didapatkan (1 poin per Rp 10.000)
        $pointsEarned = floor($order->total_price / 10000);

        if ($pointsEarned > 0) {
            $user = User::find($order->user_id);
            if ($user) {
                $user->increment('points', $pointsEarned);

                // Buat log riwayat
                PointLog::create([
                    'user_id'       => $user->id,
                    'order_id'      => $order->id,
                    'points_change' => $pointsEarned,
                    'type'          => 'earn',
                ]);
            }
        }
    }
}
