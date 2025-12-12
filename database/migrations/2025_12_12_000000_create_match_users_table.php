<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old tables in reverse order of dependency
        Schema::dropIfExists('match_messages');
        Schema::dropIfExists('match_pairs');
        Schema::dropIfExists('match_swipes');
        Schema::dropIfExists('match_photos');
        Schema::dropIfExists('match_profiles');

        // 1. Independent Users/Members table
        Schema::create('match_users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(); // Assuming name is still useful, though not in validation list explicitly, it's standard.
            $table->integer('age');
            $table->string('gender');
            $table->text('description')->nullable();
            $table->string('interested_in');
            $table->string('instagram')->nullable();
            $table->string('whatsapp')->nullable();
            
            $table->timestamps();
        });

        // 2. Photos for the match user
        Schema::create('match_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_user_id')->constrained('match_users')->onDelete('cascade');
            $table->string('url');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 3. Swipes
        Schema::create('match_swipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('swiper_id')->constrained('match_users')->onDelete('cascade');
            $table->foreignId('swiped_id')->constrained('match_users')->onDelete('cascade');
            $table->string('type')->default('like'); 
            $table->timestamps();
            
            $table->unique(['swiper_id', 'swiped_id']);
        });

        // 4. Matches
        Schema::create('match_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_1_id')->constrained('match_users')->onDelete('cascade');
            $table->foreignId('user_2_id')->constrained('match_users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_1_id', 'user_2_id']);
        });

        // 5. Messages
        Schema::create('match_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_pair_id')->constrained('match_pairs')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('match_users')->onDelete('cascade');
            $table->text('content');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_messages');
        Schema::dropIfExists('match_pairs');
        Schema::dropIfExists('match_swipes');
        Schema::dropIfExists('match_photos');
        Schema::dropIfExists('match_users');
    }
};
