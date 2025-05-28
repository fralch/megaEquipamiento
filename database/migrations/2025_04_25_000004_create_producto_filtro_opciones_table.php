<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('producto_filtro_opciones', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('id_producto');
            $table->unsignedBigInteger('id_opcion');
            $table->decimal('valor_numerico', 10, 2)->nullable();
            $table->string('valor_texto', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_producto')
                  ->references('id_producto')
                  ->on('productos')
                  ->onDelete('cascade');
            $table->foreign('id_opcion')
                  ->references('id_opcion')
                  ->on('opciones_filtro')
                  ->onDelete('cascade');

            $table->unique(['id_producto', 'id_opcion'], 'unique_producto_opcion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producto_filtro_opciones');
    }
};