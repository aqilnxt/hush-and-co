<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topping extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'price', 'active'];

    public function menus()
    {
        return $this->belongsToMany(Menu::class, 'menu_toppings')
            ->withPivot(['max_allowed', 'is_required', 'price_override'])
            ->withTimestamps();
    }

    public function orderItems()
    {
        return $this->belongsToMany(OrderItem::class, 'order_item_toppings')
            ->withPivot(['qty', 'price_at_order'])
            ->withTimestamps();
    }
}
