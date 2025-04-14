import React, { useState, useCallback } from 'react';
// useForm se mantiene importado, aunque no se usa activamente en esta versión local
import { useForm } from '@inertiajs/react';

// --- Helper para formatear moneda (Recomendado) ---
const formatCurrency = (value) => {
    // Ajusta 'es-PE' y 'PEN' según tu localidad y moneda
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(value);
};

// --- Datos de Ejemplo (mejor si vienen como props) ---
const sampleCartItems = [
    { id: 1, reference: 'PCE-ATP 1', name: 'Luminómetro PCE-ATP 1', unitPrice: 9568.00, quantity: 1, imageUrl: '/images/placeholder-luminometro.png' },
    { id: 2, reference: 'PCE-FCT 5', name: 'Analizador de redes eléctricas PCE-FCT 5', unitPrice: 215.00, quantity: 1, imageUrl: '/images/placeholder-analizador.png' },
    { id: 3, reference: 'CAL-PCE-ATP', name: 'Certificado de verificación para luminómetros', unitPrice: 1116.00, quantity: 1, imageUrl: '/images/placeholder-certificado.png' }
];

// --- Componente Carrito Mejorado ---
// Recibe initialCartItems como prop, con los datos de ejemplo como fallback
export default function Carrito({ initialCartItems = sampleCartItems }) {

    // --- Estado ---
    // Usa los items iniciales (sean props o el fallback)
    const [cartItems, setCartItems] = useState(initialCartItems);

    // --- Cálculos Derivados ---
    // useCallback puede ser útil si pasas esta función como prop, aunque no es estrictamente necesario aquí.
    const calculateTotal = useCallback(() => {
        return cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    }, [cartItems]); // Se recalcula solo si cartItems cambia

    const totalNeto = calculateTotal();

    // --- Manejadores de Eventos ---
    // Función unificada para actualizar cantidad (más concisa)
    const handleUpdateQuantity = (itemId, change) => {
        setCartItems(currentItems =>
            currentItems.map(item => {
                if (item.id === itemId) {
                    const newQuantity = item.quantity + change;
                    // Asegura que la cantidad no sea menor que 1
                    return { ...item, quantity: Math.max(1, newQuantity) };
                }
                return item;
            })
        );
        // console.log(`Quantity updated for item ${itemId}`);
        // **PUNTO DE INTEGRACIÓN INERTIA:**
        // Aquí llamarías a router.patch(route('cart.update', itemId), { quantity: newQuantity }, { preserveState: true, preserveScroll: true });
    };

    // Función para eliminar producto
    const handleRemoveItem = (itemId) => {
        setCartItems(currentItems => currentItems.filter(item => item.id !== itemId));
        // console.log(`Item ${itemId} removed`);
        // **PUNTO DE INTEGRACIÓN INERTIA:**
        // Aquí llamarías a router.delete(route('cart.remove', itemId), { preserveState: true, preserveScroll: true });
    };

    // --- Renderizado ---
    return (
        // Contenedor principal con padding y fondo gris claro
        <div className="carrito-container p-4 md:p-8 bg-gray-50 font-sans"> {/* Mejor usar font-sans o la fuente base de tu proyecto */}

            {/* --- Stepper/Pasos --- */}
            <div className="stepper mb-6 flex flex-wrap space-x-1 md:space-x-2 items-center text-sm">
                {/* Usa clases más semánticas y consistentes */}
                <span className="step active bg-blue-600 text-white px-3 py-1.5 rounded-md font-medium">1. Carro</span>
                <span className="step bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md">2. Dirección</span>
                <span className="step bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md">3. Envío</span>
                <span className="step bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md">4. Pago</span>
                <span className="step bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md">5. Terminar</span>
                {/* Botón Siguiente como parte del flujo */}
                {/* <button className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm">
                    Siguiente...
                </button> */}
                 <a href="#siguiente" className="ml-auto text-blue-600 hover:underline text-sm">Siguiente...</a>
            </div>

            {/* --- Contenedor de la Tabla (usando divs y grid para flexibilidad) --- */}
            <div className="cart-table bg-white shadow-md rounded-lg overflow-hidden">
                {/* Encabezado (visible en pantallas medianas y grandes) */}
                <div className="cart-header hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-100 border-b font-medium text-sm text-gray-600">
                    {/* Ajusta col-span para alinear con el contenido */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-6">Artículo</div>
                    <div className="col-span-12 md:col-span-2 text-right">Precio (sin IGV)</div>
                    <div className="col-span-12 md:col-span-3 lg:col-span-2 text-center">Cantidad</div>
                    <div className="col-span-12 md:col-span-2 text-right">Precio Total</div>
                    {/* Columna vacía para alinear con el botón de eliminar */}
                    <div className="col-span-12 md:col-span-1"></div>
                </div>

                {/* --- Items del Carrito --- */}
                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <p className="p-6 text-center text-gray-500">Tu carrito está vacío.</p>
                    ) : (
                        cartItems.map((item) => (
                            // Fila de cada item
                            <div key={item.id} className="cart-item grid grid-cols-12 gap-4 items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition duration-150 ease-in-out">

                                {/* 1. Artículo (Imagen y Texto) */}
                                <div className="col-span-12 md:col-span-5 lg:col-span-6 flex items-center space-x-4">
                                    <img
                                        src={item.imageUrl || '/images/placeholder.png'} // Fallback genérico
                                        alt={item.name}
                                        className="w-16 h-16 md:w-20 md:h-20 object-contain border rounded p-1 bg-white" // Padding dentro del borde
                                    />
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-500">{`Referencia ${item.reference}`}</p>
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                    </div>
                                </div>

                                {/* 2. Precio Unitario */}
                                <div className="col-span-5 md:col-span-2 text-right">
                                    <span className="md:hidden font-medium text-xs text-gray-500 mr-1">Precio:</span>
                                    <span className="text-sm md:text-base text-gray-700">{formatCurrency(item.unitPrice)}</span>
                                </div>

                                {/* 3. Cantidad */}
                                <div className="col-span-7 md:col-span-3 lg:col-span-2 flex items-center justify-end md:justify-center space-x-2">
                                     <span className="md:hidden font-medium text-xs text-gray-500 mr-1">Cant:</span>
                                    <button
                                        onClick={() => handleUpdateQuantity(item.id, -1)}
                                        disabled={item.quantity <= 1} // Deshabilitar si es 1
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-7 h-7 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        aria-label={`Disminuir cantidad de ${item.name}`}
                                    >
                                        -
                                    </button>
                                    {/* Input visual, no editable directamente */}
                                    <span
                                        className="font-medium text-center w-10 px-2 py-1 border rounded-md bg-gray-50"
                                        aria-live="polite" // Anuncia cambios de cantidad a lectores de pantalla
                                    >
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => handleUpdateQuantity(item.id, 1)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-7 h-7 rounded flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        aria-label={`Aumentar cantidad de ${item.name}`}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* 4. Precio Total por Item */}
                                <div className="col-span-9 md:col-span-2 text-right font-semibold">
                                     <span className="md:hidden font-medium text-xs text-gray-500 mr-1">Total Item:</span>
                                     {formatCurrency(item.unitPrice * item.quantity)}
                                </div>

                                {/* 5. Botón Eliminar */}
                                <div className="col-span-3 md:col-span-1 flex justify-end items-center">
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-300"
                                        aria-label={`Eliminar ${item.name} del carrito`}
                                    >
                                        {/* Icono SVG (ejemplo, podrías usar una librería como heroicons) */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        {/* O simplemente el texto "X" si prefieres */}
                                        {/* <span className="font-bold text-lg leading-none">×</span> */}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div> {/* Fin cart-table */}

            {/* --- Resumen Total --- */}
            {cartItems.length > 0 && (
                 <div className="cart-summary mt-6 flex flex-col items-end">
                    <div className="w-full md:w-auto md:min-w-[300px] p-4 bg-white shadow-md rounded-lg border">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-semibold text-gray-700">Total neto:</span>
                            <span className="text-xl font-bold text-gray-900">{formatCurrency(totalNeto)}</span>
                        </div>
                        {/* Puedes añadir más detalles aquí (impuestos, envío, etc.) */}
                        <p className="text-xs text-gray-500 text-right">Preis (Netto)</p>
                        <div className="mt-4 text-right">
                            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">
                                Proceder al Pago {/* O "Siguiente" si este es el último paso */}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div> // Fin carrito-container
    );
}
