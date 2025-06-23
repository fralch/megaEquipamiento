import React, { useState } from 'react';
import { router } from '@inertiajs/react';

const ConfirmStep = ({ orderData, isDarkMode }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(value);
    };

    const calculateTotal = () => {
        const subtotal = orderData?.cartItems?.reduce((sum, item) => {
            return sum + (item.price * (item.quantity || 1));
        }, 0) || 0;
        
        const shippingCost = orderData?.shipping?.option?.price || 0;
        const tax = subtotal * 0.18; // IGV 18%
        
        return {
            subtotal,
            shipping: shippingCost,
            tax,
            total: subtotal + shippingCost + tax
        };
    };

    const totals = calculateTotal();

    const getPaymentMethodName = (method) => {
        const methods = {
            card: 'Tarjeta de crédito/débito',
            transfer: 'Transferencia bancaria',
            yape: 'Yape',
            plin: 'Plin'
        };
        return methods[method] || method;
    };

    const getShippingIcon = (method) => {
        const icons = {
            standard: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            express: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            'same-day': (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        };
        return icons[method] || icons.standard;
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        
        try {
            // Simular procesamiento del pedido
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generar número de orden
            const orderNum = 'ORD-' + Date.now().toString().slice(-8);
            setOrderNumber(orderNum);
            setOrderPlaced(true);
            
            // Aquí iría la llamada real a la API
            // router.post('/orders', orderData);
            
        } catch (error) {
            console.error('Error al procesar el pedido:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleContinueShopping = () => {
        router.visit('/');
    };

    const handleViewOrder = () => {
        router.visit(`/orders/${orderNumber}`);
    };

    if (orderPlaced) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                {/* Confirmación exitosa */}
                <div className={`p-8 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            ¡Pedido confirmado!
                        </h2>
                        
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                            Tu pedido ha sido procesado exitosamente
                        </p>
                        
                        <div className={`inline-flex items-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Número de pedido:
                            </span>
                            <span className={`ml-2 font-mono font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {orderNumber}
                            </span>
                        </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            ¿Qué sigue?
                        </h3>
                        <div className={`text-sm space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                Recibirás un email de confirmación en los próximos minutos
                            </div>
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                Te notificaremos cuando tu pedido sea enviado
                            </div>
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                Puedes rastrear tu pedido en cualquier momento
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleViewOrder}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            Ver mi pedido
                        </button>
                        <button
                            onClick={handleContinueShopping}
                            className={`font-semibold py-3 px-6 rounded-lg border transition-colors duration-200 ${
                                isDarkMode
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Seguir comprando
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Confirmar pedido
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    Revisa los detalles de tu pedido antes de confirmar
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Detalles del pedido */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Productos */}
                    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Productos ({orderData?.cartItems?.length || 0})
                        </h3>
                        
                        <div className="space-y-4">
                            {orderData?.cartItems?.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {item.name}
                                        </h4>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Cantidad: {item.quantity || 1}
                                        </p>
                                    </div>
                                    
                                    <div className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {formatCurrency(item.price * (item.quantity || 1))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dirección de envío */}
                    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Dirección de envío
                        </h3>
                        
                        <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p className="font-medium">{orderData?.address?.fullName}</p>
                            <p>{orderData?.address?.address}</p>
                            <p>{orderData?.address?.district}, {orderData?.address?.city}</p>
                            <p className="mt-2">
                                <span className="font-medium">Teléfono:</span> {orderData?.address?.phone}
                            </p>
                            {orderData?.address?.reference && (
                                <p className="mt-1">
                                    <span className="font-medium">Referencia:</span> {orderData?.address?.reference}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Método de envío */}
                    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Método de envío
                        </h3>
                        
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                {getShippingIcon(orderData?.shipping?.option?.id)}
                            </div>
                            
                            <div>
                                <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    {orderData?.shipping?.option?.name}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {orderData?.shipping?.option?.description}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tiempo estimado: {orderData?.shipping?.option?.estimatedTime}
                                </p>
                                {orderData?.shipping?.deliveryDate && (
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Fecha preferida: {orderData?.shipping?.deliveryDate}
                                    </p>
                                )}
                            </div>
                            
                            <div className={`ml-auto font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                {orderData?.shipping?.option?.price === 0 ? 'GRATIS' : formatCurrency(orderData?.shipping?.option?.price)}
                            </div>
                        </div>
                        
                        {orderData?.shipping?.instructions && (
                            <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <span className="font-medium">Instrucciones especiales:</span> {orderData?.shipping?.instructions}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Método de pago */}
                    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Método de pago
                        </h3>
                        
                        <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p className="font-medium">{getPaymentMethodName(orderData?.payment?.method)}</p>
                            
                            {orderData?.payment?.method === 'card' && (
                                <p className="text-sm mt-1">
                                    **** **** **** {orderData?.payment?.cardNumber?.slice(-4)}
                                </p>
                            )}
                            
                            {orderData?.payment?.method === 'transfer' && (
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Se enviará la información bancaria por email
                                </p>
                            )}
                            
                            {(orderData?.payment?.method === 'yape' || orderData?.payment?.method === 'plin') && (
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Se mostrará el código QR después de confirmar
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resumen del pedido */}
                <div className="lg:col-span-1">
                    <div className={`sticky top-4 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Resumen del pedido
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Subtotal:
                                </span>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {formatCurrency(totals.subtotal)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Envío:
                                </span>
                                <span className={`text-sm ${
                                    totals.shipping === 0
                                        ? 'text-green-600'
                                        : isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                    {totals.shipping === 0 ? 'GRATIS' : formatCurrency(totals.shipping)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    IGV (18%):
                                </span>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {formatCurrency(totals.tax)}
                                </span>
                            </div>
                            
                            <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex justify-between">
                                    <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Total:
                                    </span>
                                    <span className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {formatCurrency(totals.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                            className={`w-full mt-6 font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
                                isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                            } text-white`}
                        >
                            {isProcessing ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </div>
                            ) : (
                                'Confirmar pedido'
                            )}
                        </button>
                        
                        <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                                Al confirmar tu pedido, aceptas nuestros términos y condiciones de venta
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmStep;