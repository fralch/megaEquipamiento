import React, { useContext, useEffect } from "react";
import { useTheme } from "../storage/ThemeContext";
import { CartContext } from "../storage/CartContext";
import Header from "@/Components/home/Header";
import Footer from "@/Components/home/Footer";
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

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Checkout con tabs */}
                    <CheckoutTabs
                        cartItems={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        isDarkMode={isDarkMode}
                        userAddresses={userAddresses} // Pasar las direcciones simuladas
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
