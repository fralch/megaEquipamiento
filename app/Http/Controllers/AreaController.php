<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaController extends Controller
{
    /**
     * Display a listing of the areas.
     */
    public function index(Request $request)
    {
        $query = Area::query();

        // Filtrar por estado si se especifica
        if ($request->has('estado') && $request->estado) {
            if ($request->estado === 'activo') {
                $query->activas();
            } elseif ($request->estado === 'inactivo') {
                $query->inactivas();
            }
        }

        // Buscar por término
        if ($request->has('search') && $request->search) {
            $query->buscar($request->search);
        }

        $areas = $query->orderBy('nombre')->get();

        return Inertia::render('CRM/Clientes/AreasClientes', [
            'areas' => $areas,
            'filters' => $request->only(['estado', 'search'])
        ]);
    }

    /**
     * Store a newly created area in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:areas,nombre',
            'descripcion' => 'nullable|string',
            'estado' => 'required|in:Activo,Inactivo',
        ]);

        $area = Area::create($validated);

        return back()->with('success', 'Área creada exitosamente.');
    }

    /**
     * Update the specified area in storage.
     */
    public function update(Request $request, Area $area)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:areas,nombre,' . $area->id,
            'descripcion' => 'nullable|string',
            'estado' => 'required|in:Activo,Inactivo',
        ]);

        $area->update($validated);

        return back()->with('success', 'Área actualizada exitosamente.');
    }

    /**
     * Remove the specified area from storage.
     */
    public function destroy(Area $area)
    {
        // Verificar si hay clientes asociados a esta área
        $clientesCount = $area->clientes()->count();

        if ($clientesCount > 0) {
            return back()->withErrors([
                'error' => "No se puede eliminar el área '{$area->nombre}' porque tiene {$clientesCount} cliente(s) asociado(s)."
            ]);
        }

        $area->delete();

        return back()->with('success', 'Área eliminada exitosamente.');
    }

    /**
     * Get active areas for API/dropdown usage.
     */
    public function getActivas()
    {
        $areas = Area::activas()->orderBy('nombre')->get(['id', 'nombre', 'descripcion']);

        return response()->json($areas);
    }

    /**
     * Toggle area status between Activo and Inactivo.
     */
    public function toggleEstado(Area $area)
    {
        $area->update([
            'estado' => $area->estado === 'Activo' ? 'Inactivo' : 'Activo'
        ]);

        return back()->with('success', 'Estado del área actualizado.');
    }
}
