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
        Schema::table('nuestras_empresas', function (Blueprint $table) {
            $table->string('codigo_cotizacion')->nullable()->after('id_usuario');
            $table->bigInteger('contador_cotizacion')->default(0)->after('codigo_cotizacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nuestras_empresas', function (Blueprint $table) {
            $table->dropColumn(['codigo_cotizacion', 'contador_cotizacion']);
        });
    }
};
