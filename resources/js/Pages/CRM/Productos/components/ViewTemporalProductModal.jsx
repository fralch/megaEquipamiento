import React, { useState } from 'react';
import { FiX, FiPackage, FiDollarSign, FiTag, FiMapPin, FiCalendar } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';

export default function ViewTemporalProductModal({ isOpen, onClose, producto }) {
    const { isDarkMode } = useTheme();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen || !producto) return null;

    const imagenes = producto.imagenes || [];
    const especificaciones = producto.especificaciones_tecnicas || {};

    const nextImage = () => {
        if (imagenes.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % imagenes.length);
        }
    };

    const prevImage = () => {
        if (imagenes.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    {/* Header */}
                    <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FiPackage className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Detalles del Producto Temporal
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className={`rounded-full p-1 hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                            >
                                <FiX className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        <div className="space-y-6">
                            {/* Imágenes */}
                            {imagenes.length > 0 && (
                                <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                    <div className="relative">
                                        <img
                                            src={`/storage/${imagenes[currentImageIndex]}`}
                                            alt={producto.titulo}
                                            className="w-full h-96 object-contain"
                                        />
                                        {imagenes.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                                                >
                                                    ←
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                                                >
                                                    →
                                                </button>
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                                    {currentImageIndex + 1} / {imagenes.length}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {imagenes.length > 1 && (
                                        <div className="flex gap-2 p-2 overflow-x-auto">
                                            {imagenes.map((imagen, index) => (
                                                <img
                                                    key={index}
                                                    src={`/storage/${imagen}`}
                                                    alt={`Miniatura ${index + 1}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-20 h-20 object-cover rounded cursor-pointer ${
                                                        index === currentImageIndex
                                                            ? 'ring-2 ring-blue-500'
                                                            : 'opacity-60 hover:opacity-100'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Información Principal */}
                            <div>
                                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {producto.titulo}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Precio */}
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FiDollarSign className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Precio
                                            </span>
                                        </div>
                                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                            ${parseFloat(producto.precio || 0).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Marca */}
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FiTag className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Marca
                                            </span>
                                        </div>
                                        <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {producto.marca?.nombre || 'Sin marca'}
                                        </p>
                                    </div>

                                    {/* Procedencia */}
                                    {producto.procedencia && (
                                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <FiMapPin className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Procedencia
                                                </span>
                                            </div>
                                            <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {producto.procedencia}
                                            </p>
                                        </div>
                                    )}

                                    {/* Fecha de creación */}
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FiCalendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Fecha de creación
                                            </span>
                                        </div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {formatDate(producto.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            {producto.descripcion && (
                                <div>
                                    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Descripción
                                    </h3>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {producto.descripcion}
                                    </p>
                                </div>
                            )}

                            {/* Especificaciones Técnicas */}
                            {Object.keys(especificaciones).length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Especificaciones Técnicas
                                    </h3>
                                    <div className={`rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <table className="w-full">
                                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                                {Object.entries(especificaciones).map(([clave, valor], index) => (
                                                    <tr key={index} className={isDarkMode ? 'bg-gray-700' : 'bg-white'}>
                                                        <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            {clave}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {valor}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Etiqueta de producto temporal */}
                            <div className={`p-4 rounded-lg border-2 ${isDarkMode ? 'bg-purple-900 bg-opacity-20 border-purple-500' : 'bg-purple-50 border-purple-200'}`}>
                                <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                                    <strong>Producto Temporal:</strong> Este producto está disponible solo para cotizaciones y no forma parte del catálogo principal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                    isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
