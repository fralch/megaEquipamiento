<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla principal de filtros
        Schema::create('filtros', function (Blueprint $table) {
            $table->bigIncrements('id_filtro');
            $table->string('nombre', 100);
            $table->string('slug', 100)->unique(); // Para URLs amigables y JSON key
            $table->enum('tipo_input', ['range', 'checkbox', 'select', 'radio']);
            $table->string('unidad', 20)->nullable(); // Para rangos: cm, kg, $, etc.
            $table->text('descripcion')->nullable(); // Ayuda para el usuario
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->boolean('obligatorio')->default(false); // Si es requerido al crear producto
            $table->timestamps();
            
            $table->index(['activo', 'orden']);
        });

        // Tabla de opciones para filtros tipo select, checkbox, radio
        Schema::create('opciones_filtros', function (Blueprint $table) {
            $table->bigIncrements('id_opcion');
            $table->unsignedBigInteger('id_filtro');
            $table->string('valor', 100);
            $table->string('etiqueta', 100); // Lo que ve el usuario
            $table->string('color', 7)->nullable(); // Para colores: #FF0000
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            $table->foreign('id_filtro')->references('id_filtro')->on('filtros')->onDelete('cascade');
            $table->index(['id_filtro', 'activo', 'orden']);
        });

        // Relación entre subcategorías y filtros
        Schema::create('subcategoria_filtros', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('id_subcategoria');
            $table->unsignedBigInteger('id_filtro');
            $table->integer('orden')->default(0); // Orden específico para esta subcategoría
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            $table->foreign('id_subcategoria')->references('id_subcategoria')->on('subcategorias')->onDelete('cascade');
            $table->foreign('id_filtro')->references('id_filtro')->on('filtros')->onDelete('cascade');
            
            $table->unique(['id_subcategoria', 'id_filtro']);
            $table->index(['id_subcategoria', 'activo', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subcategoria_filtros');
        Schema::dropIfExists('opciones_filtros');
        Schema::dropIfExists('filtros');
    }
};