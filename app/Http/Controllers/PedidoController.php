<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Usuario;

class PedidoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pedidos = Pedido::with('usuario')->get();
        return view('pedidos.index', compact('pedidos'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $usuarios = Usuario::all();
        return view('pedidos.create', compact('usuarios'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'monto_total' => 'required|numeric',
            'estado' => 'nullable|string|max:50',
        ]);

        Pedido::create($request->all());

        return redirect()->route('pedidos.index')
                         ->with('success', 'Pedido creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Pedido $pedido)
    {
        return view('pedidos.show', compact('pedido'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pedido $pedido)
    {
        $usuarios = Usuario::all();
        return view('pedidos.edit', compact('pedido', 'usuarios'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pedido $pedido)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'monto_total' => 'required|numeric',
            'estado' => 'nullable|string|max:50',
        ]);

        $pedido->update($request->all());

        return redirect()->route('pedidos.index')
                         ->with('success', 'Pedido actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pedido $pedido)
    {
        $pedido->delete();

        return redirect()->route('pedidos.index')
                         ->with('success', 'Pedido eliminado exitosamente.');
    }
}
