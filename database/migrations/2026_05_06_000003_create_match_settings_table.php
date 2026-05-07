<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('discovery_default_radius_km')->default(50);
            $table->unsignedInteger('daily_swipe_limit')->default(100);
            $table->boolean('maintenance_mode')->default(false);
            $table->timestamps();
        });

        DB::table('match_settings')->insert([
            'discovery_default_radius_km' => 50,
            'daily_swipe_limit' => 100,
            'maintenance_mode' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('match_settings');
    }
};
