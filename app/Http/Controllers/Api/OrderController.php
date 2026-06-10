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
            'items.*.toppings' => 'sometimes|array',
            'items.*.toppings.*.topping_id' => 'required_with:items.*.toppings|exists:toppings,id',
            'items.*.toppings.*.qty' => 'nullable|integer|min:1',
            'use_points'  => 'nullable|boolean',
        ]);


        // Pakai DB transaction biar aman
        $order = DB::transaction(function () use ($request) {

            // Hitung total harga
            $totalPrice = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $menu = Menu::with('toppings')->findOrFail($item['menu_id']);

                // Cek menu tersedia
                if (!$menu->is_available) {
                    throw new \Exception("Menu {$menu->name} sedang tidak tersedia.");
                }

                // Hitung topping untuk item ini
                $toppingsForItem = [];
                $toppingsExtraPerUnit = 0;

                if (!empty($item['toppings']) && is_array($item['toppings'])) {
                    foreach ($item['toppings'] as $tSel) {
                        $topping = \App\Models\Topping::findOrFail($tSel['topping_id']);
                        $qty = isset($tSel['qty']) ? max(1, (int)$tSel['qty']) : 1;

                        // Pastikan topping tersedia untuk menu dan tidak melebihi max
                        $menuT = $menu->toppings->firstWhere('id', $topping->id);
                        if (!$menuT) {
                            throw new \Exception("Topping {$topping->name} tidak tersedia untuk menu {$menu->name}.");
                        }

                        $maxAllowed = $menuT->pivot->max_allowed ?? 1;
                        if ($qty > $maxAllowed) {
                            throw new \Exception("Topping {$topping->name} melebihi batas maksimum ({$maxAllowed}).");
                        }

                        $unitPrice = $menuT->pivot->price_override !== null ? $menuT->pivot->price_override : $topping->price;

                        $toppingsForItem[] = [
                            'topping_id' => $topping->id,
                            'qty' => $qty,
                            'unit_price' => $unitPrice,
                            'name' => $topping->name,
                        ];

                        // Tambah harga topping ke per-unit extra
                        $toppingsExtraPerUnit += ($unitPrice * $qty);
                    }
                }

                $perUnitPrice = $menu->price + $toppingsExtraPerUnit;
                $subtotal     = $perUnitPrice * $item['quantity'];
                $totalPrice  += $subtotal;

                $orderItems[] = [
                    'menu_id'  => $menu->id,
                    'quantity' => $item['quantity'],
                    'price'    => $menu->price,
                    'subtotal' => $subtotal,
                    'notes'    => $item['notes'] ?? null,
                    'toppings' => $toppingsForItem,
                ];
            }

            $user = $request->user('sanctum') ?: $request->user();

            // 1. Check points multiplier (Monday double points)
            $pointsMultiplier = now()->isMonday() ? 2 : 1;

            // 2. Check Birthday treat eligibility
            $birthdayDrinkClaimed = false;
            $birthdayDiscount = 0;
            $birthdayTargetIndex = null;

            if ($user && $user->birth_date) {
                $isBirthdayMonth = (int) date('m') === (int) date('m', strtotime($user->birth_date));

                $alreadyClaimedThisYear = Order::where('user_id', $user->id)
                    ->where('birthday_drink_claimed', true)
                    ->whereYear('created_at', date('Y'))
                    ->where('status', '!=', 'dibatalkan')
                    ->exists();

                if ($isBirthdayMonth && !$alreadyClaimedThisYear) {
                    // Check if there is a drink item in the order
                    $drinkItems = [];
                    foreach ($orderItems as $index => $item) {
                        $menu = Menu::with('category')->find($item['menu_id']);
                        if ($menu && $menu->category && $menu->category->slug !== 'food') {
                            $drinkItems[] = [
                                'index' => $index,
                                'price' => $item['price']
                            ];
                        }
                    }

                    if (!empty($drinkItems)) {
                        // Discount the cheapest drink
                        usort($drinkItems, function ($a, $b) {
                            return $a['price'] <=> $b['price'];
                        });

                        $birthdayTargetIndex = $drinkItems[0]['index'];
                        $birthdayDiscount = $orderItems[$birthdayTargetIndex]['price'];
                        $birthdayDrinkClaimed = true;
                    }
                }
            }

            // 3. Check Kopi ke-10 Gratis eligibility
            $freeDrinkClaimed = false;
            $freeDrinkDiscount = 0;

            if ($user) {
                // Refresh user to get accessors
                $userModel = User::find($user->id);
                $freeDrinksAvailable = $userModel->free_drinks_available;

                if ($freeDrinksAvailable > 0) {
                    // Find a drink item (excluding the one taken by birthday treat if applicable)
                    $drinkItems = [];
                    foreach ($orderItems as $index => $item) {
                        $menu = Menu::with('category')->find($item['menu_id']);
                        if ($menu && $menu->category && $menu->category->slug !== 'food') {
                            $availableQty = $item['quantity'];
                            if ($birthdayDrinkClaimed && $index === $birthdayTargetIndex) {
                                $availableQty--;
                            }
                            if ($availableQty > 0) {
                                $drinkItems[] = [
                                    'index' => $index,
                                    'price' => $item['price']
                                ];
                            }
                        }
                    }

                    if (!empty($drinkItems)) {
                        // Discount the cheapest remaining drink
                        usort($drinkItems, function ($a, $b) {
                            return $a['price'] <=> $b['price'];
                        });
                        $freeDrinkDiscount = $drinkItems[0]['price'];
                        $freeDrinkClaimed = true;
                    }
                }
            }

            // Apply discounts to totalPrice
            if ($birthdayDrinkClaimed) {
                $totalPrice = max(0, $totalPrice - $birthdayDiscount);
            }
            if ($freeDrinkClaimed) {
                $totalPrice = max(0, $totalPrice - $freeDrinkDiscount);
            }

            // Hitung potongan poin jika diaktifkan
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
                'free_drink_claimed' => $freeDrinkClaimed,
                'birthday_drink_claimed' => $birthdayDrinkClaimed,
                'points_multiplier' => $pointsMultiplier,
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

            // Buat order items dan simpan topping per order item
            foreach ($orderItems as $item) {
                $created = $order->orderItems()->create([
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                    'notes' => $item['notes'] ?? null,
                ]);

                // attach toppings jika ada
                if (!empty($item['toppings'])) {
                    foreach ($item['toppings'] as $t) {
                        $created->toppings()->attach($t['topping_id'], [
                            'qty' => $t['qty'],
                            'price_at_order' => $t['unit_price'],
                        ]);
                    }
                }
            }

            // Update status meja jadi occupied
            if ($request->order_type === 'dine-in') {
                Table::where('id', $request->table_id)
                    ->update(['status' => 'occupied']);
            }

            // Award points immediately after the order is created successfully.
            $this->checkAndAwardPoints($order, true);

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
        $query = Order::with(['orderItems.menu.category', 'orderItems.toppings', 'table', 'user'])
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
     * Award points to the user if the order is completed and paid,
     * or when a valid order is created and should immediately earn points.
     * Award ratio: 1 point for every Rp 10.000 spent.
     */
    private function checkAndAwardPoints(Order $order, bool $force = false)
    {
        if (!$order->user_id) {
            return;
        }

        // Segarkan data pesanan untuk memastikan status terkini
        $order->refresh();

        // Poin hanya diberikan jika pesanan SELESAI dan LUNAS (paid),
        // kecuali dipaksa pada saat pembuatan order.
        if (!$force && ($order->status !== 'selesai' || $order->payment_status !== 'paid')) {
            return;
        }

        // Hindari double crediting: cek apakah point log earn untuk order ini sudah ada
        $alreadyEarned = PointLog::where('order_id', $order->id)
            ->where('type', 'earn')
            ->exists();

        if ($alreadyEarned) {
            return;
        }

        // Hitung poin yang didapatkan (1 poin per Rp 10.000, dikali multiplier jika ada)
        $pointsEarned = floor($order->total_price / 10000) * ($order->points_multiplier ?? 1);

        $user = User::find($order->user_id);
        if (!$user) {
            return;
        }

        if ($pointsEarned > 0) {
            $user->increment('points', $pointsEarned);

            // Buat log riwayat
            PointLog::create([
                'user_id'       => $user->id,
                'order_id'      => $order->id,
                'points_change' => $pointsEarned,
                'type'          => 'earn',
            ]);
        }

        // Award first order bonus: +10 poin ketika user menyelesaikan pesanan pertama mereka
        $this->checkAndAwardFirstOrderBonus($order, $user);
    }

    /**
     * Award bonus poin untuk pesanan pertama user.
     * Bonus: +10 poin
     * Hanya diberikan sekali per user, pada saat pesanan pertama selesai.
     */
    private function checkAndAwardFirstOrderBonus(Order $order, User $user)
    {
        // Hitung total pesanan selesai user (menggunakan accessor dari User model)
        $completedOrdersCount = $user->getCompletedTransactionsCountAttribute();

        // Jika ini adalah pesanan pertama yang selesai (count == 1)
        if ($completedOrdersCount === 1) {
            // Cek apakah user sudah pernah klaim first order bonus (double claim prevention)
            $alreadyClaimed = PointLog::where('user_id', $user->id)
                ->where('type', 'first_order_bonus')
                ->exists();

            if (!$alreadyClaimed) {
                // Award +10 bonus poin
                $bonusPoints = 10;
                $user->increment('points', $bonusPoints);

                // Buat log riwayat dengan type='first_order_bonus'
                PointLog::create([
                    'user_id'       => $user->id,
                    'order_id'      => $order->id,
                    'points_change' => $bonusPoints,
                    'type'          => 'first_order_bonus',
                ]);
            }
        }
    }
}
