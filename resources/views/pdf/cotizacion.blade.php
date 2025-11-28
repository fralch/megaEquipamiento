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
            margin-top: 60px; /* Aumentado para evitar superposición */
            clear: both;
            page-break-inside: avoid; /* Evita que se corte el footer */
        }
        
        /* Sección de totales mejorada */
        .totals-section {
            margin-bottom: 40px; /* Espacio reservado antes del footer */
            clear: both;
        }
        
        /* Contenedor de firma centrado */
        .signature-container {
            text-align: center;
            margin: 30px 0;
            padding: 20px 0;
            min-height: 140px; /* Altura mínima reservada para la firma */
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .signature-container img {
            display: block;
            margin: 0 auto;
            max-width: 300px;
            max-height: 120px;
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
            width: 100%;
            text-align: center;
        }
        
        .brand-logo img {
            width: 95%; /* Ocupar el 90% del ancho disponible */
            max-width: 100%;
            height: auto; /* Mantener proporción */
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
        
        /* Mejoras en tablas para mejor legibilidad */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 8px; /* Espacio después de las tablas */
        }
        .table, .table th, .table td {
            border: 1px solid #ccc;
        }
        .table th, .table td {
            padding: 6px; /* Aumentado para mejor legibilidad */
            text-align: left;
            vertical-align: top; /* Alineación vertical mejorada */
        }
        
        /* Tabla para especificaciones técnicas mejorada */
        .spec-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 12px; /* Espacio después de especificaciones */
        }
        .spec-table td {
            border: 1px solid #ccc;
            padding: 4px; /* Ligeramente aumentado */
            font-size: 12px;
            vertical-align: top;
        }
        .spec-table td:first-child {
            font-weight: bold;
            width: 30%;
            background-color: #f8f9fa;
        }
        
        /* Clases de utilidad mejoradas */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .bg-dark { background-color: #2c3e50; color: #fff; }
        .bg-red { background-color: #ff0000; color: #fff; }
        
        /* Imágenes de productos con mejor espaciado */
        .product-image {
            text-align: center;
            padding: 15px 0; /* Aumentado para mejor separación */
            margin: 10px 0; /* Margen adicional */
        }
        .product-image img {
            max-width: 280px;
            max-height: 280px;
            border-radius: 5px; /* Bordes redondeados sutiles */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Sombra sutil */
        }
        
        /* Títulos de sección mejorados */
        .section-title {
            font-weight: bold;
            color: red;
            margin-top: 15px; /* Aumentado para mejor separación */
            margin-bottom: 8px; /* Aumentado para mejor separación */
            padding: 3px 0; /* Padding adicional */
            border-bottom: 1px solid #ddd; /* Línea sutil de separación */
        }

        /* Para evitar que el contenido se solape en saltos de página */
        .page-break {
            page-break-before: always;
        }
        
        /* Salto de página suave para productos */
        .page-break-soft {
            page-break-after: auto;
            page-break-inside: avoid;
        }

        /* Estilos para párrafos y texto */
        p {
            margin: 4px 0;
            line-height: 1.3;
        }
        
        /* Contenedor de producto mejorado */
        .product-container {
            /* Permitir que el contenido se divida entre páginas para evitar espacios en blanco grandes */
            page-break-inside: auto;
            margin-bottom: 20px; /* Aumentado para mejor separación */
            padding: 5px 0; /* Padding adicional */
        }
        /* Mantener título con el primer bloque de contenido */
        .product-title {
            page-break-after: avoid;
        }
        
        .product-title {
            background-color: #2c3e50;
            color: white;
            padding: 8px; /* Aumentado para mejor apariencia */
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            border-radius: 3px;
            margin-bottom: 5px; /* Separación del contenido */
        }
        
        .product-content {
            padding: 10px 4px; /* Aumentado padding vertical */
            background-color: #fafafa; /* Fondo sutil para mejor legibilidad */
            border-radius: 3px;
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
                   
                </div>
            </div>
            

            
            <!-- Información comercial -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <div style="margin-bottom: 3px;"><span class="font-bold">RUC:</span> {{ $empresa['ruc'] ?? '—' }}</div>
                    </td>
                    <td style="width: 50%; vertical-align: top;">
                        <div style="margin-bottom: 3px; color: black;"><span class="font-bold">NUMERO DE COTIZACIÓN:</span><span style="color: red;"> {{ $cotizacion->numero }}</span></div>
                    </td>
                </tr>
            </table>

         <hr>

            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <div style="margin-bottom: 3px;"><span class="font-bold">ASESOR COMERCIAL:</span> {{ $vendedor->nombre ?? '—' }}</div>
                        <div style="margin-bottom: 3px;"><span class="font-bold">TELEFONO:</span> {{ $vendedor->telefono ?? '—' }}</div>
                        <div style="margin-bottom: 3px;"><span class="font-bold">CORREO:</span> {{ $vendedor->correo ?? '—' }}</div>
                        <div style="margin-bottom: 3px;"><span class="font-bold">FECHA:</span> {{ \Carbon\Carbon::parse($cotizacion->fecha_cotizacion)->format('d/m/Y') }}</div>
                        <div style="margin-bottom: 3px;"><span class="font-bold">VALIDEZ:</span> Válido hasta {{ \Carbon\Carbon::parse($cotizacion->fecha_vencimiento)->format('d/m/Y') }}</div>
                    </td>
                    <td style="width: 50%; vertical-align: top;">
                        <div style="margin-bottom: 3px;"><span class="font-bold">CLIENTE:</span> {{ $cliente->nombre }}</div>
                        @if($cliente->tipo == 'empresa')
                            <div style="margin-bottom: 3px;"><span class="font-bold">CONTACTO:</span> {{ $cliente->contacto ?? '—' }}</div>
                        @endif
                        <div style="margin-bottom: 3px;"><span class="font-bold">CORREO:</span> {{ $cliente->email ?? '—' }}</div>
                        <div style="margin-bottom: 3px;"><span class="font-bold">TELEFONO:</span> {{ $cliente->telefono ?? '—' }}</div>
                        <div style="margin-bottom: 3px;"><span class="font-bold">RUC:</span> {{ $cliente->ruc ?? $cliente->ruc_dni ?? '—' }}</div>
                    </td>
                </tr>
            </table>
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
                    @php
                        $imgInfo = $producto['imagen'] ?? null;
                        $esUrl = filter_var($imgInfo, FILTER_VALIDATE_URL);
                        $esBase64 = \Illuminate\Support\Str::startsWith($imgInfo, 'data:image');
                        $existeArchivo = !$esUrl && !$esBase64 && !empty($imgInfo) && file_exists($imgInfo) && is_file($imgInfo);
                        $mostrarImagen = !empty($imgInfo) && ($esUrl || $esBase64 || $existeArchivo);
                    @endphp

                    @if($mostrarImagen)
                        <div class="product-image">
                            <img src="{{ $imgInfo }}" alt="">
                        </div>
                    @endif

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
            {{-- Eliminar salto de página forzado entre productos para permitir flujo natural --}}
        @endforeach

        {{-- Sección de productos adicionales --}}
        @if(isset($productos_adicionales) && count($productos_adicionales) > 0)
            @foreach($productos_adicionales as $producto_adicional)
                <div class="product-container">
                    <div class="product-title">
                        {{ $producto_adicional['nombre'] }}
                    </div>
                    <div class="product-content">
                        @php
                            $imgInfoAdicional = $producto_adicional['imagen'] ?? null;
                            $esUrlAdicional = filter_var($imgInfoAdicional, FILTER_VALIDATE_URL);
                            $esBase64Adicional = \Illuminate\Support\Str::startsWith($imgInfoAdicional, 'data:image');
                            $existeArchivoAdicional = !$esUrlAdicional && !$esBase64Adicional && !empty($imgInfoAdicional) && file_exists($imgInfoAdicional) && is_file($imgInfoAdicional);
                            $mostrarImagenAdicional = !empty($imgInfoAdicional) && ($esUrlAdicional || $esBase64Adicional || $existeArchivoAdicional);
                        @endphp

                        @if($mostrarImagenAdicional)
                            <div class="product-image">
                                <img src="{{ $imgInfoAdicional }}" alt="">
                            </div>
                        @endif

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
                {{-- Eliminar salto de página forzado entre productos adicionales para permitir flujo natural --}}
            @endforeach
        @endif

        <div class="totals-section">
            <div class="page-break">
                @php
                    $monedaSymbol = $cotizacion->moneda == 'dolares' ? '$' : 'S/';
                    $totalGeneral = $productos->sum('subtotal');
                    if(isset($productos_adicionales)) {
                        $totalGeneral += $productos_adicionales->sum('subtotal');
                    }
                    $igv = $totalGeneral * 0.18;
                    $totalFinal = $totalGeneral + $igv;
                @endphp
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
                            <td class="text-right font-bold">{{ $monedaSymbol }} {{ number_format((float) $totalGeneral, 2) }}</td>
                        </tr>
                    </tbody>
                </table>
                <br>
                <div class="font-bold" style="padding: 4px; background-color: #f2f2f2;">TOTALES</div>
                <table class="table" style="width: 50%; float: right; margin-bottom: 20px;">
                    <tbody>
                        <tr>
                            <td class="font-bold">SUBTOTAL</td>
                            <td class="text-right">{{ $monedaSymbol }} {{ number_format((float) $totalGeneral, 2) }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold">IGV (18%)</td>
                            <td class="text-right">{{ $monedaSymbol }} {{ number_format((float) $igv, 2) }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold bg-dark">TOTAL</td>
                            <td class="text-right font-bold bg-dark">{{ $monedaSymbol }} {{ number_format((float) $totalFinal, 2) }}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="clear: both;"></div> <!-- Limpia el float para evitar superposiciones -->
            </div>
        </div>

        <!-- Footer - Solo al final del documento -->
        <div class="footer">
            @if($empresa && !empty($empresa['imagen_firma']))
                <div class="signature-container">
                    <img src="{{ public_path($empresa['imagen_firma']) }}" alt="Firma">
                </div>
            @endif
            
            <div style="text-align:left; font-size:12px; border-top: 1px solid #ccc; padding-top: 12px;">
                <p class="font-bold" style="margin: 0.5px 0;">Entrega: {{ $cotizacion->entrega }}</p>
                <p class="font-bold" style="margin: 0.5px 0;">Lugar de entrega: {{ $cotizacion->lugar_entrega }}</p>
                <p class="font-bold" style="margin: 0.5px 0;">Garantia: {{ $cotizacion->garantia }}</p>
                <p class="font-bold" style="margin: 0.5px 0;">Forma de pago: {{ $cotizacion->forma_pago }}</p>
                <p class="font-bold" style="margin: 0.5px 0;">Despacho: A TODO EL PERU Y LATINOAMERICA</p>
                <p class="font-bold" style="margin: 0.5px 0;">N° DE CUENTA SOLES: BCP 193-9939241-0-72 CCI: 00219300993924107218</p>
                <p class="font-bold" style="margin: 0.5px 0;">N° DE CUENTA DOLARES: BCP 193-9918677-1-64 CCI: 00219300991867716410</p>
                <p class="font-bold" style="margin: 0.5px 0;">N° DE CUENTA DETRACCIÓN: 00-059-167324</p>
                <p class="font-bold" style="margin: 0.5px 0;">PROVEEDOR DEL ESTADO PERUANO: REGISTRO VENTAS Y SERVICIOS EN LA OSCE</p>
            </div>
        </div>
    </div>

</body>
</html>
