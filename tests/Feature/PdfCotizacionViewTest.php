<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Carbon;

class PdfCotizacionViewTest extends TestCase
{
    /** @test */
    public function it_renders_additional_items_with_images_and_descriptions_in_pdf_view()
    {
        $cotizacion = (object) [
            'numero' => 'COT-001',
            'fecha_cotizacion' => Carbon::now()->toDateString(),
            'fecha_vencimiento' => Carbon::now()->addDays(15)->toDateString(),
            'moneda' => 'soles',
            'total_monto_productos' => 0,
            'total_adicionales_monto' => 200,
            'total' => 200,
            'entrega' => null,
            'lugar_entrega' => null,
            'garantia' => null,
            'forma_pago' => null,
            'notas' => null,
        ];

        $productos = [];
        $productos_adicionales = [
            [
                'nombre' => 'Servicio adicional de prueba',
                'descripcion' => 'Descripción larga del servicio.',
                'cantidad' => 2,
                'precio_unitario' => 100,
                'subtotal' => 200,
                'imagen' => 'https://example.com/test.jpg',
            ],
        ];

        $empresa = [ 'nombre' => 'Mi Empresa S.A.' ];
        $cliente = (object) [
            'tipo' => 'persona',
            'nombre' => 'Juan Pérez',
            'ruc_dni' => '12345678',
            'telefono' => '987654321',
            'email' => 'juan@example.com',
            'direccion' => 'Calle Falsa 123',
        ];
        $vendedor = (object) [ 'nombre' => 'Vendedor', 'correo' => 'vend@example.com' ];

        $html = view('pdf.cotizacion', compact('cotizacion', 'productos', 'productos_adicionales', 'empresa', 'cliente', 'vendedor'))
            ->render();

        $this->assertStringContainsString('PRODUCTOS / SERVICIOS ADICIONALES', $html);
        $this->assertStringContainsString('<img src="https://example.com/test.jpg"', $html);
        $this->assertStringContainsString('Servicio adicional de prueba', $html);
        $this->assertStringContainsString('Descripción:', $html);
        $this->assertStringContainsString('Descripción larga del servicio.', $html);
    }

    /** @test */
    public function it_shows_placeholder_when_additional_item_has_no_image()
    {
        $cotizacion = (object) [
            'numero' => 'COT-002',
            'fecha_cotizacion' => Carbon::now()->toDateString(),
            'fecha_vencimiento' => Carbon::now()->addDays(10)->toDateString(),
            'moneda' => 'dolares',
            'tipo_cambio' => 3.500,
            'total_monto_productos' => 0,
            'total_adicionales_monto' => 50,
            'total' => 50,
            'entrega' => null,
            'lugar_entrega' => null,
            'garantia' => null,
            'forma_pago' => null,
        ];

        $productos = [];
        $productos_adicionales = [
            [
                'nombre' => 'Servicio sin imagen',
                'descripcion' => 'Texto de prueba sin imagen.',
                'cantidad' => 1,
                'precio_unitario' => 50,
                'subtotal' => 50,
                'imagen' => null,
            ],
        ];

        $empresa = [ 'nombre' => 'Mi Empresa S.A.' ];
        $cliente = (object) [ 'tipo' => 'persona', 'nombre' => 'Cliente', 'email' => 'c@example.com' ];
        $vendedor = (object) [ 'nombre' => 'Vendedor', 'correo' => 'vend@example.com' ];

        $html = view('pdf.cotizacion', compact('cotizacion', 'productos', 'productos_adicionales', 'empresa', 'cliente', 'vendedor'))
            ->render();

        $this->assertStringContainsString('Sin imagen', $html);
        $this->assertStringContainsString('Servicio sin imagen', $html);
        $this->assertStringContainsString('Texto de prueba sin imagen.', $html);
    }
}