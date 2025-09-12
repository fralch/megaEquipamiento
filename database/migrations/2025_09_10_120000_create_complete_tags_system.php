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
        // Crear tabla tag_parents (sectores)
        Schema::create('tag_parents', function (Blueprint $table) {
            $table->id('id_tag_parent');
            $table->string('nombre', 150);
            $table->string('slug', 150)->unique();
            $table->text('descripcion')->nullable();
            $table->string('color', 20)->nullable();
            $table->string('imagen', 255)->nullable(); // Para GIFs como en Sectores
            $table->timestamps();

            // Índices
            $table->index(['slug']);
        });

        // Crear tabla tags (subsectores)
        Schema::create('tags', function (Blueprint $table) {
            $table->id('id_tag');
            $table->string('nombre', 150);
            $table->string('slug', 150)->unique();
            $table->text('descripcion')->nullable();
            $table->string('color', 20)->nullable();
            $table->unsignedBigInteger('id_tag_parent')->nullable();
            $table->timestamps();

            // Índices
            $table->index(['slug']);
            $table->index(['id_tag_parent']);
            
            // Relación con tag_parents
            $table->foreign('id_tag_parent')->references('id_tag_parent')->on('tag_parents')->onDelete('set null');
        });

        // Crear tabla pivote producto_tag
        Schema::create('producto_tag', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_producto');
            $table->unsignedBigInteger('id_tag');
            $table->timestamps();

            // Índices únicos
            $table->unique(['id_producto', 'id_tag']);
            $table->index(['id_producto']);
            $table->index(['id_tag']);

            // Relaciones foráneas
            $table->foreign('id_producto')->references('id_producto')->on('productos')->onDelete('cascade');
            $table->foreign('id_tag')->references('id_tag')->on('tags')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producto_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('tag_parents');
    }
};