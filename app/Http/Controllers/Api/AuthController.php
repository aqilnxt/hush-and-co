<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ── REGISTER ──
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'role'        => 'customer',
            'points'      => 0,
            'provider'    => 'local',
            'provider_id' => null,
            'avatar'      => null,
            'google_id'   => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil!',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role,
        ], 201);
    }

    // ── LOGIN ──
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'role'     => 'nullable|in:customer,staff,admin',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->provider && $user->provider !== 'local') {
            throw ValidationException::withMessages([
                'email' => ['Silakan masuk dengan Google untuk akun ini.'],
            ]);
        }

        if ($request->role && $user->role !== $request->role) {
            throw ValidationException::withMessages([
                'email' => ['Akun tidak memiliki akses ke halaman ini.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role,
        ]);
    }

    // ── LOGOUT ──
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil!',
        ]);
    }

    // ── GET PROFILE ──
    public function profile(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    // ── UPDATE PROFILE ──
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'   => 'required|string|max:255',
            'email'  => 'required|email|unique:users,email,' . $user->id,
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp',
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        $user->avatar = $user->avatar
            ? (filter_var($user->avatar, FILTER_VALIDATE_URL)
                ? $user->avatar
                : asset('storage/' . $user->avatar))
            : null;

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user'    => $user,
        ]);
    }
}
