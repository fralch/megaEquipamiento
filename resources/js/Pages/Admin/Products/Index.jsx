import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '../../../storage/ThemeContext';

export default function Index({ productos }) {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [previewImage, setPreviewImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(productos.data);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [deleteLoading, setDeleteLoading] = useState(null);

    // Filtrar productos basado en el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(productos.data);
        } else {
            const filtered = productos.data.filter(producto => 
                producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                producto.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (producto.marca && producto.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, productos.data]);

    // Auto-limpiar mensaje después de 3 segundos
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleDelete = async (productId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }

        setDeleteLoading(productId);
        try {
            const response = await fetch(`/product/delete/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Producto eliminado correctamente' });
                // Recargar la página para actualizar la lista
                window.location.reload();
            } else {
                throw new Error('Error al eliminar el producto');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al eliminar el producto' });
        } finally {
            setDeleteLoading(null);
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'N/A';
        return `S/ ${parseFloat(price).toFixed(2)}`;
    };

    const getImageUrl = (imagen) => {
        if (!imagen) return null;
        if (Array.isArray(imagen)) {
            return imagen.length > 0 ? (imagen[0].startsWith('http') ? imagen[0] : `/${imagen[0]}`) : null;
        }
        return imagen.startsWith('http') ? imagen : `/${imagen}`;
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
        }`}>
            <Head title="Productos" />
            
            {/* Botón de cambio de tema */}
            <button
                onClick={toggleDarkMode}
                className={`fixed top-4 right-4 z-20 p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                        ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
                {isDarkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>

            {/* Modal de vista previa de imagen */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-2 sm:p-4">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-t-xl sm:rounded-lg max-w-full sm:max-w-2xl max-h-[90vh] w-full sm:w-auto overflow-auto transition-colors duration-200`}>
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <img
                            src={previewImage}
                            alt="Vista previa"
                            className="w-full max-w-full sm:max-w-2xl h-auto max-h-[70vh] object-contain rounded-md"
                        />
                    </div>
                </div>
            )}

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 w-full max-w-7xl mx-auto transition-colors duration-200`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                        Gestión de Productos
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link 
                            href="/crear" 
                            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 text-center ${
                                isDarkMode 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            Volver a Crear
                        </Link>
                    </div>
                </div>

                {/* Mostrar mensajes de éxito/error */}
                {message.text && (
                    <div className={`p-3 mb-4 rounded transition-colors duration-200 ${
                        message.type === 'success' 
                            ? (isDarkMode ? 'bg-green-800 text-green-200 border border-green-700' : 'bg-green-100 text-green-800 border border-green-300')
                            : (isDarkMode ? 'bg-red-800 text-red-200 border border-red-700' : 'bg-red-100 text-red-800 border border-red-300')
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Barra de búsqueda */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU o marca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full px-4 py-2 rounded-md border transition-colors duration-200 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400' 
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                    />
                </div>

                {/* Tabla de productos */}
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-200`}>
                        <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
                            <tr>
                                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Imagen</th>
                                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>SKU</th>
                                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Nombre</th>
                                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Marca</th>
                                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Precio</th>
                                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} transition-colors duration-200`}>
                            {filteredProducts.length > 0 ? filteredProducts.map((producto) => {
                                const imageUrl = getImageUrl(producto.imagen);
                                return (
                                    <tr key={producto.id_producto} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={producto.nombre}
                                                    className="h-12 w-12 object-cover rounded-md cursor-pointer"
                                                    onClick={() => {
                                                        setPreviewImage(imageUrl);
                                                        setShowModal(true);
                                                    }}
                                                />
                                            ) : (
                                                <div className={`h-12 w-12 rounded-md flex items-center justify-center ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>
                                        <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                                            {producto.sku}
                                        </td>
                                        <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                                            <div className="max-w-xs">
                                                <p className="truncate" title={producto.nombre}>{producto.nombre}</p>
                                            </div>
                                        </td>
                                        <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                                            {producto.marca ? producto.marca.nombre : 'N/A'}
                                        </td>
                                        <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                                            {formatPrice(producto.precio_ganancia)}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/producto/${producto.id_producto}`}
                                                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                                        isDarkMode 
                                                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                            : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                                                    }`}
                                                >
                                                    Ver
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(producto.id_producto)}
                                                    disabled={deleteLoading === producto.id_producto}
                                                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                                        deleteLoading === producto.id_producto
                                                            ? (isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500')
                                                            : (isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-800')
                                                    }`}
                                                >
                                                    {deleteLoading === producto.id_producto ? 'Eliminando...' : 'Eliminar'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className={`px-6 py-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos disponibles'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {productos.links && productos.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-1">
                            {productos.links.map((link, index) => {
                                if (link.url === null) {
                                    return (
                                        <span
                                            key={index}
                                            className={`px-3 py-2 text-xs sm:text-sm border rounded transition-colors duration-200 ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 text-gray-400 border-gray-600' 
                                                    : 'bg-gray-100 text-gray-400 border-gray-300'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-2 text-xs sm:text-sm border rounded transition-colors duration-200 ${
                                            link.active 
                                                ? 'bg-blue-500 text-white border-blue-500' 
                                                : isDarkMode 
                                                    ? 'bg-gray-700 text-blue-400 border-gray-600 hover:bg-gray-600' 
                                                    : 'bg-white text-blue-500 border-gray-300 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
