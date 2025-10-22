<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cotización {{ $cotizacion->numero }}</title>
    <style>
        @page {
            margin: 8mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        /* Bordes fijos que se repiten en cada página */
        .page-border {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid #000;
            border-radius: 8px;
            pointer-events: none;
            z-index: 9999;
        }
        
        /* Header ESTÁTICO - Solo primera página */
        .header {
            padding: 5px 8px;
            background: white;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        /* Footer - Solo al final del documento */
        .footer {
            text-align: left;
            background: white;
            padding: 3px 8px;
            margin-top: 20px;
        }
        
        /* Content con padding reducido */
        .content {
            padding: 3px 8px;
            position: relative;
            z-index: 1;
        }
        
        /* CSS Grid para header */
        .header-content {
            display: grid;
            grid-template-rows: auto auto;
            gap: 3px;
        }
        
        .brand-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-bottom: 3px;
        }
        
        .brand-logo {
            margin-bottom: 8px; /* Aumentado para dar más espacio al logo más grande */
        }
        
        .brand-logo img {
            max-width: 500px; /* Aumentado de 200px a 500px */
            max-height: 140px; /* Aumentado de 65px a 140px */
            width: auto;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        
        .company-ruc {
            text-align: left;
            margin-top: 3px;
            width: 100%;
        }
        
        /* CSS Grid para información comercial */
        .commercial-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 12px;
            margin-top: 3px;
        }
        
        .info-column {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        
        /* Separador */
        hr {
            margin: 3px 0;
            border: none;
            border-top: 1px solid #333;
        }
        
        /* Tablas solo para datos tabulares */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .table, .table th, .table td {
            border: 1px solid #ccc;
        }
        .table th, .table td {
            padding: 4px;
            text-align: left;
        }
        
        /* Clases de utilidad */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .bg-dark { background-color: #2c3e50; color: #fff; }
        .bg-red { background-color: #ff0000; color: #fff; }
        
        .product-image {
            text-align: center;
            padding: 12px 0;
        }
        .product-image img {
            max-width: 280px;
            max-height: 280px;
        }
        .section-title {
            font-weight: bold;
            color: red;
            margin-top: 12px;
            margin-bottom: 6px;
        }
        
        /* Tabla para especificaciones técnicas */
        .spec-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .spec-table td {
            border: 1px solid #ccc;
            padding: 3px;
            font-size: 12px;
        }
        .spec-table td:first-child {
            font-weight: bold;
            width: 30%;
            background-color: #f8f9fa;
        }

        /* Para evitar que el contenido se solape en saltos de página */
        .page-break {
            page-break-before: always;
        }

        /* Estilos para párrafos y texto */
        p {
            margin: 4px 0;
            line-height: 1.3;
        }
        
        /* Contenedor de producto */
        .product-container {
            page-break-inside: avoid;
            margin-bottom: 15px;
        }
        
        .product-title {
            background-color: #2c3e50;
            color: white;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            border-radius: 3px;
        }
        
        .product-content {
            padding: 8px 4px;
        }
    </style>
</head>
<body>
    <!-- Borde que se repite en todas las páginas -->
    <div class="page-border"></div>

    <!-- Header estático - SOLO en primera página -->
    <div class="header">
        <div class="header-content" id="empresa-data">
            <!-- Sección de empresa -->
            <div id="header-empresa">
                <div class="brand-section">
                    @if($empresa && !empty($empresa['imagen_logo']))
                        <div class="brand-logo">
                            <img src="{{ public_path($empresa['imagen_logo']) }}" alt="Logo">
                        </div>
                    @endif
                   
                    <div class="company-ruc" style="display: flex; justify-content: space-between; font-size: 12px;">
                        <span><span class="font-bold">RUC:</span> {{ $empresa['ruc'] ?? '—' }}</span>
                        <span style="color: red;"><span class="font-bold">NUMERO DE COTIZACIÓN:</span> {{ $cotizacion->numero }}</span>
                    </div>
                </div>
            </div>
            
            <hr>
            
            <!-- Información comercial -->
            <div class="commercial-info">
                <div class="info-column">
                    <span><span class="font-bold">ASESOR COMERCIAL:</span> {{ $vendedor->nombre ?? '—' }}</span>
                    <span><span class="font-bold">TELEFONO:</span> {{ $vendedor->telefono ?? '—' }}</span>
                    <span><span class="font-bold">CORREO:</span> {{ $vendedor->correo ?? '—' }}</span>
                    <span><span class="font-bold">FECHA:</span> {{ \Carbon\Carbon::parse($cotizacion->fecha_cotizacion)->format('d/m/Y') }}</span>
                    <span><span class="font-bold">VALIDEZ:</span> Válido hasta {{ \Carbon\Carbon::parse($cotizacion->fecha_vencimiento)->format('d/m/Y') }}</span>
                </div>
                <div class="info-column">
                    <span><span class="font-bold">CLIENTE:</span> {{ $cliente->nombre }}</span>
                    @if($cliente->tipo == 'empresa')
                        <span><span class="font-bold">CONTACTO:</span> {{ $cliente->contacto ?? '—' }}</span>
                    @endif
                    <span><span class="font-bold">CORREO:</span> {{ $cliente->email ?? '—' }}</span>
                    <span><span class="font-bold">TELEFONO:</span> {{ $cliente->telefono ?? '—' }}</span>
                    <span><span class="font-bold">RUC:</span> {{ $cliente->ruc ?? $cliente->ruc_dni ?? '—' }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Contenido principal -->
    <div class="content">
        @foreach($productos as $producto)
            <div class="product-container">
                <div class="product-title">
                    {{ $producto['nombre'] }}
                </div>
                <div class="product-content">
                    <div class="product-image">
                         @if(!empty($producto['imagen']))
                            <img src="{{ $producto['imagen'] }}" alt="{{ $producto['nombre'] }}">
                        @endif
                    </div>

                    @if(!empty($producto['descripcion']))
                        <div class="section-title">Descripcion:</div>
                        <p style="font-size: 12px; line-height: 1.4; text-align: justify;">{{ $producto['descripcion'] }}</p>
                    @endif

                    @if(!empty($producto['especificaciones']) && is_array($producto['especificaciones']))
                        <div class="section-title">Datos tecnicos:</div>

                        @php
                            // Verificar si es formato con secciones o formato legacy
                            $tieneSecciones = isset($producto['especificaciones']['secciones']) && is_array($producto['especificaciones']['secciones']);
                            $esArrayDirecto = !$tieneSecciones && isset($producto['especificaciones'][0]) && is_array($producto['especificaciones'][0]);
                        @endphp

                        @if($tieneSecciones)
                            {{-- Formato nuevo con secciones --}}
                            @foreach($producto['especificaciones']['secciones'] as $seccion)
                                @if($seccion['tipo'] === 'tabla' && !empty($seccion['datos']))
                                    <table class="spec-table" style="margin-bottom: 8px;">
                                        <thead>
                                            <tr>
                                                @foreach($seccion['datos'][0] as $header)
                                                    <th style="background-color: #2c3e50; color: white; padding: 4px; border: 1px solid #ccc; font-size: 11px;">
                                                        {{ $header }}
                                                    </th>
                                                @endforeach
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach(array_slice($seccion['datos'], 1) as $rowIndex => $row)
                                                <tr style="{{ $rowIndex % 2 === 0 ? 'background-color: #f8f9fa;' : '' }}">
                                                    @foreach($row as $cell)
                                                        <td style="border: 1px solid #ccc; padding: 3px; font-size: 11px;">
                                                            {{ is_array($cell) ? implode(', ', $cell) : $cell }}
                                                        </td>
                                                    @endforeach
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                @elseif($seccion['tipo'] === 'texto' && !empty($seccion['datos']))
                                    <div style="background-color: #f8f9fa; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                                        @foreach($seccion['datos'] as $texto)
                                            <p style="margin: 2px 0; font-size: 11px;">{{ $texto }}</p>
                                        @endforeach
                                    </div>
                                @endif
                            @endforeach
                        @elseif($esArrayDirecto)
                            {{-- Formato legacy (array directo) --}}
                            <table class="spec-table">
                                <thead>
                                    <tr>
                                        @foreach($producto['especificaciones'][0] as $header)
                                            <th style="background-color: #2c3e50; color: white; padding: 4px; border: 1px solid #ccc; font-size: 11px;">
                                                {{ $header }}
                                            </th>
                                        @endforeach
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach(array_slice($producto['especificaciones'], 1) as $rowIndex => $row)
                                        <tr style="{{ $rowIndex % 2 === 0 ? 'background-color: #f8f9fa;' : '' }}">
                                            @foreach($row as $cell)
                                                <td style="border: 1px solid #ccc; padding: 3px; font-size: 11px;">
                                                    {{ is_array($cell) ? implode(', ', $cell) : $cell }}
                                                </td>
                                            @endforeach
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        @endif
                    @endif
                </div>
            </div>
            @if(!$loop->last)
                <div style="page-break-after: always;"></div>
            @endif
        @endforeach

        {{-- Sección de productos adicionales --}}
        @if(isset($productos_adicionales) && count($productos_adicionales) > 0)
            @foreach($productos_adicionales as $producto_adicional)
                <div class="product-container">
                    <div class="product-title">
                        {{ $producto_adicional['nombre'] }}
                    </div>
                    <div class="product-content">
                        <div class="product-image">
                             @if(!empty($producto_adicional['imagen']))
                                <img src="{{ $producto_adicional['imagen'] }}" alt="{{ $producto_adicional['nombre'] }}">
                            @endif
                        </div>

                        @if(!empty($producto_adicional['descripcion']))
                            <div class="section-title">Descripcion:</div>
                            <p style="font-size: 12px; line-height: 1.4; text-align: justify;">{{ $producto_adicional['descripcion'] }}</p>
                        @endif

                        @if(!empty($producto_adicional['especificaciones']) && is_array($producto_adicional['especificaciones']))
                            <div class="section-title">Datos tecnicos:</div>

                            @php
                                // Verificar si es formato con secciones o formato legacy
                                $tieneSecciones = isset($producto_adicional['especificaciones']['secciones']) && is_array($producto_adicional['especificaciones']['secciones']);
                                $esArrayDirecto = !$tieneSecciones && isset($producto_adicional['especificaciones'][0]) && is_array($producto_adicional['especificaciones'][0]);
                            @endphp

                            @if($tieneSecciones)
                                {{-- Formato nuevo con secciones --}}
                                @foreach($producto_adicional['especificaciones']['secciones'] as $seccion)
                                    @if($seccion['tipo'] === 'tabla' && !empty($seccion['datos']))
                                        <table class="spec-table" style="margin-bottom: 8px;">
                                            <thead>
                                                <tr>
                                                    @foreach($seccion['datos'][0] as $header)
                                                        <th style="background-color: #2c3e50; color: white; padding: 4px; border: 1px solid #ccc; font-size: 11px;">
                                                            {{ $header }}
                                                        </th>
                                                    @endforeach
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach(array_slice($seccion['datos'], 1) as $rowIndex => $row)
                                                    <tr style="{{ $rowIndex % 2 === 0 ? 'background-color: #f8f9fa;' : '' }}">
                                                        @foreach($row as $cell)
                                                            <td style="border: 1px solid #ccc; padding: 3px; font-size: 11px;">
                                                                {{ is_array($cell) ? implode(', ', $cell) : $cell }}
                                                            </td>
                                                        @endforeach
                                                    </tr>
                                                @endforeach
                                            </tbody>
                                        </table>
                                    @elseif($seccion['tipo'] === 'texto' && !empty($seccion['datos']))
                                        <div style="background-color: #f8f9fa; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                                            @foreach($seccion['datos'] as $texto)
                                                <p style="margin: 2px 0; font-size: 11px;">{{ $texto }}</p>
                                            @endforeach
                                        </div>
                                    @endif
                                @endforeach
                            @elseif($esArrayDirecto)
                                {{-- Formato legacy (array directo) --}}
                                <table class="spec-table">
                                    <thead>
                                        <tr>
                                            @foreach($producto_adicional['especificaciones'][0] as $header)
                                                <th style="background-color: #2c3e50; color: white; padding: 4px; border: 1px solid #ccc; font-size: 11px;">
                                                    {{ $header }}
                                                </th>
                                            @endforeach
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach(array_slice($producto_adicional['especificaciones'], 1) as $rowIndex => $row)
                                            <tr style="{{ $rowIndex % 2 === 0 ? 'background-color: #f8f9fa;' : '' }}">
                                                @foreach($row as $cell)
                                                    <td style="border: 1px solid #ccc; padding: 3px; font-size: 11px;">
                                                        {{ is_array($cell) ? implode(', ', $cell) : $cell }}
                                                    </td>
                                                @endforeach
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            @endif
                        @endif
                    </div>
                </div>
                @if(!$loop->last)
                    <div style="page-break-after: always;"></div>
                @endif
            @endforeach
        @endif

        <div class="page-break">
            <div class="bg-red text-center font-bold" style="padding: 6px; border-radius: 3px;">
                RESUMEN Y TOTALES
            </div>
            <br>
            <div class="font-bold" style="padding: 4px; background-color: #f2f2f2;">PRODUCTOS</div>
            <table class="table">
                <thead>
                    <tr class="bg-dark">
                        <th>Producto</th>
                        <th class="text-right">Precio</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($productos as $producto)
                    <tr>
                        <td>{{ $producto['nombre'] }}</td>
                        <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float) $producto['precio_unitario'], 2) }}</td>
                        <td class="text-center">{{ $producto['cantidad'] }}</td>
                        <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float) $producto['subtotal'], 2) }}</td>
                    </tr>
                    @endforeach
                    {{-- Agregar productos adicionales al resumen --}}
                    @if(isset($productos_adicionales) && count($productos_adicionales) > 0)
                        @foreach($productos_adicionales as $producto_adicional)
                        <tr>
                            <td>{{ $producto_adicional['nombre'] }}</td>
                            <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float) $producto_adicional['precio_unitario'], 2) }}</td>
                            <td class="text-center">{{ $producto_adicional['cantidad'] }}</td>
                            <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float) $producto_adicional['subtotal'], 2) }}</td>
                        </tr>
                        @endforeach
                    @endif
                    <tr>
                        <td colspan="3" class="text-right font-bold">Total productos</td>
                        <td class="text-right font-bold">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float) $cotizacion->total_monto_productos, 2) }}</td>
                    </tr>
                </tbody>
            </table>
            <br>
            <div class="font-bold" style="padding: 4px; background-color: #f2f2f2;">TOTALES</div>
            <table class="table" style="width: 50%; float: right;">
                <tbody>
                    <tr>
                        <td class="font-bold">SUBTOTAL</td>
                        <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float) $cotizacion->total_monto_productos, 2) }}</td>
                    </tr>
                    <tr>
                        <td class="font-bold">IGV (18%)</td>
                        <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float) $cotizacion->total_monto_productos * 0.18, 2) }}</td>
                    </tr>
                    <tr>
                        <td class="font-bold bg-dark">TOTAL</td>
                        <td class="text-right font-bold bg-dark">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float) $cotizacion->total_monto_productos * 1.18, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Footer - Solo al final del documento -->
        <div class="footer">
            <div style="text-align:left; font-size:12px; border-top: 1px solid #ccc; padding-top: 12px;">
                <p class="font-bold" style="margin: 0.5px 0;">Marcas:</p>
                <p class="font-bold" style="margin: 0.5px 0;">Modelos:</p>
                <p class="font-bold" style="margin: 0.5px 0;">Procedencias:</p>
                <p class="font-bold" style="margin: 0.5px 0;">Entrega: {{ $cotizacion->entrega }}</p>
                <p class="font-bold" style="margin: 0.5px 0;">Lugar de entrega: {{ $cotizacion->lugar_entrega }}</p>
                <p class="font-bold" style="margin: 0.5px 0;">Garantia: {{ $cotizacion->garantia }}</p>
                <p class="font-bold" style="margin: 0.5px 0;">Forma de pago: {{ $cotizacion->forma_pago }}</p>
                <p class="font-bold" style="margin: 0.5px 0;">Despacho:</p>
                <p class="font-bold" style="margin: 0.5px 0;">N° DE CUENTA SOLES:</p>
                <p class="font-bold" style="margin: 0.5px 0;">N° DE CUENTA DOLARES:</p>
                <p class="font-bold" style="margin: 0.5px 0;">N° DE CUENTA DETRACCIÓN:</p>
                <p class="font-bold" style="margin: 0.5px 0;">PROVEEDOR DEL ESTADO PERUANO:</p>
            </div>
        </div>
    </div>

</body>
</html>
