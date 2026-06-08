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
        Schema::table('detalles_cotizacion', function (Blueprint $table) {
            $table->unsignedBigInteger('producto_temporal_id')->nullable()->after('producto_id');
            $table->foreign('producto_temporal_id')->references('id')->on('productos_temporales')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detalles_cotizacion', function (Blueprint $table) {
            $table->dropForeign(['producto_temporal_id']);
            $table->dropColumn('producto_temporal_id');
        });
    }
};
