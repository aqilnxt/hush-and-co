<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class GalleryItemController extends Controller
{
    // GET /api/gallery — public, returns all active items ordered by sort_order
    public function index(): JsonResponse
    {
        $items = GalleryItem::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'id'          => $item->id,
                    'title'       => $item->title,
                    'image_path'  => $item->image_path,
                    'image_url'   => Storage::url($item->image_path),
                    'sort_order'  => $item->sort_order,
                    'is_active'   => $item->is_active,
                    'created_at'  => $item->created_at,
                    'updated_at'  => $item->updated_at,
                ];
            });

        return response()->json(['data' => $items]);
    }

    // GET /api/admin/gallery — admin only, returns all items ordered by sort_order
    public function adminIndex(): JsonResponse
    {
        $items = GalleryItem::orderBy('sort_order', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'id'          => $item->id,
                    'title'       => $item->title,
                    'image_path'  => $item->image_path,
                    'image_url'   => Storage::url($item->image_path),
                    'sort_order'  => $item->sort_order,
                    'is_active'   => $item->is_active,
                    'created_at'  => $item->created_at,
                    'updated_at'  => $item->updated_at,
                ];
            });

        return response()->json(['data' => $items]);
    }

    // POST /api/admin/gallery — admin only, upload image + title + sort_order
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image'      => 'required|image|mimes:jpeg,png,jpg,gif,webp',
            'title'      => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $sortOrder = $request->input('sort_order', 0);

        if ($request->hasFile('image')) {
            // Simpan gambar di folder public/gallery
            $path = $request->file('image')->store('gallery', 'public');
            
            $item = GalleryItem::create([
                'title'      => $request->title,
                'image_path' => $path,
                'sort_order' => $sortOrder,
                'is_active'  => true,
            ]);

            return response()->json([
                'message' => 'Foto berhasil ditambahkan!',
                'data'    => [
                    'id'          => $item->id,
                    'title'       => $item->title,
                    'image_path'  => $item->image_path,
                    'image_url'   => Storage::url($item->image_path),
                    'sort_order'  => $item->sort_order,
                    'is_active'   => $item->is_active,
                ]
            ], 201);
        }

        return response()->json(['message' => 'File gambar tidak ditemukan'], 400);
    }

    // PUT /api/admin/gallery/{id} — admin only, update title, sort_order, is_active
    public function update(Request $request, $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        $request->validate([
            'title'      => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'nullable|boolean',
        ]);

        $item->update($request->only(['title', 'sort_order', 'is_active']));

        return response()->json([
            'message' => 'Foto berhasil diupdate!',
            'data'    => [
                'id'          => $item->id,
                'title'       => $item->title,
                'image_path'  => $item->image_path,
                'image_url'   => Storage::url($item->image_path),
                'sort_order'  => $item->sort_order,
                'is_active'   => $item->is_active,
            ]
        ]);
    }

    // DELETE /api/admin/gallery/{id} — admin only, delete item and its image file
    public function destroy($id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        // Hapus dari folder storage
        if ($item->image_path && Storage::disk('public')->exists($item->image_path)) {
            Storage::disk('public')->delete($item->image_path);
        }

        $item->delete();

        return response()->json([
            'message' => 'Foto berhasil dihapus!',
        ]);
    }
}
