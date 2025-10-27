import React, { useState, useEffect } from 'react';
import { Head } from "@inertiajs/react";
import { FiPlus, FiLoader, FiEye, FiEdit, FiTrash, FiImage, FiSearch } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';
import TemporalProductModal from './components/TemporalProductModal';
import EditTemporalProductModal from './components/EditTemporalProductModal';
import ViewTemporalProductModal from './components/ViewTemporalProductModal';
import axios from 'axios';

export default function ProductosTemporales() {
    const { isDarkMode } = useTheme();
    const [productosTemporales, setProductosTemporales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Estados para modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [productToView, setProductToView] = useState(null);

    // Estados para filtros
    const [marcas, setMarcas] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState('');

    // Cargar marcas al montar el componente
    useEffect(() => {
        fetchMarcas();
    }, []);

    const fetchMarcas = async () => {
        try {
            const response = await axios.get('/crm/productos-temporales/marcas');
            if (response.data.success) {
                setMarcas(response.data.marcas || []);
            }
        } catch (error) {
            console.error('Error fetching marcas:', error);
            setMarcas([]);
        }
    };

    const fetchProductosTemporales = async (page = 1, itemsPerPage = 20, search = '', marcaId = '') => {
        try {
            setLoading(true);
            const endpoint = '/crm/productos-temporales';

            const response = await axios.get(endpoint, {
                params: {
                    page: page,
                    per_page: itemsPerPage,
                    ...(search && { search: search }),
                    ...(marcaId && { marca_id: marcaId })
                },
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = response.data;
            const productos = data.productos || data.data || [];
            const currentPageNum = data.pagination?.current_page || data.current_page || 1;
            const lastPageNum = data.pagination?.last_page || data.last_page || 1;
            const totalNum = data.pagination?.total || data.total || 0;
            const perPageNum = data.pagination?.per_page || data.per_page || 20;

            setProductosTemporales(productos);
            setCurrentPage(currentPageNum);
            setTotalPages(lastPageNum);
            setTotal(totalNum);
            setPerPage(perPageNum);
        } catch (error) {
            console.error('Error fetching productos temporales:', error);
            setProductosTemporales([]);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para manejar la paginación
    useEffect(() => {
        fetchProductosTemporales(currentPage, perPage, searchTerm, selectedMarca);
    }, [currentPage, perPage]);

    // Efecto para la búsqueda con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setIsSearching(true);
            fetchProductosTemporales(1, perPage, searchTerm, selectedMarca).finally(() => {
                setIsSearching(false);
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Efecto para cuando cambia marca
    useEffect(() => {
        fetchProductosTemporales(1, perPage, searchTerm, selectedMarca);
    }, [selectedMarca]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    const truncateText = (text, maxLength = 30) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Handlers para modales
    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleSaveProduct = (newProduct) => {
        alert('Producto temporal creado exitosamente');
        handleCloseCreateModal();
        fetchProductosTemporales(currentPage, perPage, searchTerm, selectedMarca);
    };

    const handleViewProduct = (producto) => {
        setProductToView(producto);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setProductToView(null);
    };

    const handleEditProduct = (producto) => {
        setProductToEdit(producto);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setProductToEdit(null);
    };

    const handleSaveEditedProduct = (updatedProduct) => {
        setProductosTemporales(prevProductos =>
            prevProductos.map(p =>
                p.id === updatedProduct.id ? updatedProduct : p
            )
        );
        alert('Producto temporal actualizado exitosamente');
        handleCloseEditModal();
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto temporal?')) {
            return;
        }

        try {
            await axios.delete(`/crm/productos-temporales/${id}/delete`);
            alert('Producto temporal eliminado exitosamente');
            fetchProductosTemporales(currentPage, perPage, searchTerm, selectedMarca);
        } catch (error) {
            console.error('Error deleting temporal product:', error);
            alert('Error al eliminar el producto temporal');
        }
    };

    return (
        <>
            <Head title="Productos Temporales" />
            <CRMLayout title="Gestión de Productos Temporales">
                <div className="p-6">
                    {/* Header con descripción */}
                    <div className="mb-6">
                        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Productos Temporales
                        </h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Gestiona productos que están disponibles solo para cotizaciones sin estar en el catálogo principal
                        </p>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar productos temporales..."
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

                    {/* Filtro de Marca */}
                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Filtrar por Marca
                        </label>
                        <select
                            value={selectedMarca}
                            onChange={(e) => setSelectedMarca(e.target.value)}
                            className={`w-full max-w-xs px-3 py-2 border rounded-lg text-sm ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        >
                            <option value="">Todas las marcas</option>
                            {marcas.map((marca) => (
                                <option key={marca.id_marca} value={marca.id_marca}>
                                    {marca.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Contador y botón de crear */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {searchTerm
                                    ? `Resultados de búsqueda: ${productosTemporales.length} de ${total}`
                                    : `Mostrando ${productosTemporales.length} de ${total} productos temporales`
                                }
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
                        <button
                            onClick={handleOpenCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <FiPlus className="w-4 h-4" />
                            Crear Producto Temporal
                        </button>
                    </div>

                    {/* Tabla de productos */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Cargando productos temporales...
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
                                            }`}>Procedencia</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Marca</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Precio</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                        {productosTemporales.length > 0 ? productosTemporales.map((producto) => {
                                            const primeraImagen = producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0
                                                ? producto.imagenes[0]
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
                                                                    alt={producto.titulo}
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
                                                        <div className="font-medium" title={producto.titulo}>
                                                            {truncateText(producto.titulo, 40)}
                                                        </div>
                                                        {producto.descripcion && (
                                                            <div className={`text-xs mt-1 ${
                                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                            }`} title={producto.descripcion}>
                                                                {truncateText(producto.descripcion, 50)}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Procedencia */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                        {producto.procedencia || 'N/A'}
                                                    </td>

                                                    {/* Marca */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>
                                                        {producto.marca?.nombre || 'Sin marca'}
                                                    </td>

                                                    {/* Precio */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${
                                                        isDarkMode ? 'text-green-400' : 'text-green-600'
                                                    }`}>
                                                        <div className="font-medium">
                                                            {producto.precio ? `$${parseFloat(producto.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'No disponible'}
                                                        </div>
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
                                                            <button
                                                                onClick={() => handleDeleteProduct(producto.id)}
                                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                                title="Eliminar"
                                                            >
                                                                <FiTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="6" className={`px-4 py-8 text-center text-sm ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    <div className="flex flex-col items-center gap-4">
                                                        <FiImage className="w-12 h-12" />
                                                        <div>
                                                            <p className="font-medium text-lg mb-2">
                                                                No hay productos temporales
                                                            </p>
                                                            <p className="text-sm">
                                                                Haz clic en "Crear Producto Temporal" para agregar uno
                                                            </p>
                                                        </div>
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

                {/* Modales */}
                <TemporalProductModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    onSave={handleSaveProduct}
                />

                <EditTemporalProductModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveEditedProduct}
                    producto={productToEdit}
                />

                <ViewTemporalProductModal
                    isOpen={isViewModalOpen}
                    onClose={handleCloseViewModal}
                    producto={productToView}
                />
            </CRMLayout>
        </>
    );
}
