<?php

namespace App\Http\Controllers\Match\Admin;

use App\Http\Controllers\Controller;
use App\Models\Match\MatchAdmin;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MatchAdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validated['email'] !== MatchAdmin::DEFAULT_EMAIL || $validated['password'] !== MatchAdmin::DEFAULT_PASSWORD) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales invalidas.'],
            ]);
        }

        $admin = MatchAdmin::query()->updateOrCreate(
            ['email' => MatchAdmin::DEFAULT_EMAIL],
            [
                'name' => MatchAdmin::DEFAULT_NAME,
                'password' => MatchAdmin::DEFAULT_PASSWORD,
                'is_active' => true,
            ]
        );

        $token = $admin->createToken('admin-api-match')->plainTextToken;

        return response()->json([
            'token' => $token,
            'admin' => [
                'id' => (string) $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'super_admin',
            ],
        ]);
    }

    public function logout(Request $request)
    {
        optional($request->user()->currentAccessToken())->delete();

        return response()->json([
            'message' => 'Sesion cerrada correctamente',
        ]);
    }
}
