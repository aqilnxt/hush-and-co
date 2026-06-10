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

    public function test_customer_points_lifecycle()
    {
        [$customer, $menu, $table] = $this->getTestData();

        // 1. Create order: 3 items of Espresso (15000 * 3 = 45000)
        $payload = [
            'order_type' => 'takeaway',
            'pickup_name' => 'John Doe',
            'items' => [
                [
                    'menu_id' => $menu->id,
                    'quantity' => 3, // 45.000 total price
                ]
            ]
        ];

        $response = $this->actingAs($customer)
            ->postJson('/api/orders', $payload);
        $response->assertStatus(201);
        $orderId = $response->json('data.id');

        $this->assertEquals(4, $customer->fresh()->points);

        // 2. Mark order as paid
        $response = $this->actingAs(User::factory()->create(['role' => 'staff']))
            ->patchJson("/api/orders/{$orderId}/payment");
        $response->assertStatus(200);

        // Point should remain the same after payment because it was already awarded.
        $this->assertEquals(4, $customer->fresh()->points);

        // 3. Mark status as 'selesai'
        $response = $this->actingAs(User::factory()->create(['role' => 'staff']))
            ->patchJson("/api/orders/{$orderId}/status", ['status' => 'selesai']);
        $response->assertStatus(200);

        // Earning: floor(45000 / 10000) = 4 points.
        $this->assertEquals(4, $customer->fresh()->points);

        // Cek point log
        $this->assertDatabaseHas('point_logs', [
            'user_id' => $customer->id,
            'order_id' => $orderId,
            'points_change' => 4,
            'type' => 'earn'
        ]);

        // Cek point log history endpoint
        $response = $this->actingAs($customer)
            ->getJson('/api/points/history');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));

        // 4. Place a new order and use points (4 points = Rp 4.000 discount)
        // 1 Espresso = 15.000. Price should be 15.000 - 4.000 = 11.000
        $payloadRedeem = [
            'order_type' => 'takeaway',
            'pickup_name' => 'John Doe',
            'use_points' => true,
            'items' => [
                [
                    'menu_id' => $menu->id,
                    'quantity' => 1,
                ]
            ]
        ];

        $response = $this->actingAs($customer)
            ->postJson('/api/orders', $payloadRedeem);
        $response->assertStatus(201);
        $newOrderId = $response->json('data.id');

        // Check if points decremented then earned from the new order total.
        $this->assertEquals(1, $customer->fresh()->points);

        // Check if total price is 11.000
        $this->assertEquals(11000, $response->json('data.total_price'));
        $this->assertEquals(4, $response->json('data.points_used'));

        // Check if redeem log created
        $this->assertDatabaseHas('point_logs', [
            'user_id' => $customer->id,
            'order_id' => $newOrderId,
            'points_change' => -4,
            'type' => 'redeem'
        ]);

        // Check if earn log created for the new order
        $this->assertDatabaseHas('point_logs', [
            'user_id' => $customer->id,
            'order_id' => $newOrderId,
            'points_change' => 1,
            'type' => 'earn'
        ]);
    }
}
