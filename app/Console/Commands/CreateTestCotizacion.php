<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Cotizacion;
use App\Models\DetalleCotizacion;
use App\Models\Cliente;
use App\Models\Usuario;
use App\Models\NuestraEmpresa;
use Carbon\Carbon;

class CreateTestCotizacion extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-test-cotizacion';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test quotation for PDF testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating test quotation...');

        // Get or create test user (admin)
        $usuario = Usuario::where('correo', 'admin@megaequipamiento.com')->first();
        if (!$usuario) {
            $this->error('Admin user not found. Please run php artisan app:create-test-user first.');
            return;
        }

        // Create or get test client
        $cliente = Cliente::firstOrCreate(
            ['email' => 'cliente.test@example.com'],
            [
                'nombrecompleto' => 'Cliente de Prueba PDF',
                'telefono' => '+51 999 888 777',
                'direccion' => 'Av. Test 123, Lima, Perú',
                'ruc_dni' => '12345678',
                'usuario_id' => $usuario->id_usuario
            ]
        );

        // Create or get test company
        $empresa = NuestraEmpresa::firstOrCreate(
            ['ruc' => '20123456789'],
            [
                'nombre' => 'MegaEquipamiento SAC',
                'email' => 'info@megaequipamiento.com',
                'telefono' => '987654321',
                'ruc' => '20123456789',
                'id_usuario' => $usuario->id_usuario,
            ]
        );

        // Create test quotation
        $cotizacion = Cotizacion::create([
            'numero' => 'COT-2025-TEST-001',
            'fecha_cotizacion' => Carbon::now(),
            'fecha_vencimiento' => Carbon::now()->addDays(30),
            'entrega' => '15 días hábiles',
            'lugar_entrega' => 'Lima, Perú - Oficinas del cliente',
            'garantia' => '12 meses contra defectos de fabricación',
            'forma_pago' => '50% adelanto, 50% contra entrega',
            'cliente_id' => $cliente->id,
            'cliente_tipo' => 'particular',
            'usuario_id' => $usuario->id_usuario,
            'miempresa_id' => $empresa->id,
            'moneda' => 'soles',
            'tipo_cambio' => 1.0,
            'total_monto_productos' => 15500.00,
            'total_adicionales_monto' => 2500.00,
            'total' => 18000.00,
            'estado' => 'pendiente',
            'notas' => 'Esta es una cotización de prueba para verificar el formato PDF. Incluye múltiples productos y servicios adicionales para probar el diseño completo.'
        ]);

        // Create product details
        DetalleCotizacion::create([
            'cotizacion_id' => $cotizacion->id,
            'producto_id' => null,
            'tipo' => 'producto',
            'nombre' => 'Microscopio Binocular Profesional',
            'descripcion' => 'Microscopio binocular con objetivos 4x, 10x, 40x y 100x. Incluye iluminación LED y condensador Abbe.',
            'cantidad' => 2,
            'precio_unitario' => 4500.00,
            'subtotal' => 9000.00
        ]);

        DetalleCotizacion::create([
            'cotizacion_id' => $cotizacion->id,
            'producto_id' => null,
            'tipo' => 'producto',
            'nombre' => 'Balanza Analítica Digital',
            'descripcion' => 'Balanza de precisión 0.1mg, capacidad 220g. Calibración interna automática.',
            'cantidad' => 1,
            'precio_unitario' => 3200.00,
            'subtotal' => 3200.00
        ]);

        DetalleCotizacion::create([
            'cotizacion_id' => $cotizacion->id,
            'producto_id' => null,
            'tipo' => 'producto',
            'nombre' => 'Centrífuga de Mesa',
            'descripcion' => 'Centrífuga para tubos de 15ml y 50ml. Velocidad máxima 4000 RPM.',
            'cantidad' => 1,
            'precio_unitario' => 3300.00,
            'subtotal' => 3300.00
        ]);

        // Create additional services
        DetalleCotizacion::create([
            'cotizacion_id' => $cotizacion->id,
            'producto_id' => null,
            'tipo' => 'adicional',
            'nombre' => 'Instalación y Puesta en Marcha',
            'descripcion' => 'Servicio de instalación profesional y capacitación básica del personal.',
            'cantidad' => 1,
            'precio_unitario' => 1500.00,
            'subtotal' => 1500.00
        ]);

        DetalleCotizacion::create([
            'cotizacion_id' => $cotizacion->id,
            'producto_id' => null,
            'tipo' => 'adicional',
            'nombre' => 'Mantenimiento Preventivo (1 año)',
            'descripcion' => 'Programa de mantenimiento preventivo con 4 visitas anuales.',
            'cantidad' => 1,
            'precio_unitario' => 1000.00,
            'subtotal' => 1000.00
        ]);

        $this->info("Test quotation created successfully!");
        $this->info("Quotation ID: {$cotizacion->id}");
        $this->info("Quotation Number: {$cotizacion->numero}");
        $this->info("You can now test the PDF at: /crm/cotizaciones/{$cotizacion->id}/export-pdf");
    }
}
