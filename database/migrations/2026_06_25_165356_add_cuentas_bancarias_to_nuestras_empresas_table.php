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
            $table->text('cuenta_soles')->nullable()->after('anio_cotizacion');
            $table->text('cuenta_dolares')->nullable()->after('cuenta_soles');
            $table->text('cuenta_detraccion')->nullable()->after('cuenta_dolares');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nuestras_empresas', function (Blueprint $table) {
            $table->dropColumn(['cuenta_soles', 'cuenta_dolares', 'cuenta_detraccion']);
        });
    }
};
