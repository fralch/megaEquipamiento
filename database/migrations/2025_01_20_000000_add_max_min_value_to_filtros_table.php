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
        Schema::table('filtros', function (Blueprint $table) {
            $table->decimal('max_value', 15, 2)->nullable()->after('obligatorio');
            $table->decimal('min_value', 15, 2)->nullable()->after('max_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('filtros', function (Blueprint $table) {
            $table->dropColumn(['max_value', 'min_value']);
        });
    }
};