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
        Schema::create('marca_categoria', function (Blueprint $table) {
            $table->unsignedBigInteger('marca_id');
            $table->unsignedBigInteger('categoria_id');
            $table->foreign('marca_id')->references('id_marca')->on('marcas')->onDelete('cascade');
            $table->foreign('categoria_id')->references('id_categoria')->on('categorias')->onDelete('cascade');
            $table->primary(['marca_id', 'categoria_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marca_categoria');
    }
};
