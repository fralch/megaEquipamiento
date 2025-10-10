import { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiPackage, FiTag, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';

export default function ProductModal({ producto, isOpen, onClose }) {
    const { isDarkMode } = useTheme();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen || !producto) return null;

    const images = producto.imagen || [];
    const hasImages = images.length > 0;

    const nextImage = () => {
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'No disponible';
        return `S/ ${parseFloat(price).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        return new Date(dateString).toLocaleDateString('es-PE', {
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
                <div className={`inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                }`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-6 border-b ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <h3 className={`text-lg font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Detalles del Producto
                        </h3>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg hover:bg-gray-100 ${
                                isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'text-gray-500'
                            }`}
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Imagen */}
                            <div className="space-y-4">
                                <div className={`relative aspect-square rounded-lg overflow-hidden ${
                                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                                }`}>
                                    {hasImages ? (
                                        <>
                                            <img
                                                src={`/${images[currentImageIndex]}`}
                                                alt={producto.nombre}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/img/no-image.svg';
                                                }}
                                            />
                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={prevImage}
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                                                    >
                                                        <FiChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={nextImage}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                                                    >
                                                        <FiChevronRight className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <FiPackage className={`w-16 h-16 ${
                                                isDarkMode ? 'text-gray-600' : 'text-gray-400'
                                            }`} />
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnails */}
                                {images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto">
                                        {images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                                                    currentImageIndex === index
                                                        ? 'border-blue-500'
                                                        : isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                }`}
                                            >
                                                <img
                                                    src={`/${image}`}
                                                    alt={`${producto.nombre} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/img/no-image.svg';
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Información del producto */}
                            <div className="space-y-6">
                                {/* Título y SKU */}
                                <div>
                                    <h2 className={`text-2xl font-bold mb-2 ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {producto.nombre}
                                    </h2>
                                </div>

                                {/* Información básica */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-lg ${
                                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiTag className={`w-4 h-4 ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`} />
                                            <span className={`text-sm font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Marca
                                            </span>
                                        </div>
                                        <p className={`${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {producto.marca?.nombre || 'Sin marca'}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-lg ${
                                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiTag className={`w-4 h-4 ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`} />
                                            <span className={`text-sm font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                SKU
                                            </span>
                                        </div>
                                        <p className={`${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {producto.sku || 'Sin SKU'}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-lg ${
                                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiDollarSign className={`w-4 h-4 text-blue-500`} />
                                            <span className={`text-sm font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Precio Base
                                            </span>
                                        </div>
                                        <p className={`text-lg font-bold text-blue-600 ${
                                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                        }`}>
                                            {formatPrice(producto.precio_sin_ganancia)}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-lg ${
                                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiDollarSign className={`w-4 h-4 text-green-500`} />
                                            <span className={`text-sm font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Precio + Ganancia
                                            </span>
                                        </div>
                                        <p className={`text-lg font-bold text-green-600 ${
                                            isDarkMode ? 'text-green-400' : 'text-green-600'
                                        }`}>
                                            {formatPrice(producto.precio_ganancia)}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-lg ${
                                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiDollarSign className={`w-4 h-4 text-purple-500`} />
                                            <span className={`text-sm font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Precio + IGV
                                            </span>
                                        </div>
                                        <p className={`text-lg font-bold text-purple-600 ${
                                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                        }`}>
                                            {formatPrice(producto.precio_igv)}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-lg ${
                                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiCalendar className={`w-4 h-4 ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`} />
                                            <span className={`text-sm font-medium ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Creado
                                            </span>
                                        </div>
                                        <p className={`text-sm ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {formatDate(producto.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Descripción */}
                                {producto.descripcion && (
                                    <div>
                                        <h4 className={`text-lg font-semibold mb-2 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Descripción
                                        </h4>
                                        <p className={`text-sm leading-relaxed ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            {producto.descripcion}
                                        </p>
                                    </div>
                                )}

                                {/* Características */}
                                {producto.caracteristicas && Array.isArray(producto.caracteristicas) && producto.caracteristicas.length > 0 && (
                                    <div>
                                        <h4 className={`text-lg font-semibold mb-2 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Características
                                        </h4>
                                        <ul className={`space-y-1 text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            {producto.caracteristicas.map((caracteristica, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                    {caracteristica}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`px-6 py-4 border-t ${
                        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                    }`}>
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                    isDarkMode 
                                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
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