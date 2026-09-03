<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seccion_producto', function (Blueprint $table) {
            $table->unsignedBigInteger('seccion_id');
            $table->unsignedBigInteger('producto_id');

            $table->primary(['seccion_id', 'producto_id']);
            $table->index('seccion_id');
            $table->index('producto_id');

            $table->foreign('seccion_id')->references('id_seccion')->on('secciones')->onDelete('cascade');
            $table->foreign('producto_id')->references('id_producto')->on('productos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seccion_producto');
    }
};
