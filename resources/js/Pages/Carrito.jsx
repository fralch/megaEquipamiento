import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useTheme } from '../storage/ThemeContext';
import { useForm } from '@inertiajs/react';
import { CartContext } from '../storage/CartContext';
import Header from "@/Components/home/Header";
import Footer from "@/Components/home/Footer";
import CheckoutTabs from '../Components/checkout/CheckoutTabs';
import { router } from '@inertiajs/react';

// --- Helper para formatear moneda ---
const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(value);
};

// --- Componente Stepper Mejorado ---
const CheckoutStepper = ({ currentStep = 1, isDarkMode }) => {
    const steps = [
        { id: 1, name: 'Carrito' },
        { id: 2, name: 'Dirección' },
        { id: 3, name: 'Envío' },
        { id: 4, name: 'Pago' },
        { id: 5, name: 'Confirmar' }
    ];

    const getStepIcon = (stepId, isCompleted) => {
        if (isCompleted) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        }
        
        switch (stepId) {
            case 1:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                );
            case 2:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            case 3:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 4:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                );
            case 5:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return <span className="text-sm font-bold">{stepId}</span>;
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between relative">
                {/* Línea de progreso */}
                <div className={`absolute top-6 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
                
                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    
                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                                ${isCompleted 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : isCurrent 
                                        ? 'bg-blue-50 border-blue-600 text-blue-600' 
                                        : isDarkMode 
                                            ? 'bg-gray-800 border-gray-600 text-gray-400'
                                            : 'bg-white border-gray-300 text-gray-400'
                                }
                            `}>
                                {getStepIcon(step.id, isCompleted)}
                            </div>
                            <span className={`
                                mt-2 text-xs font-medium transition-colors duration-300
                                ${isCurrent || isCompleted 
                                    ? 'text-blue-600' 
                                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }
                            `}>
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Componente Item del Carrito ---
const CartItem = ({ item, onUpdateQuantity, onRemoveItem, isDarkMode }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        setShowDeleteConfirm(false);
        onRemoveItem(item.id);
    };

    // Mapear los datos del producto real a la estructura esperada
    const displayItem = {
        id: item.id,
        reference: item.sku || `REF-${item.id}`,
        name: item.title,
        unitPrice: item.price,
        quantity: item.quantity || 1,
        imageUrl: item.image
    };

    return (
        <div className={`
            group relative rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}
        style={{
            borderColor: 'rgba(59,130,246,0.2)',
            transition: 'all 0.3s ease',
            transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
            e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(59,130,246,0.3)'
                : '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(59,130,246,0.3)';
            e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
        }}>
            <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                        <div className={`w-24 h-24 rounded-lg overflow-hidden border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                            <img
                                src={displayItem.imageUrl || '/images/placeholder.png'}
                                alt={displayItem.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                    e.target.src = '/images/placeholder.png';
                                }}
                            />
                        </div>
                    </div>

                    {/* Información del producto */}
                    <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-grow">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Ref: {displayItem.reference}
                                </p>
                                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    {displayItem.name}
                                </h3>
                                {item.origin && (
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Origen: {item.origin}
                                    </p>
                                )}
                                <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {formatCurrency(displayItem.unitPrice)}
                                </p>
                            </div>

                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center rounded-lg p-1 ${
                                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <button
                                        onClick={() => onUpdateQuantity(displayItem.id, -1)}
                                        disabled={displayItem.quantity <= 1}
                                        className={`
                                            w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-200
                                            ${displayItem.quantity <= 1 
                                                ? 'text-gray-400 cursor-not-allowed' 
                                                : isDarkMode 
                                                    ? 'text-gray-300 hover:bg-gray-600 active:bg-gray-500'
                                                    : 'text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                            }
                                        `}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>
                                    
                                    <span className={`w-12 text-center font-semibold ${
                                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                    }`}>
                                        {displayItem.quantity}
                                    </span>
                                    
                                    <button
                                        onClick={() => onUpdateQuantity(displayItem.id, 1)}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'text-gray-300 hover:bg-gray-600 active:bg-gray-500'
                                                : 'text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Botón eliminar */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    
                                    {/* Confirmación de eliminación */}
                                    {showDeleteConfirm && (
                                        <div className={`absolute right-0 top-10 rounded-lg shadow-lg border p-3 z-20 min-w-[200px] ${
                                            isDarkMode 
                                                ? 'bg-gray-800 border-gray-600' 
                                                : 'bg-white border-gray-200'
                                        }`}>
                                            <p className={`text-sm mb-3 ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                            }`}>¿Eliminar este producto?</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleDelete}
                                                    className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className={`flex-1 px-3 py-1 rounded text-sm transition-colors ${
                                                        isDarkMode 
                                                            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Total del item */}
                        <div className={`mt-4 pt-4 border-t flex justify-between items-center ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-100'
                        }`}>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Subtotal:
                            </span>
                            <span className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {formatCurrency(displayItem.unitPrice * displayItem.quantity)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

// --- Componente Resumen del Carrito ---
const CartSummary = ({ total, itemCount, isDarkMode }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <style>
                {`
                @keyframes summaryFloat{
                    0%,100%{transform:translateY(0)}
                    50%{transform:translateY(-5px)}
                }
                @keyframes shimmerEffect{
                    0%{background-position:-200% 0}
                    100%{background-position:200% 0}
                }
                .summary-float{
                    animation:summaryFloat 3s ease-in-out infinite;
                }
                .shimmer-button{
                    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
                    background-size:200% 100%;
                    animation:shimmerEffect 2s infinite;
                }
                `}
            </style>
            <div
                className="sticky top-4 rounded-2xl p-6 summary-float"
                style={{
                    background: isDarkMode
                        ? 'linear-gradient(135deg,rgba(30,41,59,0.9) 0%,rgba(15,23,42,0.95) 100%)'
                        : 'linear-gradient(135deg,rgba(255,255,255,0.95) 0%,rgba(248,250,252,0.98) 100%)',
                    border: '2px solid rgba(59,130,246,0.2)',
                    boxShadow: isDarkMode
                        ? '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                        : '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)'
                }}
            >
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
            </div>
        </>
    );
};

// --- Componente de Carrito Vacío ---
const EmptyCart = ({ isDarkMode }) => {
    return (
        <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Tu carrito está vacío
            </h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Agrega algunos productos para comenzar
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Seguir comprando
            </button>
        </div>
    );
};

// --- Componente Principal ---
export default function Carrito() {
    const { cart, dispatch } = useContext(CartContext);

    const { isDarkMode } = useTheme();

    // Debug: log cart changes
    useEffect(() => {
        console.log('Cart state:', cart);
    }, [cart]);

    // Obtener items del carrito desde el contexto
    const cartItems = Array.isArray(cart) ? cart : [];

    const calculateTotal = useCallback(() => {
        return cartItems.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            return sum + (price * quantity);
        }, 0);
    }, [cartItems]);

    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const handleUpdateQuantity = (itemId, change) => {
        // Dispatch action to update quantity in context immediately
        dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { id: itemId, change }
        });
        
        // **PUNTO DE INTEGRACIÓN INERTIA:**
        // Aquí llamarías a router.patch(route('cart.update', itemId), { quantity: newQuantity }, { preserveState: true, preserveScroll: true });
    };

    const handleRemoveItem = (itemId) => {
        // Dispatch action to remove item from context
        dispatch({
            type: 'REMOVE_ITEM',
            payload: { id: itemId }
        });
        
        // **PUNTO DE INTEGRACIÓN INERTIA:**
        // Aquí llamarías a router.delete(route('cart.remove', itemId), { preserveState: true, preserveScroll: true });
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <Header />
            
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header del carrito */}
                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                            Proceso de Compra
                        </h1>
                        <p className={`mt-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Completa tu compra paso a paso
                        </p>
                    </div>

                    {/* Checkout con tabs */}
                    <CheckoutTabs 
                        cartItems={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </main>
            
            <Footer />
        </div>
    );
}