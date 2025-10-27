import React, { useState, useEffect, useCallback } from 'react';
import { Head } from "@inertiajs/react";
import { FiPackage, FiEdit, FiTrash, FiPlus, FiLoader, FiEye, FiImage, FiSearch, FiFilter } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';
import ProductModal from './components/ProductModal';
import EditProductModal from './components/EditProductModal';
import TemporalProductModal from './components/TemporalProductModal';
import axios from 'axios';

export default function Productos() {
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('productos'); // 'productos' o 'temporales'
    const [productos, setProductos] = useState([]);
    const [productosTemporales, setProductosTemporales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTemporalModalOpen, setIsTemporalModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Estados para filtros
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedSubcategoria, setSelectedSubcategoria] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Función para obtener marcas
    const fetchMarcas = async () => {
        try {
            const response = await axios.get('/api/productos/crm/marcas');
            setMarcas(response.data || []);
        } catch (error) {
            console.error('Error fetching marcas:', error);
            setMarcas([]);
        }
    };

    // Función para obtener categorías
    const fetchCategorias = async () => {
        try {
            const response = await axios.get('/api/productos/crm/categorias');
            setCategorias(response.data || []);
        } catch (error) {
            console.error('Error fetching categorias:', error);
            setCategorias([]);
        }
    };

    // Función para obtener subcategorías (todas o por categoría)
    const fetchSubcategorias = async (categoriaId = null) => {
        try {
            console.log('=== fetchSubcategorias DEBUG ===');
            console.log('Called with categoriaId:', categoriaId, 'type:', typeof categoriaId);
            console.log('Stack trace:', new Error().stack);
            
            let url = '/api/productos/crm/subcategorias';
            if (categoriaId) {
                url = `/api/productos/crm/subcategorias/${categoriaId}`;
            }
            console.log('Making request to URL:', url);
            const response = await axios.get(url);
            console.log('Response received:', response.data.length, 'subcategories');
            setSubcategorias(response.data || []);
        } catch (error) {
            console.error('Error fetching subcategorias:', error);
            setSubcategorias([]);
        }
    };

    const fetchProductos = async (page = 1, itemsPerPage = 20, search = '', marcaId = '', categoriaId = '', subcategoriaId = '') => {
        try {
            setLoading(true);
            const endpoint = '/api/productos/crm';
            const response = await axios.get(endpoint, {
                params: {
                    page: page,
                    per_page: itemsPerPage,
                    ...(search && { search: search }),
                    ...(marcaId && { marca_id: marcaId }),
                    ...(categoriaId && { categoria_id: categoriaId }),
                    ...(subcategoriaId && { subcategoria_id: subcategoriaId })
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

    const fetchProductosTemporales = async (page = 1, itemsPerPage = 20, search = '', marcaId = '') => {
        try {
            setLoading(true);
            const endpoint = '/crm/productos-temporales';
            console.log('Fetching productos temporales from:', endpoint);
            console.log('Params:', { page, per_page: itemsPerPage, search, marca_id: marcaId });

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

            console.log('Response data:', response.data);
            const data = response.data;

            // El controlador puede devolver la estructura en dos formatos diferentes
            // Formato 1: Con paginación de Laravel (data.data, data.current_page, etc.)
            // Formato 2: Con estructura personalizada (data.productos, data.pagination)
            const productos = data.productos || data.data || [];
            const currentPageNum = data.pagination?.current_page || data.current_page || 1;
            const lastPageNum = data.pagination?.last_page || data.last_page || 1;
            const totalNum = data.pagination?.total || data.total || 0;
            const perPageNum = data.pagination?.per_page || data.per_page || 20;

            console.log('Productos temporales:', productos);
            console.log('Current page:', currentPageNum, 'Total:', totalNum);

            setProductosTemporales(productos);
            setCurrentPage(currentPageNum);
            setTotalPages(lastPageNum);
            setTotal(totalNum);
            setPerPage(perPageNum);
        } catch (error) {
            console.error('Error fetching productos temporales:', error);
            console.error('Error details:', error.response?.data);
            setProductosTemporales([]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos de filtros al montar el componente
    useEffect(() => {
        fetchMarcas();
        fetchCategorias();
        // Only fetch all subcategories if no category is selected
        if (!selectedCategoria) {
            fetchSubcategorias();
        }
    }, []);

    // Efecto para cambiar de tab
    useEffect(() => {
        console.log('Tab changed to:', activeTab);
        setCurrentPage(1);
        if (activeTab === 'productos') {
            console.log('Loading regular products...');
            fetchProductos(1, perPage, searchTerm, selectedMarca, selectedCategoria, selectedSubcategoria);
        } else {
            console.log('Loading temporary products...');
            fetchProductosTemporales(1, perPage, searchTerm, selectedMarca);
        }
    }, [activeTab]);

    // Actualizar productos cuando cambian los filtros (solo para productos normales)
    useEffect(() => {
        if (currentPage > 0 && activeTab === 'productos') {
            fetchProductos(currentPage, perPage, searchTerm, selectedMarca, selectedCategoria, selectedSubcategoria);
        }
    }, [selectedMarca, selectedCategoria, selectedSubcategoria]);

    // Efecto para manejar la paginación
    useEffect(() => {
        if (activeTab === 'productos') {
            fetchProductos(currentPage, perPage, searchTerm, selectedMarca, selectedCategoria, selectedSubcategoria);
        } else {
            fetchProductosTemporales(currentPage, perPage, searchTerm, selectedMarca);
        }
    }, [currentPage, perPage]);

    // Efecto para cuando cambia marca en productos temporales
    useEffect(() => {
        if (activeTab === 'temporales') {
            fetchProductosTemporales(1, perPage, searchTerm, selectedMarca);
        }
    }, [selectedMarca]);

    // Efecto para la búsqueda con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setIsSearching(true);
            if (activeTab === 'productos') {
                fetchProductos(1, perPage, searchTerm, selectedMarca, selectedCategoria, selectedSubcategoria).finally(() => {
                    setIsSearching(false);
                });
            } else {
                fetchProductosTemporales(1, perPage, searchTerm, selectedMarca).finally(() => {
                    setIsSearching(false);
                });
            }
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

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

    const handleOpenTemporalModal = () => {
        setIsTemporalModalOpen(true);
    };

    const handleCloseTemporalModal = () => {
        setIsTemporalModalOpen(false);
    };

    const handleSaveTemporalProduct = (newProduct) => {
        // Mostrar mensaje de éxito
        alert('Producto temporal creado exitosamente. Ahora puedes usarlo en tus cotizaciones.');
        handleCloseTemporalModal();
        // Recargar productos temporales
        if (activeTab === 'temporales') {
            fetchProductosTemporales(currentPage, perPage, searchTerm, selectedMarca);
        }
    };

    const handleDeleteTemporalProduct = async (id) => {
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
            <Head title="Productos" />
            <CRMLayout title="Gestión de Productos">
                <div className="p-6">
                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('productos')}
                                    className={`${
                                        activeTab === 'productos'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                >
                                    <FiPackage className="w-5 h-5" />
                                    Productos
                                </button>
                                <button
                                    onClick={() => setActiveTab('temporales')}
                                    className={`${
                                        activeTab === 'temporales'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                >
                                    <FiPlus className="w-5 h-5" />
                                    Productos Temporales
                                </button>
                            </nav>
                        </div>
                    </div>

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

                    {/* Filtro de Marca para productos temporales */}
                    {activeTab === 'temporales' && (
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
                    )}

                    {/* Sección de Filtros - Solo para productos normales */}
                    {activeTab === 'productos' && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                    isDarkMode
                                        ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <FiFilter className="w-4 h-4" />
                                <span>Filtros</span>
                                <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            
                            {/* Indicadores de filtros activos */}
                            {(selectedMarca || selectedCategoria || selectedSubcategoria) && (
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Filtros activos:
                                    </span>
                                    {selectedMarca && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Marca: {marcas.find(m => m.id_marca == selectedMarca)?.nombre}
                                        </span>
                                    )}
                                    {selectedCategoria && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Categoría: {categorias.find(c => c.id_categoria == selectedCategoria)?.nombre}
                                        </span>
                                    )}
                                    {selectedSubcategoria && (
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                            Subcategoría: {subcategorias.find(s => s.id_subcategoria == selectedSubcategoria)?.nombre}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedMarca('');
                                            setSelectedCategoria('');
                                            setSelectedSubcategoria('');
                                            // Reset subcategories to show all when clearing filters
                                            fetchSubcategorias();
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Panel de filtros */}
                        {showFilters && (
                            <div className={`p-4 rounded-lg border ${
                                isDarkMode 
                                    ? 'bg-gray-800 border-gray-700' 
                                    : 'bg-gray-50 border-gray-200'
                            }`}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Filtro por Marca */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Marca
                                        </label>
                                        <select
                                            value={selectedMarca}
                                            onChange={(e) => setSelectedMarca(e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
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

                                    {/* Filtro por Categoría */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Categoría
                                        </label>
                                        <select
                                            value={selectedCategoria}
                                            onChange={(e) => {
                                                const newCategoriaId = e.target.value;
                                                console.log('Category onChange - raw value:', newCategoriaId, 'type:', typeof newCategoriaId);
                                                setSelectedCategoria(newCategoriaId);
                                                // Reset subcategory selection when category changes
                                                setSelectedSubcategoria('');
                                                // Fetch subcategories for the selected category
                                                if (newCategoriaId && newCategoriaId !== '') {
                                                    console.log('Calling fetchSubcategorias with ID:', newCategoriaId);
                                                    fetchSubcategorias(newCategoriaId);
                                                } else {
                                                    console.log('Calling fetchSubcategorias without ID (all subcategories)');
                                                    fetchSubcategorias(); // Fetch all subcategories
                                                }
                                            }}
                                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        >
                                            <option value="">Todas las categorías</option>
                                            {categorias.map((categoria) => (
                                                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                                    {categoria.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro por Subcategoría */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Subcategoría
                                        </label>
                                        <select
                                            value={selectedSubcategoria}
                                            onChange={(e) => setSelectedSubcategoria(e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        >
                                            <option value="">Todas las subcategorías</option>
                                            {subcategorias.map((subcategoria) => (
                                                <option key={subcategoria.id_subcategoria} value={subcategoria.id_subcategoria}>
                                                    {subcategoria.nombre} ({subcategoria.categoria?.nombre})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    )}

                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {activeTab === 'productos'
                                    ? (searchTerm ? `Resultados de búsqueda: ${productos.length} de ${total}` : `Mostrando ${productos.length} de ${total} productos`)
                                    : (searchTerm ? `Resultados de búsqueda: ${productosTemporales.length} de ${total}` : `Mostrando ${productosTemporales.length} de ${total} productos temporales`)
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
                        {activeTab === 'temporales' && (
                            <button
                                onClick={handleOpenTemporalModal}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <FiPlus className="w-4 h-4" />
                                Agregar Producto Temporal
                            </button>
                        )}
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
                                        {(activeTab === 'productos' ? productos : productosTemporales).length > 0 ? (activeTab === 'productos' ? productos : productosTemporales).map((producto) => {
                                            const primeraImagen = activeTab === 'productos'
                                                ? (producto.imagen && Array.isArray(producto.imagen) && producto.imagen.length > 0 ? producto.imagen[0] : null)
                                                : (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0 ? producto.imagenes[0] : null);

                                            return (
                                                <tr key={activeTab === 'productos' ? producto.id_producto : producto.id} className={`${
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
                                                        <div className="font-medium" title={activeTab === 'productos' ? producto.nombre : producto.titulo}>
                                                            {truncateText(activeTab === 'productos' ? producto.nombre : producto.titulo, 40)}
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
                                                        {activeTab === 'productos' ? (producto.sku || 'N/A') : (producto.procedencia || 'N/A')}
                                                    </td>

                                                    {/* Marca */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>
                                                        {producto.marca?.nombre || 'Sin marca'}
                                                    </td>

                                                    {/* Precio Base (sin ganancia) - Solo para productos normales */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                        {activeTab === 'productos' ? (
                                                            <>
                                                                <div className="font-medium">
                                                                    {producto.precio_sin_ganancia ? `S/ ${parseFloat(producto.precio_sin_ganancia).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'No disponible'}
                                                                </div>
                                                                <div className="text-xs text-gray-400">Base</div>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>

                                                    {/* Precio con Ganancia (sin IGV) - Para productos normales, o precio para temporales */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${
                                                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                                    }`}>
                                                        {activeTab === 'productos' ? (
                                                            <>
                                                                <div className="font-medium">
                                                                    {producto.precio_ganancia ? `S/ ${parseFloat(producto.precio_ganancia).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'No disponible'}
                                                                </div>
                                                                <div className="text-xs text-gray-400">Sin IGV</div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="font-medium">
                                                                    {producto.precio ? `S/ ${parseFloat(producto.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'No disponible'}
                                                                </div>
                                                                <div className="text-xs text-gray-400">Precio</div>
                                                            </>
                                                        )}
                                                    </td>

                                                    {/* Precio con IGV - Solo para productos normales */}
                                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${
                                                        isDarkMode ? 'text-green-400' : 'text-green-600'
                                                    }`}>
                                                        {activeTab === 'productos' ? (
                                                            <>
                                                                <div className="font-medium">
                                                                    {producto.precio_igv ? `S/ ${parseFloat(producto.precio_igv).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'No disponible'}
                                                                </div>
                                                                <div className="text-xs text-gray-400">Con IGV</div>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    
                                                    {/* Acciones */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex gap-2">
                                                            {activeTab === 'productos' ? (
                                                                <>
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
                                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                                        title="Eliminar"
                                                                    >
                                                                        <FiTrash className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleViewProduct(producto)}
                                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                                        title="Ver detalles"
                                                                    >
                                                                        <FiEye className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteTemporalProduct(producto.id)}
                                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                                        title="Eliminar"
                                                                    >
                                                                        <FiTrash className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="8" className={`px-4 py-8 text-center text-sm ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                    <div className="flex flex-col items-center gap-4">
                                                        <FiPackage className="w-12 h-12" />
                                                        <div>
                                                            <p className="font-medium text-lg mb-2">
                                                                {activeTab === 'productos'
                                                                    ? 'No se encontraron productos'
                                                                    : 'No hay productos temporales'}
                                                            </p>
                                                            {activeTab === 'temporales' && (
                                                                <p className="text-sm">
                                                                    Haz clic en "Agregar Producto Temporal" para crear uno
                                                                </p>
                                                            )}
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

                {/* Modal de Producto Temporal */}
                <TemporalProductModal
                    isOpen={isTemporalModalOpen}
                    onClose={handleCloseTemporalModal}
                    onSave={handleSaveTemporalProduct}
                />
            </CRMLayout>
        </>
    );
}