<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
    ];

    // Relasi: kategori punya banyak menu
    public function menus()
    {
        return $this->hasMany(Menu::class);
    }
}