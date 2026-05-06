<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'points_change',
        'type',
    ];

    // Relasi: log milik satu user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: log milik satu order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}