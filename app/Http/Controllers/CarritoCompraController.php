<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CarritoCompra;
use App\Models\Usuario;

class CarritoCompraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $carritos = CarritoCompra::with('usuario')->get();
        return view('carrito_compras.index', compact('carritos'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $usuarios = Usuario::all();
        return view('carrito_compras.create', compact('usuarios'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
        ]);

        CarritoCompra::create($request->all());

        return redirect()->route('carrito-compras.index')
                         ->with('success', 'Carrito de compras creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CarritoCompra $carritoCompra)
    {
        return view('carrito_compras.show', compact('carritoCompra'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CarritoCompra $carritoCompra)
    {
        $usuarios = Usuario::all();
        return view('carrito_compras.edit', compact('carritoCompra', 'usuarios'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CarritoCompra $carritoCompra)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
        ]);

        $carritoCompra->update($request->all());

        return redirect()->route('carrito-compras.index')
                         ->with('success', 'Carrito de compras actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarritoCompra $carritoCompra)
    {
        $carritoCompra->delete();

        return redirect()->route('carrito-compras.index')
                         ->with('success', 'Carrito de compras eliminado exitosamente.');
    }
}
