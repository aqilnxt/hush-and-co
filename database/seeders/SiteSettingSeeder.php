<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'logo' => 'site/logo.png',
            'hero_image' => 'site/hero_image.png',
            'about_image' => 'site/about_image.png',
            'auth_bg' => 'site/auth_bg.png',
        ];

        File::ensureDirectoryExists(storage_path('app/public/site'));

        $publicFiles = [
            'logo' => public_path('images/hush-co-logo.png'),
            'hero_image' => public_path('images/hush-co-lifestyle.png'),
            'about_image' => public_path('images/hush-co-about.png'),
            'auth_bg' => public_path('images/hush-co-cafe.png'),
        ];

        foreach ($defaults as $key => $value) {
            if (File::exists($publicFiles[$key]) && !File::exists(storage_path('app/public/' . $value))) {
                File::copy($publicFiles[$key], storage_path('app/public/' . $value));
            }

            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }
    }
}
