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
        // Primero, limpiamos la tabla marca_categoria por si tiene datos inconsistentes
        DB::table('marca_categoria')->truncate();
        
        // Insertamos las relaciones marca-categoria basadas en los productos existentes
        $query = "
            INSERT INTO marca_categoria (marca_id, categoria_id, created_at, updated_at)
            SELECT DISTINCT 
                p.marca_id,
                s.id_categoria,
                NOW(),
                NOW()
            FROM productos p
            INNER JOIN subcategorias s ON p.id_subcategoria = s.id_subcategoria
            WHERE p.marca_id IS NOT NULL 
            AND s.id_categoria IS NOT NULL
            ON DUPLICATE KEY UPDATE updated_at = NOW()
        ";
        
        DB::statement($query);
        
        // Opcional: Mostrar estadísticas de la operación
        $totalRelaciones = DB::table('marca_categoria')->count();
        echo "Se crearon {$totalRelaciones} relaciones marca-categoria\n";
        
        // Mostrar algunas estadísticas adicionales
        $marcasConCategorias = DB::table('marca_categoria')
            ->select('marca_id')
            ->distinct()
            ->count();
            
        $categoriasConMarcas = DB::table('marca_categoria')
            ->select('categoria_id')
            ->distinct()
            ->count();
            
        echo "Marcas con categorías: {$marcasConCategorias}\n";
        echo "Categorías con marcas: {$categoriasConMarcas}\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // En caso de rollback, limpiamos la tabla
        DB::table('marca_categoria')->truncate();
        echo "Tabla marca_categoria vaciada\n";
    }
};