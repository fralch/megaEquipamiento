<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('categorias', 'slug')) {
            Schema::table('categorias', function (Blueprint $table) {
                $table->string('slug', 200)->nullable()->after('nombre');
                $table->index('slug');
            });
        }

        // Poblar slugs para todas las categorías existentes
        $categorias = DB::table('categorias')->orderBy('id_categoria')->get();
        $usedSlugs = [];

        foreach ($categorias as $cat) {
            $baseSlug = Str::slug($cat->nombre ?: 'categoria');
            if (empty($baseSlug)) {
                $baseSlug = 'categoria-'.$cat->id_categoria;
            }

            $slug = $baseSlug;
            $counter = 1;
            while (in_array($slug, $usedSlugs) || DB::table('categorias')->where('slug', $slug)->where('id_categoria', '!=', $cat->id_categoria)->exists()) {
                $slug = $baseSlug.'-'.$counter;
                $counter++;
            }

            $usedSlugs[] = $slug;
            DB::table('categorias')->where('id_categoria', $cat->id_categoria)->update(['slug' => $slug]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('categorias', 'slug')) {
            Schema::table('categorias', function (Blueprint $table) {
                $table->dropIndex(['slug']);
                $table->dropColumn('slug');
            });
        }
    }
};
