<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UserRoleController extends Controller
{
    public function usuarios(Request $request)
    {
        // Test without database first
        if ($request->has('test')) {
            return Inertia::render('CRM/UsuariosRoles/Usuarios', [
                'usuarios' => ['data' => [], 'total' => 0, 'from' => 0, 'to' => 0],
                'roles' => [],
                'estadisticas' => [],
                'filters' => []
            ]);
        }

        $query = Usuario::with('role');

        // Filtros
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('correo', 'like', "%{$search}%")
                  ->orWhere('nombre_usuario', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role !== 'all') {
            $query->whereHas('role', function($q) use ($request) {
                $q->where('nombre_rol', $request->role);
            });
        }

        $usuarios = $query->orderBy('created_at', 'desc')->paginate(15);

        // Estadísticas
        $totalUsuarios = Usuario::count();
        $totalRoles = Role::count();
        $usuariosActivos = Usuario::whereNotNull('updated_at')
            ->where('updated_at', '>=', now()->subDays(30))
            ->count();
        $administradores = Usuario::whereHas('role', function($q) {
            $q->where('nombre_rol', 'admin');
        })->count();

        $estadisticas = [
            [
                'titulo' => 'Total Usuarios',
                'valor' => $totalUsuarios,
                'color' => 'blue',
                'cambio' => '+0%'
            ],
            [
                'titulo' => 'Roles Activos',
                'valor' => $totalRoles,
                'color' => 'green',
                'cambio' => '+0%'
            ],
            [
                'titulo' => 'Administradores',
                'valor' => $administradores,
                'color' => 'purple',
                'cambio' => '+0%'
            ],
            [
                'titulo' => 'Activos (30d)',
                'valor' => $usuariosActivos,
                'color' => 'orange',
                'cambio' => '+0%'
            ]
        ];

        $roles = Role::all();

        return Inertia::render('CRM/UsuariosRoles/Usuarios', [
            'usuarios' => $usuarios,
            'roles' => $roles,
            'estadisticas' => $estadisticas,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role
            ]
        ]);
    }

    public function roles(Request $request)
    {
        // Test without database first
        if ($request->has('test')) {
            return Inertia::render('CRM/UsuariosRoles/Roles', [
                'roles' => []
            ]);
        }

        $roles = Role::withCount('usuarios')->get();

        return Inertia::render('CRM/UsuariosRoles/Roles', [
            'roles' => $roles
        ]);
    }

    public function createUser()
    {
        $roles = Role::all();
        return Inertia::render('CRM/UsuariosRoles/CreateUser', [
            'roles' => $roles
        ]);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'nombre_usuario' => 'required|string|max:255|unique:usuarios',
            'correo' => 'required|email|unique:usuarios',
            'contraseña' => 'required|min:6',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'id_rol' => 'required|exists:roles,id_rol'
        ]);

        Usuario::create([
            'nombre' => $request->nombre,
            'nombre_usuario' => $request->nombre_usuario,
            'correo' => $request->correo,
            'contraseña' => bcrypt($request->contraseña),
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
            'id_rol' => $request->id_rol
        ]);

        return redirect()->route('crm.usuarios')->with('success', 'Usuario creado exitosamente.');
    }

    public function showUser($id)
    {
        $usuario = Usuario::with('role')->where('id_usuario', $id)->firstOrFail();
        return Inertia::render('CRM/UsuariosRoles/ShowUser', [
            'usuario' => $usuario
        ]);
    }

    public function editUser($id)
    {
        $usuario = Usuario::with('role')->where('id_usuario', $id)->firstOrFail();
        $roles = Role::all();
        return Inertia::render('CRM/UsuariosRoles/EditUser', [
            'usuario' => $usuario,
            'roles' => $roles
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        $usuario = Usuario::where('id_usuario', $id)->firstOrFail();

        $request->validate([
            'nombre' => 'required|string|max:255',
            'nombre_usuario' => ['required', 'string', 'max:255', Rule::unique('usuarios')->ignore($usuario->id_usuario, 'id_usuario')],
            'correo' => ['required', 'email', Rule::unique('usuarios')->ignore($usuario->id_usuario, 'id_usuario')],
            'contraseña' => 'nullable|min:6',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'id_rol' => 'required|exists:roles,id_rol'
        ]);

        $updateData = [
            'nombre' => $request->nombre,
            'nombre_usuario' => $request->nombre_usuario,
            'correo' => $request->correo,
            'telefono' => $request->telefono,
            'direccion' => $request->direccion,
            'id_rol' => $request->id_rol
        ];

        if ($request->contraseña) {
            $updateData['contraseña'] = bcrypt($request->contraseña);
        }

        $usuario->update($updateData);

        return redirect()->route('crm.usuarios')->with('success', 'Usuario actualizado exitosamente.');
    }

    public function destroyUser($id)
    {
        $usuario = Usuario::where('id_usuario', $id)->firstOrFail();
        $usuario->delete();
        return redirect()->route('crm.usuarios')->with('success', 'Usuario eliminado exitosamente.');
    }

    public function createRole()
    {
        return Inertia::render('CRM/UsuariosRoles/CreateRole');
    }

    public function storeRole(Request $request)
    {
        $request->validate([
            'nombre_rol' => 'required|string|max:50|unique:roles',
            'descripcion' => 'nullable|string|max:255'
        ]);

        Role::create([
            'nombre_rol' => $request->nombre_rol,
            'descripcion' => $request->descripcion
        ]);

        return redirect()->route('crm.roles')->with('success', 'Rol creado exitosamente.');
    }

    public function editRole($id)
    {
        $role = Role::where('id_rol', $id)->firstOrFail();
        return Inertia::render('CRM/UsuariosRoles/EditRole', [
            'role' => $role
        ]);
    }

    public function updateRole(Request $request, $id)
    {
        $role = Role::where('id_rol', $id)->firstOrFail();

        $request->validate([
            'nombre_rol' => ['required', 'string', 'max:50', Rule::unique('roles')->ignore($role->id_rol, 'id_rol')],
            'descripcion' => 'nullable|string|max:255'
        ]);

        $role->update([
            'nombre_rol' => $request->nombre_rol,
            'descripcion' => $request->descripcion
        ]);

        return redirect()->route('crm.roles')->with('success', 'Rol actualizado exitosamente.');
    }

    public function destroyRole($id)
    {
        $role = Role::where('id_rol', $id)->firstOrFail();

        // Verificar que no tenga usuarios asignados
        if ($role->usuarios()->count() > 0) {
            return redirect()->route('crm.roles')->with('error', 'No se puede eliminar un rol que tiene usuarios asignados.');
        }

        $role->delete();
        return redirect()->route('crm.roles')->with('success', 'Rol eliminado exitosamente.');
    }
}