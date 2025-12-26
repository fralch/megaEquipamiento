<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete all existing match users to avoid unique constraint violations on email
        // Since foreign keys are set to cascade on delete, this will clean up related data too
        DB::table('match_users')->delete();

        Schema::table('match_users', function (Blueprint $table) {
            $table->string('email')->unique()->after('name');
            $table->string('password')->after('email');
            $table->rememberToken()->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('match_users', function (Blueprint $table) {
            $table->dropColumn(['email', 'password', 'remember_token']);
        });
    }
};
