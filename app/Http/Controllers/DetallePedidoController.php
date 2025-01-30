<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DetallePedido;
use App\Models\Pedido;
use App\Models\Producto;

class DetallePedidoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $detallesPedidos = DetallePedido::with(['pedido', 'producto'])->get();
        return view('detalles_pedidos.index', compact('detallesPedidos'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $pedidos = Pedido::all();
        $productos = Producto::all();
        return view('detalles_pedidos.create', compact('pedidos', 'productos'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_pedido' => 'required|exists:pedidos,id_pedido',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'nullable|integer',
            'precio' => 'nullable|numeric',
        ]);

        DetallePedido::create($request->all());

        return redirect()->route('detalles-pedidos.index')
                         ->with('success', 'Detalle de Pedido creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(DetallePedido $detallePedido)
    {
        return view('detalles_pedidos.show', compact('detallePedido'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DetallePedido $detallePedido)
    {
        $pedidos = Pedido::all();
        $productos = Producto::all();
        return view('detalles_pedidos.edit', compact('detallePedido', 'pedidos', 'productos'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DetallePedido $detallePedido)
    {
        $request->validate([
            'id_pedido' => 'required|exists:pedidos,id_pedido',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'nullable|integer',
            'precio' => 'nullable|numeric',
        ]);

        $detallePedido->update($request->all());

        return redirect()->route('detalles-pedidos.index')
                         ->with('success', 'Detalle de Pedido actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DetallePedido $detallePedido)
    {
        $detallePedido->delete();

        return redirect()->route('detalles-pedidos.index')
                         ->with('success', 'Detalle de Pedido eliminado exitosamente.');
    }
}
