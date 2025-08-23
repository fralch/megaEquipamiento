import React, { useState, useEffect } from 'react';
import { useTheme } from '../../storage/ThemeContext';

const URL_API = import.meta.env.VITE_API_URL;

const ProductsView = () => {
    const { isDarkMode } = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    // Función para obtener productos con paginación
    const fetchProducts = async (page = 1, itemsPerPage = 20) => {
        setLoading(true);
        try {
            const response = await fetch(`${URL_API}/product/all?page=${page}&per_page=${itemsPerPage}`);
            const data = await response.json();
            
            if (data.data) {
                setProducts(data.data);
                setFilteredProducts(data.data);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotalProducts(data.total);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setMessage('Error al cargar los productos');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    // Cargar productos al montar el componente
    useEffect(() => {
        fetchProducts(currentPage, perPage);
    }, [currentPage, perPage]);

    // Filtrar productos por búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product => 
                product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.marca && product.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);

    // Auto-clear messages
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Función para eliminar producto
    const handleDelete = async (productId, productName) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}"?`)) {
            return;
        }

        setDeleteLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch(`${URL_API}/product/delete/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage(`Producto "${productName}" eliminado exitosamente`);
                setMessageType('success');
                // Recargar productos
                fetchProducts(currentPage, perPage);
            } else {
                setMessage(data.message || 'Error al eliminar el producto');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            setMessage('Error al eliminar el producto');
            setMessageType('error');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Función para formatear precio
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(price || 0);
    };

    // Función para obtener URL de imagen
    const getImageUrl = (imagePath) => {
        if (!imagePath || typeof imagePath !== 'string') return '/img/no-image.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    };

    // Función para cambiar página
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Función para cambiar items por página
    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1); // Reset to first page
    };

    // Generar números de página para la paginación
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfMaxPages = Math.floor(maxPagesToShow / 2);

        let startPage = Math.max(1, currentPage - halfMaxPages);
        let endPage = Math.min(totalPages, currentPage + halfMaxPages);

        if (currentPage <= halfMaxPages) {
            endPage = Math.min(totalPages, maxPagesToShow);
        }
        if (currentPage + halfMaxPages >= totalPages) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    return (
        <div className={`p-6 rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
            {/* Header */}
            <div className="mb-6">
                <h1 className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                    Gestión de Productos
                </h1>
                <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                    Total de productos: {totalProducts}
                </p>
            </div>

            {/* Messages */}
            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    messageType === 'success' 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                    {message}
                </div>
            )}

            {/* Search and Controls */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU o marca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full px-4 py-2 rounded-md border transition-colors duration-200 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Mostrar:
                    </label>
                    <select
                        value={perPage}
                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                        className={`px-3 py-2 rounded-md border transition-colors duration-200 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        por página
                    </span>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                        isDarkMode ? 'border-blue-400' : 'border-blue-600'
                    }`}></div>
                    <span className={`ml-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Cargando productos...
                    </span>
                </div>
            )}

            {/* Products Table */}
            {!loading && (
                <div className="overflow-x-auto">
                    <table className={`min-w-full table-auto border-collapse ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <thead>
                            <tr className={`${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b ${
                                    isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-200'
                                }`}>
                                    Imagen
                                </th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b ${
                                    isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-200'
                                }`}>
                                    SKU
                                </th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b ${
                                    isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-200'
                                }`}>
                                    Nombre
                                </th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b ${
                                    isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-200'
                                }`}>
                                    Marca
                                </th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b ${
                                    isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-200'
                                }`}>
                                    Precio
                                </th>
                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b ${
                                    isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-200'
                                }`}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${
                            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                        }`}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id_producto} className={`hover:${
                                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                    } transition-colors duration-150`}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex-shrink-0 h-16 w-16">
                                                <img
                                                    className="h-16 w-16 rounded-lg object-cover cursor-pointer hover:opacity-75 transition-opacity"
                                                    src={getImageUrl(product.imagen)}
                                                    alt={product.nombre}
                                                    onClick={() => {
                                                        setSelectedImage(getImageUrl(product.imagen));
                                                        setShowImageModal(true);
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = '/img/no-image.jpg';
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                        }`}>
                                            {product.sku}
                                        </td>
                                        <td className={`px-4 py-4 text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                        }`}>
                                            <div className="max-w-xs truncate" title={product.nombre}>
                                                {product.nombre}
                                            </div>
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                        }`}>
                                            {product.marca ? product.marca.nombre : 'Sin marca'}
                                        </td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-green-400' : 'text-green-600'
                                        }`}>
                                            {formatPrice(product.precio_igv)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <a
                                                    href={`/product/show/${product.id_producto}`}
                                                    className={`px-3 py-1 rounded-md text-xs transition-colors duration-200 ${
                                                        isDarkMode 
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                                    }`}
                                                >
                                                    Ver
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(product.id_producto, product.nombre)}
                                                    disabled={deleteLoading}
                                                    className={`px-3 py-1 rounded-md text-xs transition-colors duration-200 ${
                                                        deleteLoading
                                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                            : isDarkMode 
                                                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                                                : 'bg-red-500 text-white hover:bg-red-600'
                                                    }`}
                                                >
                                                    {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className={`px-4 py-8 text-center text-sm ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos disponibles'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Mostrando {((currentPage - 1) * perPage) + 1} a {Math.min(currentPage * perPage, totalProducts)} de {totalProducts} productos
                    </div>
                    
                    <nav className="flex items-center space-x-1">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                currentPage === 1
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : isDarkMode 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                        >
                            Anterior
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    currentPage === page
                                        ? isDarkMode 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-blue-500 text-white'
                                        : isDarkMode 
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                currentPage === totalPages
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : isDarkMode 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                        >
                            Siguiente
                        </button>
                    </nav>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
                    <div className="max-w-4xl max-h-full p-4">
                        <img
                            src={selectedImage}
                            alt="Vista ampliada"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsView;