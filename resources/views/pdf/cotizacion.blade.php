<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización {{ $cotizacion->numero }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header con logo y empresa */
        .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
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
            max-width: 150px;
            max-height: 80px;
            object-fit: contain;
        }
        .empresa-info {
            display: table-cell;
            width: 70%;
            text-align: right;
            vertical-align: middle;
        }
        .empresa-nombre {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .empresa-datos {
            font-size: 10px;
            color: #6b7280;
            line-height: 1.6;
        }

        /* Título de cotización */
        .cotizacion-titulo {
            text-align: center;
            background: #2563eb;
            color: white;
            padding: 10px;
            margin: 20px 0;
            font-size: 16px;
            font-weight: bold;
            border-radius: 5px;
        }

        /* Información en dos columnas */
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .info-column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 10px;
        }
        .info-box {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 12px;
            margin-bottom: 10px;
        }
        .info-box h3 {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 4px;
        }
        .info-row {
            margin-bottom: 5px;
        }
        .info-label {
            font-weight: bold;
            color: #4b5563;
            display: inline-block;
            width: 100px;
        }
        .info-value {
            color: #1f2937;
        }

        /* Tabla de productos */
        .productos-section {
            margin: 20px 0;
        }
        .section-title {
            background: #3b82f6;
            color: white;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 10px;
            border-radius: 3px;
        }

        .producto-item {
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            background: white;
            page-break-inside: avoid;
        }
        .producto-header {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        .producto-imagen {
            display: table-cell;
            width: 120px;
            vertical-align: top;
            padding-right: 15px;
        }
        .producto-imagen img {
            max-width: 100px;
            max-height: 100px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            object-fit: contain;
        }
        .producto-info {
            display: table-cell;
            vertical-align: top;
        }
        .producto-nombre {
            font-size: 13px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .producto-descripcion {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 8px;
            line-height: 1.5;
        }
        .producto-precios {
            background: #f9fafb;
            padding: 8px;
            border-radius: 3px;
            margin-top: 8px;
        }
        .precio-item {
            display: inline-block;
            margin-right: 15px;
            font-size: 11px;
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
            margin-top: 10px;
            border-top: 1px dashed #d1d5db;
            padding-top: 10px;
        }
        .especificaciones h4 {
            font-size: 11px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
        }
        .especificaciones table {
            width: 100%;
            font-size: 10px;
        }
        .especificaciones td {
            padding: 3px 8px;
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
            margin-top: 10px;
        }
        .adicionales-table th {
            background: #f3f4f6;
            color: #374151;
            padding: 8px;
            text-align: left;
            font-size: 11px;
            border: 1px solid #e5e7eb;
        }
        .adicionales-table td {
            padding: 8px;
            border: 1px solid #e5e7eb;
            font-size: 10px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }

        /* Resumen de totales */
        .totales {
            margin-top: 20px;
            border-top: 2px solid #2563eb;
            padding-top: 15px;
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
            padding: 5px 0;
        }
        .total-label {
            display: table-cell;
            text-align: right;
            padding-right: 15px;
            font-size: 11px;
            color: #4b5563;
        }
        .total-value {
            display: table-cell;
            text-align: right;
            font-size: 11px;
            font-weight: bold;
            color: #1f2937;
        }
        .total-final {
            background: #2563eb;
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .total-final .total-label,
        .total-final .total-value {
            color: white;
            font-size: 14px;
        }

        /* Condiciones comerciales */
        .condiciones {
            margin-top: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 12px;
        }
        .condiciones h3 {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
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
            padding: 4px 10px 4px 0;
            width: 30%;
        }
        .condicion-value {
            display: table-cell;
            color: #1f2937;
            padding: 4px 0;
        }

        /* Firma */
        .firma-section {
            margin-top: 40px;
            text-align: center;
            page-break-inside: avoid;
        }
        .firma-imagen {
            max-width: 200px;
            max-height: 80px;
            margin: 0 auto 10px;
            object-fit: contain;
        }
        .firma-linea {
            border-top: 2px solid #1f2937;
            width: 250px;
            margin: 30px auto 10px;
        }
        .firma-nombre {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 3px;
        }
        .firma-cargo {
            font-size: 10px;
            color: #6b7280;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header con Logo y Empresa -->
        <div class="header">
            <div class="header-content">
                <div class="logo-section">
                    @if($empresa && $empresa->imagen_logo)
                        <img src="{{ public_path($empresa->imagen_logo) }}" alt="Logo {{ $empresa->nombre }}">
                    @endif
                </div>
                <div class="empresa-info">
                    <div class="empresa-nombre">{{ $empresa->nombre ?? 'N/A' }}</div>
                    <div class="empresa-datos">
                        @if($empresa)
                            <div><strong>RUC:</strong> {{ $empresa->ruc }}</div>
                            <div><strong>Email:</strong> {{ $empresa->email }}</div>
                            <div><strong>Teléfono:</strong> {{ $empresa->telefono }}</div>
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
                        <span class="info-value">{{ $vendedor->nombre }} {{ $vendedor->apellido }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ $vendedor->correo }}</span>
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
                        @if($producto['imagen'])
                            <div class="producto-imagen">
                                <img src="{{ $producto['imagen'] }}" alt="{{ $producto['nombre'] }}">
                            </div>
                        @endif
                        <div class="producto-info">
                            <div class="producto-nombre">{{ $producto['nombre'] }}</div>
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
                                    <span class="precio-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format($producto['precio_unitario'], 2) }}</span>
                                </div>
                                <div class="precio-item">
                                    <span class="precio-label">Subtotal:</span>
                                    <span class="precio-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format($producto['subtotal'], 2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    @if(!empty($producto['especificaciones']) && is_array($producto['especificaciones']))
                        <div class="especificaciones">
                            <h4>Especificaciones Técnicas:</h4>
                            <table>
                                @foreach($producto['especificaciones'] as $key => $value)
                                    @if(!is_array($value))
                                        <tr>
                                            <td>{{ ucfirst(str_replace('_', ' ', $key)) }}</td>
                                            <td>{{ $value }}</td>
                                        </tr>
                                    @endif
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
                                <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format($adicional->precio_unitario, 2) }}</td>
                                <td class="text-right">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format($adicional->subtotal, 2) }}</td>
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
                        <div class="total-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format($cotizacion->total_monto_productos, 2) }}</div>
                    </div>
                    @if($cotizacion->total_adicionales_monto > 0)
                        <div class="total-row">
                            <div class="total-label">Subtotal Adicionales:</div>
                            <div class="total-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format($cotizacion->total_adicionales_monto, 2) }}</div>
                        </div>
                    @endif
                    <div class="total-row total-final">
                        <div class="total-label">TOTAL:</div>
                        <div class="total-value">{{ $cotizacion->moneda == 'dolares' ? '$' : 'S/' }} {{ number_format($cotizacion->total, 2) }}</div>
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
        @if($empresa && $empresa->imagen_firma)
            <div class="firma-section">
                <img class="firma-imagen" src="{{ public_path($empresa->imagen_firma) }}" alt="Firma">
                <div class="firma-linea"></div>
                <div class="firma-nombre">{{ $vendedor->nombre }} {{ $vendedor->apellido }}</div>
                <div class="firma-cargo">{{ $empresa->nombre }}</div>
            </div>
        @else
            <div class="firma-section">
                <div class="firma-linea"></div>
                <div class="firma-nombre">{{ $vendedor->nombre }} {{ $vendedor->apellido }}</div>
                <div class="firma-cargo">{{ $empresa->nombre ?? 'Vendedor' }}</div>
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>Este documento es una cotización formal. Válido hasta {{ \Carbon\Carbon::parse($cotizacion->fecha_vencimiento)->format('d/m/Y') }}</p>
            <p>{{ $empresa->nombre ?? '' }} - {{ $empresa->ruc ?? '' }}</p>
        </div>
    </div>
</body>
</html>
