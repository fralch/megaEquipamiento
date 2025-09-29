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
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombrecompleto');
            $table->string('ruc');
            $table->unsignedBigInteger('empresa_id')->nullable();
            $table->string('sucursal')->nullable();
            $table->string('area')->nullable();
            $table->string('cargo')->nullable();
            $table->string('email')->nullable();
            $table->string('telefono')->nullable();
            $table->text('direccion')->nullable();
            $table->unsignedBigInteger('usuario_id'); // vendedor
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('empresa_id')->references('id')->on('empresasclientes')->onDelete('set null');
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
