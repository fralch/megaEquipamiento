import { Head } from "@inertiajs/react";
import { FiPackage, FiEdit, FiTrash, FiPlus, FiLoader, FiEye, FiImage, FiSearch } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';
import ProductModal from './components/ProductModal';
import EditProductModal from './components/EditProductModal';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Productos() {
    const { isDarkMode } = useTheme();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const fetchProductos = async (page = 1, itemsPerPage = 20, search = '') => {
        try {
            setLoading(true);
            const endpoint = search ? '/api/productos/crm' : '/api/productos/excluye-servicios';
            const response = await axios.get(endpoint, {
                params: {
                    page: page,
                    per_page: itemsPerPage,
                    ...(search && { search: search })
                }
            });
            
            const data = response.data;
            setProductos(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setTotal(data.total || 0);
            setPerPage(data.per_page || 20);
        } catch (error) {
            console.error('Error fetching productos:', error);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos(currentPage, perPage, searchTerm);
    }, [currentPage, perPage]);

    // Efecto separado para la búsqueda con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== '') {
                setIsSearching(true);
                fetchProductos(1, perPage, searchTerm).finally(() => {
                    setIsSearching(false);
                });
            } else {
                fetchProductos(1, perPage, '');
            }
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm, perPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    const formatPrice = (price) => {
        if (!price) return 'No disponible';
        return `S/ ${parseFloat(price).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    };

    const getStockStatus = (stock) => {
        if (!stock || stock === 0) return { text: 'Agotado', class: 'bg-red-100 text-red-800' };
        if (stock <= 5) return { text: 'Bajo Stock', class: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Disponible', class: 'bg-green-100 text-green-800' };
    };

    const handleViewProduct = (producto) => {
        setSelectedProduct(producto);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleEditProduct = (producto) => {
        setProductToEdit(producto);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setProductToEdit(null);
    };

    const handleSaveProduct = (updatedProduct) => {
        // Actualizar la lista de productos con el producto actualizado
        setProductos(prevProductos =>
            prevProductos.map(p =>
                p.id_producto === updatedProduct.id_producto ? updatedProduct : p
            )
        );
        handleCloseEditModal();
    };

    const truncateText = (text, maxLength = 30) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <>
            <Head title="Productos" />
            <CRMLayout title="Gestión de Productos">
                <div className="p-6">
                    {/* Barra de búsqueda */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar productos por nombre, SKU, descripción o marca..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className={`block w-full pl-10 pr-10 py-2 border rounded-lg text-sm ${
                                    isDarkMode 
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                                } focus:outline-none focus:ring-2`}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                                        ✕
                                    </span>
                                </button>
                            )}
                        </div>
                        {isSearching && (
                            <div className="mt-2 flex items-center gap-2">
                                <FiLoader className="w-4 h-4 animate-spin text-blue-600" />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Buscando...
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {searchTerm ? `Resultados de búsqueda: ${productos.length} de ${total}` : `Mostrando ${productos.length} de ${total} productos`}
                            </span>
                            <select 
                                value={perPage} 
                                onChange={(e) => setPerPage(parseInt(e.target.value))}
                                className={`px-3 py-1 rounded border text-sm ${
                                    isDarkMode 
                                        ? 'bg-gray-800 border-gray-700 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            >
                                <option value={10}>10 por página</option>
                                <option value={20}>20 por página</option>
                                <option value={50}>50 por página</option>
                                <option value={100}>100 por página</option>
                            </select>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <FiPlus className="w-4 h-4" />
                            Agregar Producto
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Cargando productos...
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className={`rounded-xl shadow-sm border overflow-hidden ${
                                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                            }`}>
                                <table className="w-full">
                                    <thead className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                        <tr>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Imagen</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Producto</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>SKU</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Marca</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Precio Base</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Precio + Ganancia</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Precio + IGV</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                        {productos.length > 0 ? productos.map((producto) => {
                                            const primeraImagen = producto.imagen && Array.isArray(producto.imagen) && producto.imagen.length > 0 
                                                ? producto.imagen[0] 
                                                : null;
                                            
                                            return (
                                                <tr key={producto.id} className={`${
                                                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                                }`}>
                                                    {/* Imagen */}
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            {primeraImagen ? (
                                                <img
                                                    src={`/${primeraImagen}`}
                                                    alt={producto.nombre}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                                            <div className={`w-full h-full flex items-center justify-center ${primeraImagen ? 'hidden' : ''}`}>
                                                                <FiImage className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Producto */}
                                                    <td className={`px-4 py-4 text-sm ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                        <div className="font-medium" title={producto.nombre}>
                                                            {truncateText(producto.nombre, 40)}
                                                        </div>
                                                        {producto.descripcion && (
                                                            <div className={`text-xs mt-1 ${
                                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                            }`} title={producto.descripcion}>
                                                                {truncateText(producto.descripcion, 50)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    
                                                    {/* SKU */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                        {producto.sku || 'N/A'}
                                                    </td>
                                                    
                                                    {/* Marca */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>
                                                        {producto.marca?.nombre || 'Sin marca'}
                                                    </td>
                                                    
                                                    {/* Precio Base (sin ganancia) */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                        <div className="font-medium">
                                                            {producto.precio_sin_ganancia ? `S/ ${parseFloat(producto.precio_sin_ganancia).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'No disponible'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">Base</div>
                                                    </td>
                                                    
                                                    {/* Precio con Ganancia (sin IGV) */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${
                                                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                                    }`}>
                                                        <div className="font-medium">
                                                            {producto.precio_ganancia ? `S/ ${parseFloat(producto.precio_ganancia).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'No disponible'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">Sin IGV</div>
                                                    </td>
                                                    
                                                    {/* Precio con IGV */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${
                                                        isDarkMode ? 'text-green-400' : 'text-green-600'
                                                    }`}>
                                                        <div className="font-medium">
                                                            {producto.precio_igv ? `S/ ${parseFloat(producto.precio_igv).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'No disponible'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">Con IGV</div>
                                                    </td>
                                                    
                                                    {/* Acciones */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleViewProduct(producto)}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                                title="Ver detalles"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditProduct(producto)}
                                                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                                title="Editar"
                                                            >
                                                                <FiEdit className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Eliminar">
                                                                <FiTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="7" className={`px-4 py-8 text-center text-sm ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FiPackage className="w-8 h-8" />
                                                        <span>No se encontraron productos</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Página {currentPage} de {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded border text-sm ${
                                                currentPage === 1
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-100'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            Anterior
                                        </button>
                                        
                                        {/* Números de página */}
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-3 py-1 rounded border text-sm ${
                                                        currentPage === pageNum
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : isDarkMode 
                                                                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                                                                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded border text-sm ${
                                                currentPage === totalPages
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-100'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Modal de Vista */}
                <ProductModal
                    producto={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />

                {/* Modal de Edición */}
                <EditProductModal
                    producto={productToEdit}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveProduct}
                />
            </CRMLayout>
        </>
    );
}