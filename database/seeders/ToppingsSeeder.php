<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Topping;

class ToppingsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['name' => 'Gula', 'price' => 0.50],
            ['name' => 'Syrup Vanilla', 'price' => 1.00],
            ['name' => 'Extra Milk', 'price' => 0.75],
            ['name' => 'Whipped Cream', 'price' => 1.25],
        ];

        foreach ($data as $row) {
            Topping::updateOrCreate(['name' => $row['name']], $row);
        }
    }
}
