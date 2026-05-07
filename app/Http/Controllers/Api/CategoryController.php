<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        $categories = Category::withCount('menus')->get();

        return response()->json([
            'data' => $categories
        ]);
    }

    // POST /api/categories (admin only)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug',
            'icon' => 'nullable|string',
        ]);

        $category = Category::create($request->all());

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan!',
            'data'    => $category,
        ], 201);
    }

    // PUT /api/categories/{id} (admin only)
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug,' . $id,
            'icon' => 'nullable|string',
        ]);

        $category->update($request->all());

        return response()->json([
            'message' => 'Kategori berhasil diupdate!',
            'data'    => $category,
        ]);
    }

    // DELETE /api/categories/{id} (admin only)
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus!',
        ]);
    }
}