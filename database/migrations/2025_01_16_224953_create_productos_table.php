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
            $table->bigIncrements('id_producto'); // Clave primaria autoincremental
            $table->string('sku', 100); // SKU del producto
            $table->string('nombre', 100); // Nombre del producto
            $table->unsignedBigInteger('id_subcategoria'); // Clave foránea para subcategoría
            $table->unsignedBigInteger('marca_id'); // Clave foránea para marca
            $table->string('pais', 100)->nullable(); // País de origen (opcional)
            $table->decimal('precio_sin_ganancia', 10, 2)->nullable(); // Precio sin ganancia (opcional)
            $table->decimal('precio_ganancia', 10, 2)->nullable(); // Precio con ganancia (opcional)
            $table->decimal('precio_igv', 10, 2)->nullable(); // Precio con IGV (opcional)
            $table->string('imagen', 255)->nullable(); // URL de la imagen (opcional)
            $table->text('descripcion')->nullable(); // Descripción del producto (opcional)
            $table->string('video', 255)->nullable(); // URL del video (opcional)
            $table->string('envio', 100)->nullable(); // Información de envío (opcional)
            $table->longText('soporte_tecnico')->nullable(); // Soporte técnico (opcional)
            $table->json('caracteristicas')->nullable(); // Características en formato JSON (opcional)
            $table->json('datos_tecnicos')->nullable(); // Datos técnicos en formato JSON (opcional)
            $table->longText('especificaciones_tecnicas')->nullable(); // Especificaciones (opcional)
            $table->json('archivos_adicionales')->nullable(); // Archivos adicionales en formato JSON (opcional)

            // Claves foráneas
            $table->foreign('id_subcategoria')->references('id_subcategoria')->on('subcategorias')->onDelete('cascade');
            $table->foreign('marca_id')->references('id_marca')->on('marcas')->onDelete('cascade');

            $table->timestamps(); // Campos created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos'); // Elimina la tabla si se revierte la migración
    }
};