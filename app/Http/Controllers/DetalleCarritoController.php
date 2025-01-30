<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DetalleCarrito;
use App\Models\CarritoCompra;
use App\Models\Producto;

class DetalleCarritoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $detallesCarrito = DetalleCarrito::with(['carrito', 'producto'])->get();
        return view('detalles_carrito.index', compact('detallesCarrito'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $carritos = CarritoCompra::all();
        $productos = Producto::all();
        return view('detalles_carrito.create', compact('carritos', 'productos'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_carrito' => 'required|exists:carrito_compras,id_carrito',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'nullable|integer',
        ]);

        DetalleCarrito::create($request->all());

        return redirect()->route('detalles-carrito.index')
                         ->with('success', 'Detalle de Carrito creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(DetalleCarrito $detalleCarrito)
    {
        return view('detalles_carrito.show', compact('detalleCarrito'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DetalleCarrito $detalleCarrito)
    {
        $carritos = CarritoCompra::all();
        $productos = Producto::all();
        return view('detalles_carrito.edit', compact('detalleCarrito', 'carritos', 'productos'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DetalleCarrito $detalleCarrito)
    {
        $request->validate([
            'id_carrito' => 'required|exists:carrito_compras,id_carrito',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'nullable|integer',
        ]);

        $detalleCarrito->update($request->all());

        return redirect()->route('detalles-carrito.index')
                         ->with('success', 'Detalle de Carrito actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DetalleCarrito $detalleCarrito)
    {
        $detalleCarrito->delete();

        return redirect()->route('detalles-carrito.index')
                         ->with('success', 'Detalle de Carrito eliminado exitosamente.');
    }
}
