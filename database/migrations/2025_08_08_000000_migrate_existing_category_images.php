<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Categoria;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Obtener todas las categorías
        $categorias = Categoria::all();
        
        // Directorio base de imágenes existentes
        $baseDir = public_path('img/categorias');
        
        // Directorio destino para el nuevo sistema
        $newBaseDir = public_path('categorias');
        
        // Crear directorio destino si no existe
        if (!file_exists($newBaseDir)) {
            mkdir($newBaseDir, 0777, true);
        }
        
        // Obtener todas las carpetas disponibles
        $availableFolders = [];
        if (is_dir($baseDir)) {
            $folders = array_filter(glob($baseDir . '/*'), 'is_dir');
            foreach ($folders as $folder) {
                $folderName = basename($folder);
                $availableFolders[] = $folderName;
            }
        }
        
        echo "Carpetas disponibles encontradas: " . count($availableFolders) . "\n";
        
        foreach ($categorias as $categoria) {
            echo "\n--- Procesando categoría: '{$categoria->nombre}' ---\n";
            
            // Normalizar el nombre de la categoría para buscar carpetas
            $normalizedNames = $this->generateNormalizedNames($categoria->nombre);
            
            echo "Nombres normalizados generados: " . implode(', ', $normalizedNames) . "\n";
            
            $foundFolder = null;
            $foundImages = [];
            
            // Buscar carpeta existente con diferentes estrategias de normalización
            foreach ($normalizedNames as $normalizedName) {
                $folderPath = $baseDir . '/' . $normalizedName;
                
                if (is_dir($folderPath)) {
                    $foundFolder = $folderPath;
                    echo "✓ Encontrada carpeta exacta: {$normalizedName}\n";
                    break;
                }
            }
            
            // Si no encontramos coincidencia exacta, buscar coincidencias parciales
            if (!$foundFolder) {
                echo "Buscando coincidencias parciales...\n";
                foreach ($normalizedNames as $normalizedName) {
                    foreach ($availableFolders as $availableFolder) {
                        // Buscar si el nombre normalizado está contenido en alguna carpeta
                        if (stripos($availableFolder, $normalizedName) !== false || 
                            stripos($normalizedName, $availableFolder) !== false) {
                            $folderPath = $baseDir . '/' . $availableFolder;
                            if (is_dir($folderPath)) {
                                $foundFolder = $folderPath;
                                echo "✓ Encontrada carpeta parcial: {$availableFolder} (para {$normalizedName})\n";
                                break 2;
                            }
                        }
                    }
                }
            }
            
            // Si encontramos la carpeta, procesar las imágenes
            if ($foundFolder) {
                $imageFiles = glob($foundFolder . '/*.{jpg,jpeg,png,gif,webp,webm}', GLOB_BRACE);
                echo "Imágenes encontradas en carpeta: " . count($imageFiles) . "\n";
                
                foreach ($imageFiles as $imagePath) {
                    $fileName = basename($imagePath);
                    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                    
                    // Crear nombre único para evitar conflictos
                    $timestamp = time();
                    $unique = uniqid();
                    $index = count($foundImages);
                    $newFileName = $timestamp . '_' . $unique . '_' . $index . '.' . $extension;
                    $newImagePath = $newBaseDir . '/' . $newFileName;
                    
                    // Copiar imagen al nuevo directorio
                    if (copy($imagePath, $newImagePath)) {
                        $foundImages[] = 'categorias/' . $newFileName;
                        echo "  ✓ Copiada: {$fileName} -> {$newFileName}\n";
                    } else {
                        echo "  ✗ Error copiando: {$fileName}\n";
                    }
                }
                
                // Actualizar la base de datos con las nuevas rutas
                if (!empty($foundImages)) {
                    $categoria->img = $foundImages;
                    $categoria->save();
                    echo "✓ Actualizada categoría '{$categoria->nombre}' con " . count($foundImages) . " imágenes\n";
                } else {
                    echo "✗ No se encontraron imágenes válidas para '{$categoria->nombre}'\n";
                }
            } else {
                echo "✗ No se encontró carpeta para '{$categoria->nombre}'\n";
                // Mostrar las primeras 5 carpetas disponibles para debug
                $sampleFolders = array_slice($availableFolders, 0, 5);
                echo "   Carpetas disponibles (muestra): " . implode(', ', $sampleFolders) . "...\n";
            }
        }
        
        echo "Migración de imágenes completada.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Limpiar las rutas de imágenes de la base de datos
        DB::table('categorias')->update(['img' => null]);
        
        // Opcionalmente, eliminar el directorio de categorías
        // (comentado por seguridad)
        // $newBaseDir = public_path('categorias');
        // if (is_dir($newBaseDir)) {
        //     $this->deleteDirectory($newBaseDir);
        // }
        
        echo "Revertida migración de imágenes.\n";
    }
    
    /**
     * Generar diferentes variaciones normalizadas del nombre de categoría
     */
    private function generateNormalizedNames(string $categoryName): array
    {
        $normalizedNames = [];
        
        // Estrategia 1: guiones, minúsculas (más común en las carpetas)
        $name1 = strtolower($categoryName);
        $name1 = preg_replace('/[^a-z0-9\s]/i', '-', $name1);
        $name1 = preg_replace('/\s+/', '-', $name1);
        $name1 = preg_replace('/-+/', '-', $name1);
        $name1 = trim($name1, '-');
        if (!empty($name1)) $normalizedNames[] = $name1;
        
        // Estrategia 2: guiones bajos, minúsculas
        $name2 = strtolower($categoryName);
        $name2 = preg_replace('/[^a-z0-9\s]/i', '_', $name2);
        $name2 = preg_replace('/\s+/', '_', $name2);
        $name2 = preg_replace('/_+/', '_', $name2);
        $name2 = trim($name2, '_');
        if (!empty($name2) && !in_array($name2, $normalizedNames)) $normalizedNames[] = $name2;
        
        // Estrategia 3: solo espacios a guiones
        $name3 = strtolower(str_replace(' ', '-', $categoryName));
        if (!empty($name3) && !in_array($name3, $normalizedNames)) $normalizedNames[] = $name3;
        
        // Estrategia 4: solo espacios a guiones bajos
        $name4 = strtolower(str_replace(' ', '_', $categoryName));
        if (!empty($name4) && !in_array($name4, $normalizedNames)) $normalizedNames[] = $name4;
        
        // Estrategia 5: solo caracteres alfanuméricos
        $name5 = strtolower(preg_replace('/[^a-z0-9]/i', '', $categoryName));
        if (!empty($name5) && !in_array($name5, $normalizedNames)) $normalizedNames[] = $name5;
        
        // Estrategia 6: tal como está, solo minúsculas
        $name6 = strtolower($categoryName);
        if (!empty($name6) && !in_array($name6, $normalizedNames)) $normalizedNames[] = $name6;
        
        // Estrategia 7: remover acentos y caracteres especiales comunes
        $name7 = strtolower($categoryName);
        $name7 = str_replace(['á', 'é', 'í', 'ó', 'ú', 'ñ'], ['a', 'e', 'i', 'o', 'u', 'n'], $name7);
        $name7 = preg_replace('/[^a-z0-9\s]/i', '-', $name7);
        $name7 = preg_replace('/\s+/', '-', $name7);
        $name7 = preg_replace('/-+/', '-', $name7);
        $name7 = trim($name7, '-');
        if (!empty($name7) && !in_array($name7, $normalizedNames)) $normalizedNames[] = $name7;
        
        // Estrategia 8: tal como está original
        if (!empty($categoryName) && !in_array($categoryName, $normalizedNames)) $normalizedNames[] = $categoryName;
        
        return $normalizedNames;
    }
    
    /**
     * Eliminar directorio recursivamente
     */
    private function deleteDirectory(string $dir): bool
    {
        if (!is_dir($dir)) {
            return false;
        }
        
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        
        return rmdir($dir);
    }
};