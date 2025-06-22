import React, { useState, useCallback } from "react";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import EmptyCart from "../components/EmptyCart";

const CartStep = ({ cartItems, onUpdateQuantity, onRemoveItem, onComplete, isDarkMode }) => {
    const calculateTotal = useCallback(() => {
        return cartItems.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            return sum + (price * quantity);
        }, 0);
    }, [cartItems]);

    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const handleProceedToCheckout = () => {
        if (cartItems.length > 0) {
            onComplete();
        }
    };

    if (cartItems.length === 0) {
        return <EmptyCart isDarkMode={isDarkMode} />;
    }

    return (
        <div className="space-y-6">
            {/* Header del carrito */}
            <div className="mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Tu carrito de compras
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de productos */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onUpdateQuantity={onUpdateQuantity}
                            onRemoveItem={onRemoveItem}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </div>

                {/* Resumen del carrito */}
                <div className="lg:col-span-1">
                    <CartSummary
                        total={calculateTotal()}
                        itemCount={totalItems}
                        isDarkMode={isDarkMode}
                        onProceed={handleProceedToCheckout}
                        buttonText="Continuar con la dirección"
                    />
                </div>
            </div>

            {/* Información adicional */}
            <div className={`mt-8 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            Información importante
                        </h3>
                        <ul className={`mt-2 text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li>• Envío gratuito en pedidos superiores a S/ 500</li>
                            <li>• Los precios incluyen IGV</li>
                            <li>• Tiempo de entrega: 2-5 días hábiles</li>
                            <li>• Garantía en todos nuestros productos</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartStep;