<?php

namespace App\Http\Controllers;

use App\Models\EmpresaCliente;
use App\Models\Usuario;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class EmpresaClienteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $empresas = EmpresaCliente::with(['usuario', 'clienteEnlazado'])
            ->orderBy('created_at', 'desc')
            ->get();

        $usuarios = Usuario::select('id_usuario', 'nombre', 'correo')->get();
        $clientes = Cliente::select('id', 'nombrecompleto', 'email', 'ruc')
            ->orderBy('nombrecompleto')
            ->get();

        return Inertia::render('CRM/Clientes/EmpresasClientes', [
            'empresas' => $empresas,
            'usuarios' => $usuarios,
            'clientes' => $clientes
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $usuarios = Usuario::select('id_usuario', 'nombre', 'correo')->get();
        $clientes = Cliente::select('id', 'nombrecompleto', 'email', 'ruc')
            ->orderBy('nombrecompleto')
            ->get();

        return Inertia::render('CRM/Clientes/CrearEmpresaCliente', [
            'usuarios' => $usuarios,
            'clientes' => $clientes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'razon_social' => 'required|string|max:255',
            'ruc' => 'required|string|size:11|unique:empresasclientes,ruc',
            'sector' => 'required|string|max:100',
            'contacto_principal' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:empresasclientes,email',
            'telefono' => 'required|string|max:20',
            'direccion' => 'required|string',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'cliente_id' => 'nullable|exists:clientes,id',
            'activo' => 'boolean'
        ]);

        $empresa = EmpresaCliente::create($validated);

        return redirect()
            ->route('empresas-clientes.index')
            ->with('success', 'Empresa cliente creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EmpresaCliente $empresaCliente)
    {
        $empresaCliente->load(['usuario', 'clienteEnlazado']);

        return Inertia::render('CRM/Clientes/DetalleEmpresaCliente', [
            'empresa' => $empresaCliente
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EmpresaCliente $empresaCliente)
    {
        $usuarios = Usuario::select('id_usuario', 'nombre', 'correo')->get();
        $clientes = Cliente::select('id', 'nombrecompleto', 'email', 'ruc')
            ->orderBy('nombrecompleto')
            ->get();

        return Inertia::render('CRM/Clientes/EditarEmpresaCliente', [
            'empresa' => $empresaCliente,
            'usuarios' => $usuarios,
            'clientes' => $clientes
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $empresaCliente = EmpresaCliente::findOrFail($id);

        $validated = $request->validate([
            'razon_social' => 'required|string|max:255',
            'ruc' => [
                'required',
                'string',
                'size:11',
                Rule::unique('empresasclientes', 'ruc')->ignore($id)
            ],
            'sector' => 'required|string|max:100',
            'contacto_principal' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('empresasclientes', 'email')->ignore($id)
            ],
            'telefono' => 'required|string|max:20',
            'direccion' => 'required|string',
            'usuario_id' => 'required|exists:usuarios,id_usuario',
            'cliente_id' => 'nullable|exists:clientes,id',
            'activo' => 'boolean'
        ]);

        $empresaCliente->update($validated);

        return redirect()
            ->route('empresas-clientes.index')
            ->with('success', 'Empresa cliente actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmpresaCliente $empresaCliente)
    {
        $empresaCliente->delete();

        return redirect()
            ->route('empresas-clientes.index')
            ->with('success', 'Empresa cliente eliminada exitosamente.');
    }

    /**
     * Toggle the status of the resource.
     */
    public function toggleStatus(EmpresaCliente $empresaCliente)
    {
        $empresaCliente->update([
            'activo' => !$empresaCliente->activo
        ]);

        $status = $empresaCliente->activo ? 'activada' : 'desactivada';

        return redirect()
            ->route('empresas-clientes.index')
            ->with('success', "Empresa cliente {$status} exitosamente.");
    }

    /**
     * Get companies by sector for API.
     */
    public function getBySector(Request $request)
    {
        $sector = $request->query('sector');

        $empresas = EmpresaCliente::porSector($sector)
            ->activas()
            ->get();

        return response()->json($empresas);
    }
}