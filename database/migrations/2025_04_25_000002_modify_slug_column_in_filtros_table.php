<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('filtros', function (Blueprint $table) {
            // Eliminar el índice único de la columna slug
            $table->dropUnique(['slug']);
        });
    }

    public function down(): void
    {
        Schema::table('filtros', function (Blueprint $table) {
            // Restaurar el índice único en caso de rollback
            $table->unique('slug');
        });
    }
};