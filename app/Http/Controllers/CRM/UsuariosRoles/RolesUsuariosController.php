<?php

namespace App\Http\Controllers\CRM\UsuariosRoles;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RolesUsuariosController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(Request $request)
    {
        $query = Rol::query()->withCount('usuarios');

        // Búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre_rol', 'like', "%{$search}%")
                    ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'id_rol');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Obtener todos los roles (sin paginación por ahora, ya que normalmente hay pocos roles)
        $roles = $query->get();

        return Inertia::render('CRM/UsuariosRoles/Roles', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'sort_by', 'sort_order'])
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre_rol' => 'required|string|max:50|unique:roles,nombre_rol',
            'descripcion' => 'nullable|string|max:255',
        ], [
            'nombre_rol.required' => 'El nombre del rol es obligatorio',
            'nombre_rol.unique' => 'Este nombre de rol ya está en uso',
            'nombre_rol.max' => 'El nombre del rol no puede superar los 50 caracteres',
            'descripcion.max' => 'La descripción no puede superar los 255 caracteres',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $rol = Rol::create([
            'nombre_rol' => $request->nombre_rol,
            'descripcion' => $request->descripcion,
        ]);

        return back()->with('success', 'Rol creado exitosamente');
    }

    /**
     * Display the specified role.
     */
    public function show($id)
    {
        $rol = Rol::withCount('usuarios')->findOrFail($id);

        // Obtener algunos usuarios de ejemplo con este rol
        $usuariosEjemplo = Usuario::where('id_rol', $id)
            ->select('id_usuario', 'nombre_usuario', 'nombre', 'apellido', 'correo')
            ->limit(5)
            ->get();

        return response()->json([
            'rol' => $rol,
            'usuarios_ejemplo' => $usuariosEjemplo
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, $id)
    {
        $rol = Rol::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre_rol' => [
                'required',
                'string',
                'max:50',
                Rule::unique('roles', 'nombre_rol')->ignore($rol->id_rol, 'id_rol')
            ],
            'descripcion' => 'nullable|string|max:255',
        ], [
            'nombre_rol.required' => 'El nombre del rol es obligatorio',
            'nombre_rol.unique' => 'Este nombre de rol ya está en uso',
            'nombre_rol.max' => 'El nombre del rol no puede superar los 50 caracteres',
            'descripcion.max' => 'La descripción no puede superar los 255 caracteres',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $rol->update([
            'nombre_rol' => $request->nombre_rol,
            'descripcion' => $request->descripcion,
        ]);

        return back()->with('success', 'Rol actualizado exitosamente');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy($id)
    {
        $rol = Rol::findOrFail($id);

        // Verificar si hay usuarios asignados a este rol
        $usuariosCount = Usuario::where('id_rol', $id)->count();

        if ($usuariosCount > 0) {
            return back()->withErrors([
                'error' => "No se puede eliminar el rol porque tiene {$usuariosCount} usuario(s) asignado(s). Primero reasigna o elimina esos usuarios."
            ]);
        }

        $rol->delete();

        return back()->with('success', 'Rol eliminado exitosamente');
    }

    /**
     * Get users count by role.
     */
    public function getUsersCount()
    {
        $rolesCounts = Rol::withCount('usuarios')->get();

        return response()->json([
            'roles' => $rolesCounts
        ]);
    }

    /**
     * Assign role to user.
     */
    public function assignRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_rol' => 'required|exists:roles,id_rol',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $usuario = Usuario::findOrFail($request->id_usuario);
        $usuario->id_rol = $request->id_rol;
        $usuario->save();

        return back()->with('success', 'Rol asignado exitosamente al usuario');
    }

    /**
     * Remove role from user.
     */
    public function removeRole(Request $request, $userId)
    {
        $usuario = Usuario::findOrFail($userId);
        $usuario->id_rol = null;
        $usuario->save();

        return back()->with('success', 'Rol removido del usuario exitosamente');
    }

    /**
     * Bulk assign role to multiple users.
     */
    public function bulkAssignRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids_usuarios' => 'required|array',
            'ids_usuarios.*' => 'exists:usuarios,id_usuario',
            'id_rol' => 'required|exists:roles,id_rol',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        Usuario::whereIn('id_usuario', $request->ids_usuarios)
            ->update(['id_rol' => $request->id_rol]);

        $count = count($request->ids_usuarios);
        return back()->with('success', "Rol asignado a {$count} usuario(s) exitosamente");
    }
}
