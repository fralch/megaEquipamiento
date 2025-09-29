<?php

namespace Database\Seeders;

use App\Models\EmpresaCliente;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class EmpresaClienteFactorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Este seeder utiliza la factory para generar datos aleatorios
     * Úsalo cuando necesites generar muchas empresas para testing
     */
    public function run(): void
    {
        // Obtener usuarios existentes
        $usuarios = Usuario::all();

        if ($usuarios->isEmpty()) {
            // Si no hay usuarios, crear algunos para testing
            $usuarios = Usuario::factory(5)->create();
        }

        // Crear 25 empresas clientes aleatorias
        $usuarios->each(function ($usuario) {
            // Crear entre 3-7 empresas por usuario
            EmpresaCliente::factory()
                ->count(rand(3, 7))
                ->forUsuario($usuario->id_usuario)
                ->create();
        });

        // Crear algunas empresas específicas por sector
        EmpresaCliente::factory(5)->sector('Tecnología')->activa()->create();
        EmpresaCliente::factory(3)->sector('Salud y Laboratorios')->activa()->create();
        EmpresaCliente::factory(4)->sector('Industria Química')->create();
        EmpresaCliente::factory(2)->sector('Investigación')->inactiva()->create();

        $this->command->info('Se han creado empresas clientes usando la factory.');
    }
}