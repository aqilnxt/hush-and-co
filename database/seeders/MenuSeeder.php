<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Category;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $signature  = Category::where('slug', 'signature')->first()->id;
        $coffee     = Category::where('slug', 'coffee')->first()->id;
        $nonCoffee  = Category::where('slug', 'non-coffee')->first()->id;
        $food       = Category::where('slug', 'food')->first()->id;

        $menus = [
            // Signature
            [
                'category_id'  => $signature,
                'name'         => 'Hush Latte',
                'description'  => 'Espresso double shot, susu oat, notes karamel & hazelnut.',
                'price'        => 32000,
                'is_available' => true,
            ],
            [
                'category_id'  => $signature,
                'name'         => 'Cold Brew Navy',
                'description'  => 'Cold brew 18 jam, vanilla bean, es batu serut.',
                'price'        => 35000,
                'is_available' => true,
            ],
            [
                'category_id'  => $signature,
                'name'         => 'Cream Caramel',
                'description'  => 'Espresso, saus karamel homemade, susu full cream.',
                'price'        => 34000,
                'is_available' => true,
            ],
            // Coffee
            [
                'category_id'  => $coffee,
                'name'         => 'Americano',
                'description'  => 'Espresso double shot dengan air panas.',
                'price'        => 25000,
                'is_available' => true,
            ],
            [
                'category_id'  => $coffee,
                'name'         => 'Flat White',
                'description'  => 'Ristretto double shot dengan microfoam susu segar.',
                'price'        => 30000,
                'is_available' => true,
            ],
            [
                'category_id'  => $coffee,
                'name'         => 'Pour Over',
                'description'  => 'Single origin Flores, manual brew 4 menit.',
                'price'        => 38000,
                'is_available' => false,
            ],
            [
                'category_id'  => $coffee,
                'name'         => 'Espresso',
                'description'  => 'Shot espresso murni, bold dan concentrated.',
                'price'        => 22000,
                'is_available' => true,
            ],
            // Non-Coffee
            [
                'category_id'  => $nonCoffee,
                'name'         => 'Matcha Cream',
                'description'  => 'Matcha ceremonial grade Jepang, susu full cream.',
                'price'        => 30000,
                'is_available' => true,
            ],
            [
                'category_id'  => $nonCoffee,
                'name'         => 'Dark Choco',
                'description'  => 'Coklat 72% Valrhona, steamed milk, fleur de sel.',
                'price'        => 28000,
                'is_available' => true,
            ],
            [
                'category_id'  => $nonCoffee,
                'name'         => 'Susu Segar',
                'description'  => 'Susu full cream segar tanpa campuran apapun.',
                'price'        => 18000,
                'is_available' => true,
            ],
            // Food
            [
                'category_id'  => $food,
                'name'         => 'Butter Croissant',
                'description'  => 'Croissant all-butter, dipanggang fresh tiap pagi.',
                'price'        => 22000,
                'is_available' => true,
            ],
            [
                'category_id'  => $food,
                'name'         => 'Waffle',
                'description'  => 'Waffle crispy dengan madu dan mentega.',
                'price'        => 28000,
                'is_available' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::create($menu);
        }
    }
}