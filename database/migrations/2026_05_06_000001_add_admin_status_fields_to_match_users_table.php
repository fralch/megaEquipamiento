<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_users', function (Blueprint $table) {
            $table->string('status')->default('active')->index();
            $table->timestamp('banned_at')->nullable();
            $table->string('ban_reason')->nullable();
            $table->text('ban_notes')->nullable();
            $table->timestamp('last_active_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('match_users', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn([
                'status',
                'banned_at',
                'ban_reason',
                'ban_notes',
                'last_active_at',
            ]);
        });
    }
};
