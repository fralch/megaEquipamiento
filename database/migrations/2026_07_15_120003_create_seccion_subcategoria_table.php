<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seccion_subcategoria', function (Blueprint $table) {
            $table->unsignedBigInteger('seccion_id');
            $table->unsignedBigInteger('subcategoria_id');

            $table->primary(['seccion_id', 'subcategoria_id']);
            $table->index('seccion_id');
            $table->index('subcategoria_id');

            $table->foreign('seccion_id')->references('id_seccion')->on('secciones')->onDelete('cascade');
            $table->foreign('subcategoria_id')->references('id_subcategoria')->on('subcategorias')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seccion_subcategoria');
    }
};
