<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sliders', function (Blueprint $table) {
            $table->id('id_slider');
            $table->enum('tipo', ['imagen', 'video'])->default('imagen');
            $table->string('titulo', 255)->nullable();
            $table->string('subtitulo', 255)->nullable();
            $table->string('subtitulo_2', 255)->nullable();
            $table->string('subtitulo_pie', 255)->nullable();
            $table->string('texto_boton', 100)->nullable()->default('Ver más');
            $table->string('url_boton', 500)->nullable();
            $table->string('imagen', 255)->nullable();
            $table->string('video_youtube_id', 50)->nullable();
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index('activo');
            $table->index('orden');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sliders');
    }
};
