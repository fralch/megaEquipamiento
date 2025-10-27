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
        Schema::create('productos_temporales', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->unsignedBigInteger('marca_id')->nullable();
            $table->text('descripcion')->nullable();
            $table->json('especificaciones_tecnicas')->nullable();
            $table->string('procedencia')->nullable();
            $table->json('imagenes')->nullable();
            $table->decimal('precio', 10, 2);
            $table->timestamps();

            $table->foreign('marca_id')->references('id_marca')->on('marcas')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos_temporales');
    }
};
