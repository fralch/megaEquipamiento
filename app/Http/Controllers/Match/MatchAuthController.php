<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Match\MatchUser;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MatchAuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:match_users',
            'password' => 'required|string|min:6',
            'name' => 'nullable|string',
            'age' => 'required|integer|min:18',
            'gender' => 'required|string',
            'interested_in' => 'required|string',
            // other fields
            'description' => 'nullable|string',
            'instagram' => 'nullable|string',
            'whatsapp' => 'nullable|string',
        ]);

        // Since we cast 'password' => 'hashed' in the model, we don't need Hash::make here
        $user = MatchUser::create([
            'email' => $request->email,
            'password' => $request->password,
            'name' => $request->name,
            'age' => $request->age,
            'gender' => $request->gender,
            'interested_in' => $request->interested_in,
            'description' => $request->description,
            'instagram' => $request->instagram,
            'whatsapp' => $request->whatsapp,
        ]);

        $token = $user->createToken('match-app')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = MatchUser::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales incorrectas.'],
            ]);
        }

        $token = $user->createToken('match-app')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
