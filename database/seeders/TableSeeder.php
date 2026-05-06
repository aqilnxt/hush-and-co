<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Table;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [
            // Area A
            ['table_number' => 'A1', 'status' => 'available', 'capacity' => 2],
            ['table_number' => 'A2', 'status' => 'available', 'capacity' => 2],
            ['table_number' => 'A3', 'status' => 'available', 'capacity' => 4],
            ['table_number' => 'A4', 'status' => 'available', 'capacity' => 4],
            // Area B
            ['table_number' => 'B1', 'status' => 'available', 'capacity' => 2],
            ['table_number' => 'B2', 'status' => 'available', 'capacity' => 4],
            ['table_number' => 'B3', 'status' => 'available', 'capacity' => 6],
            ['table_number' => 'B4', 'status' => 'available', 'capacity' => 4],
            // Area C
            ['table_number' => 'C1', 'status' => 'available', 'capacity' => 2],
            ['table_number' => 'C2', 'status' => 'available', 'capacity' => 2],
            ['table_number' => 'C3', 'status' => 'available', 'capacity' => 4],
            ['table_number' => 'C4', 'status' => 'unavailable', 'capacity' => 4],
        ];

        foreach ($tables as $table) {
            Table::create($table);
        }
    }
}