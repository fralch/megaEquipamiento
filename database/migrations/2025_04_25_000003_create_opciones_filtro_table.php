<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opciones_filtro', function (Blueprint $table) {
            $table->bigIncrements('id_opcion');
            $table->unsignedBigInteger('id_filtro');
            $table->string('valor', 255);
            $table->string('etiqueta', 255);
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_filtro')
                  ->references('id_filtro')
                  ->on('filtros_subcategoria')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opciones_filtro');
    }
};