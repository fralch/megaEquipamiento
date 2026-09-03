<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('seccion_producto');
        Schema::dropIfExists('seccion_subcategoria');
        Schema::dropIfExists('seccion_marca');
        Schema::dropIfExists('seccion_categoria');
    }

    public function down(): void
    {
        // Las pivots originales se recrean con sus propias migraciones
        // (2026_07_15_120001 - 2026_07_15_120004) si se hace rollback por pasos.
    }
};
