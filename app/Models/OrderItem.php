<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'menu_id',
        'quantity',
        'price',
        'subtotal',
        'notes',
    ];

    // Relasi: item milik satu order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Relasi: item merujuk ke satu menu
    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}