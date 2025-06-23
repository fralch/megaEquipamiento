import React, { useState, useEffect } from 'react';
import { useCheckout } from '../../../storage/CheckoutContext';

const AddressStep = ({ onComplete, isDarkMode }) => {
    const [savedAddresses, setSavedAddresses] = useState([]);
    
    const { checkoutState, updateCustomerData } = useCheckout();
    const [processing, setProcessing] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [forceShowForm, setForceShowForm] = useState(false); // Para forzar mostrar formulario cuando se edita
    
    // Usar los datos del contexto
    const data = checkoutState.customerData || {};
    
    const setData = (field, value) => {
        updateCustomerData({ [field]: value });
    };
    
    // Función para verificar si los datos están completos
    const isDataComplete = () => {
        return !!(data.fullName && data.address && data.district && data.phone && data.rucDni && data.email);
    };

    // Inicializar selectedAddressId cuando el contexto esté disponible
    useEffect(() => {
        if (data?.id) {
            setSelectedAddressId(data.id);
        }
    }, [data?.id]);

    const districts = [
        'Barranco', 'Breña', 'Cercado de Lima', 'Chorrillos', 'Jesús María',
        'La Molina', 'La Victoria', 'Lince', 'Magdalena', 'Miraflores',
        'Pueblo Libre', 'San Borja', 'San Isidro', 'San Luis', 'San Miguel',
        'Santiago de Surco', 'Surquillo'
    ];

    const handleAddressSelect = (address) => {
        setSelectedAddressId(address.id);
        updateCustomerData({
            fullName: address.fullName,
            address: address.address,
            district: address.district,
            city: address.city,
            phone: address.phone,
            reference: address.reference || '',
            saveAddress: false,
            company: address.company || '',
            department: address.department || '',
            rucDni: address.rucDni || '',
            email: address.email || ''
        });
        setShowNewAddressForm(false);
        setForceShowForm(false);
    };

    const handleNewAddress = () => {
        setSelectedAddressId(null);
        updateCustomerData({
            fullName: '',
            address: '',
            district: '',
            city: 'Lima',
            phone: '',
            reference: '',
            saveAddress: true,
            company: '',
            department: '',
            rucDni: '',
            email: ''
        });
        setShowNewAddressForm(true);
        setForceShowForm(true);
    };

    const handleEditAddress = () => {
        setForceShowForm(true);
        setShowNewAddressForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        
        // Validación básica
        if (!data.fullName || !data.address || !data.district || !data.phone || !data.rucDni || !data.email) {
            setProcessing(false);
            return;
        }

        const addressData = {
            id: selectedAddressId || Date.now(),
            ...data
        };

        // Si es una nueva dirección y se quiere guardar
        if (!selectedAddressId && data.saveAddress) {
            setSavedAddresses(prev => [...prev, { ...addressData, name: 'Nueva dirección' }]);
        }

        // Actualizar el contexto con los datos finales
        updateCustomerData(addressData);
        setForceShowForm(false);
        
        setProcessing(false);
        onComplete(addressData);
    };

    // Componente de resumen de datos
    const AddressSummary = () => (
        <div className={`space-y-4 p-6 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
            <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Dirección de envío confirmada
                </h3>
                <button
                    onClick={handleEditAddress}
                    className={`text-blue-600 hover:text-blue-700 font-medium text-sm ${
                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : ''
                    }`}
                >
                    Editar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información personal */}
                <div className="space-y-3">
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Información personal
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nombre:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.fullName}</span>
                        </div>
                        <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>RUC/DNI:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.rucDni}</span>
                        </div>
                        <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.email}</span>
                        </div>
                        <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Teléfono:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.phone}</span>
                        </div>
                        {data.company && (
                            <div>
                                <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Empresa:</span>
                                <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.company}</span>
                            </div>
                        )}
                        {data.department && (
                            <div>
                                <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Departamento:</span>
                                <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.department}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dirección */}
                <div className="space-y-3">
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Dirección de envío
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dirección:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.address}</span>
                        </div>
                        <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Distrito:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.district}</span>
                        </div>
                        <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ciudad:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.city || 'Lima'}</span>
                        </div>
                        <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>País:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Perú</span>
                        </div>

                        {data.reference && (
                            <div>
                                <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Referencia:</span>
                                <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{data.reference}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Botón de continuar */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => onComplete(data)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    Continuar con esta dirección
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Dirección de envío
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    {isDataComplete() && !forceShowForm 
                        ? 'Revisa tu dirección de envío' 
                        : 'Selecciona o agrega una dirección de envío'
                    }
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contenido principal */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Mostrar resumen si los datos están completos y no se fuerza mostrar el formulario */}
                    {isDataComplete() && !forceShowForm ? (
                        <AddressSummary />
                    ) : (
                        <>
                            {/* Direcciones existentes */}
                            {savedAddresses.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Direcciones guardadas
                                    </h3>
                                    {savedAddresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className={`
                                                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                                ${selectedAddressId === address.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : isDarkMode
                                                        ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                }
                                            `}
                                            onClick={() => handleAddressSelect(address)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                            {address.name}
                                                        </h4>
                                                        {address.isDefault && (
                                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                Por defecto
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {address.fullName}
                                                    </p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {address.address}, {address.district}, {address.city}
                                                    </p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Tel: {address.phone}
                                                    </p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                    selectedAddressId === address.id
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {selectedAddressId === address.id && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Botón para nueva dirección */}
                            <button
                                onClick={handleNewAddress}
                                className={`
                                    w-full p-4 border-2 border-dashed rounded-lg transition-all duration-200
                                    ${showNewAddressForm
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : isDarkMode
                                            ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                                            : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="font-medium">Agregar nueva dirección</span>
                                </div>
                            </button>

                            {/* Formulario de nueva dirección */}
                            {(showNewAddressForm || selectedAddressId) && (
                                <form onSubmit={handleSubmit} className={`space-y-4 p-6 rounded-lg border ${
                                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                }`}>
                                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {showNewAddressForm ? 'Nueva dirección' : 'Editar dirección'}
                                    </h3>
                                    
                                    {/* Información de la empresa (opcional) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Empresa
                                            </label>
                                            <input
                                                type="text"
                                                value={data.company || ''}
                                                onChange={(e) => setData('company', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Departamento
                                            </label>
                                            <input
                                                type="text"
                                                value={data.department || ''}
                                                onChange={(e) => setData('department', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* RUC/DNI */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            RUC/DNI *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.rucDni || ''}
                                            onChange={(e) => setData('rucDni', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            required
                                        />
                                    </div>

                                    {/* Nombre completo */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Nombre completo *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.fullName || ''}
                                            onChange={(e) => setData('fullName', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            required
                                        />
                                    </div>

                                    {/* Dirección */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Dirección *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.address || ''}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Ciudad *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.city || 'Lima'}
                                                onChange={(e) => setData('city', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                País *
                                            </label>
                                            <select
                                                value="Perú"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                                readOnly
                                            >
                                                <option value="Perú">Perú</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Distrito *
                                            </label>
                                            <select
                                                value={data.district || ''}
                                                onChange={(e) => setData('district', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                                required
                                            >
                                                <option value="">Seleccionar distrito</option>
                                                {districts.map(district => (
                                                    <option key={district} value={district}>{district}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Dirección E-Mail *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email || ''}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            required
                                        />
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Teléfono *
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone || ''}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            required
                                        />
                                    </div>



                                    {/* Referencia */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Referencia (opcional)
                                        </label>
                                        <textarea
                                            value={data.reference || ''}
                                            onChange={(e) => setData('reference', e.target.value)}
                                            rows={3}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        />
                                    </div>

                                    {showNewAddressForm && (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="saveAddress"
                                                checked={data.saveAddress || false}
                                                onChange={(e) => setData('saveAddress', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="saveAddress" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Guardar esta dirección para futuras compras
                                            </label>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {processing ? 'Guardando...' : 'Continuar'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                {/* Resumen lateral */}
                <div className="lg:col-span-1">
                    <div className={`sticky top-4 p-6 rounded-lg border ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Información de envío
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                                                     
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    Entrega en 2-5 días hábiles
                                </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    Seguimiento en tiempo real
                                </span>
                            </div>
                        </div>
                        
                        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                💡 <strong>Tip:</strong> Asegúrate de que la dirección sea correcta para evitar retrasos en la entrega.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressStep;