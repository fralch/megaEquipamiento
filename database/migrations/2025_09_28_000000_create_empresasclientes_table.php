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
        Schema::create('empresasclientes', function (Blueprint $table) {
            $table->id();
            $table->string('razon_social');
            $table->string('ruc', 11)->unique();
            $table->string('sector');
            $table->string('contacto_principal');
            $table->string('email')->unique();
            $table->string('telefono');
            $table->text('direccion');
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Índices para mejorar el rendimiento
            $table->index(['sector']);
            $table->index(['activo']);
            $table->index(['usuario_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresasclientes');
    }
};