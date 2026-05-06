<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Signature', 'slug' => 'signature',   'icon' => '⭐'],
            ['name' => 'Coffee',    'slug' => 'coffee',       'icon' => '☕'],
            ['name' => 'Non-Coffee','slug' => 'non-coffee',   'icon' => '🍵'],
            ['name' => 'Food',      'slug' => 'food',         'icon' => '🥐'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }
    }
}