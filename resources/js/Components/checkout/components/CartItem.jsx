import React, { useState } from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove, isDarkMode }) => {
    const [isRemoving, setIsRemoving] = useState(false);
    // Usar directamente la cantidad del item del contexto
    const quantity = item.quantity || 1;

    const getImageUrl = (image) => {
        if (!image) return '/api/placeholder/120/120';
        
        if (Array.isArray(image)) {
            const firstImage = image[0];
            if (!firstImage) return '/api/placeholder/120/120';
            
            // Limpiar backticks y espacios
            const cleanUrl = firstImage.toString().replace(/`/g, '').trim();
            
            // Si ya es una URL completa, usarla directamente
            if (cleanUrl.startsWith('http')) {
                return cleanUrl;
            }
            
            // Si es una ruta relativa, agregar la barra diagonal
            return `/${cleanUrl}`;
        }
        
        // Limpiar backticks y espacios para imagen individual
        const cleanUrl = image.toString().replace(/`/g, '').trim();
        
        // Si ya es una URL completa, usarla directamente
        if (cleanUrl.startsWith('http')) {
            return cleanUrl;
        }
        
        // Si es una ruta relativa, agregar la barra diagonal
        return `/${cleanUrl}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handleQuantityChange = (change) => {
        // Solo validar que no sea menor a 1 antes de enviar el cambio
        const newQuantity = Math.max(1, quantity + change);
        if (newQuantity >= 1) {
            onUpdateQuantity(item.id, change);
        }
    };

    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(() => {
            onRemove(item.id);
        }, 300);
    };

    return (
        <div
            className={`group relative overflow-hidden rounded-xl p-6 mb-4 transition-all duration-500 ${
                isRemoving ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}
            style={{
                background: isDarkMode
                    ? 'linear-gradient(135deg,rgba(42,52,65,0.8) 0%,rgba(30,41,59,0.9) 100%)'
                    : 'linear-gradient(135deg,rgba(255,255,255,0.9) 0%,rgba(248,250,252,1) 100%)',
                border: '2px solid rgba(59,130,246,0.1)',
                boxShadow: '0 8px 25px rgba(59,130,246,0.08)'
            }}
        >
            <div className="flex items-start gap-4">
                {/* Imagen del producto */}
                <div className="relative flex-shrink-0">
                    <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                        style={{
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    />
                    {item.discount && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            -{item.discount}%
                        </div>
                    )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-lg mb-1 ${
                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                        {item.title}
                    </h3>
                    
                    {item.variant && (
                        <p className={`text-sm mb-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {item.variant}
                        </p>
                    )}

                    <div className="flex items-center gap-4 mb-3">
                        <span className="text-xl font-bold"
                            style={{
                                background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                            {formatCurrency(item.price)}
                        </span>
                        {item.originalPrice && (
                            <span className={`text-sm line-through ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                                {formatCurrency(item.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                    quantity <= 1
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-blue-100 hover:text-blue-600'
                                } ${
                                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            
                            <span className={`w-12 text-center font-semibold ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                                {quantity}
                            </span>
                            
                            <button
                                onClick={() => handleQuantityChange(1)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                                         hover:bg-blue-100 hover:text-blue-600 ${
                                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1" />

                        {/* Botón eliminar */}
                        <button
                            onClick={handleRemove}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            title="Eliminar producto"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Subtotal del item */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Subtotal ({quantity} {quantity === 1 ? 'unidad' : 'unidades'})
                    </span>
                    <span className="text-lg font-bold"
                        style={{
                            background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                        {formatCurrency(item.price * quantity)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CartItem;