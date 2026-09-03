<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seccion_categoria', function (Blueprint $table) {
            $table->unsignedBigInteger('seccion_id');
            $table->unsignedBigInteger('categoria_id');

            $table->primary(['seccion_id', 'categoria_id']);
            $table->index('seccion_id');
            $table->index('categoria_id');

            $table->foreign('seccion_id')->references('id_seccion')->on('secciones')->onDelete('cascade');
            $table->foreign('categoria_id')->references('id_categoria')->on('categorias')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seccion_categoria');
    }
};
