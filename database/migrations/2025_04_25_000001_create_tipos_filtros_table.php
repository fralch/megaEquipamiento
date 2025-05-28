<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_filtros', function (Blueprint $table) {
            $table->bigIncrements('id_tipo_filtro');
            $table->string('nombre', 100);
            $table->enum('tipo_input', ['range', 'checkbox', 'select', 'radio']);
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_filtros');
    }
};