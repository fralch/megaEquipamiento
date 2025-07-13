import React, { useContext, useEffect } from "react";
import { useTheme } from "../storage/ThemeContext";
import { CartContext } from "../storage/CartContext";
import Header from "@/Components/home/Header";
import Footer from "@/Components/home/Footer";
import Menu from "../Components/home/Menu";
import CheckoutTabs from "../Components/checkout/CheckoutTabs";

// --- Componente Principal ---
export default function Carrito() {
    // Datos simulados de direcciones del usuario
    const userAddresses = [
        {
            id: 1,
            name: 'Casa',
            fullName: 'Juan Pérez',
            address: 'Av. Javier Prado 123',
            district: 'San Isidro',
            city: 'Lima',
            phone: '987654321',
            isDefault: true
        },
        {
            id: 2,
            name: 'Oficina',
            fullName: 'Juan Pérez',
            address: 'Calle Los Pinos 456',
            district: 'Miraflores',
            city: 'Lima',
            phone: '987654322',
            isDefault: false
        }
    ];
    const { cart, dispatch } = useContext(CartContext);

    const { isDarkMode } = useTheme();

    // Debug: log cart changes
    useEffect(() => {
        console.log("Cart state:", cart);
    }, [cart]);

    // Obtener items del carrito desde el contexto
    const cartItems = Array.isArray(cart) ? cart : [];

    const handleUpdateQuantity = (itemId, change) => {
        // Dispatch action to update quantity in context immediately
        dispatch({
            type: "UPDATE_QUANTITY",
            payload: { id: itemId, change },
        });

        // **PUNTO DE INTEGRACIÓN INERTIA:**
        // Aquí llamarías a router.patch(route('cart.update', itemId), { quantity: newQuantity }, { preserveState: true, preserveScroll: true });
    };

    const handleRemoveItem = (itemId) => {
        // Dispatch action to remove item from context
        dispatch({
            type: "REMOVE_ITEM",
            payload: { id: itemId },
        });

        // **PUNTO DE INTEGRACIÓN INERTIA:**
        // Aquí llamarías a router.delete(route('cart.remove', itemId), { preserveState: true, preserveScroll: true });
    };

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
        >
            <Header />
            <Menu />
            
            {/* Contenido principal del carrito */}
            <main className={`container mx-auto px-4 py-8 min-h-[60vh] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold">Carrito de Compras</h1>
                      
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lista de productos del carrito */}
                        <div className="lg:col-span-2">
                            <div className={`rounded-lg border p-6 mb-4 ${
                                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                                <h2 className="text-xl font-semibold mb-4">Productos en tu carrito</h2>
                                
                                {/* Producto de ejemplo 1 */}
                                <div className={`flex items-center space-x-4 p-4 rounded-lg border mb-4 ${
                                    isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-100 bg-gray-50'
                                }`}>
                                    <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${
                                        isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}>
                                        <span className="text-2xl">📱</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">Smartphone Samsung Galaxy</h3>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Color: Negro, 128GB</p>
                                        <p className="font-bold text-lg">$899.99</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                                            isDarkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
                                        }`}>-</button>
                                        <span className="w-8 text-center">2</span>
                                        <button className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                                            isDarkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
                                        }`}>+</button>
                                    </div>
                                    <button className={`text-red-500 hover:text-red-700 p-2`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Producto de ejemplo 2 */}
                                <div className={`flex items-center space-x-4 p-4 rounded-lg border mb-4 ${
                                    isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-100 bg-gray-50'
                                }`}>
                                    <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${
                                        isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}>
                                        <span className="text-2xl">💻</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">Laptop HP Pavilion</h3>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Intel i5, 8GB RAM, 256GB SSD</p>
                                        <p className="font-bold text-lg">$1,299.99</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                                            isDarkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
                                        }`}>-</button>
                                        <span className="w-8 text-center">1</span>
                                        <button className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                                            isDarkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
                                        }`}>+</button>
                                    </div>
                                    <button className={`text-red-500 hover:text-red-700 p-2`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Botón continuar comprando */}
                                <button className={`w-full mt-4 py-3 px-4 rounded-lg border-2 border-dashed font-medium ${
                                    isDarkMode 
                                        ? 'border-gray-600 text-gray-400 hover:border-gray-500' 
                                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                }`}>
                                    + Continuar comprando
                                </button>
                            </div>
                        </div>
                        
                        {/* Resumen del pedido */}
                        <div className="lg:col-span-1">
                            <div className={`rounded-lg border p-6 sticky top-4 ${
                                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                                <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal (3 productos)</span>
                                        <span>$3,099.97</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Envío</span>
                                        <span className="text-green-600">Gratis</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Impuestos</span>
                                        <span>$279.00</span>
                                    </div>
                                    <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>$3,378.97</span>
                                    </div>
                                </div>
                                
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg mb-3 transition-colors">
                                    Proceder al checkout
                                </button>
                                
                                <button className={`w-full border font-medium py-3 px-4 rounded-lg transition-colors ${
                                    isDarkMode 
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}>
                                    Guardar para después
                                </button>
                                
                                {/* Métodos de pago aceptados */}
                                <div className="mt-6">
                                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métodos de pago aceptados:</p>
                                    <div className="flex space-x-2">
                                        <div className={`px-2 py-1 rounded text-xs ${
                                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                        }`}>💳 Visa</div>
                                        <div className={`px-2 py-1 rounded text-xs ${
                                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                        }`}>💳 MC</div>
                                        <div className={`px-2 py-1 rounded text-xs ${
                                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                        }`}>💰 PayPal</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
         
            <Footer />
        </div>
    );
}
