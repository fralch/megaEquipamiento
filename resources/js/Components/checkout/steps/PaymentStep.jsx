import React, { useState } from 'react';
import { useCheckout } from '../../../storage/CheckoutContext';
import { useCurrency } from '../../../storage/CurrencyContext';

const PaymentStep = ({ onComplete, initialData, orderData, isDarkMode }) => {
    const { checkoutState, updateCustomerData } = useCheckout();
    const { formatPrice } = useCurrency();
    const [selectedPayment, setSelectedPayment] = useState(initialData?.method || null);
    const [paymentData, setPaymentData] = useState({
        // Transferencia bancaria
        bankAccount: initialData?.bankAccount || '',
        
        // Opciones
        requestInvoice: initialData?.requestInvoice || false
    });
    
    // Obtener datos de facturación del contexto
    const billingData = {
        billingAddress: checkoutState.customerData?.address || '',
        billingName: checkoutState.customerData?.fullName || '',
        documentType: checkoutState.customerData?.rucDni?.length === 11 ? 'ruc' : 'dni',
        documentNumber: checkoutState.customerData?.rucDni || '',
        company: checkoutState.customerData?.company || '',
        email: checkoutState.customerData?.email || ''
    };

    const paymentMethods = [
        {
            id: 'transfer',
            name: 'Transferencia bancaria',
            description: 'BCP, BBVA, Scotiabank, Interbank',
            icon: 'bank',
            processingTime: '1-2 días hábiles',
            fees: 'Sin comisiones'
        },
        {
            id: 'yape',
            name: 'Yape',
            description: 'Pago con código QR',
            icon: 'mobile',
            processingTime: 'Inmediato',
            fees: 'Sin comisiones'
        },
        {
            id: 'plin',
            name: 'Plin',
            description: 'Pago con código QR',
            icon: 'mobile',
            processingTime: 'Inmediato',
            fees: 'Sin comisiones'
        }
    ];

    // formatCurrency moved to CurrencyContext

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

    const getPaymentIcon = (iconType) => {
        const icons = {
            bank: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            mobile: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            )
        };
        return icons[iconType] || icons.bank;
    };

    const handlePaymentSelect = (method) => {
        setSelectedPayment(method.id);
    };

    const handleInputChange = (field, value) => {
        // Si es un campo de facturación, actualizar el contexto
        if (['documentNumber', 'documentType', 'company', 'email'].includes(field)) {
            if (field === 'documentNumber') {
                updateCustomerData({ rucDni: value });
            } else if (field === 'company') {
                updateCustomerData({ company: value });
            } else if (field === 'email') {
                updateCustomerData({ email: value });
            }
        } else {
            setPaymentData(prev => ({ ...prev, [field]: value }));
        }
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!selectedPayment) {
            return;
        }

        // Validaciones básicas
        if (!billingData.documentNumber) {
            return;
        }

        const finalPaymentData = {
            method: selectedPayment,
            ...paymentData,
            ...billingData,
            totals
        };

        onComplete(finalPaymentData);
    };

    const renderPaymentForm = () => {
        switch (selectedPayment) {
            case 'transfer':
                return (
                    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                        <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            Datos para transferencia bancaria
                        </h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Banco:</span>
                                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>BCP</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Cuenta corriente:</span>
                                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>194-123456789-0-12</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>CCI:</span>
                                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>002-194-123456789012-34</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Titular:</span>
                                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>MEGA EQUIPAMIENTO SAC</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Monto a transferir:</span>
                                <span className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>{formatPrice(totals.total)}</span>
                            </div>
                        </div>
                        <div className={`mt-4 p-4 rounded-lg border-2 border-blue-500 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                            <p className={`text-sm font-medium flex items-center ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                <span className="text-lg mr-2">📧</span>
                                <span>
                                    Envía el comprobante de transferencia a:{' '}
                                    <span className="font-bold">pagos@megaequipamiento.com</span>
                                </span>
                            </p>
                        </div>
                    </div>
                );
                
            case 'yape':
            case 'plin':
                return (
                    <div className={`p-6 rounded-lg border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-200'}`}>
                        <div className="mb-4">
                            <div className={`w-48 h-48 mx-auto rounded-lg border-2 border-dashed flex items-center justify-center ${
                                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                            }`}>
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5m3 0h6m-9 4h2m3 0h2M4 16h5m3 0h6m-9 4h2m3 0h2" />
                                    </svg>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Código QR se generará
                                        <br />después de confirmar
                                    </p>
                                </div>
                            </div>
                        </div>
                        <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            Pago con {selectedPayment === 'yape' ? 'Yape' : 'Plin'}
                        </h4>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Monto a pagar: <span className="font-semibold">{formatPrice(totals.total)}</span>
                        </p>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                💡 El código QR se mostrará después de confirmar tu pedido
                            </p>
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Método de pago
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    Selecciona tu método de pago preferido
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Métodos de pago */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Selección de método de pago */}
                    <div className="space-y-4">
                        {paymentMethods.map((method) => {
                            const isSelected = selectedPayment === method.id;
                            
                            return (
                                <div
                                    key={method.id}
                                    className={`
                                        p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                        ${isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : isDarkMode
                                                ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }
                                    `}
                                    onClick={() => handlePaymentSelect(method)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-lg ${
                                                isSelected
                                                    ? 'bg-blue-500 text-white'
                                                    : isDarkMode
                                                        ? 'bg-gray-700 text-gray-300'
                                                        : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {getPaymentIcon(method.icon)}
                                            </div>
                                            
                                            <div>
                                                <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                    {method.name}
                                                </h3>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {method.description}
                                                </p>
                                                <div className="flex space-x-4 mt-1">
                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        ⏱️ {method.processingTime}
                                                    </span>
                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        💳 {method.fees}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300'
                                        }`}>
                                            {isSelected && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Formulario de pago */}
                    {selectedPayment && (
                        <form onSubmit={handleSubmit} className={`p-6 rounded-lg border ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                Detalles de pago
                            </h3>
                            
                            {renderPaymentForm()}
                            
                            {/* Datos de facturación */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Datos de facturación
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Tipo de documento *
                                        </label>
                                        <select
                                            value={billingData.documentType}
                                            onChange={(e) => handleInputChange('documentType', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            <option value="dni">DNI</option>
                                            <option value="ruc">RUC</option>
                                            <option value="passport">Pasaporte</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Número de documento *
                                        </label>
                                        <input
                                            type="text"
                                            value={billingData.documentNumber}
                                            onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                                            placeholder={billingData.documentType === 'dni' ? '12345678' : billingData.documentType === 'ruc' ? '12345678901' : 'A1234567'}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="requestInvoice"
                                            checked={paymentData.requestInvoice}
                                            onChange={(e) => handleInputChange('requestInvoice', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="requestInvoice" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Solicitar factura electrónica
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                Confirmar pago
                            </button>
                        </form>
                    )}
                </div>

                {/* Resumen del pedido */}
                <div className="lg:col-span-1">
                    <div className={`sticky top-4 p-6 rounded-lg border ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Resumen del pedido
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Subtotal:
                                </span>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {formatPrice(totals.subtotal)}
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
                                    {totals.shipping === 0 ? 'GRATIS' : formatPrice(totals.shipping)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    IGV (18%):
                                </span>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {formatPrice(totals.tax)}
                                </span>
                            </div>
                            
                            <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex justify-between">
                                    <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Total:
                                    </span>
                                    <span className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {formatPrice(totals.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Compra segura
                                </span>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Tus datos están protegidos con encriptación SSL de 256 bits
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStep;