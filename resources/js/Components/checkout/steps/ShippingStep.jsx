import React, { useState, useEffect } from 'react';

const ShippingStep = ({ onComplete, initialData, addressData, isDarkMode }) => {
    const [selectedShipping, setSelectedShipping] = useState(initialData?.id || null);
    const [deliveryDate, setDeliveryDate] = useState(initialData?.deliveryDate || '');
    const [specialInstructions, setSpecialInstructions] = useState(initialData?.specialInstructions || '');

    const shippingOptions = [
        {
            id: 'standard',
            name: 'Envío estándar',
            description: 'Entrega en 3-5 días hábiles',
            price: 0,
            estimatedDays: '3-5',
            icon: 'truck',
            features: ['Seguimiento incluido', 'Seguro básico', 'Entrega en horario laboral']
        },
        {
            id: 'express',
            name: 'Envío express',
            description: 'Entrega en 1-2 días hábiles',
            price: 25,
            estimatedDays: '1-2',
            icon: 'lightning',
            features: ['Seguimiento en tiempo real', 'Seguro completo', 'Entrega prioritaria']
        },
        {
            id: 'same-day',
            name: 'Envío el mismo día',
            description: 'Entrega el mismo día (Lima Metropolitana)',
            price: 45,
            estimatedDays: 'Hoy',
            icon: 'clock',
            features: ['Solo Lima Metropolitana', 'Entrega antes de 8 PM', 'Confirmación por WhatsApp'],
            available: addressData?.city === 'Lima' && ['Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja'].includes(addressData?.district)
        }
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(value);
    };

    const getShippingIcon = (iconType) => {
        const icons = {
            truck: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            lightning: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            clock: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        };
        return icons[iconType] || icons.truck;
    };

    const getEstimatedDeliveryDate = (option) => {
        const today = new Date();
        let deliveryDate = new Date(today);
        
        if (option.id === 'same-day') {
            return 'Hoy antes de las 8:00 PM';
        } else if (option.id === 'express') {
            deliveryDate.setDate(today.getDate() + 1);
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 2);
            return `${deliveryDate.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}`;
        } else {
            deliveryDate.setDate(today.getDate() + 3);
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 5);
            return `${deliveryDate.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}`;
        }
    };

    const handleShippingSelect = (option) => {
        setSelectedShipping(option.id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!selectedShipping) {
            return;
        }

        const selectedOption = shippingOptions.find(opt => opt.id === selectedShipping);
        const shippingData = {
            id: selectedShipping,
            option: selectedOption,
            deliveryDate,
            specialInstructions,
            estimatedDelivery: getEstimatedDeliveryDate(selectedOption)
        };

        onComplete(shippingData);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Opciones de envío
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    Selecciona tu método de envío preferido
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Opciones de envío */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Dirección de envío confirmada */}
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Envío a: {addressData?.fullName}
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {addressData?.address}, {addressData?.district}, {addressData?.city}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Opciones de envío */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {shippingOptions.map((option) => {
                            const isAvailable = option.available !== false;
                            const isSelected = selectedShipping === option.id;
                            
                            return (
                                <div
                                    key={option.id}
                                    className={`
                                        relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200
                                        ${!isAvailable
                                            ? 'opacity-50 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : isDarkMode
                                                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                        }
                                    `}
                                    onClick={() => isAvailable && handleShippingSelect(option)}
                                >
                                    {!isAvailable && (
                                        <div className="absolute top-4 right-4">
                                            <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded-full">
                                                No disponible
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={`p-3 rounded-lg ${
                                                isSelected
                                                    ? 'bg-blue-500 text-white'
                                                    : isDarkMode
                                                        ? 'bg-gray-700 text-gray-300'
                                                        : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {getShippingIcon(option.icon)}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                        {option.name}
                                                    </h3>
                                                    <span className={`text-lg font-bold ${
                                                        option.price === 0
                                                            ? 'text-green-600'
                                                            : isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                                    }`}>
                                                        {option.price === 0 ? 'GRATIS' : formatCurrency(option.price)}
                                                    </span>
                                                </div>
                                                
                                                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {option.description}
                                                </p>
                                                
                                                <div className="mb-3">
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Fecha estimada: {getEstimatedDeliveryDate(option)}
                                                    </p>
                                                </div>
                                                
                                                <ul className="space-y-1">
                                                    {option.features.map((feature, index) => (
                                                        <li key={index} className={`text-sm flex items-center space-x-2 ${
                                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-4 ${
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

                        {/* Fecha de entrega preferida */}
                        {selectedShipping && selectedShipping !== 'same-day' && (
                            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Fecha de entrega preferida (opcional)
                                </label>
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    min={new Date(Date.now() + (selectedShipping === 'express' ? 86400000 : 259200000)).toISOString().split('T')[0]}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                />
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Si no seleccionas una fecha, entregaremos en la fecha más próxima disponible
                                </p>
                            </div>
                        )}

                      
                        <button
                            type="submit"
                            disabled={!selectedShipping}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continuar con el pago
                        </button>
                    </form>
                </div>

                {/* Resumen lateral */}
                <div className="lg:col-span-1">
                    <div className={`sticky top-4 p-6 rounded-lg border ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Resumen de envío
                        </h3>
                        
                        {selectedShipping && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Método seleccionado:
                                    </span>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {shippingOptions.find(opt => opt.id === selectedShipping)?.name}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Costo de envío:
                                    </span>
                                    <span className={`text-sm font-medium ${
                                        shippingOptions.find(opt => opt.id === selectedShipping)?.price === 0
                                            ? 'text-green-600'
                                            : isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                        {shippingOptions.find(opt => opt.id === selectedShipping)?.price === 0
                                            ? 'GRATIS'
                                            : formatCurrency(shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0)
                                        }
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Tiempo estimado:
                                    </span>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {shippingOptions.find(opt => opt.id === selectedShipping)?.estimatedDays} días
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Información importante
                                </span>
                            </div>
                            <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <li>• Los tiempos de entrega son estimados</li>
                                <li>• Recibirás un código de seguimiento</li>
                                <li>• Alguien debe estar presente para recibir</li>
                                <li>• Verificaremos la dirección antes del envío</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingStep;