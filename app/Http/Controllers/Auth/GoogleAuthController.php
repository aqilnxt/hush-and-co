<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request)
    {
        $frontendUrl = $request->query('frontend_url', config('app.url'));
        $nextRoute = $request->query('nextRoute', '/menu');

        $request->session()->put('google_frontend_url', $frontendUrl);
        $request->session()->put('google_next_route', $nextRoute);

        $redirectUri = config('services.google.redirect');
        return Socialite::driver('google')
            ->redirectUrl($redirectUri)
            ->redirect();
    }

    public function callback(Request $request)
    {
        $redirectUri = config('services.google.redirect');
        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl($redirectUri)
                ->stateless()
                ->user();
        } catch (\Exception $e) {
            $frontendUrl = $request->session()->pull('google_frontend_url', config('app.url'));
            return redirect()->away($frontendUrl . '/oauth-success?error=' . urlencode('Google login gagal.'));
        }

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Pelanggan',
                'email' => $googleUser->getEmail(),
                'password' => Hash::make(Str::random(40)),
                'role' => 'customer',
                'points' => 0,
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'google_id' => $googleUser->getId(),
            ]
        );

        if ($user->provider === 'local') {
            $frontendUrl = $request->session()->pull('google_frontend_url', config('app.url'));
            return redirect()->away($frontendUrl . '/oauth-success?error=' . urlencode('Akun sudah terdaftar dengan email/password.')); 
        }

        if ($user->provider !== 'google') {
            $user->provider = 'google';
            $user->provider_id = $googleUser->getId();
            $user->google_id = $googleUser->getId();
            $user->avatar = $googleUser->getAvatar();
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $frontendUrl = $request->session()->pull('google_frontend_url', config('app.url'));
        $nextRoute = $request->session()->pull('google_next_route', '/menu');

        $query = http_build_query([
            'token' => $token,
            'nextRoute' => $nextRoute,
        ]);

        return redirect()->away(rtrim($frontendUrl, '/') . '/oauth-success?' . $query);
    }
}
