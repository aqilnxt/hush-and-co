<?php

namespace Tests\Feature;

use App\Models\GalleryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GalleryTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        GalleryItem::query()->delete();
    }

    public function test_public_can_get_only_active_gallery_items()
    {
        // 1. Create active item
        $activeItem = GalleryItem::create([
            'title'      => 'Active Photo',
            'image_path' => 'gallery/active.jpg',
            'sort_order' => 1,
            'is_active'  => true,
        ]);

        // 2. Create inactive item
        $inactiveItem = GalleryItem::create([
            'title'      => 'Inactive Photo',
            'image_path' => 'gallery/inactive.jpg',
            'sort_order' => 2,
            'is_active'  => false,
        ]);

        // 3. Request public endpoint
        $response = $this->getJson('/api/gallery');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $activeItem->id);
    }

    public function test_non_admin_cannot_access_admin_gallery_endpoints()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $staff    = User::factory()->create(['role' => 'staff']);

        // Test GET admin gallery
        $this->actingAs($customer)->getJson('/api/admin/gallery')->assertStatus(403);
        $this->actingAs($staff)->getJson('/api/admin/gallery')->assertStatus(403);

        // Test POST admin gallery
        $this->actingAs($customer)->postJson('/api/admin/gallery', [])->assertStatus(403);

        // Test PUT admin gallery
        $this->actingAs($customer)->putJson('/api/admin/gallery/1', [])->assertStatus(403);

        // Test DELETE admin gallery
        $this->actingAs($customer)->deleteJson('/api/admin/gallery/1')->assertStatus(403);
    }

    public function test_admin_can_manage_gallery_items()
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        // 1. Admin GET all gallery items
        GalleryItem::create([
            'title'      => 'Photo A',
            'image_path' => 'gallery/a.jpg',
            'sort_order' => 5,
            'is_active'  => false, // inactive is included
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/gallery');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');

        // 2. Admin POST (upload photo)
        $file     = UploadedFile::fake()->image('scene.jpg');
        $response = $this->actingAs($admin)->postJson('/api/admin/gallery', [
            'image'      => $file,
            'title'      => 'Bar counter',
            'sort_order' => 3,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('gallery_items', [
            'title'      => 'Bar counter',
            'sort_order' => 3,
            'is_active'  => true,
        ]);

        $itemId    = $response->json('data.id');
        $imagePath = $response->json('data.image_path');
        Storage::disk('public')->assertExists($imagePath);

        // 3. Admin PUT (update title, sort_order, is_active)
        $response = $this->actingAs($admin)->putJson("/api/admin/gallery/{$itemId}", [
            'title'      => 'New Title',
            'sort_order' => 10,
            'is_active'  => false,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('gallery_items', [
            'id'         => $itemId,
            'title'      => 'New Title',
            'sort_order' => 10,
            'is_active'  => false,
        ]);

        // 4. Admin DELETE
        $response = $this->actingAs($admin)->deleteJson("/api/admin/gallery/{$itemId}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('gallery_items', ['id' => $itemId]);
        Storage::disk('public')->assertMissing($imagePath);
    }
}
