<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PedidoConfirmacion;
use App\Models\Pedido;
use App\Models\Usuario;
use Inertia\Inertia;

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

    /**
     * Confirmar pedido y enviar correo de confirmación
     */
    public function confirmarPedido(Request $request)
    {
        try {
            // Validar los datos del pedido
            $validated = $request->validate([
                'orderData' => 'required|array',
                'checkoutState' => 'required|array',
                'totals' => 'required|array',
                'orderNumber' => 'required|string'
            ]);

            // Extraer datos del cliente
            $customerData = $validated['checkoutState']['customerData'] ?? [];
            $shippingData = $validated['checkoutState']['shippingData'] ?? [];
            $paymentData = $validated['checkoutState']['paymentData'] ?? [];
            
            // Preparar datos para el correo
            $datosCorreo = [
                'orderNumber' => $validated['orderNumber'],
                'customerData' => $customerData,
                'shippingData' => $shippingData,
                'paymentData' => $paymentData,
                'orderData' => $validated['orderData'],
                'totals' => $validated['totals'],
                'datosBancarios' => [
                    'banco' => 'Banco de Crédito del Perú (BCP)',
                    'titular' => 'MegaEquipamiento S.A.C.',
                    'numeroCuenta' => '194-2345678-0-12',
                    'cuentaInterbancaria' => '002-194-002345678012-34',
                    'ruc' => '20123456789',
                    'email' => 'ventas@megaequipamiento.com',
                    'telefono' => '+51 1 234-5678'
                ]
            ];

            // Enviar correo de confirmación
            if (isset($customerData['email']) && !empty($customerData['email'])) {
                Mail::to($customerData['email'])->send(new PedidoConfirmacion($datosCorreo));
            }

            return response()->json([
                'success' => true,
                'message' => 'Pedido confirmado y correo enviado exitosamente',
                'orderNumber' => $validated['orderNumber']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ver detalles del pedido
     */
    public function verPedido($orderNumber)
    {
        return Inertia::render('Pedido/Detalle', [
            'orderNumber' => $orderNumber
        ]);
    }
}
