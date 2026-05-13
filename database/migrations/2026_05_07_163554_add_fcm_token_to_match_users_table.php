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
        if (Schema::hasColumn('match_users', 'fcm_token')) {
            return;
        }

        Schema::table('match_users', function (Blueprint $table) {
            $table->string('fcm_token')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('match_users', 'fcm_token')) {
            return;
        }

        Schema::table('match_users', function (Blueprint $table) {
            $table->dropColumn('fcm_token');
        });
    }
};
