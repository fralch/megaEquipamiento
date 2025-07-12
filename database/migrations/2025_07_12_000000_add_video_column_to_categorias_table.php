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
        // Add video column to categorias table
        Schema::table('categorias', function (Blueprint $table) {
            $table->text('video')->nullable()->after('descripcion');
        });

        // Load JSON data and update categories with video links
        $jsonPath = database_path('data/categoria_sin_id_updated.json');
        if (file_exists($jsonPath)) {
            $jsonData = json_decode(file_get_contents($jsonPath), true);
            
            foreach ($jsonData as $item) {
                if (isset($item['video_link']) && $item['video_link'] !== null && isset($item['id_categoria'])) {
                    // Update category by exact ID match
                    DB::table('categorias')
                        ->where('id_categoria', $item['id_categoria'])
                        ->update(['video' => $item['video_link']]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropColumn('video');
        });
    }
};