<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización {{ $cotizacion->numero }}</title>
    <style>
         /* Configuración para página A4 vertical */
        @page {
            size: A4 portrait;
            margin: 15mm 10mm 15mm 10mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #333;
            line-height: 1.3;
            width: 210mm;
            min-height: 297mm;
        }
        
        .container {
            width: 100%;
            max-width: 190mm; /* Ajustado para A4 con márgenes */
            margin: 0 auto;
            padding: 5mm;
        }

        /* Header con logo y empresa */
        .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10mm;
            margin-bottom: 15mm;
        }
        .header-content {
            display: table;
            width: 100%;
        }
        .logo-section {
            display: table-cell;
            width: 30%;
            vertical-align: middle;
        }
        .logo-section img {
            max-width: 120px;
            max-height: 60px;
            object-fit: contain;
        }
        .empresa-info {
            display: table-cell;
            width: 70%;
            text-align: right;
            vertical-align: middle;
        }
        .empresa-nombre {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 3mm;
        }
        .empresa-datos {
            font-size: 9px;
            color: #6b7280;
            line-height: 1.4;
        }

        /* Título de cotización */
        .cotizacion-titulo {
            text-align: center;
            background: #2563eb;
            color: white;
            padding: 8mm;
            margin: 15mm 0;
            font-size: 14px;
            font-weight: bold;
            border-radius: 3px;
        }

        /* Información en dos columnas */
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 15mm;
        }
        .info-column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 5mm;
        }
        .info-box {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 3px;
            padding: 8mm;
            margin-bottom: 8mm;
        }
        .info-box h3 {
            font-size: 11px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 6mm;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 3mm;
        }
        .info-row {
            margin-bottom: 3mm;
        }
        .info-label {
            font-weight: bold;
            color: #4b5563;
            display: inline-block;
            width: 80px;
        }
        .info-value {
            color: #1f2937;
        }

        /* Tabla de productos */
        .productos-section {
            margin: 15mm 0;
        }
        .section-title {
            background: #3b82f6;
            color: white;
            padding: 6mm 8mm;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8mm;
            border-radius: 2px;
        }

        .producto-item {
            border: 1px solid #e5e7eb;
            border-radius: 3px;
            padding: 10mm;
            margin-bottom: 10mm;
            background: white;
            page-break-inside: avoid;
        }
        .producto-header {
            display: table;
            width: 100%;
            margin-bottom: 8mm;
        }
        .producto-imagen {
            display: table-cell;
            width: 100px;
            vertical-align: top;
            padding-right: 10mm;
        }
        .producto-imagen img {
            max-width: 80px;
            max-height: 80px;
            border: 1px solid #e5e7eb;
            border-radius: 3px;
            object-fit: contain;
        }
        .producto-info {
            display: table-cell;
            vertical-align: top;
        }
        .producto-nombre {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 3mm;
        }
        .producto-descripcion {
            font-size: 9px;
            color: #6b7280;
            margin-bottom: 6mm;
            line-height: 1.4;
        }
        .producto-precios {
            background: #f9fafb;
            padding: 6mm;
            border-radius: 2px;
            margin-top: 6mm;
        }
        .precio-item {
            display: inline-block;
            margin-right: 10mm;
            font-size: 10px;
        }
        .precio-label {
            font-weight: bold;
            color: #4b5563;
        }
        .precio-value {
            color: #1f2937;
        }

        /* Especificaciones técnicas */
        .especificaciones {
            margin-top: 8mm;
            border-top: 1px dashed #d1d5db;
            padding-top: 8mm;
        }
        .especificaciones h4 {
            font-size: 10px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 4mm;
        }
        .especificaciones table {
            width: 100%;
            font-size: 9px;
        }
        .especificaciones td {
            padding: 2mm 6mm;
            border-bottom: 1px solid #f3f4f6;
        }
        .especificaciones td:first-child {
            font-weight: bold;
            color: #4b5563;
            width: 40%;
        }
        .especificaciones td:last-child {
            color: #1f2937;
        }

        /* Productos adicionales */
        .adicionales-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8mm;
        }
        .adicionales-table th {
            background: #f3f4f6;
            color: #374151;
            padding: 6mm;
            text-align: left;
            font-size: 10px;
            border: 1px solid #e5e7eb;
        }
        .adicionales-table td {
            padding: 6mm;
            border: 1px solid #e5e7eb;
            font-size: 9px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }

        /* Resumen de totales */
        .totales {
            margin-top: 15mm;
            border-top: 2px solid #2563eb;
            padding-top: 10mm;
            page-break-inside: avoid;
        }
        .totales-grid {
            display: table;
            width: 100%;
        }
        .totales-left {
            display: table-cell;
            width: 60%;
            vertical-align: top;
        }
        .totales-right {
            display: table-cell;
            width: 40%;
            vertical-align: top;
        }
        .total-row {
            display: table;
            width: 100%;
            padding: 3mm 0;
        }
        .total-label {
            display: table-cell;
            text-align: right;
            padding-right: 10mm;
            font-size: 10px;
            color: #4b5563;
        }
        .total-value {
            display: table-cell;
            text-align: right;
            font-size: 10px;
            font-weight: bold;
            color: #1f2937;
        }
        .total-final {
            background: #2563eb;
            color: white;
            padding: 8mm;
            border-radius: 3px;
            margin-top: 8mm;
        }
        .total-final .total-label,
        .total-final .total-value {
            color: white;
            font-size: 12px;
        }

        /* Condiciones comerciales */
        .condiciones {
            margin-top: 15mm;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 3px;
            padding: 8mm;
            page-break-inside: avoid;
        }
        .condiciones h3 {
            font-size: 11px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 6mm;
        }
        .condiciones-grid {
            display: table;
            width: 100%;
        }
        .condicion-item {
            display: table-row;
        }
        .condicion-label {
            display: table-cell;
            font-weight: bold;
            color: #4b5563;
            padding: 3mm 8mm 3mm 0;
            width: 30%;
        }
        .condicion-value {
            display: table-cell;
            color: #1f2937;
            padding: 3mm 0;
        }

        /* Firma */
        .firma-section {
            margin-top: 30mm;
            text-align: center;
            page-break-inside: avoid;
        }
        .firma-imagen {
            max-width: 150px;
            max-height: 60px;
            margin: 0 auto 8mm;
            object-fit: contain;
        }
        .firma-linea {
            border-top: 2px solid #1f2937;
            width: 200px;
            margin: 20mm auto 8mm;
        }
        .firma-nombre {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 2mm;
        }
        .firma-cargo {
            font-size: 9px;
            color: #6b7280;
        }

        /* Footer */
        .footer {
            margin-top: 20mm;
            padding-top: 10mm;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="container">u
        <!-- Header con Empresa -->
        <div class="header">
            <div class="header-content">
                <div class="empresa-info" style="width: 100%; text-align: center;">
                    @if($empresa && $empresa['imagen_logo'])
                        <div style="text-align: center; margin-bottom: 10px;">
                            <img src="{{ public_path($empresa['imagen_logo']) }}" 
                                 alt="Logo {{ $empresa['nombre'] ?? 'Empresa' }}" 
                                 style="max-height: 80px; max-width: 200px; height: auto;">
                        </div>
                    @endif
                    <div class="empresa-nombre">{{ $empresa['nombre'] ?? 'N/A' }}</div>
                    <div class="empresa-datos">
                        @if($empresa)
                            <div><strong>RUC:</strong> {{ $empresa['ruc'] }}</div>
                            <div><strong>Email:</strong> {{ $empresa['email'] }}</div>
                            <div><strong>Teléfono:</strong> {{ $empresa['telefono'] }}</div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- Título de Cotización -->
        <div class="cotizacion-titulo">
            COTIZACIÓN {{ $cotizacion->numero }}
        </div>

        <!-- Información del Cliente y Cotización -->
        <div class="info-grid">
            <!-- Columna Izquierda - Cliente -->
            <div class="info-column">
                <div class="info-box">
                    <h3>INFORMACIÓN DEL CLIENTE</h3>
                    <div class="info-row">
                        <span class="info-label">{{ $cliente->tipo == 'empresa' ? 'Razón Social:' : 'Nombre:' }}</span>
                        <span class="info-value">{{ $cliente->nombre }}</span>
                    </div>
                    @if($cliente->tipo == 'empresa')
                        <div class="info-row">
                            <span class="info-label">RUC:</span>
                            <span class="info-value">{{ $cliente->ruc ?? 'N/A' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Contacto:</span>
                            <span class="info-value">{{ $cliente->contacto }}</span>
                        </div>
                    @else
                        <div class="info-row">
                            <span class="info-label">DNI/RUC:</span>
                            <span class="info-value">{{ $cliente->ruc_dni ?? 'N/A' }}</span>
                        </div>
                    @endif
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ $cliente->email }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">{{ $cliente->telefono }}</span>
                    </div>
                    @if($cliente->direccion != 'N/A')
                        <div class="info-row">
                            <span class="info-label">Dirección:</span>
                            <span class="info-value">{{ $cliente->direccion }}</span>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Columna Derecha - Datos de Cotización -->
            <div class="info-column">
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

                <div class="info-box">
                    <h3>VENDEDOR</h3>
                    <div class="info-row">
                        <span class="info-label">Nombre:</span>
                        <span class="info-value">{{ $vendedor->nombre ?? 'N/A' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ $vendedor->correo ?? 'N/A' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Productos -->
        <div class="productos-section">
            <div class="section-title">PRODUCTOS COTIZADOS</div>

            @foreach($productos as $producto)
                <div class="producto-item">
                    <div class="producto-header">
                        <div class="producto-info" style="width: 100%;">
                            <div class="producto-nombre">
                                {{ $producto['nombre'] }}
                                @if($producto['sku'])
                                    <span style="color: #6b7280; font-size: 11px; font-weight: normal;"> (SKU: {{ $producto['sku'] }})</span>
                                @endif
                            </div>
                            @if($producto['descripcion'])
                                <div class="producto-descripcion">{{ $producto['descripcion'] }}</div>
                            @endif
                            <div class="producto-precios">
                                <div class="precio-item">
                                    <span class="precio-label">Cantidad:</span>
                                    <span class="precio-value">{{ $producto['cantidad'] }}</span>
                                </div>
                                <div class="precio-item">
                                    <span class="precio-label">Precio Unit.:</span>
                                    <span class="precio-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float)$producto['precio_unitario'], 2, '.', ',') }}</span>
                                </div>
                                <div class="precio-item">
                                    <span class="precio-label">Subtotal:</span>
                                    <span class="precio-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float)$producto['subtotal'], 2, '.', ',') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    @if(!empty($producto['especificaciones']) && is_array($producto['especificaciones']) && count($producto['especificaciones']) > 0)
                        <div class="especificaciones">
                            <h4>Especificaciones Técnicas:</h4>
                            <table>
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
            @endforeach
        </div>

        <!-- Productos Adicionales -->
        @if($productos_adicionales && count($productos_adicionales) > 0)
            <div class="productos-section">
                <div class="section-title">PRODUCTOS/SERVICIOS ADICIONALES</div>
                <table class="adicionales-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th class="text-center" style="width: 15%;">Cantidad</th>
                            <th class="text-right" style="width: 20%;">Precio Unit.</th>
                            <th class="text-right" style="width: 20%;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($productos_adicionales as $adicional)
                            <tr>
                                <td>{{ $adicional->nombre }}</td>
                                <td class="text-center">{{ $adicional->cantidad }}</td>
                                <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float)$adicional->precio_unitario, 2, '.', ',') }}</td>
                                <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float)$adicional->subtotal, 2, '.', ',') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        <!-- Totales -->
        <div class="totales">
            <div class="totales-grid">
                <div class="totales-left"></div>
                <div class="totales-right">
                    <div class="total-row">
                        <div class="total-label">Subtotal Productos:</div>
                        <div class="total-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float)$cotizacion->total_monto_productos, 2, '.', ',') }}</div>
                    </div>
                    @if($cotizacion->total_adicionales_monto > 0)
                        <div class="total-row">
                            <div class="total-label">Subtotal Adicionales:</div>
                            <div class="total-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float)$cotizacion->total_adicionales_monto, 2, '.', ',') }}</div>
                        </div>
                    @endif
                    <div class="total-row total-final">
                        <div class="total-label">TOTAL:</div>
                        <div class="total-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format((float)$cotizacion->total, 2, '.', ',') }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Condiciones Comerciales -->
        @if($cotizacion->entrega || $cotizacion->lugar_entrega || $cotizacion->garantia || $cotizacion->forma_pago)
            <div class="condiciones">
                <h3>CONDICIONES COMERCIALES</h3>
                <div class="condiciones-grid">
                    @if($cotizacion->entrega)
                        <div class="condicion-item">
                            <div class="condicion-label">Tiempo de Entrega:</div>
                            <div class="condicion-value">{{ $cotizacion->entrega }}</div>
                        </div>
                    @endif
                    @if($cotizacion->lugar_entrega)
                        <div class="condicion-item">
                            <div class="condicion-label">Lugar de Entrega:</div>
                            <div class="condicion-value">{{ $cotizacion->lugar_entrega }}</div>
                        </div>
                    @endif
                    @if($cotizacion->garantia)
                        <div class="condicion-item">
                            <div class="condicion-label">Garantía:</div>
                            <div class="condicion-value">{{ $cotizacion->garantia }}</div>
                        </div>
                    @endif
                    @if($cotizacion->forma_pago)
                        <div class="condicion-item">
                            <div class="condicion-label">Forma de Pago:</div>
                            <div class="condicion-value">{{ $cotizacion->forma_pago }}</div>
                        </div>
                    @endif
                </div>
            </div>
        @endif

        <!-- Notas -->
        @if($cotizacion->notas)
            <div class="condiciones" style="margin-top: 15px;">
                <h3>NOTAS ADICIONALES</h3>
                <div style="padding: 5px 0;">{{ $cotizacion->notas }}</div>
            </div>
        @endif

        <!-- Firma -->
        <div class="firma-section">
            @if($empresa && $empresa['imagen_firma'])
                <div style="text-align: center; margin-bottom: 10px;">
                    <img src="{{ public_path($empresa['imagen_firma']) }}" 
                         alt="Firma {{ $vendedor->nombre ?? 'Vendedor' }}" 
                         style="max-height: 60px; max-width: 150px; height: auto;">
                </div>
            @endif
            <div class="firma-linea"></div>
            <div class="firma-nombre">{{ $vendedor->nombre ?? 'N/A' }}</div>
            <div class="firma-cargo">{{ $empresa['nombre'] ?? 'Vendedor' }}</div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Este documento es una cotización formal. Válido hasta {{ \Carbon\Carbon::parse($cotizacion->fecha_vencimiento)->format('d/m/Y') }}</p>
            <p>{{ $empresa['nombre'] ?? '' }} - {{ $empresa['ruc'] ?? '' }}</p>
        </div>
    </div>
</body>
</html>
