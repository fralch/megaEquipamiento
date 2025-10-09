<?php

namespace App\Http\Controllers\CRM\NuestrasEmpresas;

use App\Http\Controllers\Controller;
use App\Models\NuestraEmpresa;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class NuestrasEmpresasController extends Controller
{
    /**
     * Display a listing of empresas.
     */
    public function index(Request $request)
    {
        $query = NuestraEmpresa::query()->with('usuario');

        // Búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('ruc', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('telefono', 'like', "%{$search}%");
            });
        }

        // Filtro por usuario asignado
        if ($request->has('id_usuario') && $request->id_usuario) {
            $query->where('id_usuario', $request->id_usuario);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        $perPage = $request->get('per_page', 15);
        $empresas = $query->paginate($perPage);

        // Obtener todos los usuarios para filtros y asignaciones
        $usuarios = Usuario::where('activo', true)->get();

        // Calcular estadísticas
        $totalEmpresas = NuestraEmpresa::count();
        $empresasConUsuario = NuestraEmpresa::whereNotNull('id_usuario')->count();
        $empresasSinUsuario = NuestraEmpresa::whereNull('id_usuario')->count();
        $nuevasEsteMes = NuestraEmpresa::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return response()->json([
            'empresas' => $empresas,
            'usuarios' => $usuarios,
            'estadisticas' => [
                'total_empresas' => $totalEmpresas,
                'empresas_con_usuario' => $empresasConUsuario,
                'empresas_sin_usuario' => $empresasSinUsuario,
                'nuevas_este_mes' => $nuevasEsteMes,
            ],
            'filters' => $request->only(['search', 'id_usuario', 'sort_by', 'sort_order', 'per_page'])
        ]);
    }

    /**
     * Store a newly created empresa in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'ruc' => 'nullable|string|max:11|unique:nuestras_empresas,ruc',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'imagen_destacada' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ], [
            'nombre.required' => 'El nombre de la empresa es obligatorio',
            'nombre.max' => 'El nombre no puede exceder 255 caracteres',
            'email.email' => 'El formato del email no es válido',
            'ruc.unique' => 'Este RUC ya está registrado',
            'ruc.max' => 'El RUC no puede exceder 11 caracteres',
            'telefono.max' => 'El teléfono no puede exceder 20 caracteres',
            'id_usuario.exists' => 'El usuario seleccionado no existe',
            'imagen_destacada.image' => 'El archivo debe ser una imagen',
            'imagen_destacada.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif, svg',
            'imagen_destacada.max' => 'La imagen no puede ser mayor a 2MB',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Manejar la subida de imagen
            if ($request->hasFile('imagen_destacada')) {
                $image = $request->file('imagen_destacada');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('empresas', $imageName, 'public');
                $data['imagen_destacada'] = $imagePath;
            }

            $empresa = NuestraEmpresa::create($data);
            $empresa->load('usuario');

            return response()->json([
                'success' => true,
                'message' => 'Empresa creada exitosamente',
                'empresa' => $empresa
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified empresa.
     */
    public function show($id)
    {
        try {
            $empresa = NuestraEmpresa::with('usuario')->findOrFail($id);

            return response()->json([
                'success' => true,
                'empresa' => $empresa
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Empresa no encontrada'
            ], 404);
        }
    }

    /**
     * Update the specified empresa in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $empresa = NuestraEmpresa::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'telefono' => 'nullable|string|max:20',
                'ruc' => [
                    'nullable',
                    'string',
                    'max:11',
                    Rule::unique('nuestras_empresas', 'ruc')->ignore($empresa->id)
                ],
                'id_usuario' => 'nullable|exists:usuarios,id_usuario',
                'imagen_destacada' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ], [
                'nombre.required' => 'El nombre de la empresa es obligatorio',
                'nombre.max' => 'El nombre no puede exceder 255 caracteres',
                'email.email' => 'El formato del email no es válido',
                'ruc.unique' => 'Este RUC ya está registrado',
                'ruc.max' => 'El RUC no puede exceder 11 caracteres',
                'telefono.max' => 'El teléfono no puede exceder 20 caracteres',
                'id_usuario.exists' => 'El usuario seleccionado no existe',
                'imagen_destacada.image' => 'El archivo debe ser una imagen',
                'imagen_destacada.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif, svg',
                'imagen_destacada.max' => 'La imagen no puede ser mayor a 2MB',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Manejar la subida de nueva imagen
            if ($request->hasFile('imagen_destacada')) {
                // Eliminar imagen anterior si existe
                if ($empresa->imagen_destacada && Storage::disk('public')->exists($empresa->imagen_destacada)) {
                    Storage::disk('public')->delete($empresa->imagen_destacada);
                }

                $image = $request->file('imagen_destacada');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('empresas', $imageName, 'public');
                $data['imagen_destacada'] = $imagePath;
            }

            $empresa->update($data);
            $empresa->load('usuario');

            return response()->json([
                'success' => true,
                'message' => 'Empresa actualizada exitosamente',
                'empresa' => $empresa
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified empresa from storage.
     */
    public function destroy($id)
    {
        try {
            $empresa = NuestraEmpresa::findOrFail($id);

            // Eliminar imagen si existe
            if ($empresa->imagen_destacada && Storage::disk('public')->exists($empresa->imagen_destacada)) {
                Storage::disk('public')->delete($empresa->imagen_destacada);
            }

            $empresa->delete();

            return response()->json([
                'success' => true,
                'message' => 'Empresa eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete empresas.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:nuestras_empresas,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $empresas = NuestraEmpresa::whereIn('id', $request->ids)->get();

            // Eliminar imágenes asociadas
            foreach ($empresas as $empresa) {
                if ($empresa->imagen_destacada && Storage::disk('public')->exists($empresa->imagen_destacada)) {
                    Storage::disk('public')->delete($empresa->imagen_destacada);
                }
            }

            NuestraEmpresa::whereIn('id', $request->ids)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Empresas eliminadas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar las empresas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all usuarios for dropdowns.
     */
    public function getUsuarios()
    {
        try {
            $usuarios = Usuario::where('activo', true)
                ->select('id_usuario', 'nombre', 'apellido', 'correo', 'nombre_usuario')
                ->orderBy('nombre')
                ->get();

            return response()->json([
                'success' => true,
                'usuarios' => $usuarios
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search empresas by name.
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = $request->query;
            $empresas = NuestraEmpresa::with('usuario')
                ->where('nombre', 'like', "%{$query}%")
                ->orWhere('ruc', 'like', "%{$query}%")
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'empresas' => $empresas
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda: ' . $e->getMessage()
            ], 500);
        }
    }
}