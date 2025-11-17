import React, { useState } from 'react';
import { useTheme } from '../../storage/ThemeContext';
import {
    clearProductsCache,
    clearCategoriesCache,
    clearBrandsCache,
    clearAllCache,
    getCacheInfo,
} from '../../utils/cacheManager';

/**
 * Componente para limpiar cache desde el panel de administración
 * Muestra un botón flotante para administradores
 */
const CacheCleaner = ({ isAdmin = true }) => {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [cacheInfo, setCacheInfo] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isAdmin) return null;

    const handleClearCache = (type) => {
        let success = false;

        switch (type) {
            case 'products':
                success = clearProductsCache();
                break;
            case 'categories':
                success = clearCategoriesCache();
                break;
            case 'brands':
                success = clearBrandsCache();
                break;
            case 'all':
                success = clearAllCache();
                break;
            default:
                break;
        }

        if (success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

            // Actualizar info del cache
            loadCacheInfo();

            // Opcional: recargar después de 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    };

    const loadCacheInfo = () => {
        const info = getCacheInfo();
        setCacheInfo(info);
    };

    const togglePanel = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            loadCacheInfo();
        }
    };

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={togglePanel}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    isDarkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
                title="Gestión de Cache"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
            </button>

            {/* Panel de control */}
            {isOpen && (
                <div
                    className={`fixed bottom-24 right-6 z-50 w-96 rounded-lg shadow-2xl overflow-hidden ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}
                >
                    {/* Header */}
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                🗂️ Gestión de Cache
                            </h3>
                            <button
                                onClick={togglePanel}
                                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                            >
                                ✕
                            </button>
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Limpia el cache después de crear/editar contenido
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                        {/* Info del cache */}
                        {cacheInfo && (
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Estado del Cache:
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Productos:</span>
                                        <span className={cacheInfo.products.exists ? 'text-green-500' : 'text-red-500'}>
                                            {cacheInfo.products.exists
                                                ? `✓ (${cacheInfo.products.age || 0} min)`
                                                : '✗ Sin cache'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Categorías/Sub:</span>
                                        <span className={cacheInfo.categories.exists ? 'text-green-500' : 'text-red-500'}>
                                            {cacheInfo.categories.exists
                                                ? `✓ (${cacheInfo.categories.age || 0} min)`
                                                : '✗ Sin cache'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Marcas:</span>
                                        <span className={cacheInfo.brands.exists ? 'text-green-500' : 'text-red-500'}>
                                            {cacheInfo.brands.exists
                                                ? `✓ (${cacheInfo.brands.age || 0} min)`
                                                : '✗ Sin cache'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones de limpieza */}
                        <div className="space-y-2">
                            <button
                                onClick={() => handleClearCache('products')}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                            >
                                🛒 Limpiar Cache de Productos
                            </button>

                            <button
                                onClick={() => handleClearCache('categories')}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isDarkMode
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                📁 Limpiar Cache de Categorías y Subcategorías
                            </button>

                            <button
                                onClick={() => handleClearCache('brands')}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isDarkMode
                                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}
                            >
                                🏷️ Limpiar Cache de Marcas
                            </button>

                            <button
                                onClick={() => handleClearCache('all')}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isDarkMode
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                            >
                                🗑️ Limpiar TODO el Cache
                            </button>
                        </div>

                        {/* Success message */}
                        {showSuccess && (
                            <div className="p-3 bg-green-500 text-white rounded-lg text-sm font-medium text-center">
                                ✅ Cache limpiado exitosamente. Recargando...
                            </div>
                        )}

                        <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            💡 La página se recargará automáticamente después de limpiar el cache
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default CacheCleaner;
