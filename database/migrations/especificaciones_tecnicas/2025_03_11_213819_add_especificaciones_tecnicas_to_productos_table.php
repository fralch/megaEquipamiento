<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations. 
     
     php artisan make:migration add_especificaciones_tecnicas_to_productos_table --table=productos
     php artisan migrate
     
     */
    public function up()
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->longText('especificaciones_tecnicas')->nullable();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('especificaciones_tecnicas');
        });
    }
};
