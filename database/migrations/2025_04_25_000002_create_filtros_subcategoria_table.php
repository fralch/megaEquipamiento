<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filtros_subcategoria', function (Blueprint $table) {
            $table->bigIncrements('id_filtro');
            $table->unsignedBigInteger('id_subcategoria');
            $table->unsignedBigInteger('id_tipo_filtro');
            $table->string('nombre_filtro', 100);
            $table->json('configuracion')->nullable();
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->foreign('id_subcategoria')
                  ->references('id_subcategoria')
                  ->on('subcategorias')
                  ->onDelete('cascade');
            $table->foreign('id_tipo_filtro')
                  ->references('id_tipo_filtro')
                  ->on('tipos_filtros')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filtros_subcategoria');
    }
};