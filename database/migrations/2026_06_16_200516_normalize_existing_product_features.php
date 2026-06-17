<?php
use App\Models\Producto;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Obtener todos los productos y normalizar las características
        Producto::chunk(100, function ($productos) {
            foreach ($productos as $producto) {
                $caracts = $producto->caracteristicas;
                if (is_array($caracts) && count($caracts) > 0) {
                    // Si el primer elemento es un arreglo con llaves 'name' y 'value',
                    // significa que está en el formato secuencial incorrecto [ {name, value}, ... ]
                    $firstItem = reset($caracts);
                    if (is_array($firstItem) && isset($firstItem['name']) && isset($firstItem['value'])) {
                        $normalized = [];
                        foreach ($caracts as $item) {
                            if (is_array($item) && isset($item['name']) && isset($item['value'])) {
                                $normalized[trim($item['name'])] = trim($item['value']);
                            }
                        }
                        $producto->caracteristicas = $normalized;
                        $producto->save();
                    }
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir de formato clave-valor a arreglo secuencial [ {name, value}, ... ]
        Producto::chunk(100, function ($productos) {
            foreach ($productos as $producto) {
                $caracts = $producto->caracteristicas;
                if (is_array($caracts) && count($caracts) > 0) {
                    // Verificar si es un arreglo asociativo (clave-valor)
                    $isAssociative = false;
                    foreach (array_keys($caracts) as $key) {
                        if (!is_int($key)) {
                            $isAssociative = true;
                            break;
                        }
                    }
                    
                    if ($isAssociative) {
                        $sequential = [];
                        foreach ($caracts as $name => $value) {
                            $sequential[] = [
                                'name' => $name,
                                'value' => $value
                            ];
                        }
                        $producto->caracteristicas = $sequential;
                        $producto->save();
                    }
                }
            }
        });
    }
};
