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
        Schema::create('tipos_relacion_productos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });
        
        // Insertar datos iniciales
        DB::table('tipos_relacion_productos')->insert([
            ['nombre' => 'accesorio', 'descripcion' => 'Accesorios generales'],
            ['nombre' => 'suministro', 'descripcion' => 'Suministros generales'],
            ['nombre' => 'otro', 'descripcion' => 'Otras relaciones'],
            ['nombre' => 'insumos y consumibles', 'descripcion' => 'Productos consumibles y suministros'],
            ['nombre' => 'productos relacionados', 'descripcion' => 'Productos con alguna relación'],
            ['nombre' => 'productos vistos recientemente', 'descripcion' => 'Historial de productos visualizados'],
            ['nombre' => 'productos que utilizan estos accesorios', 'descripcion' => 'Productos compatibles con estos accesorios'],
            ['nombre' => 'productos que utilizan estos insumos', 'descripcion' => 'Productos que usan estos consumibles'],
        ]);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipos_relacion_productos');
    }
};
