<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Topping;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class OrderWithToppingsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_order_with_toppings_stores_toppings_and_price()
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $category = Category::create([
            'name' => 'Coffee',
            'slug' => 'coffee-' . uniqid(),
            'icon' => '☕',
        ]);

        $menu = Menu::create([
            'category_id' => $category->id,
            'name' => 'Latte',
            'price' => 20000,
            'is_available' => true,
        ]);

        $topping = Topping::create([
            'name' => 'Gula',
            'price' => 500,
            'active' => true,
        ]);

        // attach topping to menu with pivot
        $menu->toppings()->attach($topping->id, [
            'max_allowed' => 2,
            'is_required' => false,
            'price_override' => null,
        ]);

        $payload = [
            'order_type' => 'takeaway',
            'pickup_name' => 'Tester',
            'items' => [
                [
                    'menu_id' => $menu->id,
                    'quantity' => 2,
                    'toppings' => [
                        ['topping_id' => $topping->id, 'qty' => 1],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($customer)
            ->postJson('/api/orders', $payload);

        $response->assertStatus(201);

        $orderId = $response->json('data.id');

        // Check order_item_toppings exists
        $this->assertDatabaseHas('order_item_toppings', [
            'topping_id' => $topping->id,
        ]);

        // Check total price includes topping (2 items × (20000 + 500) = 41000)
        $this->assertEquals(41000, $response->json('data.total_price'));
    }
}
