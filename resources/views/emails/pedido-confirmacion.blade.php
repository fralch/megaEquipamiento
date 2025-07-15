<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pedido</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .order-number {
            background-color: #f0f9ff;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
            border-left: 4px solid #2563eb;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
        }
        .info-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
        }
        .info-value {
            color: #6b7280;
        }
        .product-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .product-info {
            flex: 1;
        }
        .product-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .product-quantity {
            color: #6b7280;
            font-size: 14px;
        }
        .product-price {
            font-weight: bold;
            color: #059669;
        }
        .totals {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .total-final {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
        }
        .bank-info {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .bank-title {
            color: #92400e;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 15px;
        }
        .bank-details {
            display: grid;
            gap: 10px;
        }
        .bank-item {
            display: flex;
            justify-content: space-between;
        }
        .bank-label {
            font-weight: bold;
            color: #92400e;
        }
        .bank-value {
            color: #451a03;
            font-family: monospace;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .product-item {
                flex-direction: column;
                align-items: flex-start;
            }
            .product-price {
                margin-top: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MegaEquipamiento</div>
            <p>Confirmación de tu pedido</p>
        </div>

        <div class="order-number">
            <h2 style="margin: 0; color: #2563eb;">Pedido Confirmado</h2>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">{{ $datosPedido['orderNumber'] }}</p>
        </div>

        <!-- Datos del Cliente -->
        <div class="section">
            <h3 class="section-title">Datos del Cliente</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Nombre Completo</div>
                    <div class="info-value">{{ $datosPedido['customerData']['firstName'] ?? '' }} {{ $datosPedido['customerData']['lastName'] ?? '' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">{{ $datosPedido['customerData']['email'] ?? '' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Teléfono</div>
                    <div class="info-value">{{ $datosPedido['customerData']['phone'] ?? '' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Documento</div>
                    <div class="info-value">{{ $datosPedido['customerData']['documentType'] ?? '' }}: {{ $datosPedido['customerData']['documentNumber'] ?? '' }}</div>
                </div>
            </div>
        </div>

        <!-- Dirección de Envío -->
        <div class="section">
            <h3 class="section-title">Dirección de Envío</h3>
            <div class="info-item">
                <div class="info-label">Dirección Completa</div>
                <div class="info-value">
                    {{ $datosPedido['shippingData']['address'] ?? '' }}<br>
                    {{ $datosPedido['shippingData']['city'] ?? '' }}, {{ $datosPedido['shippingData']['state'] ?? '' }}<br>
                    {{ $datosPedido['shippingData']['zipCode'] ?? '' }}
                </div>
            </div>
        </div>

        <!-- Método de Pago -->
        <div class="section">
            <h3 class="section-title">Método de Pago</h3>
            <div class="info-item">
                <div class="info-label">Método Seleccionado</div>
                <div class="info-value">
                    @if(isset($datosPedido['paymentData']['method']))
                        @switch($datosPedido['paymentData']['method'])
                            @case('card')
                                Tarjeta de crédito/débito
                                @break
                            @case('transfer')
                                Transferencia bancaria
                                @break
                            @case('yape')
                                Yape
                                @break
                            @case('plin')
                                Plin
                                @break
                            @default
                                {{ $datosPedido['paymentData']['method'] }}
                        @endswitch
                    @endif
                </div>
            </div>
        </div>

        <!-- Productos -->
        <div class="section">
            <h3 class="section-title">Productos Pedidos</h3>
            @if(isset($datosPedido['orderData']['cartItems']))
                @foreach($datosPedido['orderData']['cartItems'] as $item)
                    <div class="product-item">
                        <div class="product-info">
                            <div class="product-name">{{ $item['title'] ?? 'Producto' }}</div>
                            <div class="product-quantity">Cantidad: {{ $item['quantity'] ?? 1 }}</div>
                        </div>
                        <div class="product-price">
                            S/ {{ number_format(($item['price'] ?? 0) * ($item['quantity'] ?? 1), 2) }}
                        </div>
                    </div>
                @endforeach
            @endif
        </div>

        <!-- Totales -->
        <div class="section">
            <h3 class="section-title">Resumen del Pedido</h3>
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>S/ {{ number_format($datosPedido['totals']['subtotal'] ?? 0, 2) }}</span>
                </div>
                <div class="total-row">
                    <span>Envío:</span>
                    <span>S/ {{ number_format($datosPedido['totals']['shipping'] ?? 0, 2) }}</span>
                </div>
                <div class="total-row">
                    <span>IGV (18%):</span>
                    <span>S/ {{ number_format($datosPedido['totals']['tax'] ?? 0, 2) }}</span>
                </div>
                <div class="total-row total-final">
                    <span>Total:</span>
                    <span>S/ {{ number_format($datosPedido['totals']['total'] ?? 0, 2) }}</span>
                </div>
            </div>
        </div>

        <!-- Información Bancaria -->
        <div class="bank-info">
            <div class="bank-title">📋 Datos Bancarios para Transferencia</div>
            <div class="bank-details">
                <div class="bank-item">
                    <span class="bank-label">Banco:</span>
                    <span class="bank-value">{{ $datosPedido['datosBancarios']['banco'] }}</span>
                </div>
                <div class="bank-item">
                    <span class="bank-label">Titular:</span>
                    <span class="bank-value">{{ $datosPedido['datosBancarios']['titular'] }}</span>
                </div>
                <div class="bank-item">
                    <span class="bank-label">Número de Cuenta:</span>
                    <span class="bank-value">{{ $datosPedido['datosBancarios']['numeroCuenta'] }}</span>
                </div>
                <div class="bank-item">
                    <span class="bank-label">Cuenta Interbancaria:</span>
                    <span class="bank-value">{{ $datosPedido['datosBancarios']['cuentaInterbancaria'] }}</span>
                </div>
                <div class="bank-item">
                    <span class="bank-label">RUC:</span>
                    <span class="bank-value">{{ $datosPedido['datosBancarios']['ruc'] }}</span>
                </div>
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #92400e;">
                <strong>Importante:</strong> Una vez realizada la transferencia, envía el comprobante a {{ $datosPedido['datosBancarios']['email'] }} o comunícate al {{ $datosPedido['datosBancarios']['telefono'] }} para confirmar tu pago.
            </p>
        </div>

        <div class="footer">
            <p>¡Gracias por tu compra!</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p><strong>MegaEquipamiento</strong> | {{ $datosPedido['datosBancarios']['email'] }} | {{ $datosPedido['datosBancarios']['telefono'] }}</p>
        </div>
    </div>
</body>
</html>