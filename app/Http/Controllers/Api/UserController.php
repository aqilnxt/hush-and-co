<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    protected function authorizeAdmin(Request $request): void
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Forbidden');
        }
    }

    // GET /api/admin/users
    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);
        $users = User::withCount('orders')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $users]);
    }

    // POST /api/admin/users
    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'required|in:staff,admin',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return response()->json([
            'message' => 'Akun berhasil dibuat!',
            'data'    => $user,
        ], 201);
    }

    // PUT /api/admin/users/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorizeAdmin($request);

        $user = User::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'role'     => 'sometimes|in:customer,staff,admin',
        ]);

        $data = $request->except('password', 'password_confirmation');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'User berhasil diupdate!',
            'data'    => $user,
        ]);
    }
}
