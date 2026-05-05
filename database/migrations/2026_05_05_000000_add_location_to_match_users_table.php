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
        Schema::table('match_users', function (Blueprint $table) {
            // Using decimal for precision (standard for GPS coordinates)
            $table->decimal('latitude', 10, 8)->nullable()->after('whatsapp');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('city')->nullable()->after('longitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('match_users', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'city']);
        });
    }
};
