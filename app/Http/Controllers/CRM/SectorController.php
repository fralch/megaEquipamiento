<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use Illuminate\Http\Request;

class SectorController extends Controller
{
    /**
     * Obtener todos los sectores
     */
    public function index()
    {
        $sectores = Sector::orderBy('nombre', 'asc')->get();
        return response()->json($sectores);
    }

    /**
     * Obtener todos los sectores activos
     */
    public function getActivos()
    {
        $sectores = Sector::where('activo', true)
            ->orderBy('nombre', 'asc')
            ->get();
        return response()->json($sectores);
    }

    /**
     * Crear un nuevo sector
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100|unique:sectores,nombre',
            'descripcion' => 'nullable|string',
            'activo' => 'nullable|boolean',
        ]);

        $sector = Sector::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'activo' => $request->activo ?? true,
        ]);

        return response()->json([
            'message' => 'Sector creado exitosamente',
            'sector' => $sector
        ], 201);
    }

    /**
     * Obtener un sector específico
     */
    public function show($id)
    {
        $sector = Sector::with(['clientes', 'empresasClientes'])->findOrFail($id);
        return response()->json($sector);
    }

    /**
     * Actualizar un sector
     */
    public function update(Request $request, $id)
    {
        $sector = Sector::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:100|unique:sectores,nombre,' . $id . ',id_sector',
            'descripcion' => 'nullable|string',
            'activo' => 'nullable|boolean',
        ]);

        $sector->update([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion ?? $sector->descripcion,
            'activo' => $request->activo ?? $sector->activo,
        ]);

        return response()->json([
            'message' => 'Sector actualizado exitosamente',
            'sector' => $sector
        ]);
    }

    /**
     * Eliminar un sector
     */
    public function destroy($id)
    {
        $sector = Sector::findOrFail($id);

        // Verificar si hay clientes asociados
        $clientesCount = $sector->clientes()->count();
        $empresasCount = $sector->empresasClientes()->count();

        if ($clientesCount > 0 || $empresasCount > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el sector porque tiene clientes o empresas asociados',
                'clientes_count' => $clientesCount,
                'empresas_count' => $empresasCount
            ], 400);
        }

        $sector->delete();

        return response()->json([
            'message' => 'Sector eliminado exitosamente'
        ]);
    }

    /**
     * Activar/Desactivar un sector
     */
    public function toggleActivo($id)
    {
        $sector = Sector::findOrFail($id);
        $sector->activo = !$sector->activo;
        $sector->save();

        return response()->json([
            'message' => 'Estado del sector actualizado',
            'sector' => $sector
        ]);
    }
}
