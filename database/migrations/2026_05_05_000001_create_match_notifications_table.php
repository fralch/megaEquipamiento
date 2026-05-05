<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add fcm_token to match_users to identify devices
        Schema::table('match_users', function (Blueprint $table) {
            $table->string('fcm_token')->nullable()->after('city');
        });

        // Create notifications table for Match module
        Schema::create('match_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_user_id')->constrained('match_users')->onDelete('cascade');
            $table->string('type'); // 'match', 'message', 'like', etc.
            $table->string('title');
            $table->text('content');
            $table->json('data')->nullable(); // Extra data like match_id or sender_id
            $table->boolean('is_read')->default(false);
            $table->timestamps();
            
            $table->index(['match_user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_notifications');
        Schema::table('match_users', function (Blueprint $table) {
            $table->dropColumn('fcm_token');
        });
    }
};
