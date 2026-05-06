<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'table_id',
        'order_type',
        'pickup_name',
        'status',
        'payment_status',
        'total_price',
        'points_used',
    ];

    // Relasi: order milik satu user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: order milik satu meja (nullable)
    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    // Relasi: order punya banyak item
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Relasi: order punya banyak point log
    public function pointLogs()
    {
        return $this->hasMany(PointLog::class);
    }

    // Helper: hitung total dari items
    public function calculateTotal(): int
    {
        return $this->orderItems->sum('subtotal');
    }
}