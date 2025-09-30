<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\EmpresaCliente;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    /**
     * Display a listing of all clientes (empleados y particulares).
     */
    public function index(Request $request)
    {
        $query = Cliente::with(['empresa', 'vendedor']);

        // Filtrar por tipo de cliente si se especifica
        if ($request->has('tipo')) {
            if ($request->tipo === 'empleado') {
                $query->empleados();
            } elseif ($request->tipo === 'particular') {
                $query->particulares();
            }
        }

        // Buscar por término
        if ($request->has('search') && $request->search) {
            $query->buscar($request->search);
        }

        // Filtrar por vendedor
        if ($request->has('vendedor_id') && $request->vendedor_id) {
            $query->porVendedor($request->vendedor_id);
        }

        $clientes = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('CRM/Clientes/EmpleadosClientesParticulares', [
            'clientes' => $clientes,
            'filters' => $request->only(['tipo', 'search', 'vendedor_id'])
        ]);
    }

    /**
     * Display a listing of empleados (clientes con empresa).
     */
    public function empleados(Request $request)
    {
        $query = Cliente::with(['empresa', 'vendedor'])->empleados();

        if ($request->has('search') && $request->search) {
            $query->buscar($request->search);
        }

        if ($request->has('vendedor_id') && $request->vendedor_id) {
            $query->porVendedor($request->vendedor_id);
        }

        $clientes = $query->orderBy('created_at', 'desc')->get();

        return response()->json($clientes);
    }

    /**
     * Display a listing of clientes particulares.
     */
    public function particulares(Request $request)
    {
        $query = Cliente::with('vendedor')->particulares();

        if ($request->has('search') && $request->search) {
            $query->buscar($request->search);
        }

        if ($request->has('vendedor_id') && $request->vendedor_id) {
            $query->porVendedor($request->vendedor_id);
        }

        $clientes = $query->orderBy('created_at', 'desc')->get();

        return response()->json($clientes);
    }

    /**
     * Show the form for creating a new cliente.
     */
    public function create()
    {
        $usuarios = Usuario::select('id_usuario', 'nombre', 'correo')->get();
        $empresas = EmpresaCliente::where('activo', true)
            ->select('id', 'razon_social', 'ruc')
            ->orderBy('razon_social')
            ->get();

        return Inertia::render('CRM/Clientes/CrearCliente', [
            'usuarios' => $usuarios,
            'empresas' => $empresas
        ]);
    }

    /**
     * Store a newly created cliente in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombrecompleto' => 'required|string|max:255',
            'ruc' => 'required|string|max:20',
            'empresa_id' => 'nullable|exists:empresasclientes,id',
            'sucursal' => 'nullable|string|max:255',
            'area' => 'nullable|string|max:255',
            'cargo' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
        ]);

        $cliente = Cliente::create($validated);

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente creado exitosamente.');
    }

    /**
     * Display the specified cliente.
     */
    public function show(Cliente $cliente)
    {
        $cliente->load(['empresa', 'vendedor']);

        return Inertia::render('CRM/Clientes/DetalleCliente', [
            'cliente' => $cliente
        ]);
    }

    /**
     * Show the form for editing the specified cliente.
     */
    public function edit(Cliente $cliente)
    {
        $usuarios = Usuario::select('id_usuario', 'nombre', 'correo')->get();
        $empresas = EmpresaCliente::where('activo', true)
            ->select('id', 'razon_social', 'ruc')
            ->orderBy('razon_social')
            ->get();

        $cliente->load(['empresa', 'vendedor']);

        return Inertia::render('CRM/Clientes/EditarCliente', [
            'cliente' => $cliente,
            'usuarios' => $usuarios,
            'empresas' => $empresas
        ]);
    }

    /**
     * Update the specified cliente in storage.
     */
    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'nombrecompleto' => 'required|string|max:255',
            'ruc' => 'required|string|max:20',
            'empresa_id' => 'nullable|exists:empresasclientes,id',
            'sucursal' => 'nullable|string|max:255',
            'area' => 'nullable|string|max:255',
            'cargo' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
        ]);

        $cliente->update($validated);

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente actualizado exitosamente.');
    }

    /**
     * Remove the specified cliente from storage.
     */
    public function destroy(Cliente $cliente)
    {
        $cliente->delete();

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente eliminado exitosamente.');
    }

    /**
     * Get clientes by empresa for API.
     */
    public function getByEmpresa(Request $request, $empresaId)
    {
        $clientes = Cliente::with('vendedor')
            ->where('empresa_id', $empresaId)
            ->orderBy('nombrecompleto')
            ->get();

        return response()->json($clientes);
    }

    /**
     * Get clientes by vendedor for API.
     */
    public function getByVendedor(Request $request, $vendedorId)
    {
        $clientes = Cliente::with(['empresa', 'vendedor'])
            ->where('usuario_id', $vendedorId)
            ->orderBy('nombrecompleto')
            ->get();

        return response()->json($clientes);
    }
}