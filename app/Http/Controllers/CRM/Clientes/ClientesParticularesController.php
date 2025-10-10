<?php

namespace App\Http\Controllers\CRM\Clientes;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Usuario;
use App\Models\EmpresaCliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ClientesParticularesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Cliente::with('vendedor');

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nombrecompleto', 'like', "%{$search}%")
                    ->orWhere('ruc_dni', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('telefono', 'like', "%{$search}%");
            });
        }

        // Filtro por vendedor
        if ($request->has('vendedor_id')) {
            $query->where('usuario_id', $request->input('vendedor_id'));
        }

        // Ordenamiento
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginación
        $perPage = $request->input('per_page', 15);
        $clientes = $query->paginate($perPage);

        // Si es una petición web (navegador), renderizar la vista con Inertia
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($clientes);
        }

        // Cargar datos adicionales para la vista
        $usuarios = Usuario::where('activo', true)
            ->select('id_usuario', 'nombre', 'apellido', 'correo')
            ->orderBy('nombre')
            ->get();

        $empresas = EmpresaCliente::where('activo', true)
            ->select('id', 'razon_social', 'ruc', 'email')
            ->orderBy('razon_social')
            ->get();

        // Renderizar la vista con Inertia
        return Inertia::render('CRM/Clientes/Cliente', [
            'clientes' => $clientes->items(), // Obtener solo los datos del paginador
            'pagination' => [
                'current_page' => $clientes->currentPage(),
                'last_page' => $clientes->lastPage(),
                'per_page' => $clientes->perPage(),
                'total' => $clientes->total(),
                'from' => $clientes->firstItem(),
                'to' => $clientes->lastItem(),
            ],
            'usuarios' => $usuarios,
            'empresas' => $empresas,
            'areas' => [], // Por ahora vacío, se puede agregar si existe el modelo Area
            'filters' => $request->only(['search', 'vendedor_id', 'sort_field', 'sort_direction'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombrecompleto' => 'required|string|max:255',
            'ruc_dni' => 'nullable|string|max:255',
            'cargo' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:255',
            'direccion' => 'nullable|string',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $cliente = Cliente::create($request->all());
        $cliente->load('vendedor');

        return response()->json([
            'success' => true,
            'message' => 'Cliente creado exitosamente',
            'data' => $cliente
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $cliente = Cliente::with('vendedor')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $cliente
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $cliente = Cliente::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombrecompleto' => 'required|string|max:255',
            'ruc_dni' => 'nullable|string|max:255',
            'cargo' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:255',
            'direccion' => 'nullable|string',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $cliente->update($request->all());
        $cliente->load('vendedor');

        return response()->json([
            'success' => true,
            'message' => 'Cliente actualizado exitosamente',
            'data' => $cliente
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cliente eliminado exitosamente'
        ]);
    }

    /**
     * Bulk delete clientes
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:clientes,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        Cliente::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Clientes eliminados exitosamente'
        ]);
    }

    /**
     * Get all vendedores for selection
     */
    public function getVendedores()
    {
        $vendedores = Usuario::where('activo', true)
            ->select('id_usuario', 'nombre', 'apellido', 'correo')
            ->orderBy('nombre')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vendedores
        ]);
    }
}
