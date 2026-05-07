<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    // GET /api/menus
    public function index(Request $request)
    {
        $query = Menu::with('category');

        // Filter by kategori
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by ketersediaan
        if ($request->has('is_available')) {
            $query->where('is_available', $request->is_available);
        }

        // Search by nama
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $menus = $query->get();

        return response()->json([
            'data' => $menus
        ]);
    }

    // GET /api/menus/{id}
    public function show($id)
    {
        $menu = Menu::with('category')->findOrFail($id);

        return response()->json([
            'data' => $menu
        ]);
    }

    // POST /api/menus (admin only)
    public function store(Request $request)
    {
        $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'required|integer|min:0',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_available' => 'boolean',
        ]);

        $data = $request->except('image');

        // Upload foto kalau ada
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menus', 'public');
            $data['image'] = $path;
        }

        $menu = Menu::create($data);

        return response()->json([
            'message' => 'Menu berhasil ditambahkan!',
            'data'    => $menu->load('category'),
        ], 201);
    }

    // PUT /api/menus/{id} (admin only)
    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);

        $request->validate([
            'category_id'  => 'sometimes|exists:categories,id',
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'sometimes|integer|min:0',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_available' => 'sometimes|boolean',
        ]);

        $data = $request->except('image');

        // Upload foto baru kalau ada
        if ($request->hasFile('image')) {
            // Hapus foto lama
            if ($menu->image) {
                Storage::disk('public')->delete($menu->image);
            }
            $path = $request->file('image')->store('menus', 'public');
            $data['image'] = $path;
        }

        $menu->update($data);

        return response()->json([
            'message' => 'Menu berhasil diupdate!',
            'data'    => $menu->load('category'),
        ]);
    }

    // DELETE /api/menus/{id} (admin only)
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);

        // Hapus foto kalau ada
        if ($menu->image) {
            Storage::disk('public')->delete($menu->image);
        }

        $menu->delete();

        return response()->json([
            'message' => 'Menu berhasil dihapus!',
        ]);
    }

    // PATCH /api/menus/{id}/toggle (admin only)
    public function toggle($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->update([
            'is_available' => !$menu->is_available
        ]);

        return response()->json([
            'message' => 'Status menu berhasil diubah!',
            'data'    => $menu,
        ]);
    }
}