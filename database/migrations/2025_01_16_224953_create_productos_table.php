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
        Schema::create('productos', function (Blueprint $table) {
            $table->bigIncrements('id_producto');
            $table->string('sku', 100);
            $table->string('nombre', 100);
            $table->unsignedBigInteger('id_subcategoria');
            $table->unsignedBigInteger('marca_id');
            $table->string('pais', 100)->nullable();
            $table->decimal('precio_sin_ganancia', 10, 2)->nullable();
            $table->decimal('precio_ganancia', 10, 2)->nullable();
            $table->decimal('precio_igv', 10, 2)->nullable();
            $table->string('imagen', 255)->nullable();
            $table->string('descripcion', 255)->nullable();
            $table->string('video', 255)->nullable();
            $table->string('envio', 100)->nullable();
            $table->string('soporte_tecnico', 100)->nullable();
            $table->json('caracteristicas')->nullable();
            $table->foreign('id_subcategoria')->references('id_subcategoria')->on('subcategorias')->onDelete('cascade');
            $table->foreign('marca_id')->references('id_marca')->on('marcas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
