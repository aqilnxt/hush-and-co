<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Topping;

class MenuToppingsSeeder extends Seeder
{
    public function run(): void
    {
        $toppings = Topping::all();

        // Attach all toppings to all menus with sensible defaults so admin can tweak later
        Menu::all()->each(function (Menu $menu) use ($toppings) {
            foreach ($toppings as $topping) {
                $menu->toppings()->syncWithoutDetaching([
                    $topping->id => [
                        'max_allowed' => 2,
                        'is_required' => false,
                        'price_override' => null,
                    ],
                ]);
            }
        });
    }
}
