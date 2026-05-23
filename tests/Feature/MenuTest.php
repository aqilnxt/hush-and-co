<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use DatabaseTransactions;

    // ------------------------------------------------------------------ helpers

    private function makeCategory(string $suffix = ''): Category
    {
        $uid = uniqid($suffix . '_', true);
        return Category::create([
            'name' => 'Test Cat ' . $uid,
            'slug' => 'test-cat-' . $uid,
            'icon' => '☕',
        ]);
    }

    // ------------------------------------------------------------------ tests

    public function test_can_retrieve_unpaginated_menus(): void
    {
        $category = $this->makeCategory('unpag');

        Menu::create([
            'category_id'  => $category->id,
            'name'         => 'Espresso_' . uniqid(),
            'price'        => 15000,
            'is_available' => true,
        ]);

        $response = $this->getJson('/api/menus');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);

        // At least one item in the response (live DB may have others too)
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_can_retrieve_paginated_menus_with_stats(): void
    {
        $category = $this->makeCategory('pag');

        for ($i = 1; $i <= 15; $i++) {
            Menu::create([
                'category_id'  => $category->id,
                'name'         => 'Espresso_' . $i . '_' . uniqid(),
                'price'        => 15000,
                'is_available' => $i <= 10,
            ]);
        }

        // Paginate filtered to this test's category so other rows don't interfere
        $response = $this->getJson(
            '/api/menus?paginate=true&per_page=10&page=1&category_id=' . $category->id
        );

        $response->assertStatus(200)
            ->assertJsonPath('current_page', 1)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('stats.total', 15)
            ->assertJsonPath('stats.available', 10)
            ->assertJsonPath('stats.unavailable', 5);
    }

    public function test_admin_can_create_menu_with_image(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);

        $category = $this->makeCategory('img');

        $file = UploadedFile::fake()->image('latte.jpg');

        $response = $this->actingAs($admin)
            ->postJson('/api/menus', [
                'category_id'  => $category->id,
                'name'         => 'Hush Latte ' . uniqid(),
                'description'  => 'Latte with signature syrup',
                'price'        => 25000,
                'is_available' => true,
                'image'        => $file,
            ]);

        $response->assertStatus(201);

        $menu = Menu::where('category_id', $category->id)->firstOrFail();
        $this->assertNotNull($menu->image);
        Storage::disk('public')->assertExists($menu->image);
    }
}
