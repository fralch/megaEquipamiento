<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->unsignedBigInteger('id_seccion')->nullable()->after('descripcion');
            $table->index('id_seccion');
            $table->foreign('id_seccion')->references('id_seccion')->on('secciones')->onDelete('set null');
        });

        // Migración de datos: conservar las asignaciones existentes de seccion_categoria
        DB::statement('
            UPDATE categorias c
            INNER JOIN seccion_categoria sc ON sc.categoria_id = c.id_categoria
            SET c.id_seccion = sc.seccion_id
        ');
    }

    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropForeign(['id_seccion']);
            $table->dropIndex(['id_seccion']);
            $table->dropColumn('id_seccion');
        });
    }
};
