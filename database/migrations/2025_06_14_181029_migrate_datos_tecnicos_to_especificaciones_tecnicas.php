<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Obtener todos los productos que tengan datos_tecnicos
        $productos = DB::table('productos')
            ->whereNotNull('datos_tecnicos')
            ->where('datos_tecnicos', '!=', '')
            ->where('datos_tecnicos', '!=', '{}')
            ->get();

        foreach ($productos as $producto) {
            try {
                // Decodificar datos_tecnicos
                $datosTecnicos = json_decode($producto->datos_tecnicos, true);
                
                if (!$datosTecnicos || !is_array($datosTecnicos)) {
                    continue;
                }

                // Decodificar especificaciones_tecnicas existentes o crear estructura vacía
                $especificaciones = [];
                if (!empty($producto->especificaciones_tecnicas)) {
                    $especificaciones = json_decode($producto->especificaciones_tecnicas, true);
                }
                
                // Si no existe la estructura, crearla
                if (!isset($especificaciones['secciones'])) {
                    $especificaciones = [
                        'secciones' => [],
                        'textoActual' => ''
                    ];
                }

                // Convertir datos_tecnicos a formato de tabla
                $datosTecnicosTabla = [
                    'tipo' => 'tabla',
                    'datos' => [
                        ['Especificación', 'Valor'] // Header
                    ]
                ];

                // Agregar cada dato técnico como fila
                foreach ($datosTecnicos as $clave => $valor) {
                    // Formatear la clave para que se vea mejor
                    $claveFormateada = $this->formatearClave($clave);
                    $datosTecnicosTabla['datos'][] = [$claveFormateada, $valor];
                }

                // Agregar la nueva sección al inicio de las especificaciones
                array_unshift($especificaciones['secciones'], $datosTecnicosTabla);

                // Actualizar el producto
                DB::table('productos')
                    ->where('id_producto', $producto->id_producto)
                    ->update([
                        'especificaciones_tecnicas' => json_encode($especificaciones, JSON_UNESCAPED_UNICODE)
                    ]);

            } catch (Exception $e) {
                // Log del error pero continúa con el siguiente producto
                \Log::error("Error procesando producto {$producto->id_producto}: " . $e->getMessage());
            }
        }

        // Eliminar la columna datos_tecnicos
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('datos_tecnicos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recrear la columna datos_tecnicos
        Schema::table('productos', function (Blueprint $table) {
            $table->json('datos_tecnicos')->nullable();
        });

        // Restaurar los datos desde especificaciones_tecnicas
        $productos = DB::table('productos')
            ->whereNotNull('especificaciones_tecnicas')
            ->where('especificaciones_tecnicas', '!=', '')
            ->get();

        foreach ($productos as $producto) {
            try {
                $especificaciones = json_decode($producto->especificaciones_tecnicas, true);
                
                if (!isset($especificaciones['secciones']) || !is_array($especificaciones['secciones'])) {
                    continue;
                }

                // Buscar la sección de datos técnicos (debería ser la primera tabla)
                $datosTecnicos = [];
                $seccionesRestantes = [];
                $encontroTablaEspecificaciones = false;

                foreach ($especificaciones['secciones'] as $seccion) {
                    if ($seccion['tipo'] === 'tabla' && !$encontroTablaEspecificaciones) {
                        // Verificar si es la tabla de especificaciones técnicas
                        if (isset($seccion['datos'][0]) && 
                            count($seccion['datos'][0]) === 2 && 
                            ($seccion['datos'][0][0] === 'Especificación' || 
                             $seccion['datos'][0][0] === 'Especificacion')) {
                            
                            // Extraer datos técnicos
                            for ($i = 1; $i < count($seccion['datos']); $i++) {
                                if (count($seccion['datos'][$i]) === 2) {
                                    $clave = $this->revertirClave($seccion['datos'][$i][0]);
                                    $valor = $seccion['datos'][$i][1];
                                    $datosTecnicos[$clave] = $valor;
                                }
                            }
                            $encontroTablaEspecificaciones = true;
                        } else {
                            $seccionesRestantes[] = $seccion;
                        }
                    } else {
                        $seccionesRestantes[] = $seccion;
                    }
                }

                // Actualizar ambos campos
                $updates = [];
                
                if (!empty($datosTecnicos)) {
                    $updates['datos_tecnicos'] = json_encode($datosTecnicos, JSON_UNESCAPED_UNICODE);
                }

                if (!empty($seccionesRestantes) || !$encontroTablaEspecificaciones) {
                    $especificaciones['secciones'] = $seccionesRestantes;
                    $updates['especificaciones_tecnicas'] = json_encode($especificaciones, JSON_UNESCAPED_UNICODE);
                } else {
                    $updates['especificaciones_tecnicas'] = null;
                }

                if (!empty($updates)) {
                    DB::table('productos')
                        ->where('id_producto', $producto->id_producto)
                        ->update($updates);
                }

            } catch (Exception $e) {
                \Log::error("Error revirtiendo producto {$producto->id_producto}: " . $e->getMessage());
            }
        }
    }

    /**
     * Formatear clave para mostrar en la tabla
     */
    private function formatearClave(string $clave): string
    {
        // Convertir snake_case a título
        $palabras = explode('_', $clave);
        $palabras = array_map('ucfirst', $palabras);
        return implode(' ', $palabras);
    }

    /**
     * Revertir clave formateada a snake_case
     */
    private function revertirClave(string $claveFormateada): string
    {
        // Convertir título a snake_case
        $clave = strtolower($claveFormateada);
        $clave = str_replace(' ', '_', $clave);
        return $clave;
    }
};