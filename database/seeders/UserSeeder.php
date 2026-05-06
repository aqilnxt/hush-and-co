<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name'     => 'Admin Hush',
            'email'    => 'admin@hushandco.id',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'points'   => 0,
        ]);

        // Staff
        User::create([
            'name'     => 'Rizky Barista',
            'email'    => 'rizky@hushandco.id',
            'password' => Hash::make('password'),
            'role'     => 'staff',
            'points'   => 0,
        ]);

        User::create([
            'name'     => 'Farah Staff',
            'email'    => 'farah@hushandco.id',
            'password' => Hash::make('password'),
            'role'     => 'staff',
            'points'   => 0,
        ]);

        // Customers
        User::create([
            'name'     => 'Ahmad Fauzi',
            'email'    => 'ahmad@email.com',
            'password' => Hash::make('password'),
            'role'     => 'customer',
            'points'   => 150,
        ]);

        User::create([
            'name'     => 'Sari Wulandari',
            'email'    => 'sari@email.com',
            'password' => Hash::make('password'),
            'role'     => 'customer',
            'points'   => 80,
        ]);

        User::create([
            'name'     => 'Dika Ramadhan',
            'email'    => 'dika@email.com',
            'password' => Hash::make('password'),
            'role'     => 'customer',
            'points'   => 320,
        ]);
    }
}