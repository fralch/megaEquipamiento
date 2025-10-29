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
        Schema::create('notificaciones_cotizacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cotizacion_id')->constrained('cotizaciones')->onDelete('cascade');
            $table->unsignedBigInteger('usuario_id'); // Usuario que creó la cotización
            $table->foreign('usuario_id')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->enum('tipo', ['vencida', 'por_vencer'])->default('vencida');
            $table->integer('dias_vencimiento')->nullable(); // Días desde que venció o hasta que venza
            $table->enum('nivel_urgencia', ['info', 'warning', 'danger'])->default('info');
            $table->boolean('visualizado')->default(false);
            $table->timestamp('fecha_visualizado')->nullable();
            $table->text('mensaje')->nullable();
            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index(['usuario_id', 'visualizado']);
            $table->index(['cotizacion_id', 'usuario_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones_cotizacion');
    }
};
