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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->bigIncrements('id_usuario');
            $table->string('nombre_usuario', 50);
            $table->string('contraseña', 255);
            $table->string('correo', 100)->nullable();
            $table->string('nombre', 50)->nullable();
            $table->string('apellido', 50)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
