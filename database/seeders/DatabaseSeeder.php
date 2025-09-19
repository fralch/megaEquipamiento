<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'nombre_usuario' => 'admin',
            'correo' => 'admin@example.com',
            'nombre' => 'Administrador',
            'apellido' => 'Sistema',
            'id_rol' => 1, // Asumiendo que el rol admin tendrá id_rol = 1
        ]);

        $this->call([
            RoleSeeder::class,
            TagSeeder::class,
        ]);
    }
}
