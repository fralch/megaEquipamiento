<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DetalleComparacion;
use App\Models\ComparacionProducto;
use App\Models\Producto;

class DetalleComparacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $detallesComparaciones = DetalleComparacion::with(['comparacion', 'producto'])->get();
        return view('detalles_comparaciones.index', compact('detallesComparaciones'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $comparaciones = ComparacionProducto::all();
        $productos = Producto::all();
        return view('detalles_comparaciones.create', compact('comparaciones', 'productos'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_comparacion' => 'required|exists:comparaciones_productos,id_comparacion',
            'id_producto' => 'required|exists:productos,id_producto',
            'notas' => 'nullable|string',
        ]);

        DetalleComparacion::create($request->all());

        return redirect()->route('detalles-comparaciones.index')
                         ->with('success', 'Detalle de Comparación creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(DetalleComparacion $detalleComparacion)
    {
        return view('detalles_comparaciones.show', compact('detalleComparacion'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DetalleComparacion $detalleComparacion)
    {
        $comparaciones = ComparacionProducto::all();
        $productos = Producto::all();
        return view('detalles_comparaciones.edit', compact('detalleComparacion', 'comparaciones', 'productos'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DetalleComparacion $detalleComparacion)
    {
        $request->validate([
            'id_comparacion' => 'required|exists:comparaciones_productos,id_comparacion',
            'id_producto' => 'required|exists:productos,id_producto',
            'notas' => 'nullable|string',
        ]);

        $detalleComparacion->update($request->all());

        return redirect()->route('detalles-comparaciones.index')
                         ->with('success', 'Detalle de Comparación actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DetalleComparacion $detalleComparacion)
    {
        $detalleComparacion->delete();

        return redirect()->route('detalles-comparaciones.index')
                         ->with('success', 'Detalle de Comparación eliminado exitosamente.');
    }
}
