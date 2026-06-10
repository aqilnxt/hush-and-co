<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SiteSettingController extends Controller
{
    protected array $allowedKeys = [
        'logo',
        'hero_image',
        'about_image',
        'auth_bg',
    ];

    public function index()
    {
        $settings = SiteSetting::all()->mapWithKeys(function (SiteSetting $setting) {
            return [
                $setting->key => Storage::disk('public')->url($setting->value),
            ];
        });

        return response()->json(['data' => $settings]);
    }

    public function update(Request $request, string $key)
    {
        if (!in_array($key, $this->allowedKeys, true)) {
            return response()->json(['message' => 'Invalid site setting key.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:51200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('image');
        $path = $file->store('site', 'public');

        $setting = SiteSetting::firstOrNew(['key' => $key]);

        if ($setting->value && Storage::disk('public')->exists($setting->value)) {
            Storage::disk('public')->delete($setting->value);
        }

        $setting->value = $path;
        $setting->save();

        return response()->json([
            'data' => [
                'key' => $key,
                'image_url' => Storage::disk('public')->url($path),
            ],
        ]);
    }
}
