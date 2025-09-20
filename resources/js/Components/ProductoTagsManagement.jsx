import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../storage/ThemeContext';
import ProductTagSelector from './ProductTagSelector';

const ProductoTagsManagement = ({ initialProductos, initialTags, initialTagParents, initialFilters }) => {
    const { isDarkMode } = useTheme();
    const [productos, setProductos] = useState(initialProductos?.data || []);
    const [tags, setTags] = useState(initialTags || []);
    const [tagParents, setTagParents] = useState(initialTagParents || []);
    const [filters, setFilters] = useState(initialFilters || {});
    const [selectedProductForTags, setSelectedProductForTags] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    // Efecto para manejar filtros iniciales
    useEffect(() => {
        if (initialFilters?.tag_id || (initialFilters?.search && initialFilters.search.trim().length >= 2)) {
            setFilters(initialFilters);
            if (initialFilters.tag_id) {
                filtrarProductosPorTag(initialFilters.tag_id, 1);
            } else if (initialFilters.search && initialFilters.search.trim().length >= 2) {
                buscarProductosEnServidor(initialFilters.search.trim(), 1);
            }
        }
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Resetear página cuando cambian los filtros
        setCurrentPage(1);

        // Realizar búsqueda en el servidor si hay término de búsqueda
        if (key === 'search' && value && value.trim().length >= 2) {
            buscarProductosEnServidor(value.trim(), 1);
        } else if (key === 'search' && (!value || value.trim().length < 2)) {
            // Si no hay búsqueda o es muy corta, considerar filtro de tag
            if (newFilters.tag_id) {
                filtrarProductosPorTag(newFilters.tag_id, 1);
            } else {
                setProductos(initialProductos?.data || []);
                setPagination(null);
                setCurrentPage(1);
            }
        } else if (key === 'tag_id') {
            // Para filtro de tag, hacer consulta al servidor
            if (value) {
                filtrarProductosPorTag(value, 1);
            } else {
                // Si se quita el filtro de tag, verificar si hay búsqueda
                if (newFilters.search && newFilters.search.trim().length >= 2) {
                    buscarProductosEnServidor(newFilters.search.trim(), 1);
                } else {
                    setProductos(initialProductos?.data || []);
                    setPagination(null);
                    setCurrentPage(1);
                }
            }
        } else {
            // Para otros filtros, filtrar localmente
            filterProductos(newFilters);
        }
    };

    const filterProductos = (currentFilters) => {
        let filtered = initialProductos?.data || [];

        // Nota: El filtro por tags ahora se hace desde el servidor
        // Solo aplicar otros filtros locales si es necesario

        setProductos(filtered);
    };

    const buscarProductosEnServidor = async (termino, page = 1) => {
        setLoading(true);
        try {
            const requestData = {
                producto: termino,
                page: page
            };

            // Si hay filtro de tag activo, incluirlo en la búsqueda
            if (filters.tag_id) {
                requestData.tag_id = filters.tag_id;
            }

            const response = await axios.post('/productos/buscar-relacionados', requestData);
            setProductos(response.data.data || response.data);
            setPagination(response.data);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            showMessage('error', 'Error al buscar productos');
        } finally {
            setLoading(false);
        }
    };

    const filtrarProductosPorTag = async (tagId, page = 1) => {
        setLoading(true);
        try {
            if (tagId) {
                // Si hay un tag seleccionado, buscar todos los productos con ese tag
                const requestData = {
                    tag_id: tagId,
                    page: page
                };

                // Si también hay búsqueda activa, incluir el término de búsqueda
                if (filters.search && filters.search.trim().length >= 2) {
                    requestData.producto = filters.search.trim();
                } else {
                    // Si no hay búsqueda, usar "*" para obtener todos los productos con el tag
                    requestData.producto = "*";
                }

                const response = await axios.post('/productos/buscar-relacionados', requestData);
                setProductos(response.data.data || response.data);
                setPagination(response.data);
            } else {
                // Si no hay tag seleccionado
                if (filters.search && filters.search.trim().length >= 2) {
                    // Si hay búsqueda activa, buscar sin tag
                    const response = await axios.post('/productos/buscar-relacionados', {
                        producto: filters.search.trim(),
                        page: page
                    });
                    setProductos(response.data.data || response.data);
                    setPagination(response.data);
                } else {
                    // Si no hay búsqueda ni tag, mostrar productos iniciales
                    setProductos(initialProductos?.data || []);
                    setPagination(null);
                }
            }
            setCurrentPage(page);
        } catch (error) {
            console.error('Error al filtrar por tag:', error);
            showMessage('error', 'Error al filtrar productos por tag');
        } finally {
            setLoading(false);
        }
    };



    const loadStats = async () => {
        try {
            const response = await axios.get('/admin/producto-tags/stats');
            setStats(response.data.stats);
            setShowStats(true);
        } catch (error) {
            console.error('Error loading stats:', error);
            showMessage('error', 'Error al cargar estadísticas');
        }
    };

    const getTagColor = (tag) => {
        if (tag.tag_parent?.color) {
            return tag.tag_parent.color;
        }
        return tag.color || '#3B82F6';
    };

    const handlePageChange = (page) => {
        if (filters.tag_id) {
            filtrarProductosPorTag(filters.tag_id, page);
        } else if (filters.search && filters.search.trim().length >= 2) {
            buscarProductosEnServidor(filters.search.trim(), page);
        }
    };

    const clearFilters = () => {
        setFilters({});
        setProductos(initialProductos?.data || []);
        setPagination(null);
        setCurrentPage(1);
    };

    return (
        <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {message.text && (
                <div className={`p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Filters */}
            <div className={`p-6 rounded-lg shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <h2 className="text-2xl font-bold mb-4">Filtros y Búsqueda</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Buscar Producto
                        </label>
                        <input
                            type="text"
                            placeholder="Nombre o SKU"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Filtrar por Tag
                        </label>
                        <select
                            value={filters.tag_id || ''}
                            onChange={(e) => handleFilterChange('tag_id', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <option value="">Todos los productos</option>
                            {tagParents.map(parent => (
                                <optgroup key={parent.id_tag_parent} label={parent.nombre}>
                                    {parent.tags?.map(tag => (
                                        <option key={tag.id_tag} value={tag.id_tag}>
                                            {tag.nombre}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                            <optgroup label="Tags Independientes">
                                {tags.filter(tag => !tag.id_tag_parent).map(tag => (
                                    <option key={tag.id_tag} value={tag.id_tag}>
                                        {tag.nombre}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                     <div className="flex items-end space-x-2">
                         <button
                             onClick={clearFilters}
                             disabled={!filters.tag_id && !filters.search}
                             className={`px-4 py-2 rounded-lg font-medium ${
                                 !filters.tag_id && !filters.search
                                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                     : isDarkMode
                                         ? 'bg-red-600 hover:bg-red-700 text-white'
                                         : 'bg-red-500 hover:bg-red-600 text-white'
                             }`}
                         >
                             Limpiar Filtros
                         </button>
                         <button
                             onClick={loadStats}
                             className={`px-4 py-2 rounded-lg font-medium ${
                                 isDarkMode
                                     ? 'bg-blue-600 hover:bg-blue-700'
                                     : 'bg-blue-500 hover:bg-blue-600'
                             } text-white`}
                         >
                             Ver Estadísticas
                         </button>
                     </div>
                </div>
            </div>



            {/* Products List */}
            <div className={`p-6 rounded-lg shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold">
                        Productos ({pagination ? pagination.total : productos.length})
                        {filters.tag_id && (
                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                                filtrados por tag
                            </span>
                        )}
                        {filters.search && (
                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                                búsqueda: "{filters.search}"
                            </span>
                        )}
                    </h2>
                    {loading && (
                        <div className="flex items-center mt-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Cargando productos...</span>
                        </div>
                    )}
                </div>
                
                <div className={`overflow-x-auto rounded-lg border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <table className="w-full">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    SKU
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Tags Actuales
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {productos.map((producto) => (
                                <tr key={producto.id_producto} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {producto.imagen?.[0] && (
                                                <img
                                                    src={producto.imagen[0]}
                                                    alt={producto.nombre}
                                                    className="w-10 h-10 rounded-lg mr-3 object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{producto.nombre}</div>
                                                <div className="text-sm opacity-75">
                                                    {producto.subcategoria?.categoria?.nombre} - {producto.subcategoria?.nombre}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {producto.sku}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {producto.tags?.map((tag) => (
                                                <span
                                                    key={tag.id_tag}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                                    style={{ backgroundColor: getTagColor(tag) }}
                                                    title={tag.tag_parent?.nombre ? `${tag.tag_parent.nombre} - ${tag.nombre}` : tag.nombre}
                                                >
                                                    {tag.nombre}
                                                </span>
                                            )) || <span className="text-gray-500 text-sm">Sin tags</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => setSelectedProductForTags(producto)}
                                            className={`px-3 py-1 rounded text-xs font-medium ${
                                                isDarkMode
                                                    ? 'bg-blue-600 hover:bg-blue-700'
                                                    : 'bg-blue-500 hover:bg-blue-600'
                                            } text-white`}
                                        >
                                            Gestionar Tags
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Mostrando {pagination.from || 0} a {pagination.to || 0} de {pagination.total || 0} productos
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    currentPage === 1 || loading
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                            >
                                Anterior
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= pagination.last_page - 2) {
                                        pageNum = pagination.last_page - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            disabled={loading}
                                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                            } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.last_page || loading}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    currentPage === pagination.last_page || loading
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Modal */}
            {showStats && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Estadísticas de Tags</h3>
                            <button
                                onClick={() => setShowStats(false)}
                                className={`px-3 py-1 rounded ${
                                    isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'
                                } text-white`}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                    <tr>
                                        <th className="px-4 py-2 text-left">Tag</th>
                                        <th className="px-4 py-2 text-left">Sector</th>
                                        <th className="px-4 py-2 text-left">Productos</th>
                                        <th className="px-4 py-2 text-left">Vista Previa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((stat) => (
                                        <tr key={stat.id_tag} className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                                            <td className="px-4 py-2">{stat.tag_nombre}</td>
                                            <td className="px-4 py-2">{stat.sector_nombre || 'Independiente'}</td>
                                            <td className="px-4 py-2">{stat.productos_count}</td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                                    style={{ backgroundColor: stat.sector_color || stat.color || '#3B82F6' }}
                                                >
                                                    {stat.tag_nombre}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Tag Selector Modal */}
            {selectedProductForTags && (
                <ProductTagSelector
                    producto={selectedProductForTags}
                    tags={tags}
                    tagParents={tagParents}
                    onClose={() => setSelectedProductForTags(null)}
                    onSave={(updatedProduct) => {
                        // Update the product in the list
                        setProductos(prev => 
                            prev.map(p => 
                                p.id_producto === updatedProduct.id_producto 
                                    ? { ...p, tags: updatedProduct.tags }
                                    : p
                            )
                        );
                        setSelectedProductForTags(null);
                        showMessage('success', 'Tags actualizados correctamente');
                    }}
                />
            )}
        </div>
    );
};

export default ProductoTagsManagement;