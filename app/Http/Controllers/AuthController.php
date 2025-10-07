<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $usuario = Usuario::where('correo', $request->email)->first();

        if (!$usuario || !Hash::check($request->password, $usuario->contraseña)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $usuario->forceFill([
            'ultima_conexion' => Carbon::now(),
        ])->save();

        Auth::login($usuario);

        return redirect()->route('welcome');
    }

    public function register(Request $request)
    {
        $request->validate([
            'nombre_usuario' => 'required|unique:usuarios',
            'correo' => 'required|email|unique:usuarios',
            'contraseña' => 'required|min:8',
            'nombre' => 'required|string',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string',
        ]);

        $usuario = Usuario::create([
            'nombre_usuario' => $request->nombre_usuario,
            'correo' => $request->correo,
            'contraseña' => Hash::make($request->contraseña),
            'nombre' => $request->nombre,
            'direccion' => $request->direccion,
            'telefono' => $request->telefono,
            'ultima_conexion' => Carbon::now(),
        ]);

        Auth::login($usuario);

        return redirect()->route('welcome');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('welcome');
    }
}
