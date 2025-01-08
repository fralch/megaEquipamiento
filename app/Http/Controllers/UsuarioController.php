<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
   /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuarios = Usuario::all();
        return response()->json($usuarios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre_usuario' => 'required|string|max:50',
            'contraseña' => 'required|string|max:255',
            'correo' => 'nullable|string|max:100',
            'nombre' => 'nullable|string|max:50',
            'apellido' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
        ]);

        $usuario = new Usuario();
        $usuario->nombre_usuario = $request->nombre_usuario;
        $usuario->contraseña = bcrypt($request->contraseña);
        $usuario->correo = $request->correo;
        $usuario->nombre = $request->nombre;
        $usuario->apellido = $request->apellido;
        $usuario->direccion = $request->direccion;
        $usuario->telefono = $request->telefono;
        $usuario->save();
        return response()->json($usuario);
    }

    /**
     * Display the specified resource.
     */
    public function show(Usuario $usuario)
    {
        return response()->json($usuario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Usuario $usuario)
    {
        $request->validate([
            'nombre_usuario' => 'sometimes|required|string|max:50',
            'contraseña' => 'sometimes|required|string|max:255',
            'correo' => 'nullable|string|max:100',
            'nombre' => 'nullable|string|max:50',
            'apellido' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
        ]);

        $usuario->nombre_usuario = $request->nombre_usuario;
        $usuario->contraseña = bcrypt($request->contraseña);
        $usuario->correo = $request->correo;
        $usuario->nombre = $request->nombre;
        $usuario->apellido = $request->apellido;
        $usuario->direccion = $request->direccion;
        $usuario->telefono = $request->telefono;
        $usuario->save();        
        return response()->json($usuario);
    }
    /**
     * Login the user  
     */
    public function login(Request $request)
    {
        $request->validate([
            'nombre_usuario' => 'required|string|max:50',
            'contraseña' => 'required|string|max:255',
        ]);

        $usuario = Usuario::where('nombre_usuario', $request->nombre_usuario)->first();

        if ($usuario && Hash::check($request->contraseña, $usuario->contraseña)) {
            $token = JWTAuth::fromUser($usuario);
            return response()->json([
                'token' => $token->token,
                'usuario' => $usuario
            ]);
        }
        return response()->json(null, 401);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Usuario $usuario)
    {
        $usuario->delete();
        return response()->json(null, 204);
    }
}
