<?php

namespace App\Http\Controllers\CRM\UsuariosRoles;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UsuariosGestionController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = Usuario::query()->with('rol');

        // Búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre_usuario', 'like', "%{$search}%")
                    ->orWhere('correo', 'like', "%{$search}%")
                    ->orWhere('nombre', 'like', "%{$search}%")
                    ->orWhere('apellido', 'like', "%{$search}%");
            });
        }

        // Filtro por rol
        if ($request->has('id_rol') && $request->id_rol) {
            $query->where('id_rol', $request->id_rol);
        }

        // Filtro por estado
        if ($request->has('activo')) {
            $activoFilter = filter_var($request->activo, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($activoFilter !== null) {
                $query->where('activo', $activoFilter);
            }
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'id_usuario');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        $perPage = $request->get('per_page', 10);
        $perPage = $request->get('per_page', 15);
        $usuarios = $query->paginate($perPage);

        // Obtener todos los roles
        $roles = Rol::all();

        // Calcular estadísticas
        $totalUsuarios = Usuario::count();
        $usuariosActivos = Usuario::where('activo', true)->count();
        $usuariosInactivos = Usuario::where('activo', false)->count();
        $nuevosEsteMes = Usuario::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return Inertia::render('CRM/UsuariosRoles/Usuarios', [
            'usuarios' => $usuarios,
            'roles' => $roles,
            'estadisticas' => [
                'total_usuarios' => $totalUsuarios,
                'usuarios_activos' => $usuariosActivos,
                'usuarios_inactivos' => $usuariosInactivos,
                'nuevos_este_mes' => $nuevosEsteMes,
            ],
            'filters' => $request->only(['search', 'id_rol', 'activo', 'sort_by', 'sort_order', 'per_page'])
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre_usuario' => 'required|string|max:50|unique:usuarios,nombre_usuario',
            'contraseña' => 'required|string|min:8',
            'correo' => 'required|email|max:100|unique:usuarios,correo',
            'nombre' => 'nullable|string|max:50',
            'apellido' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'id_rol' => 'nullable|exists:roles,id_rol',
            'activo' => 'sometimes|boolean',
            'ultima_conexion' => 'nullable|date'
        ], [
            'nombre_usuario.required' => 'El nombre de usuario es obligatorio',
            'nombre_usuario.unique' => 'Este nombre de usuario ya esta en uso',
            'contraseña.required' => 'La contraseña es obligatoria',
            'contraseña.min' => 'La contraseña debe tener al menos 8 caracteres',
            'correo.required' => 'El correo electronico es obligatorio',
            'correo.email' => 'El correo electronico no es valido',
            'correo.unique' => 'Este correo electronico ya esta registrado',
            'id_rol.exists' => 'El rol seleccionado no existe',
            'activo.boolean' => 'El estado seleccionado no es valido',
            'ultima_conexion.date' => 'La fecha de ultima conexion no es valida'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $usuario = Usuario::create([
            'nombre_usuario' => $request->nombre_usuario,
            'contraseña' => Hash::make($request->contraseña),
            'correo' => $request->correo,
            'nombre' => $request->nombre,
            'apellido' => $request->apellido,
            'direccion' => $request->direccion,
            'telefono' => $request->telefono,
            'id_rol' => $request->id_rol,
            'activo' => $request->has('activo') ? $request->boolean('activo') : true,
            'ultima_conexion' => $request->ultima_conexion,
        ]);

        return back()->with('success', 'Usuario creado exitosamente');
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $usuario = Usuario::with('rol')->findOrFail($id);

        return response()->json([
            'usuario' => $usuario
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre_usuario' => [
                'required',
                'string',
                'max:50',
                Rule::unique('usuarios', 'nombre_usuario')->ignore($usuario->id_usuario, 'id_usuario')
            ],
            'correo' => [
                'required',
                'email',
                'max:100',
                Rule::unique('usuarios', 'correo')->ignore($usuario->id_usuario, 'id_usuario')
            ],
            'contraseña' => 'nullable|string|min:8',
            'nombre' => 'nullable|string|max:50',
            'apellido' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'id_rol' => 'nullable|exists:roles,id_rol',
            'activo' => 'sometimes|boolean',
            'ultima_conexion' => 'nullable|date'
        ], [
            'nombre_usuario.required' => 'El nombre de usuario es obligatorio',
            'nombre_usuario.unique' => 'Este nombre de usuario ya esta en uso',
            'correo.required' => 'El correo electronico es obligatorio',
            'correo.email' => 'El correo electronico no es valido',
            'correo.unique' => 'Este correo electronico ya esta registrado',
            'contraseña.min' => 'La contraseña debe tener al menos 8 caracteres',
            'id_rol.exists' => 'El rol seleccionado no existe',
            'activo.boolean' => 'El estado seleccionado no es valido',
            'ultima_conexion.date' => 'La fecha de ultima conexion no es valida'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $dataToUpdate = [
            'nombre_usuario' => $request->nombre_usuario,
            'correo' => $request->correo,
            'nombre' => $request->nombre,
            'apellido' => $request->apellido,
            'direccion' => $request->direccion,
            'telefono' => $request->telefono,
            'id_rol' => $request->id_rol
        ];

        if ($request->has('activo')) {
            $dataToUpdate['activo'] = $request->boolean('activo');
        }

        if ($request->has('ultima_conexion')) {
            $dataToUpdate['ultima_conexion'] = $request->filled('ultima_conexion')
                ? $request->ultima_conexion
                : null;
        }


        // Solo actualizar contraseña si se proporciona una nueva
        if ($request->filled('contraseña')) {
            $dataToUpdate['contraseña'] = Hash::make($request->contraseña);
        }

        $usuario->update($dataToUpdate);

        return back()->with('success', 'Usuario actualizado exitosamente');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id)
    {
        $usuario = Usuario::findOrFail($id);

        // Prevenir eliminación del usuario actual autenticado
        if (auth()->check() && auth()->user()->id_usuario === $usuario->id_usuario) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propio usuario']);
        }

        $usuario->delete();

        return back()->with('success', 'Usuario eliminado exitosamente');
    }

    /**
     * Update user status (activate/deactivate).
     */
    public function toggleStatus($id)
    {
        $usuario = Usuario::findOrFail($id);

        // Si existe un campo activo en la tabla
        if (isset($usuario->activo)) {
            $usuario->activo = !$usuario->activo;
            $usuario->save();

            $status = $usuario->activo ? 'activado' : 'desactivado';
            return back()->with('success', "Usuario {$status} exitosamente");
        }

        return back()->withErrors(['error' => 'Esta funcionalidad no esta disponible en este momento']);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'contraseña_actual' => 'required|string',
            'contraseña_nueva' => 'required|string|min:8',
        ], [
            'contraseña_actual.required' => 'La contraseña actual es obligatoria',
            'contraseña_nueva.required' => 'La nueva contraseña es obligatoria',
            'contraseña_nueva.min' => 'La nueva contraseña debe tener al menos 8 caracteres',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $usuario = Usuario::findOrFail($id);

        // Verificar contraseña actual
        if (!Hash::check($request->contraseña_actual, $usuario->contraseña)) {
            return back()->withErrors(['contraseña_actual' => 'La contraseña actual es incorrecta']);
        }

        $usuario->update([
            'contraseña' => Hash::make($request->contraseña_nueva)
        ]);

        return back()->with('success', 'Contraseña cambiada exitosamente');
    }

    /**
     * Reset user password (admin function).
     */
    public function resetPassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'contraseña_nueva' => 'required|string|min:8',
        ], [
            'contraseña_nueva.required' => 'La nueva contraseña es obligatoria',
            'contraseña_nueva.min' => 'La nueva contraseña debe tener al menos 8 caracteres',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $usuario = Usuario::findOrFail($id);

        $usuario->update([
            'contraseña' => Hash::make($request->contraseña_nueva)
        ]);

        return back()->with('success', 'Contraseña restablecida exitosamente');
    }

    /**
     * Bulk delete users.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:usuarios,id_usuario'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        // Prevenir eliminación del usuario actual autenticado
        $currentUserId = auth()->check() ? auth()->user()->id_usuario : null;
        $idsToDelete = array_diff($request->ids, [$currentUserId]);

        Usuario::whereIn('id_usuario', $idsToDelete)->delete();

        $count = count($idsToDelete);
        return back()->with('success', "{$count} usuario(s) eliminado(s) exitosamente");
    }

    /**
     * Export users to CSV.
     */
    public function export(Request $request)
    {
        $query = Usuario::query()->with('rol');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre_usuario', 'like', "%{$search}%")
                    ->orWhere('correo', 'like', "%{$search}%")
                    ->orWhere('nombre', 'like', "%{$search}%")
                    ->orWhere('apellido', 'like', "%{$search}%");
            });
        }

        if ($request->has('id_rol') && $request->id_rol) {
            $query->where('id_rol', $request->id_rol);
        }

        $usuarios = $query->get();

        $filename = 'usuarios_' . date('Y-m-d_H-i-s') . '.csv';
        $handle = fopen('php://output', 'w');

        ob_start();

        // Encabezados CSV
        fputcsv($handle, ['ID', 'Usuario', 'Correo', 'Nombre', 'Apellido', 'Teléfono', 'Dirección', 'Rol', 'Fecha Creación']);

        foreach ($usuarios as $usuario) {
            fputcsv($handle, [
                $usuario->id_usuario,
                $usuario->nombre_usuario,
                $usuario->correo,
                $usuario->nombre,
                $usuario->apellido,
                $usuario->telefono,
                $usuario->direccion,
                $usuario->rol?->nombre_rol ?? 'Sin rol',
                $usuario->created_at?->format('Y-m-d H:i:s')
            ]);
        }

        fclose($handle);
        $csv = ob_get_clean();

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
