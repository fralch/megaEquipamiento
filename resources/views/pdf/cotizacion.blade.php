<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cotización {{ $cotizacion->numero }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Configuración página A4 vertical */
        @page {
            size: A4 portrait;
            margin: 22mm 14mm 24mm 14mm; /* espacio adicional para header/footer fijos */
        }

        /* Reset básico compatible con motores PDF */
        * { box-sizing: border-box; }
        html, body { padding: 0; margin: 0; }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            color: #1f2937; /* gris 800 */
            line-height: 1.4;
        }

        /* Header fijo (logo destacado) */
        .pdf-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 70px; /* ~ 18mm */
            padding: 8px 14mm 0 14mm;
        }
        .pdf-header .h-wrap { width: 100%; display: table; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
        .pdf-header .h-left { display: table-cell; width: 45%; vertical-align: middle; }
        .pdf-header .h-right { display: table-cell; width: 55%; vertical-align: middle; text-align: right; }
        .brand-logo {
            display: inline-block;
            padding: 6px 10px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: #ffffff;
        }
        .brand-logo img {
            max-height: 48px;
            max-width: 240px;
            object-fit: contain;
        }
        .empresa-nombre {
            font-size: 16px;
            font-weight: bold;
            color: #111827; /* gris 900 */
            margin-bottom: 4px;
        }
        .empresa-datos { color: #6b7280; font-size: 9px; line-height: 1.3; }

        /* Footer fijo (numeración + nota) */
        .pdf-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px; /* ~ 16mm */
            padding: 6px 14mm 8px 14mm;
            color: #6b7280;
            font-size: 8.5px;
            border-top: 1px solid #e5e7eb;
        }
        .pdf-footer .f-wrap { display: table; width: 100%; }
        .f-left { display: table-cell; width: 70%; vertical-align: middle; }
        .f-right { display: table-cell; width: 30%; vertical-align: middle; text-align: right; }
        .pagenum:before { content: counter(page) " / " counter(pages); }

        /* Contenido con margen compensado por header/footer fijos */
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 0 0;
        }
        .content {
            padding: 86px 10mm 70px 10mm; /* deja espacio para header/footer fijos y agrega margen lateral */
        }

        /* Título de cotización */
        .cotizacion-titulo {
            text-align: center;
            background: #2563eb;
            color: #ffffff;
            padding: 10px 12px;
            margin: 8px 0 16px 0;
            font-size: 14px;
            font-weight: bold;
            border-radius: 4px;
            letter-spacing: .3px;
        }

        /* Bloques de información (grid tabla para compatibilidad) */
        .info-grid { display: table; width: 100%; table-layout: fixed; margin-bottom: 12px; }
        .info-col { display: table-cell; width: 50%; vertical-align: top; padding: 0 6px; }
        .info-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
            page-break-inside: avoid;
        }
        .info-box h3 {
            font-size: 11px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 8px 0;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
        }
        .info-row { margin-bottom: 4px; }
        .info-label { display: inline-block; min-width: 88px; color: #4b5563; font-weight: bold; }
        .info-value { color: #1f2937; }

        /* Secciones */
        .section {
            margin: 16px 0;
            page-break-inside: avoid;
        }
        .section-title {
            background: #3b82f6;
            color: #ffffff;
            padding: 8px 10px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 4px;
            margin-bottom: 10px;
        }

        /* Lista de productos (tarjetizado compacto y consistente en PDF) */
        .producto {
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
            background: #ffffff;
            page-break-inside: avoid;
            display: table;
            width: 100%;
            table-layout: fixed;
        }
        .producto-imagen {
            display: table-cell;
            width: 80px;
            vertical-align: top;
            padding-right: 10px;
            text-align: center; /* centra el contenido dentro de la celda */
            height: 70px; /* fija alto del contenedor para centrar */
        }
        .producto-imagen img {
            max-width: 70px;
            max-height: 70px;
            width: auto;
            height: auto;
            object-fit: contain; /* mantiene proporciones sin recortar */
            background: #ffffff; /* mejora visibilidad en imágenes con transparencia */
            display: block;
            margin: 0 auto; /* centra la imagen */
            border: 1px solid #e5e7eb;
            border-radius: 4px;
        }
        /* Imagen destacada para el producto con mayor subtotal */
        .producto-imagen--grande { width: 120px; height: 120px; }
        .producto-imagen--grande img { max-width: 120px; max-height: 120px; }
        .producto-contenido {
            display: table-cell;
            vertical-align: top;
        }
        .producto-header { margin-bottom: 10px; }
        .producto-nombre { font-size: 12px; font-weight: bold; color: #111827; margin-bottom: 4px; }
        .producto-sku { color: #6b7280; font-size: 10px; font-weight: normal; }
        .producto-desc {
            font-size: 10px;
            color: #374151;
            margin: 8px 0;
            line-height: 1.5;
            text-align: justify;
            background: #f9fafb;
            padding: 8px 10px;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
        }
        .producto-precios {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 8px;
        }
        .precio-chip { display: inline-block; margin-right: 12px; font-size: 10px; }
        .precio-label { color: #4b5563; font-weight: bold; }
        .precio-value { color: #111827; }

        /* Especificaciones técnicas */
        .especificaciones {
            margin-top: 10px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
        }
        .especificaciones h4 {
            font-size: 11px;
            margin: 0 0 8px 0;
            color: #111827;
            font-weight: bold;
            padding-bottom: 6px;
            border-bottom: 2px solid #3b82f6;
        }
        .spec-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
        }
        .spec-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }
        .spec-table tr:last-child td {
            border-bottom: none;
        }
        .spec-table td:first-child {
            width: 35%;
            font-weight: bold;
            color: #374151;
            background: #f9fafb;
        }
        .spec-table td:last-child {
            color: #1f2937;
            line-height: 1.4;
        }

        /* Tabla adicionales */
        table.table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th {
            background: #f3f4f6;
            color: #374151;
            padding: 8px;
            text-align: left;
            font-size: 10px;
            border: 1px solid #e5e7eb;
        }
        .table td {
            padding: 8px;
            border: 1px solid #e5e7eb;
            font-size: 9.5px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        /* Totales */
        .totales {
            margin-top: 14px;
            page-break-inside: avoid;
        }
        .totales-grid { display: table; width: 100%; table-layout: fixed; }
        .totales-left { display: table-cell; width: 55%; vertical-align: top; padding-right: 8px; }
        .totales-right { display: table-cell; width: 45%; vertical-align: top; }
        .total-row { display: table; width: 100%; padding: 6px 0; }
        .total-label { display: table-cell; text-align: right; padding-right: 10px; color: #4b5563; font-size: 10px; vertical-align: middle; }
        .total-value { display: table-cell; text-align: right; font-size: 10px; font-weight: bold; color: #111827; vertical-align: middle; }
        .total-final {
            background: #2563eb;
            color: #ffffff;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .total-final .total-label,
        .total-final .total-value { color: #ffffff; font-size: 12px; }

        /* Condiciones / Notas */
        .condiciones {
            margin-top: 14px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
            page-break-inside: avoid;
        }
        .condiciones h3 {
            font-size: 11px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 8px 0;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
        }
        .cond-row { display: table; width: 100%; margin-bottom: 6px; }
        .cond-label { display: table-cell; width: 32%; font-weight: bold; color: #4b5563; padding-right: 8px; vertical-align: top; }
        .cond-value { display: table-cell; color: #1f2937; }

        /* Firma (mejor posición y presencia) */
        .firma-wrap {
            margin-top: 18px;
            page-break-inside: avoid;
            width: 100%;
        }
        .firma-right {
            width: 60%;
            margin-left: 40%; /* ancla a la derecha */
            text-align: center;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px 10px 10px 10px;
            background: #ffffff;
        }
        .firma-imagen {
            max-width: 170px;
            max-height: 70px;
            object-fit: contain;
            margin: 0 auto 6px auto;
            display: block;
        }
        .firma-linea {
            border-top: 1.8px solid #111827;
            width: 70%;
            margin: 10px auto 6px auto;
        }
        .firma-nombre { font-weight: bold; color: #111827; font-size: 10.5px; }
        .firma-cargo { font-size: 9px; color: #6b7280; }

        /* Utilidades */
        .mt-4 { margin-top: 4px; } .mt-6 { margin-top: 6px; }
        .mt-8 { margin-top: 8px; } .mt-10 { margin-top: 10px; }
        .mb-0 { margin-bottom: 0; }
        .avoid-break { page-break-inside: avoid; }
    </style>
</head>
<body>

    {{-- HEADER FIJO --}}
    <div class="pdf-header">
        <div class="h-wrap">
            <div class="h-left">
                @if($empresa && !empty($empresa['imagen_logo']))
                    <span class="brand-logo">
                        <img src="{{ public_path($empresa['imagen_logo']) }}" alt="Logo {{ $empresa['nombre'] ?? 'Empresa' }}">
                    </span>
                @endif
            </div>
            <div class="h-right">
                <div class="empresa-nombre">{{ $empresa['nombre'] ?? '—' }}</div>
                <div class="empresa-datos">
                    @if($empresa)
                        RUC: {{ $empresa['ruc'] ?? '—' }} ·
                        Email: {{ $empresa['email'] ?? '—' }} ·
                        Tel: {{ $empresa['telefono'] ?? '—' }}
                    @endif
                </div>
            </div>
        </div>
    </div>

    {{-- FOOTER FIJO --}}
    <div class="pdf-footer">
        <div class="f-wrap">
            <div class="f-left">
                Este documento es una cotización formal. Válido hasta
                {{ \Carbon\Carbon::parse($cotizacion->fecha_vencimiento)->format('d/m/Y') }}.
                {{ $empresa['nombre'] ?? '' }} — RUC {{ $empresa['ruc'] ?? '' }}
            </div>
            <div class="f-right">
                Página <span class="pagenum"></span>
            </div>
        </div>
    </div>

    {{-- CONTENIDO --}}
    <div class="container">
        <div class="content">

            {{-- TÍTULO --}}
            <div class="cotizacion-titulo">
                COTIZACIÓN {{ $cotizacion->numero }}
            </div>

            {{-- INFO CLIENTE / COTIZACIÓN --}}
            <div class="info-grid">
                <div class="info-col">
                    <div class="info-box">
                        <h3>INFORMACIÓN DEL CLIENTE</h3>

                        <div class="info-row">
                            <span class="info-label">{{ $cliente->tipo == 'empresa' ? 'Razón Social:' : 'Nombre:' }}</span>
                            <span class="info-value">{{ $cliente->nombre }}</span>
                        </div>

                        @if($cliente->tipo == 'empresa')
                            <div class="info-row">
                                <span class="info-label">RUC:</span>
                                <span class="info-value">{{ $cliente->ruc ?? '—' }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Contacto:</span>
                                <span class="info-value">{{ $cliente->contacto ?? '—' }}</span>
                            </div>
                        @else
                            <div class="info-row">
                                <span class="info-label">DNI/RUC:</span>
                                <span class="info-value">{{ $cliente->ruc_dni ?? '—' }}</span>
                            </div>
                        @endif

                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ $cliente->email ?? '—' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Teléfono:</span>
                            <span class="info-value">{{ $cliente->telefono ?? '—' }}</span>
                        </div>
                        @if(!empty($cliente->direccion) && $cliente->direccion !== 'N/A')
                            <div class="info-row">
                                <span class="info-label">Dirección:</span>
                                <span class="info-value">{{ $cliente->direccion }}</span>
                            </div>
                        @endif
                    </div>
                </div>

                <div class="info-col">
                    <div class="info-box">
                        <h3>DATOS DE LA COTIZACIÓN</h3>

                        <div class="info-row">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">{{ \Carbon\Carbon::parse($cotizacion->fecha_cotizacion)->format('d/m/Y') }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Vencimiento:</span>
                            <span class="info-value">{{ \Carbon\Carbon::parse($cotizacion->fecha_vencimiento)->format('d/m/Y') }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Moneda:</span>
                            <span class="info-value">{{ $cotizacion->moneda == 'dolares' ? 'Dólares (USD)' : 'Soles (PEN)' }}</span>
                        </div>
                        @if($cotizacion->moneda == 'dolares' && $cotizacion->tipo_cambio)
                            <div class="info-row">
                                <span class="info-label">Tipo Cambio:</span>
                                <span class="info-value">S/ {{ number_format($cotizacion->tipo_cambio, 3) }}</span>
                            </div>
                        @endif
                    </div>

                    <div class="info-box mt-8">
                        <h3>VENDEDOR</h3>
                        <div class="info-row">
                            <span class="info-label">Nombre:</span>
                            <span class="info-value">{{ $vendedor->nombre ?? '—' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ $vendedor->correo ?? '—' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            {{-- PRODUCTOS --}}
            <div class="section">
                <div class="section-title">PRODUCTOS COTIZADOS</div>

                @php
                    $maxProductoIndex = null;
                    $maxSubtotal = -1;
                    foreach($productos as $idx => $p) {
                        $val = isset($p['subtotal']) ? (float) $p['subtotal'] : 0;
                        if ($val > $maxSubtotal) { $maxSubtotal = $val; $maxProductoIndex = $idx; }
                    }
                @endphp

                @foreach($productos as $producto)
                    <div class="producto">
                        {{-- Imagen del producto --}}
                        <div class="producto-imagen {{ $loop->index === $maxProductoIndex ? 'producto-imagen--grande' : '' }}">
                            @if(!empty($producto['imagen']))
                                <img src="{{ $producto['imagen'] }}" alt="{{ $producto['nombre'] }}" onerror="this.style.display='none'">
                            @else
                                <div style="width: 70px; height: 70px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 8px; text-align: center;">
                                    Sin imagen
                                </div>
                            @endif
                        </div>

                        {{-- Contenido del producto --}}
                        <div class="producto-contenido">
                            <div class="producto-header">
                                <div class="producto-nombre">
                                    {{ $producto['nombre'] }}
                                    @if(!empty($producto['sku']))
                                        <span class="producto-sku"> (SKU: {{ $producto['sku'] }})</span>
                                    @endif
                                </div>

                                <div class="producto-precios">
                                    <span class="precio-chip">
                                        <span class="precio-label">Cantidad: </span>
                                        <span class="precio-value">{{ $producto['cantidad'] }}</span>
                                    </span>
                                    <span class="precio-chip">
                                        <span class="precio-label">Precio Unit.: </span>
                                        <span class="precio-value">
                                            {{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }}
                                            {{ number_format((float) $producto['precio_unitario'], 2, '.', ',') }}
                                        </span>
                                    </span>
                                    <span class="precio-chip">
                                        <span class="precio-label">Subtotal: </span>
                                        <span class="precio-value">
                                            {{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }}
                                            {{ number_format((float) $producto['subtotal'], 2, '.', ',') }}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {{-- Descripción completa del producto --}}
                            @if(!empty($producto['descripcion']))
                                <div class="producto-desc">
                                    <strong>Descripción:</strong><br>
                                    {{ $producto['descripcion'] }}
                                </div>
                            @endif

                            {{-- Especificaciones técnicas completas --}}
                            @if(!empty($producto['especificaciones']) && is_array($producto['especificaciones']) && count($producto['especificaciones']) > 0)
                                <div class="especificaciones">
                                    <h4>Especificaciones Técnicas</h4>
                                    <table class="spec-table">
                                        @foreach($producto['especificaciones'] as $key => $value)
                                            <tr>
                                                <td>{{ ucfirst(str_replace('_', ' ', $key)) }}</td>
                                                <td>{{ $value }}</td>
                                            </tr>
                                        @endforeach
                                    </table>
                                </div>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>

            {{-- ADICIONALES --}}
            @if(!empty($productos_adicionales) && count($productos_adicionales) > 0)
                <div class="section avoid-break">
                    <div class="section-title">PRODUCTOS / SERVICIOS ADICIONALES</div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="width: 14%;" class="text-center">Imagen</th>
                                <th>Descripción</th>
                                <th class="text-center" style="width: 12%;">Cantidad</th>
                                <th class="text-right" style="width: 18%;">Precio Unit.</th>
                                <th class="text-right" style="width: 18%;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($productos_adicionales as $adicional)
                                <tr>
                                    <td class="text-center" style="width: 80px;">
                                        @if(!empty($adicional['imagen']))
                                            <img src="{{ $adicional['imagen'] }}" alt="{{ $adicional['nombre'] }}"
                                                 style="max-width:70px; max-height:70px; width:auto; height:auto; object-fit:contain; background:#ffffff; border:1px solid #e5e7eb; border-radius:4px; display:block; margin:0 auto;" />
                                        @else
                                            <span style="color:#6b7280;">Sin imagen</span>
                                        @endif
                                    </td>
                                    <td>
                                        <div style="font-weight:bold; color:#111827;">{{ $adicional['nombre'] }}</div>
                                        @if(!empty($adicional['descripcion']))
                                            <div class="producto-desc" style="margin-top:6px;">
                                                <strong>Descripción:</strong><br>
                                                {{ $adicional['descripcion'] }}
                                            </div>
                                        @endif
                                    </td>
                                    <td class="text-center">{{ $adicional['cantidad'] }}</td>
                                    <td class="text-right">
                                        {{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }}
                                        {{ number_format((float) $adicional['precio_unitario'], 2, '.', ',') }}
                                    </td>
                                    <td class="text-right">
                                        {{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }}
                                        {{ number_format((float) $adicional['subtotal'], 2, '.', ',') }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif

            {{-- TOTALES --}}
            <div class="totales">
                <div class="totales-grid">
                    <div class="totales-left">
                        {{-- espacio reservado por si deseas términos rápidos o sello --}}
                    </div>
                    <div class="totales-right">
                        <div class="total-row">
                            <div class="total-label">Subtotal Productos:</div>
                            <div class="total-value">
                                {{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }}
                                {{ number_format((float) $cotizacion->total_monto_productos, 2, '.', ',') }}
                            </div>
                        </div>
                        @if(($cotizacion->total_adicionales_monto ?? 0) > 0)
                            <div class="total-row">
                                <div class="total-label">Subtotal Adicionales:</div>
                                <div class="total-value">
                                    {{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }}
                                    {{ number_format((float) $cotizacion->total_adicionales_monto, 2, '.', ',') }}
                                </div>
                            </div>
                        @endif
                        <div class="total-row total-final">
                            <div class="total-label">TOTAL</div>
                            <div class="total-value">
                                {{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }}
                                {{ number_format((float) $cotizacion->total, 2, '.', ',') }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- CONDICIONES --}}
            @if($cotizacion->entrega || $cotizacion->lugar_entrega || $cotizacion->garantia || $cotizacion->forma_pago)
                <div class="condiciones">
                    <h3>CONDICIONES COMERCIALES</h3>

                    @if($cotizacion->entrega)
                        <div class="cond-row">
                            <div class="cond-label">Tiempo de Entrega:</div>
                            <div class="cond-value">{{ $cotizacion->entrega }}</div>
                        </div>
                    @endif

                    @if($cotizacion->lugar_entrega)
                        <div class="cond-row">
                            <div class="cond-label">Lugar de Entrega:</div>
                            <div class="cond-value">{{ $cotizacion->lugar_entrega }}</div>
                        </div>
                    @endif

                    @if($cotizacion->garantia)
                        <div class="cond-row">
                            <div class="cond-label">Garantía:</div>
                            <div class="cond-value">{{ $cotizacion->garantia }}</div>
                        </div>
                    @endif

                    @if($cotizacion->forma_pago)
                        <div class="cond-row">
                            <div class="cond-label">Forma de Pago:</div>
                            <div class="cond-value">{{ $cotizacion->forma_pago }}</div>
                        </div>
                    @endif
                </div>
            @endif

            {{-- NOTAS --}}
            @if(!empty($cotizacion->notas))
                <div class="condiciones">
                    <h3>NOTAS ADICIONALES</h3>
                    <div>{{ $cotizacion->notas }}</div>
                </div>
            @endif

            {{-- FIRMA (anclada derecha, caja con borde) --}}
            <div class="firma-wrap">
                <div class="firma-right">
                    @if($empresa && !empty($empresa['imagen_firma']))
                        <img class="firma-imagen"
                             src="{{ public_path($empresa['imagen_firma']) }}"
                             alt="Firma {{ $vendedor->nombre ?? 'Vendedor' }}">
                    @endif
                    <div class="firma-linea"></div>
                    <div class="firma-nombre">{{ $vendedor->nombre ?? '—' }}</div>
                    <div class="firma-cargo">{{ $empresa['nombre'] ?? '—' }}</div>
                </div>
            </div>

        </div>
    </div>
</body>
</html>
