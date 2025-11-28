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
use App\Models\ProductoTemporal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

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

            // Limitar resultados a las cotizaciones del usuario autenticado
            $usuario = auth()->user();
            if ($usuario && ($usuario->nombre_usuario !== 'Admin')) {
                $query->where('usuario_id', $usuario->id_usuario);
            }

            // Filtro por búsqueda
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

            // Paginación
            $perPage = $request->input('per_page', 15);
            $cotizaciones = $query->paginate($perPage);

            // Cargar información de clientes para cada cotización
            $cotizaciones->getCollection()->transform(function ($cotizacion) {
                // Cargar cliente dinámicamente
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

            // Si es una petición AJAX, retornar JSON
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
     * Get data for creating a new cotización
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

            $empresas = EmpresaCliente::with(['vendedor', 'contactos'])
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
                        'contactos' => $empresa->contactos->map(function ($contacto) {
                            return [
                                'id' => $contacto->id,
                                'nombre' => $contacto->nombre,
                                'email' => $contacto->email,
                                'telefono' => $contacto->telefono,
                                'cargo' => $contacto->cargo,
                                'es_principal' => $contacto->es_principal
                            ];
                        }),
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
            Log::error('Error al obtener datos para crear cotización: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener datos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created cotización
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

            // Crear la cotización
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
                    'producto_temporal_id' => $producto['producto_temporal_id'] ?? null,
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
                        'producto_id' => $adicional['producto_id'] ?? null,
                        'producto_temporal_id' => $adicional['producto_temporal_id'] ?? null,
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
                'message' => 'Cotización creada exitosamente',
                'data' => $cotizacion
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear cotización: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al crear cotización',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified cotización
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

            // Cargar información del cliente y mapear a objeto
            if ($cotizacion->cliente_tipo === 'empresa') {
                $cliente = EmpresaCliente::find($cotizacion->cliente_id);
                $cotizacion->cliente = (object)[
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
                $cotizacion->cliente = (object)[
                    'tipo' => 'particular',
                    'nombre' => $cliente->nombrecompleto ?? 'N/A',
                    'contacto' => $cliente->nombrecompleto ?? 'N/A',
                    'email' => $cliente->email ?? 'N/A',
                    'telefono' => $cliente->telefono ?? 'N/A',
                    'direccion' => $cliente->direccion ?? 'N/A',
                    'ruc_dni' => $cliente->ruc_dni ?? 'N/A',
                ];
            }

            // Mapear nombre del vendedor
            $vendedorData = null;
            if ($cotizacion->vendedor) {
                $vendedorData = (object)[
                    'nombre' => $cotizacion->vendedor->nombre . ' ' . $cotizacion->vendedor->apellido,
                    'correo' => $cotizacion->vendedor->correo ?? '',
                ];
            }
            $cotizacion->vendedor_data = $vendedorData;

            // Mapear nombre de mi empresa
            if ($cotizacion->miEmpresa) {
                $cotizacion->mi_empresa = (object)[
                    'nombre' => $cotizacion->miEmpresa->nombre,
                    'ruc' => $cotizacion->miEmpresa->ruc ?? '',
                    'email' => $cotizacion->miEmpresa->email ?? '',
                    'telefono' => $cotizacion->miEmpresa->telefono ?? '',
                ];
            }

            // Transformar detallesProductos a productos para el frontend
            $cotizacion->productos = $cotizacion->detallesProductos->map(function ($detalle) {
                return [
                    'id' => $detalle->producto_id,
                    'nombre' => $detalle->nombre,
                    'cantidad' => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal,
                ];
            });

            // Transformar detallesAdicionales a productos_adicionales para el frontend
            $cotizacion->productos_adicionales = $cotizacion->detallesAdicionales->map(function ($detalle) {
                return [
                    'nombre' => $detalle->nombre,
                    'cantidad' => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $cotizacion
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener cotización: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Cotización no encontrada',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified cotización
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

            // Actualizar datos básicos
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
                        'producto_temporal_id' => $producto['producto_temporal_id'] ?? null,
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
                            'producto_id' => $adicional['producto_id'] ?? null,
                            'producto_temporal_id' => $adicional['producto_temporal_id'] ?? null,
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
                'message' => 'Cotización actualizada exitosamente',
                'data' => $cotizacion
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar cotización: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar cotización',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified cotización
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $cotizacion = Cotizacion::findOrFail($id);

            // Eliminar todos los detalles
            $cotizacion->detalles()->delete();

            // Eliminar la cotización
            $cotizacion->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cotización eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar cotización: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar cotización',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar el estado de una cotización
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
            Log::error('Error al cambiar estado de cotización: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al cambiar estado',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de cotizaciones
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
            Log::error('Error al obtener estadísticas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener estadísticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug de datos para PDF - Ruta temporal
     */
    public function debugPdf($id)
    {
        try {
            // Cargar cotización con relaciones básicas
            $cotizacion = Cotizacion::with([
                'vendedor:id_usuario,nombre,apellido,correo',
                'miEmpresa',
                'detallesProductos',
                'detallesAdicionales'
            ])->findOrFail($id);

            // Obtener IDs de productos de los detalles
            $productosIds = $cotizacion->detallesProductos
                ->filter(function($detalle) {
                    return !is_null($detalle->producto_id);
                })
                ->pluck('producto_id')
                ->unique()
                ->toArray();

            // Cargar productos completos directamente desde la base de datos
            $productosCompletos = Producto::whereIn('id_producto', $productosIds)->get();

            $debug = [
                'cotizacion_id' => $cotizacion->id,
                'cotizacion_numero' => $cotizacion->numero,
                'productos_ids' => $productosIds,
                'productos_count' => $productosCompletos->count(),
                'productos_completos' => $productosCompletos->map(function($p) {
                    return [
                        'id' => $p->id_producto,
                        'nombre' => $p->nombre,
                        'sku' => $p->sku,
                        'descripcion' => $p->descripcion ? substr($p->descripcion, 0, 100) . '...' : 'NULL',
                        'tiene_especificaciones' => !empty($p->especificaciones_tecnicas),
                        'especificaciones_type' => gettype($p->especificaciones_tecnicas),
                        'especificaciones_raw' => $p->especificaciones_tecnicas,
                        'especificaciones_count' => is_array($p->especificaciones_tecnicas) ? count($p->especificaciones_tecnicas) : 0,
                        'imagen_type' => gettype($p->imagen),
                        'imagen_count' => is_array($p->imagen) ? count($p->imagen) : 0,
                    ];
                }),
                'detalles' => $cotizacion->detallesProductos->map(function($d) {
                    return [
                        'id' => $d->id,
                        'producto_id' => $d->producto_id,
                        'nombre' => $d->nombre,
                        'descripcion' => $d->descripcion ? substr($d->descripcion, 0, 50) . '...' : 'NULL',
                    ];
                })
            ];

            return response()->json($debug, 200, [], JSON_PRETTY_PRINT);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Exportar cotización a PDF
     */
    public function exportPdf($id)
    {
        Log::info("Iniciando exportación de PDF para cotización ID: {$id}");
        try {
            // Cargar cotización con relaciones básicas
            $cotizacion = Cotizacion::with([
                'vendedor:id_usuario,nombre,apellido,correo',
                'miEmpresa',
                'detallesProductos',
                'detallesAdicionales'
            ])->findOrFail($id);

            // Cargar información del cliente
            if ($cotizacion->cliente_tipo === 'empresa') {
                $cliente = EmpresaCliente::find($cotizacion->cliente_id);
                $cotizacion->cliente = (object)[
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
                $cotizacion->cliente = (object)[
                    'tipo' => 'particular',
                    'nombre' => $cliente->nombrecompleto ?? 'N/A',
                    'contacto' => $cliente->nombrecompleto ?? 'N/A',
                    'email' => $cliente->email ?? 'N/A',
                    'telefono' => $cliente->telefono ?? 'N/A',
                    'direccion' => $cliente->direccion ?? 'N/A',
                    'ruc_dni' => $cliente->ruc_dni ?? 'N/A',
                ];
            }

            // Obtener IDs de productos regulares de los detalles
            $productosIds = $cotizacion->detallesProductos
                ->filter(function($detalle) {
                    return !is_null($detalle->producto_id);
                })
                ->pluck('producto_id')
                ->unique()
                ->toArray();

            // Obtener IDs de productos temporales de los detalles
            $productosTemporalesIds = $cotizacion->detallesProductos
                ->filter(function($detalle) {
                    return !is_null($detalle->producto_temporal_id);
                })
                ->pluck('producto_temporal_id')
                ->unique()
                ->toArray();

            // Cargar productos completos directamente desde la base de datos
            $productosCompletos = Producto::whereIn('id_producto', $productosIds)->get()->keyBy('id_producto');

            // Cargar productos temporales completos
            $productosTemporalesCompletos = ProductoTemporal::whereIn('id', $productosTemporalesIds)->get()->keyBy('id');

            Log::info("=== DEBUG COTIZACION PDF ===");
            Log::info("Productos IDs: " . json_encode($productosIds));
            Log::info("Productos completos count: " . $productosCompletos->count());
            Log::info("Productos temporales IDs: " . json_encode($productosTemporalesIds));
            Log::info("Productos temporales completos count: " . $productosTemporalesCompletos->count());

            // Log de cada producto para ver sus especificaciones
            foreach ($productosCompletos as $p) {
                Log::info("Producto ID: {$p->id_producto}, Nombre: {$p->nombre}");
                Log::info("  - Tiene especificaciones: " . (!empty($p->especificaciones_tecnicas) ? 'SI' : 'NO'));
                Log::info("  - Tipo especificaciones: " . gettype($p->especificaciones_tecnicas));
                if (!empty($p->especificaciones_tecnicas)) {
                    Log::info("  - Especificaciones RAW: " . json_encode($p->especificaciones_tecnicas));
                    Log::info("  - Count: " . (is_array($p->especificaciones_tecnicas) ? count($p->especificaciones_tecnicas) : 0));
                }
            }

            // Mapear detalles de productos con información completa
            $productos = $cotizacion->detallesProductos->map(function ($detalle) use ($productosCompletos, $productosTemporalesCompletos) {
                $imagen = null;
                $descripcion = $detalle->descripcion ?? '';
                $sku = null;
                $especificaciones = [];

                // Si el detalle tiene un producto temporal asociado
                if ($detalle->producto_temporal_id && isset($productosTemporalesCompletos[$detalle->producto_temporal_id])) {
                    $productoTemporal = $productosTemporalesCompletos[$detalle->producto_temporal_id];

                    // Descripción - usar la del producto temporal si existe
                    if (!empty($productoTemporal->descripcion)) {
                        $descripcion = $productoTemporal->descripcion;
                    }

                    // Imagen - obtener la primera imagen del producto temporal
                    if (!empty($productoTemporal->imagenes)) {
                        $imagenes = $productoTemporal->imagenes; // Ya es array gracias al cast
                        if (is_array($imagenes) && count($imagenes) > 0) {
                            $primeraImagen = $imagenes[0];
                            // Para PDF, necesitamos rutas físicas, no URLs
                            if (\Illuminate\Support\Str::startsWith($primeraImagen, 'data:image')) {
                                $imagen = $primeraImagen;
                            } elseif (filter_var($primeraImagen, FILTER_VALIDATE_URL)) {
                                $imagen = $primeraImagen;
                            } else {
                                // Convertir ruta relativa a ruta física
                                $imagen = public_path($primeraImagen);
                            }
                        }
                    }

                    // Especificaciones técnicas - pasarlas tal cual están
                    if (!empty($productoTemporal->especificaciones_tecnicas)) {
                        $specs = $productoTemporal->especificaciones_tecnicas;
                        if (is_string($specs)) {
                            $decoded = json_decode($specs, true);
                            $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                        } elseif (is_array($specs)) {
                            $especificaciones = $specs;
                        }
                    }
                }
                // Si el detalle tiene un producto regular asociado, obtener sus datos
                elseif ($detalle->producto_id && isset($productosCompletos[$detalle->producto_id])) {
                    $producto = $productosCompletos[$detalle->producto_id];

                    // SKU
                    $sku = $producto->sku;

                    // Descripción - usar la del producto si existe
                    if (!empty($producto->descripcion)) {
                        $descripcion = $producto->descripcion;
                    }

                    // Imagen - obtener la primera imagen del producto
                    if (!empty($producto->imagen)) {
                        $imagenes = $producto->imagen; // Ya es array gracias al cast
                        if (is_array($imagenes) && count($imagenes) > 0) {
                            $primeraImagen = $imagenes[0];
                            // Para PDF, necesitamos rutas físicas, no URLs
                            if (\Illuminate\Support\Str::startsWith($primeraImagen, 'data:image')) {
                                $imagen = $primeraImagen;
                            } elseif (filter_var($primeraImagen, FILTER_VALIDATE_URL)) {
                                $imagen = $primeraImagen;
                            } else {
                                // Convertir ruta relativa a ruta física
                                $imagen = public_path($primeraImagen);
                            }
                        }
                    }

                    // Especificaciones técnicas - pasarlas tal cual están (array de arrays o con secciones)
                    if (!empty($producto->especificaciones_tecnicas)) {
                        $specs = $producto->especificaciones_tecnicas;
                        if (is_string($specs)) {
                            $decoded = json_decode($specs, true);
                            $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                        } elseif (is_array($specs)) {
                            $especificaciones = $specs;
                        }
                    }
                }

                return [
                    'nombre' => $detalle->nombre,
                    'sku' => $sku,
                    'descripcion' => $descripcion,
                    'cantidad' => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal,
                    'especificaciones' => $especificaciones,
                    'imagen' => $imagen,
                ];
            });

            // Log de productos mapeados
            Log::info("=== PRODUCTOS MAPEADOS PARA PDF ===");
            foreach ($productos as $index => $prod) {
                Log::info("Producto #{$index}: {$prod['nombre']}");
                Log::info("  - SKU: " . ($prod['sku'] ?? 'NULL'));
                Log::info("  - Tiene especificaciones: " . (!empty($prod['especificaciones']) ? 'SI' : 'NO'));
                Log::info("  - Count especificaciones: " . count($prod['especificaciones']));
                if (!empty($prod['especificaciones'])) {
                    Log::info("  - Especificaciones: " . json_encode($prod['especificaciones']));
                }
            }

            // Obtener IDs de productos adicionales regulares
            $adicionalesIds = $cotizacion->detallesAdicionales
                ->filter(function($detalle) {
                    return !is_null($detalle->producto_id);
                })
                ->pluck('producto_id')
                ->unique()
                ->toArray();

            // Obtener IDs de productos adicionales temporales
            $adicionalesTemporalesIds = $cotizacion->detallesAdicionales
                ->filter(function($detalle) {
                    return !is_null($detalle->producto_temporal_id);
                })
                ->pluck('producto_temporal_id')
                ->unique()
                ->toArray();

            // Cargar productos adicionales completos
            $adicionalesCompletos = Producto::whereIn('id_producto', $adicionalesIds)->get()->keyBy('id_producto');

            // Cargar productos adicionales temporales completos
            $adicionalesTemporalesCompletos = ProductoTemporal::whereIn('id', $adicionalesTemporalesIds)->get()->keyBy('id');

            // Mapear productos adicionales con información completa
            $adicionales = $cotizacion->detallesAdicionales->map(function ($detalle) use ($adicionalesCompletos, $adicionalesTemporalesCompletos) {
                $imagen = null;
                $descripcion = $detalle->descripcion ?? '';
                $especificaciones = [];

                // Si el detalle tiene un producto temporal asociado
                if ($detalle->producto_temporal_id && isset($adicionalesTemporalesCompletos[$detalle->producto_temporal_id])) {
                    $productoTemporal = $adicionalesTemporalesCompletos[$detalle->producto_temporal_id];

                    // Descripción
                    if (!empty($productoTemporal->descripcion)) {
                        $descripcion = $productoTemporal->descripcion;
                    }

                    // Imagen
                    if (!empty($productoTemporal->imagenes)) {
                        $imagenes = $productoTemporal->imagenes;
                        if (is_array($imagenes) && count($imagenes) > 0) {
                            $primeraImagen = $imagenes[0];
                            // Para PDF, necesitamos rutas físicas, no URLs
                            if (\Illuminate\Support\Str::startsWith($primeraImagen, 'data:image')) {
                                $imagen = $primeraImagen;
                            } elseif (filter_var($primeraImagen, FILTER_VALIDATE_URL)) {
                                $imagen = $primeraImagen;
                            } else {
                                $imagen = public_path($primeraImagen);
                            }
                        }
                    }

                    // Especificaciones técnicas - pasarlas tal cual están
                    if (!empty($productoTemporal->especificaciones_tecnicas)) {
                        $specs = $productoTemporal->especificaciones_tecnicas;
                        if (is_string($specs)) {
                            $decoded = json_decode($specs, true);
                            $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                        } elseif (is_array($specs)) {
                            $especificaciones = $specs;
                        }
                    }
                }
                // Si el detalle tiene un producto regular asociado
                elseif ($detalle->producto_id && isset($adicionalesCompletos[$detalle->producto_id])) {
                    $producto = $adicionalesCompletos[$detalle->producto_id];

                    // Descripción
                    if (!empty($producto->descripcion)) {
                        $descripcion = $producto->descripcion;
                    }

                    // Imagen
                    if (!empty($producto->imagen)) {
                        $imagenes = $producto->imagen;
                        if (is_array($imagenes) && count($imagenes) > 0) {
                            $primeraImagen = $imagenes[0];
                            // Para PDF, necesitamos rutas físicas, no URLs
                            if (\Illuminate\Support\Str::startsWith($primeraImagen, 'data:image')) {
                                $imagen = $primeraImagen;
                            } elseif (filter_var($primeraImagen, FILTER_VALIDATE_URL)) {
                                $imagen = $primeraImagen;
                            } else {
                                $imagen = public_path($primeraImagen);
                            }
                        }
                    }

                    // Especificaciones técnicas - pasarlas tal cual están
                    if (!empty($producto->especificaciones_tecnicas)) {
                        $specs = $producto->especificaciones_tecnicas;
                        if (is_string($specs)) {
                            $decoded = json_decode($specs, true);
                            $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                        } elseif (is_array($specs)) {
                            $especificaciones = $specs;
                        }
                    }
                } else {
                    // Si no tiene producto vinculado, intentar buscar por nombre en productos regulares
                    $productoMatch = Producto::where('nombre', 'like', '%' . $detalle->nombre . '%')->first();

                    if ($productoMatch) {
                        // Descripción
                        if (!empty($productoMatch->descripcion)) {
                            $descripcion = $productoMatch->descripcion;
                        }

                        // Imagen
                        if (!empty($productoMatch->imagen)) {
                            $imagenes = $productoMatch->imagen;
                            if (is_array($imagenes) && count($imagenes) > 0) {
                                $primeraImagen = $imagenes[0];
                                if (\Illuminate\Support\Str::startsWith($primeraImagen, 'data:image')) {
                                    $imagen = $primeraImagen;
                                } elseif (filter_var($primeraImagen, FILTER_VALIDATE_URL)) {
                                    $imagen = $primeraImagen;
                                } else {
                                    $imagen = public_path($primeraImagen);
                                }
                            }
                        }

                        // Especificaciones técnicas - pasarlas tal cual están
                        if (!empty($productoMatch->especificaciones_tecnicas)) {
                            $specs = $productoMatch->especificaciones_tecnicas;
                            if (is_string($specs)) {
                                $decoded = json_decode($specs, true);
                                $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                            } elseif (is_array($specs)) {
                                $especificaciones = $specs;
                            }
                        }
                    } else {
                        // Si tampoco se encuentra, intentar buscar en productos temporales
                        $productoTemporalMatch = ProductoTemporal::where('titulo', 'like', '%' . $detalle->nombre . '%')->first();

                        if ($productoTemporalMatch) {
                            // Descripción
                            if (!empty($productoTemporalMatch->descripcion)) {
                                $descripcion = $productoTemporalMatch->descripcion;
                            }

                            // Imagen
                            if (!empty($productoTemporalMatch->imagenes)) {
                                $imagenes = $productoTemporalMatch->imagenes;
                                if (is_array($imagenes) && count($imagenes) > 0) {
                                    $primeraImagen = $imagenes[0];
                                    if (\Illuminate\Support\Str::startsWith($primeraImagen, 'data:image')) {
                                    $imagen = $primeraImagen;
                                } elseif (filter_var($primeraImagen, FILTER_VALIDATE_URL)) {
                                    $imagen = $primeraImagen;
                                } else {
                                    $imagen = public_path($primeraImagen);
                                }
                                }
                            }

                            // Especificaciones técnicas - pasarlas tal cual están
                            if (!empty($productoTemporalMatch->especificaciones_tecnicas)) {
                                $specs = $productoTemporalMatch->especificaciones_tecnicas;
                                if (is_string($specs)) {
                                    $decoded = json_decode($specs, true);
                                    $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                                } elseif (is_array($specs)) {
                                    $especificaciones = $specs;
                                }
                            }
                        }
                    }
                }

                return [
                    'nombre' => $detalle->nombre,
                    'descripcion' => $descripcion,
                    'cantidad' => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal,
                    'imagen' => $imagen,
                    'especificaciones' => $especificaciones,
                ];
            });

            // Preparar vendedor
            $vendedor = null;
            if ($cotizacion->vendedor) {
                $vendedor = (object)[
                    'nombre' => $cotizacion->vendedor->nombre . ' ' . $cotizacion->vendedor->apellido,
                    'correo' => $cotizacion->vendedor->correo ?? '',
                ];
            }

            // Preparar datos de nuestra empresa
            $empresa = null;
            if ($cotizacion->miEmpresa) {
                $empresa = [
                    'id' => $cotizacion->miEmpresa->id,
                    'nombre' => $cotizacion->miEmpresa->nombre,
                    'email' => $cotizacion->miEmpresa->email,
                    'telefono' => $cotizacion->miEmpresa->telefono,
                    'ruc' => $cotizacion->miEmpresa->ruc,
                    'imagen_logo' => $cotizacion->miEmpresa->imagen_logo,
                    'imagen_firma' => $cotizacion->miEmpresa->imagen_firma,
                ];
            }

            // Preparar datos para el PDF
            $data = [
                'cotizacion' => $cotizacion,
                'productos' => $productos,
                'productos_adicionales' => $adicionales,
                'empresa' => $empresa,
                'cliente' => $cotizacion->cliente,
                'vendedor' => $vendedor,
            ];

            // Generar el PDF
            $pdf = Pdf::loadView('pdf.cotizacion', $data);
            $pdf->setPaper('a4', 'portrait');

            // Nombre del archivo
            $filename = 'Cotizacion_' . $cotizacion->numero . '.pdf';

            Log::info("PDF generado correctamente para cotización ID: {$id}. Nombre: {$filename}");
            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error al exportar cotización a PDF en CotizacionesController@exportPdf');
            Log::error('ID: ' . $id);
            Log::error('Mensaje: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'error' => 'Error al exportar cotización',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vista HTML de la cotización para previsualización (solo entorno local)
     */
    public function previewPdfHtml($id = null)
    {
        try {
            // Obtener cotización; si no se pasa id, usar la primera disponible
            $cotizacionQuery = Cotizacion::with([
                'vendedor:id_usuario,nombre,apellido,correo',
                'miEmpresa',
                'detallesProductos',
                'detallesAdicionales'
            ]);

            $cotizacion = $id ? $cotizacionQuery->findOrFail($id) : $cotizacionQuery->firstOrFail();

            // Cargar información del cliente
            if ($cotizacion->cliente_tipo === 'empresa') {
                $cliente = EmpresaCliente::find($cotizacion->cliente_id);
                $cotizacion->cliente = (object)[
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
                $cotizacion->cliente = (object)[
                    'tipo' => 'particular',
                    'nombre' => $cliente->nombrecompleto ?? 'N/A',
                    'contacto' => $cliente->nombrecompleto ?? 'N/A',
                    'email' => $cliente->email ?? 'N/A',
                    'telefono' => $cliente->telefono ?? 'N/A',
                    'direccion' => $cliente->direccion ?? 'N/A',
                    'ruc_dni' => $cliente->ruc_dni ?? 'N/A',
                ];
            }

            // IDs productos y temporales
            $productosIds = $cotizacion->detallesProductos
                ->filter(fn($detalle) => !is_null($detalle->producto_id))
                ->pluck('producto_id')
                ->unique()
                ->toArray();

            $productosTemporalesIds = $cotizacion->detallesProductos
                ->filter(fn($detalle) => !is_null($detalle->producto_temporal_id))
                ->pluck('producto_temporal_id')
                ->unique()
                ->toArray();

            $productosCompletos = Producto::whereIn('id_producto', $productosIds)->get()->keyBy('id_producto');
            $productosTemporalesCompletos = ProductoTemporal::whereIn('id', $productosTemporalesIds)->get()->keyBy('id');

            // Mapear detalles de productos con información completa
            $productos = $cotizacion->detallesProductos->map(function ($detalle) use ($productosCompletos, $productosTemporalesCompletos) {
                $imagen = null;
                $descripcion = $detalle->descripcion ?? '';
                $sku = null;
                $especificaciones = [];

                if ($detalle->producto_temporal_id && isset($productosTemporalesCompletos[$detalle->producto_temporal_id])) {
                    $productoTemporal = $productosTemporalesCompletos[$detalle->producto_temporal_id];
                    if (!empty($productoTemporal->descripcion)) {
                        $descripcion = $productoTemporal->descripcion;
                    }
                    if (!empty($productoTemporal->imagenes)) {
                        $imagenes = $productoTemporal->imagenes;
                        if (is_array($imagenes) && count($imagenes) > 0) {
                            $primeraImagen = $imagenes[0];
                            // Para PDF, necesitamos rutas físicas, no URLs
                            $imagen = filter_var($primeraImagen, FILTER_VALIDATE_URL) ? $primeraImagen : public_path($primeraImagen);
                        }
                    }
                    if (!empty($productoTemporal->especificaciones_tecnicas)) {
                        $specs = $productoTemporal->especificaciones_tecnicas;
                        if (is_string($specs)) {
                            $decoded = json_decode($specs, true);
                            $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                        } elseif (is_array($specs)) {
                            $especificaciones = $specs;
                        }
                    }
                } elseif ($detalle->producto_id && isset($productosCompletos[$detalle->producto_id])) {
                    $producto = $productosCompletos[$detalle->producto_id];
                    $sku = $producto->sku;
                    if (!empty($producto->descripcion)) {
                        $descripcion = $producto->descripcion;
                    }
                    if (!empty($producto->imagen)) {
                        $imagenes = $producto->imagen;
                        if (is_array($imagenes) && count($imagenes) > 0) {
                            $primeraImagen = $imagenes[0];
                            // Para PDF, necesitamos rutas físicas, no URLs
                            $imagen = filter_var($primeraImagen, FILTER_VALIDATE_URL) ? $primeraImagen : public_path($primeraImagen);
                        }
                    }
                    if (!empty($producto->especificaciones_tecnicas)) {
                        $specs = $producto->especificaciones_tecnicas;
                        if (is_string($specs)) {
                            $decoded = json_decode($specs, true);
                            $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                        } elseif (is_array($specs)) {
                            $especificaciones = $specs;
                        }
                    }
                }

                return [
                    'nombre' => $detalle->nombre,
                    'sku' => $sku,
                    'descripcion' => $descripcion,
                    'cantidad' => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal,
                    'especificaciones' => $especificaciones,
                    'imagen' => $imagen,
                ];
            });

            // Productos adicionales
            $adicionalesIds = $cotizacion->detallesAdicionales
                ->filter(fn($detalle) => !is_null($detalle->producto_id))
                ->pluck('producto_id')
                ->unique()
                ->toArray();

            $adicionalesTemporalesIds = $cotizacion->detallesAdicionales
                ->filter(fn($detalle) => !is_null($detalle->producto_temporal_id))
                ->pluck('producto_temporal_id')
                ->unique()
                ->toArray();

            $adicionalesCompletos = Producto::whereIn('id_producto', $adicionalesIds)->get()->keyBy('id_producto');
            $adicionalesTemporalesCompletos = ProductoTemporal::whereIn('id', $adicionalesTemporalesIds)->get()->keyBy('id');

            $adicionales = $cotizacion->detallesAdicionales->map(function ($detalle) use ($adicionalesCompletos, $adicionalesTemporalesCompletos) {
                $imagen = null;
                $descripcion = $detalle->descripcion ?? '';
                $especificaciones = [];

                if ($detalle->producto_temporal_id && isset($adicionalesTemporalesCompletos[$detalle->producto_temporal_id])) {
                    $productoTemporal = $adicionalesTemporalesCompletos[$detalle->producto_temporal_id];
                    if (!empty($productoTemporal->descripcion)) {
                        $descripcion = $productoTemporal->descripcion;
                    }
                    if (!empty($productoTemporal->imagenes)) {
                        $imagenes = $productoTemporal->imagenes;
                        if (is_array($imagenes) && count($imagenes) > 0) {
                            $primeraImagen = $imagenes[0];
                            // Para PDF, necesitamos rutas físicas, no URLs
                            $imagen = filter_var($primeraImagen, FILTER_VALIDATE_URL) ? $primeraImagen : public_path($primeraImagen);
                        }
                    }
                    if (!empty($productoTemporal->especificaciones_tecnicas)) {
                        $specs = $productoTemporal->especificaciones_tecnicas;
                        if (is_string($specs)) {
                            $decoded = json_decode($specs, true);
                            $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                        } elseif (is_array($specs)) {
                            $especificaciones = $specs;
                        }
                    }
                } elseif ($detalle->producto_id && isset($adicionalesCompletos[$detalle->producto_id])) {
                    $producto = $adicionalesCompletos[$detalle->producto_id];
                    if (!empty($producto->descripcion)) {
                        $descripcion = $producto->descripcion;
                    }
                    if (!empty($producto->imagen)) {
                        $imagenes = $producto->imagen;
                        if (is_array($imagenes) && count($imagenes) > 0) {
                            $primeraImagen = $imagenes[0];
                            // Para PDF, necesitamos rutas físicas, no URLs
                            $imagen = filter_var($primeraImagen, FILTER_VALIDATE_URL) ? $primeraImagen : public_path($primeraImagen);
                        }
                    }
                    if (!empty($producto->especificaciones_tecnicas)) {
                        $specs = $producto->especificaciones_tecnicas;
                        if (is_string($specs)) {
                            $decoded = json_decode($specs, true);
                            $especificaciones = (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) ? $decoded : [];
                        } elseif (is_array($specs)) {
                            $especificaciones = $specs;
                        }
                    }
                }

                return [
                    'nombre' => $detalle->nombre,
                    'descripcion' => $descripcion,
                    'cantidad' => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal' => $detalle->subtotal,
                    'imagen' => $imagen,
                    'especificaciones' => $especificaciones,
                ];
            });

            // Vendedor
            $vendedor = null;
            if ($cotizacion->vendedor) {
                $vendedor = (object)[
                    'nombre' => $cotizacion->vendedor->nombre . ' ' . $cotizacion->vendedor->apellido,
                    'correo' => $cotizacion->vendedor->correo ?? '',
                ];
            }

            // Nuestra empresa
            $empresa = null;
            if ($cotizacion->miEmpresa) {
                $empresa = [
                    'id' => $cotizacion->miEmpresa->id,
                    'nombre' => $cotizacion->miEmpresa->nombre,
                    'email' => $cotizacion->miEmpresa->email,
                    'telefono' => $cotizacion->miEmpresa->telefono,
                    'ruc' => $cotizacion->miEmpresa->ruc,
                    'imagen_logo' => $cotizacion->miEmpresa->imagen_logo,
                    'imagen_firma' => $cotizacion->miEmpresa->imagen_firma,
                ];
            }

            // Datos para la vista
            $data = [
                'cotizacion' => $cotizacion,
                'productos' => $productos,
                'productos_adicionales' => $adicionales,
                'empresa' => $empresa,
                'cliente' => $cotizacion->cliente,
                'vendedor' => $vendedor,
            ];

            return view('pdf.cotizacion', $data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al previsualizar cotización',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
