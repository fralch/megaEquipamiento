import React, { useState } from 'react';

const CartSummary = ({ total, itemCount, isDarkMode, onProceedToCheckout }) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <>
            <div
                className="flex items-center gap-3 mb-6 pb-4 border-b"
                style={{ borderColor: isDarkMode ? 'rgba(71,85,105,0.3)' : 'rgba(226,232,240,0.5)' }}
            >
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#2563eb 100%)',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}
                >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                    </svg>
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                        style={{ letterSpacing: '0.5px' }}>
                        Resumen del pedido
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                    </p>
                </div>
            </div>
            
            <div
                className="mb-6 p-5 rounded-xl"
                style={{
                    background: isDarkMode
                        ? 'linear-gradient(135deg,rgba(42,52,65,0.8) 0%,rgba(30,41,59,0.9) 100%)'
                        : 'linear-gradient(135deg,rgba(255,255,255,0.9) 0%,rgba(248,250,252,1) 100%)',
                    border: '2px solid rgba(59,130,246,0.2)',
                    boxShadow: '0 8px 25px rgba(59,130,246,0.1)'
                }}
            >
                <div className="flex justify-between items-center">
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total:
                    </span>
                    <span className="text-2xl font-black"
                        style={{
                            background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '0.5px'
                        }}>
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>

            <button
                onClick={onProceedToCheckout}
                className="w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-400
                         relative overflow-hidden group"
                style={{
                    background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#2563eb 100%)',
                    boxShadow: isHovered
                        ? '0 12px 35px rgba(59,130,246,0.4), 0 0 0 2px rgba(59,130,246,0.1)'
                        : '0 8px 25px rgba(59,130,246,0.2)',
                    transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
                    letterSpacing: '0.5px',
                    fontSize: '16px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {isHovered && <div className="shimmer-button absolute inset-0" />}
                <span className="relative z-10 flex items-center justify-center gap-2">
                    Proceder al checkout
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </button>
            
            <p className={`text-xs text-center mt-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
                Envío gratuito en pedidos superiores a S/ 500 (incluye envío de productos)
            </p>
        </>
    );
};

export default CartSummary;