<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use DatabaseTransactions;

    private function getTestData()
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $category = Category::create([
            'name' => 'Coffee',
            'slug' => 'coffee-' . uniqid(),
            'icon' => '☕',
        ]);

        $menu = Menu::create([
            'category_id' => $category->id,
            'name' => 'Espresso',
            'price' => 15000,
            'is_available' => true,
        ]);

        $table = Table::create([
            'table_number' => 'T10',
            'capacity' => 4,
            'status' => 'available',
        ]);

        return [$customer, $menu, $table];
    }

    public function test_customer_can_create_dine_in_order_with_table_number()
    {
        [$customer, $menu, $table] = $this->getTestData();

        $payload = [
            'order_type' => 'dine-in',
            'table_id' => 'T10',
            'pickup_name' => null, // Explicitly null like frontend
            'items' => [
                [
                    'menu_id' => $menu->id,
                    'quantity' => 2,
                    'notes' => 'Extra hot',
                ]
            ]
        ];

        $response = $this->actingAs($customer)
            ->postJson('/api/orders', $payload);

        if ($response->status() !== 201) {
            fwrite(STDERR, print_r($response->json(), true));
        }

        $response->assertStatus(201);
    }

    public function test_customer_can_create_takeaway_order()
    {
        [$customer, $menu, $table] = $this->getTestData();

        $payload = [
            'order_type' => 'takeaway',
            'table_id' => null, // Explicitly null like frontend
            'pickup_name' => 'John Doe',
            'items' => [
                [
                    'menu_id' => $menu->id,
                    'quantity' => 2,
                ]
            ]
        ];

        $response = $this->actingAs($customer)
            ->postJson('/api/orders', $payload);

        if ($response->status() !== 201) {
            fwrite(STDERR, print_r($response->json(), true));
        }

        $response->assertStatus(201);
    }
}
