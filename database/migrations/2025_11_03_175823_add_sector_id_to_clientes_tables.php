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
        // Agregar sector_id a tabla clientes
        Schema::table('clientes', function (Blueprint $table) {
            $table->unsignedBigInteger('sector_id')->nullable()->after('direccion');
            $table->foreign('sector_id')->references('id_sector')->on('sectores')->onDelete('set null');
        });

        // Agregar sector_id a tabla empresasclientes
        Schema::table('empresasclientes', function (Blueprint $table) {
            $table->unsignedBigInteger('sector_id')->nullable()->after('direccion');
            $table->foreign('sector_id')->references('id_sector')->on('sectores')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar de tabla clientes
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['sector_id']);
            $table->dropColumn('sector_id');
        });

        // Eliminar de tabla empresasclientes
        Schema::table('empresasclientes', function (Blueprint $table) {
            $table->dropForeign(['sector_id']);
            $table->dropColumn('sector_id');
        });
    }
};
