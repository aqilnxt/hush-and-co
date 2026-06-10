<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value'];

    public static function getValue(string $key, $default = null)
    {
        return self::where('key', $key)->value('value') ?? $default;
    }

    public static function getUrl(string $key, string $default = null)
    {
        $value = self::getValue($key);
        if ($value) {
            return Storage::disk('public')->url($value);
        }

        return $default;
    }
}
