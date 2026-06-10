<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Topping;
use App\Models\Menu;

class ToppingController extends Controller
{
    // List toppings
    // - Public route: only active toppings
    // - Admin route: show all toppings so inactive ones stay visible
    public function index(Request $request)
    {
        $adminListing = str_contains($request->route()->uri(), 'admin/toppings');
        $query = $adminListing
            ? Topping::query()
            : Topping::where('active', true);

        return response()->json($query->get());
    }

    // Public: get toppings available for a specific menu (with pivot)
    public function forMenu($menuId)
    {
        $menu = Menu::with(['toppings'])->findOrFail($menuId);
        return response()->json($menu->toppings);
    }

    // Admin: create topping
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'active' => 'sometimes|boolean',
        ]);

        $topping = Topping::create($data);
        return response()->json($topping, 201);
    }

    // Admin: update topping
    public function update(Request $request, $id)
    {
        $topping = Topping::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'active' => 'sometimes|boolean',
        ]);
        $topping->update($data);
        return response()->json($topping);
    }

    // Admin: delete topping
    public function destroy($id)
    {
        $topping = Topping::findOrFail($id);
        $topping->delete();
        return response()->json(['deleted' => true]);
    }
}
