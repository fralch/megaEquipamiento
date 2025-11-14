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
        if (!Schema::hasTable('productos_externos')) {
            Schema::create('productos_externos', function (Blueprint $table) {
                // Table options
                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_0900_ai_ci';

                // Columns
                $table->id();
                $table->json('heading')->nullable();
                $table->json('paragraphs')->nullable();
                $table->json('tables')->nullable();
                $table->json('images')->nullable();

                // Timestamps
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos_externos');
    }
};