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
        Schema::create('producto_relaciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('producto_id'); // Producto principal
            $table->unsignedBigInteger('relacionado_id'); // Producto relacionado
            $table->string('tipo'); // Tipo de relación (suministro, accesorio, etc.)

            // Definir claves foráneas
            $table->foreign('producto_id')->references('id_producto')->on('productos')->onDelete('cascade');
            $table->foreign('relacionado_id')->references('id_producto')->on('productos')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producto_relaciones');
    }
};
