<?php

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
        Schema::create('detalles_comparaciones', function (Blueprint $table) {
            $table->id('id_detalle_comparacion');
            $table->unsignedBigInteger('id_comparacion');
            $table->unsignedBigInteger('id_producto');
            $table->string('notas')->nullable(); // Campo opcional para notas adicionales

            $table->foreign('id_comparacion')->references('id_comparacion')->on('comparaciones_productos')->onDelete('cascade');
            $table->foreign('id_producto')->references('id_producto')->on('productos')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalles_comparaciones');
    }
};
