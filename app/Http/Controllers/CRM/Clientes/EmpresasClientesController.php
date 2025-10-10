<?php

namespace App\Http\Controllers\CRM\Clientes;

use App\Http\Controllers\Controller;
use App\Models\EmpresaCliente;
use App\Models\Usuario;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class EmpresasClientesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EmpresaCliente::with('vendedor');

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('razon_social', 'like', "%{$search}%")
                    ->orWhere('ruc', 'like', "%{$search}%")
                    ->orWhere('contacto_principal', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('telefono', 'like', "%{$search}%");
            });
        }

        // Filtro por vendedor
        if ($request->has('vendedor_id')) {
            $query->where('usuario_id', $request->input('vendedor_id'));
        }

        // Filtro por estado activo
        if ($request->has('activo')) {
            $query->where('activo', $request->input('activo'));
        }

        // Ordenamiento
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginación
        $perPage = $request->input('per_page', 15);
        $empresas = $query->paginate($perPage);

        // Si es una petición web (navegador), renderizar la vista con Inertia
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($empresas);
        }

        // Cargar datos adicionales para la vista
        $usuarios = Usuario::where('activo', true)
            ->select('id_usuario', 'nombre', 'apellido', 'correo')
            ->orderBy('nombre')
            ->get();

        $clientes = Cliente::select('id', 'nombrecompleto', 'ruc_dni', 'email')
            ->orderBy('nombrecompleto')
            ->get();

        // Renderizar la vista con Inertia
        return Inertia::render('CRM/Clientes/EmpresasClientes', [
            'empresas' => $empresas,
            'usuarios' => $usuarios,
            'clientes' => $clientes,
            'filters' => $request->only(['search', 'vendedor_id', 'activo', 'sort_field', 'sort_direction'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'razon_social' => 'required|string|max:255',
            'ruc' => 'required|string|max:11',
            'contacto_principal' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:255',
            'direccion' => 'nullable|string',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $empresa = EmpresaCliente::create($request->all());
        $empresa->load('vendedor');

        return response()->json([
            'success' => true,
            'message' => 'Empresa cliente creada exitosamente',
            'data' => $empresa
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $empresa = EmpresaCliente::with('vendedor')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $empresa
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $empresa = EmpresaCliente::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'razon_social' => 'required|string|max:255',
            'ruc' => 'required|string|max:11',
            'contacto_principal' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:255',
            'direccion' => 'nullable|string',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $empresa->update($request->all());
        $empresa->load('vendedor');

        return response()->json([
            'success' => true,
            'message' => 'Empresa cliente actualizada exitosamente',
            'data' => $empresa
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $empresa = EmpresaCliente::findOrFail($id);
        $empresa->delete();

        return response()->json([
            'success' => true,
            'message' => 'Empresa cliente eliminada exitosamente'
        ]);
    }

    /**
     * Bulk delete empresas
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:empresasclientes,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        EmpresaCliente::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Empresas eliminadas exitosamente'
        ]);
    }

    /**
     * Toggle the activo status of an empresa
     */
    public function toggleActivo($id)
    {
        $empresa = EmpresaCliente::findOrFail($id);
        $empresa->activo = !$empresa->activo;
        $empresa->save();

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado exitosamente',
            'data' => $empresa
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
