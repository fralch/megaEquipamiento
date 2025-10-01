<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class EmpresaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $empresas = Empresa::with('usuario')
            ->orderBy('created_at', 'desc')
            ->get();

        $usuarios = Usuario::select('id_usuario', 'nombre', 'apellido', 'nombre_usuario', 'correo')->get();

        return Inertia::render('CRM/Empresas/VerEmpresas', [
            'empresas' => $empresas,
            'usuarios' => $usuarios
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'ruc' => 'nullable|string|max:11',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'imagen_destacada' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('imagen_destacada')) {
            $image = $request->file('imagen_destacada');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('empresas', $imageName, 'public');
            $validated['imagen_destacada'] = $imagePath;
        }

        $empresa = Empresa::create($validated);

        return redirect()
            ->route('crm.empresas.index')
            ->with('success', 'Empresa creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Empresa $empresa)
    {
        $empresa->load('usuario');

        return response()->json([
            'empresa' => $empresa
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'ruc' => 'nullable|string|max:11',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'imagen_destacada' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('imagen_destacada')) {
            // Delete old image if exists
            if ($empresa->imagen_destacada && Storage::disk('public')->exists($empresa->imagen_destacada)) {
                Storage::disk('public')->delete($empresa->imagen_destacada);
            }

            $image = $request->file('imagen_destacada');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('empresas', $imageName, 'public');
            $validated['imagen_destacada'] = $imagePath;
        }

        $empresa->update($validated);

        return redirect()
            ->route('crm.empresas.index')
            ->with('success', 'Empresa actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Empresa $empresa)
    {
        // Delete image if exists
        if ($empresa->imagen_destacada && Storage::disk('public')->exists($empresa->imagen_destacada)) {
            Storage::disk('public')->delete($empresa->imagen_destacada);
        }

        $empresa->delete();

        return redirect()
            ->route('crm.empresas.index')
            ->with('success', 'Empresa eliminada exitosamente.');
    }

    /**
     * Search companies by term
     */
    public function search(Request $request)
    {
        $termino = $request->query('q');

        $empresas = Empresa::buscar($termino)
            ->with('usuario')
            ->get();

        return response()->json($empresas);
    }

    /**
     * Get companies by user
     */
    public function porUsuario(Request $request, $usuarioId)
    {
        $empresas = Empresa::porUsuario($usuarioId)
            ->with('usuario')
            ->get();

        return response()->json($empresas);
    }
}
