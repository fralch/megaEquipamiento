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
        Schema::create('cotizaciones', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->date('fecha_cotizacion');
            $table->date('fecha_vencimiento');
            $table->string('entrega')->nullable();
            $table->string('lugar_entrega')->nullable();
            $table->string('garantia')->nullable();
            $table->string('forma_pago')->nullable();

            // Cliente (polimórfico - puede ser particular o empresa)
            $table->unsignedBigInteger('cliente_id');
            $table->enum('cliente_tipo', ['particular', 'empresa'])->default('particular');

            // Relaciones
            $table->unsignedBigInteger('usuario_id'); // Vendedor
            $table->unsignedBigInteger('miempresa_id'); // Nuestra empresa

            // Financiero
            $table->enum('moneda', ['soles', 'dolares'])->default('soles');
            $table->decimal('tipo_cambio', 10, 3)->default(1.000);
            $table->decimal('total_monto_productos', 10, 2)->default(0);
            $table->decimal('total_adicionales_monto', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);

            // Estado
            $table->enum('estado', ['pendiente', 'enviada', 'aprobada', 'rechazada', 'negociacion'])->default('pendiente');

            // Notas
            $table->text('notas')->nullable();

            $table->timestamps();

            // Índices
            $table->index('numero');
            $table->index('cliente_id');
            $table->index('cliente_tipo');
            $table->index('usuario_id');
            $table->index('miempresa_id');
            $table->index('estado');
            $table->index('fecha_cotizacion');

            // Foreign keys
            $table->foreign('usuario_id')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->foreign('miempresa_id')->references('id')->on('nuestras_empresas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cotizaciones');
    }
};
