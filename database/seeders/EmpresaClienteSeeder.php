<?php

namespace Database\Seeders;

use App\Models\EmpresaCliente;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class EmpresaClienteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener algunos usuarios existentes o crear uno por defecto
        $usuarios = Usuario::all();

        if ($usuarios->isEmpty()) {
            // Si no hay usuarios, crear uno por defecto
            $usuario = Usuario::create([
                'nombre_usuario' => 'admin_crm',
                'contraseña' => bcrypt('password'),
                'correo' => 'admin@crm.com',
                'nombre' => 'Administrador',
                'direccion' => 'Oficina Central',
                'telefono' => '999888777',
                'id_rol' => 1,
            ]);
            $usuarioId = $usuario->id_usuario;
        } else {
            $usuarioId = $usuarios->first()->id_usuario;
        }

        $empresas = [
            [
                'razon_social' => 'TechCorp Soluciones S.A.C.',
                'ruc' => '20123456789',
                'sector' => 'Tecnología',
                'contacto_principal' => 'Juan Carlos Pérez López',
                'email' => 'contacto@techcorp.com.pe',
                'telefono' => '+51 1 234-5678',
                'direccion' => 'Av. Javier Prado Este 4200, San Isidro, Lima',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
            [
                'razon_social' => 'Laboratorios Científicos del Perú S.A.',
                'ruc' => '20987654321',
                'sector' => 'Salud y Laboratorios',
                'contacto_principal' => 'Dra. María Elena García',
                'email' => 'ventas@labcientificos.pe',
                'telefono' => '+51 1 987-6543',
                'direccion' => 'Calle Las Begonias 450, San Isidro, Lima',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
            [
                'razon_social' => 'Industrias Químicas Andinas S.R.L.',
                'ruc' => '20456789012',
                'sector' => 'Industria Química',
                'contacto_principal' => 'Ing. Carlos Alberto López',
                'email' => 'compras@iqandinas.com',
                'telefono' => '+51 1 456-7890',
                'direccion' => 'Av. Argentina 1750, Callao',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
            [
                'razon_social' => 'Servicios Hospitalarios Integrados E.I.R.L.',
                'ruc' => '20789012345',
                'sector' => 'Servicios Médicos',
                'contacto_principal' => 'Lic. Ana Patricia Rodríguez',
                'email' => 'adquisiciones@shi.pe',
                'telefono' => '+51 1 789-0123',
                'direccion' => 'Av. Brasil 2350, Magdalena del Mar, Lima',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
            [
                'razon_social' => 'Universidad Nacional de Investigación S.A.',
                'ruc' => '20345678901',
                'sector' => 'Educación Superior',
                'contacto_principal' => 'Dr. Roberto Silva Mendoza',
                'email' => 'logistica@uni.edu.pe',
                'telefono' => '+51 1 345-6789',
                'direccion' => 'Av. Túpac Amaru 210, Rímac, Lima',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
            [
                'razon_social' => 'Minera Aurífera del Sur S.A.C.',
                'ruc' => '20654321098',
                'sector' => 'Minería',
                'contacto_principal' => 'Ing. Luis Fernando Torres',
                'email' => 'compras@mineraaurifera.com',
                'telefono' => '+51 1 654-3210',
                'direccion' => 'Av. El Derby 250, Surco, Lima',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
            [
                'razon_social' => 'Alimentaria Procesadora S.A.',
                'ruc' => '20876543210',
                'sector' => 'Industria Alimentaria',
                'contacto_principal' => 'Ing. Carmen Rosa Vásquez',
                'email' => 'calidad@alimentaria.pe',
                'telefono' => '+51 1 876-5432',
                'direccion' => 'Av. Colonial 1890, Callao',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
            [
                'razon_social' => 'Farmacéutica Nacional Ltda.',
                'ruc' => '20567890123',
                'sector' => 'Farmacéutico',
                'contacto_principal' => 'Q.F. Patricia Morales',
                'email' => 'procurement@farmanacional.com.pe',
                'telefono' => '+51 1 567-8901',
                'direccion' => 'Av. Arequipa 2850, Lince, Lima',
                'usuario_id' => $usuarioId,
                'activo' => false, // Esta empresa está inactiva
            ],
            [
                'razon_social' => 'Petroquímica del Pacífico S.A.',
                'ruc' => '20234567890',
                'sector' => 'Petroquímica',
                'contacto_principal' => 'Ing. Miguel Ángel Ramos',
                'email' => 'adquisiciones@petropacifico.pe',
                'telefono' => '+51 1 234-5679',
                'direccion' => 'Av. República de Panamá 3000, San Isidro, Lima',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
            [
                'razon_social' => 'Centro de Investigación Biomédica S.A.C.',
                'ruc' => '20765432109',
                'sector' => 'Investigación',
                'contacto_principal' => 'Dr. Fernando Castillo Herrera',
                'email' => 'equipos@cib.org.pe',
                'telefono' => '+51 1 765-4321',
                'direccion' => 'Av. Honorio Delgado 430, San Martín de Porres, Lima',
                'usuario_id' => $usuarioId,
                'activo' => true,
            ],
        ];

        foreach ($empresas as $empresa) {
            EmpresaCliente::create($empresa);
        }
    }
}