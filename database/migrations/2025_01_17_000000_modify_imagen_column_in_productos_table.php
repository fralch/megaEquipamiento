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
        // Primero, limpiar datos inválidos que podrían causar problemas con JSON
        DB::statement("
            UPDATE productos 
            SET imagen = NULL 
            WHERE imagen IS NOT NULL 
            AND imagen != '' 
            AND (imagen LIKE '%\\%' OR imagen LIKE '%\"%' OR imagen LIKE '%\n%' OR imagen LIKE '%\r%')
        ");
        
        // Crear una columna temporal para almacenar los datos
        Schema::table('productos', function (Blueprint $table) {
            $table->json('imagen_temp')->nullable();
        });
        
        // Migrar los datos válidos a la columna temporal
        DB::statement("
            UPDATE productos 
            SET imagen_temp = CASE 
                WHEN imagen IS NOT NULL AND imagen != '' 
                THEN JSON_ARRAY(imagen)
                ELSE NULL 
            END
        ");
        
        // Eliminar la columna original
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('imagen');
        });
        
        // Renombrar la columna temporal
        Schema::table('productos', function (Blueprint $table) {
            $table->renameColumn('imagen_temp', 'imagen');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Crear una columna temporal para almacenar los datos revertidos
        Schema::table('productos', function (Blueprint $table) {
            $table->string('imagen_temp', 255)->nullable();
        });
        
        // Revertir los datos JSON a string (tomar solo la primera imagen)
        DB::statement("
            UPDATE productos 
            SET imagen_temp = CASE 
                WHEN imagen IS NOT NULL AND JSON_VALID(imagen) = 1
                THEN JSON_UNQUOTE(JSON_EXTRACT(imagen, '$[0]'))
                ELSE NULL 
            END
        ");
        
        // Eliminar la columna JSON
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('imagen');
        });
        
        // Renombrar la columna temporal
        Schema::table('productos', function (Blueprint $table) {
            $table->renameColumn('imagen_temp', 'imagen');
        });
    }
};