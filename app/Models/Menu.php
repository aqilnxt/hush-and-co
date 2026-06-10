<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'image',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    // Relasi: menu milik satu kategori
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relasi: menu ada di banyak order item
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Relasi: toppings yang tersedia untuk menu ini (dikonfigurasi admin)
    public function toppings()
    {
        return $this->belongsToMany(Topping::class, 'menu_toppings')
            ->withPivot(['max_allowed', 'is_required', 'price_override'])
            ->withTimestamps();
    }
}
