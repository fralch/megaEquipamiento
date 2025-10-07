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
        // Crear tabla roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id('id_rol');
            $table->string('nombre_rol', 50)->unique();
            $table->string('descripcion', 255)->nullable();
            $table->timestamps();
        });

        // Agregar columna role_id a la tabla usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            $table->foreignId('id_rol')->nullable()->constrained('roles', 'id_rol')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la foreign key y columna de usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropForeign(['id_rol']);
            $table->dropColumn('id_rol');
        });

        // Eliminar tabla roles
        Schema::dropIfExists('roles');
    }
};