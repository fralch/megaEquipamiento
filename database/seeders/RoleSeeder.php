<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'nombre_rol' => 'admin',
                'descripcion' => 'Administrador del sistema con acceso completo'
            ],
            [
                'nombre_rol' => 'usuario',
                'descripcion' => 'Usuario regular del sistema'
            ],
            [
                'nombre_rol' => 'editor',
                'descripcion' => 'Editor del sistema'
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}