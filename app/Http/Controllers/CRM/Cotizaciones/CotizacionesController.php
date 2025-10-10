<?php

namespace App\Http\Controllers\CRM\Cotizaciones;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\DetalleCotizacion;
use App\Models\Cliente;
use App\Models\EmpresaCliente;
use App\Models\Usuario;
use App\Models\NuestraEmpresa;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CotizacionesController extends Controller
{
    /**
     * Display a listing of cotizaciones
     */
    public function index(Request $request)
    {
        try {
            $query = Cotizacion::with([
                'vendedor:id_usuario,nombre,apellido',
                'miEmpresa:id,nombre',
                'detallesProductos',
                'detallesAdicionales'
            ]);

            // Filtro por b�squeda
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('numero', 'like', "%{$search}%");
                });
            }

            // Filtro por estado
            if ($request->has('estado') && $request->estado !== 'all') {
                $query->where('estado', $request->estado);
            }

            // Filtro por vendedor
            if ($request->has('vendedor_id') && $request->vendedor_id) {
                $query->where('usuario_id', $request->vendedor_id);
            }

            // Ordenamiento
            $sortField = $request->input('sort_field', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Paginaci�n
            $perPage = $request->input('per_page', 15);
            $cotizaciones = $query->paginate($perPage);

            // Cargar informaci�n de clientes para cada cotizaci�n
            $cotizaciones->getCollection()->transform(function ($cotizacion) {
                // Cargar cliente din�micamente
                if ($cotizacion->cliente_tipo === 'empresa') {
                    $cliente = EmpresaCliente::find($cotizacion->cliente_id);
                    $cotizacion->cliente_nombre = $cliente->razon_social ?? 'N/A';
                    $cotizacion->cliente_contacto = $cliente->contacto_principal ?? 'N/A';
                    $cotizacion->cliente_email = $cliente->email ?? 'N/A';
                    $cotizacion->cliente_telefono = $cliente->telefono ?? 'N/A';
                } else {
                    $cliente = Cliente::find($cotizacion->cliente_id);
                    $cotizacion->cliente_nombre = $cliente->nombrecompleto ?? 'N/A';
                    $cotizacion->cliente_contacto = $cliente->nombrecompleto ?? 'N/A';
                    $cotizacion->cliente_email = $cliente->email ?? 'N/A';
                    $cotizacion->cliente_telefono = $cliente->telefono ?? 'N/A';
                }

                $cotizacion->vendedor_nombre = $cotizacion->vendedor
                    ? $cotizacion->vendedor->nombre . ' ' . $cotizacion->vendedor->apellido
                    : 'N/A';

                return $cotizacion;
            });

            // Si es una petici�n AJAX, retornar JSON
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json($cotizaciones);
            }

            // Renderizar la vista con Inertia
            return Inertia::render('CRM/Cotizaciones/Cotizaciones', [
                'cotizaciones' => $cotizaciones->items(),
                'pagination' => [
                    'current_page' => $cotizaciones->currentPage(),
                    'last_page' => $cotizaciones->lastPage(),
                    'per_page' => $cotizaciones->perPage(),
                    'total' => $cotizaciones->total(),
                    'from' => $cotizaciones->firstItem(),
                    'to' => $cotizaciones->lastItem(),
                ],
                'filters' => $request->only(['search', 'estado', 'vendedor_id', 'sort_field', 'sort_direction'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener cotizaciones: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener cotizaciones',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get data for creating a new cotizaci�n
     */
    public function create()
    {
        try {
            $clientes = Cliente::with('vendedor')
                ->orderBy('nombrecompleto')
                ->get()
                ->map(function ($cliente) {
                    return [
                        'id' => $cliente->id,
                        'tipo' => 'particular',
                        'nombre' => $cliente->nombrecompleto,
                        'email' => $cliente->email,
                        'telefono' => $cliente->telefono,
                        'vendedor_id' => $cliente->usuario_id,
                    ];
                });

            $empresas = EmpresaCliente::with('vendedor')
                ->where('activo', true)
                ->orderBy('razon_social')
                ->get()
                ->map(function ($empresa) {
                    return [
                        'id' => $empresa->id,
                        'tipo' => 'empresa',
                        'nombre' => $empresa->razon_social,
                        'email' => $empresa->email,
                        'telefono' => $empresa->telefono,
                        'vendedor_id' => $empresa->usuario_id,
                    ];
                });

            // Combinar clientes y empresas
            $todosClientes = $clientes->concat($empresas);

            $vendedores = Usuario::where('activo', true)
                ->select('id_usuario as id', 'nombre', 'apellido', 'correo')
                ->orderBy('nombre')
                ->get()
                ->map(function ($vendedor) {
                    return [
                        'id' => $vendedor->id,
                        'nombre' => $vendedor->nombre . ' ' . $vendedor->apellido,
                        'email' => $vendedor->correo,
                    ];
                });

            $misEmpresas = NuestraEmpresa::select('id', 'nombre', 'ruc', 'email', 'telefono')
                ->orderBy('nombre')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'clientes' => $todosClientes,
                    'vendedores' => $vendedores,
                    'empresas' => $misEmpresas,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener datos para crear cotizaci�n: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener datos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created cotizaci�n
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha_cotizacion' => 'required|date',
            'fecha_vencimiento' => 'required|date|after:fecha_cotizacion',
            'entrega' => 'nullable|string',
            'lugar_entrega' => 'nullable|string',
            'garantia' => 'nullable|string',
            'forma_pago' => 'nullable|string',
            'cliente_id' => 'required|integer',
            'cliente_tipo' => 'required|in:particular,empresa',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'miempresa_id' => 'required|exists:nuestras_empresas,id',
            'moneda' => 'required|in:soles,dolares',
            'tipo_cambio' => 'nullable|numeric|min:0',
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'nullable|exists:productos,id_producto',
            'productos.*.nombre' => 'required|string',
            'productos.*.cantidad' => 'required|integer|min:1',
            'productos.*.precio_unitario' => 'required|numeric|min:0',
            'productos_adicionales' => 'nullable|array',
            'productos_adicionales.*.nombre' => 'required|string',
            'productos_adicionales.*.cantidad' => 'required|integer|min:1',
            'productos_adicionales.*.precio_unitario' => 'required|numeric|min:0',
            'notas' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Crear la cotizaci�n
            $cotizacion = Cotizacion::create([
                'fecha_cotizacion' => $request->fecha_cotizacion,
                'fecha_vencimiento' => $request->fecha_vencimiento,
                'entrega' => $request->entrega,
                'lugar_entrega' => $request->lugar_entrega,
                'garantia' => $request->garantia,
                'forma_pago' => $request->forma_pago,
                'cliente_id' => $request->cliente_id,
                'cliente_tipo' => $request->cliente_tipo,
                'usuario_id' => $request->usuario_id,
                'miempresa_id' => $request->miempresa_id,
                'moneda' => $request->moneda,
                'tipo_cambio' => $request->tipo_cambio ?? 1.0,
                'estado' => 'pendiente',
                'notas' => $request->notas,
            ]);

            // Agregar productos
            $totalProductos = 0;
            foreach ($request->productos as $producto) {
                $subtotal = $producto['cantidad'] * $producto['precio_unitario'];
                $totalProductos += $subtotal;

                DetalleCotizacion::create([
                    'cotizacion_id' => $cotizacion->id,
                    'producto_id' => $producto['producto_id'] ?? null,
                    'tipo' => 'producto',
                    'nombre' => $producto['nombre'],
                    'descripcion' => $producto['descripcion'] ?? null,
                    'cantidad' => $producto['cantidad'],
                    'precio_unitario' => $producto['precio_unitario'],
                    'subtotal' => $subtotal,
                ]);
            }

            // Agregar productos adicionales
            $totalAdicionales = 0;
            if ($request->has('productos_adicionales') && is_array($request->productos_adicionales)) {
                foreach ($request->productos_adicionales as $adicional) {
                    $subtotal = $adicional['cantidad'] * $adicional['precio_unitario'];
                    $totalAdicionales += $subtotal;

                    DetalleCotizacion::create([
                        'cotizacion_id' => $cotizacion->id,
                        'producto_id' => null,
                        'tipo' => 'adicional',
                        'nombre' => $adicional['nombre'],
                        'descripcion' => $adicional['descripcion'] ?? null,
                        'cantidad' => $adicional['cantidad'],
                        'precio_unitario' => $adicional['precio_unitario'],
                        'subtotal' => $subtotal,
                    ]);
                }
            }

            // Actualizar totales
            $cotizacion->update([
                'total_monto_productos' => $totalProductos,
                'total_adicionales_monto' => $totalAdicionales,
                'total' => $totalProductos + $totalAdicionales,
            ]);

            DB::commit();

            $cotizacion->load(['vendedor', 'miEmpresa', 'detallesProductos', 'detallesAdicionales']);

            return response()->json([
                'success' => true,
                'message' => 'Cotizaci�n creada exitosamente',
                'data' => $cotizacion
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear cotizaci�n: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al crear cotizaci�n',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified cotizaci�n
     */
    public function show($id)
    {
        try {
            $cotizacion = Cotizacion::with([
                'vendedor:id_usuario,nombre,apellido,correo',
                'miEmpresa:id,nombre,ruc,email,telefono,imagen_logo,imagen_firma',
                'detallesProductos.producto',
                'detallesAdicionales'
            ])->findOrFail($id);

            // Cargar informaci�n del cliente
            if ($cotizacion->cliente_tipo === 'empresa') {
                $cliente = EmpresaCliente::find($cotizacion->cliente_id);
                $cotizacion->cliente_info = [
                    'tipo' => 'empresa',
                    'nombre' => $cliente->razon_social ?? 'N/A',
                    'contacto' => $cliente->contacto_principal ?? 'N/A',
                    'email' => $cliente->email ?? 'N/A',
                    'telefono' => $cliente->telefono ?? 'N/A',
                    'direccion' => $cliente->direccion ?? 'N/A',
                    'ruc' => $cliente->ruc ?? 'N/A',
                ];
            } else {
                $cliente = Cliente::find($cotizacion->cliente_id);
                $cotizacion->cliente_info = [
                    'tipo' => 'particular',
                    'nombre' => $cliente->nombrecompleto ?? 'N/A',
                    'contacto' => $cliente->nombrecompleto ?? 'N/A',
                    'email' => $cliente->email ?? 'N/A',
                    'telefono' => $cliente->telefono ?? 'N/A',
                    'direccion' => $cliente->direccion ?? 'N/A',
                    'ruc_dni' => $cliente->ruc_dni ?? 'N/A',
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $cotizacion
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener cotizaci�n: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Cotizaci�n no encontrada',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified cotizaci�n
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'fecha_cotizacion' => 'sometimes|date',
            'fecha_vencimiento' => 'sometimes|date|after:fecha_cotizacion',
            'entrega' => 'nullable|string',
            'lugar_entrega' => 'nullable|string',
            'garantia' => 'nullable|string',
            'forma_pago' => 'nullable|string',
            'cliente_id' => 'sometimes|integer',
            'cliente_tipo' => 'sometimes|in:particular,empresa',
            'usuario_id' => 'sometimes|exists:usuarios,id_usuario',
            'miempresa_id' => 'sometimes|exists:nuestras_empresas,id',
            'moneda' => 'sometimes|in:soles,dolares',
            'tipo_cambio' => 'nullable|numeric|min:0',
            'productos' => 'sometimes|array|min:1',
            'productos.*.producto_id' => 'nullable|exists:productos,id_producto',
            'productos.*.nombre' => 'required|string',
            'productos.*.cantidad' => 'required|integer|min:1',
            'productos.*.precio_unitario' => 'required|numeric|min:0',
            'productos_adicionales' => 'nullable|array',
            'productos_adicionales.*.nombre' => 'required|string',
            'productos_adicionales.*.cantidad' => 'required|integer|min:1',
            'productos_adicionales.*.precio_unitario' => 'required|numeric|min:0',
            'estado' => 'sometimes|in:pendiente,enviada,aprobada,rechazada,negociacion',
            'notas' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $cotizacion = Cotizacion::findOrFail($id);

            // Actualizar datos b�sicos
            $cotizacion->update($request->except(['productos', 'productos_adicionales']));

            // Si se enviaron productos, actualizar los detalles
            if ($request->has('productos')) {
                // Eliminar detalles de productos existentes
                $cotizacion->detallesProductos()->delete();

                // Agregar nuevos productos
                $totalProductos = 0;
                foreach ($request->productos as $producto) {
                    $subtotal = $producto['cantidad'] * $producto['precio_unitario'];
                    $totalProductos += $subtotal;

                    DetalleCotizacion::create([
                        'cotizacion_id' => $cotizacion->id,
                        'producto_id' => $producto['producto_id'] ?? null,
                        'tipo' => 'producto',
                        'nombre' => $producto['nombre'],
                        'descripcion' => $producto['descripcion'] ?? null,
                        'cantidad' => $producto['cantidad'],
                        'precio_unitario' => $producto['precio_unitario'],
                        'subtotal' => $subtotal,
                    ]);
                }

                $cotizacion->total_monto_productos = $totalProductos;
            }

            // Si se enviaron productos adicionales, actualizar
            if ($request->has('productos_adicionales')) {
                // Eliminar detalles adicionales existentes
                $cotizacion->detallesAdicionales()->delete();

                // Agregar nuevos adicionales
                $totalAdicionales = 0;
                if (is_array($request->productos_adicionales)) {
                    foreach ($request->productos_adicionales as $adicional) {
                        $subtotal = $adicional['cantidad'] * $adicional['precio_unitario'];
                        $totalAdicionales += $subtotal;

                        DetalleCotizacion::create([
                            'cotizacion_id' => $cotizacion->id,
                            'producto_id' => null,
                            'tipo' => 'adicional',
                            'nombre' => $adicional['nombre'],
                            'descripcion' => $adicional['descripcion'] ?? null,
                            'cantidad' => $adicional['cantidad'],
                            'precio_unitario' => $adicional['precio_unitario'],
                            'subtotal' => $subtotal,
                        ]);
                    }
                }

                $cotizacion->total_adicionales_monto = $totalAdicionales;
            }

            // Recalcular total
            if ($request->has('productos') || $request->has('productos_adicionales')) {
                $cotizacion->total = $cotizacion->total_monto_productos + $cotizacion->total_adicionales_monto;
                $cotizacion->save();
            }

            DB::commit();

            $cotizacion->load(['vendedor', 'miEmpresa', 'detallesProductos', 'detallesAdicionales']);

            return response()->json([
                'success' => true,
                'message' => 'Cotizaci�n actualizada exitosamente',
                'data' => $cotizacion
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar cotizaci�n: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar cotizaci�n',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified cotizaci�n
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $cotizacion = Cotizacion::findOrFail($id);

            // Eliminar todos los detalles
            $cotizacion->detalles()->delete();

            // Eliminar la cotizaci�n
            $cotizacion->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cotizaci�n eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar cotizaci�n: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar cotizaci�n',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar el estado de una cotizaci�n
     */
    public function cambiarEstado(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:pendiente,enviada,aprobada,rechazada,negociacion',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $cotizacion = Cotizacion::findOrFail($id);
            $cotizacion->update(['estado' => $request->estado]);

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado exitosamente',
                'data' => $cotizacion
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cambiar estado de cotizaci�n: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al cambiar estado',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estad�sticas de cotizaciones
     */
    public function estadisticas()
    {
        try {
            $total = Cotizacion::count();
            $montoTotal = Cotizacion::sum('total');
            $pendientes = Cotizacion::where('estado', 'pendiente')->count();
            $aprobadas = Cotizacion::where('estado', 'aprobada')->count();
            $enviadas = Cotizacion::where('estado', 'enviada')->count();
            $rechazadas = Cotizacion::where('estado', 'rechazada')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'monto_total' => $montoTotal,
                    'pendientes' => $pendientes,
                    'aprobadas' => $aprobadas,
                    'enviadas' => $enviadas,
                    'rechazadas' => $rechazadas,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener estad�sticas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener estad�sticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
