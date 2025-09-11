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
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedProductForTags, setSelectedProductForTags] = useState(null);
    const [bulkAction, setBulkAction] = useState('attach');
    const [bulkTags, setBulkTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState([]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        // Aquí podrías hacer una llamada al servidor para filtrar
        // Por ahora filtraremos localmente
        filterProductos(newFilters);
    };

    const filterProductos = (currentFilters) => {
        let filtered = initialProductos?.data || [];

        if (currentFilters.search) {
            filtered = filtered.filter(producto => 
                producto.nombre.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                producto.sku.toLowerCase().includes(currentFilters.search.toLowerCase())
            );
        }

        if (currentFilters.tag_id) {
            filtered = filtered.filter(producto => 
                producto.tags?.some(tag => tag.id_tag == currentFilters.tag_id)
            );
        }

        setProductos(filtered);
    };

    const handleProductSelection = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === productos.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(productos.map(p => p.id_producto));
        }
    };

    const handleBulkTagUpdate = async () => {
        if (selectedProducts.length === 0 || bulkTags.length === 0) {
            showMessage('error', 'Selecciona productos y tags para continuar');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/admin/producto-tags/bulk-assign', {
                producto_ids: selectedProducts,
                tag_ids: bulkTags,
                action: bulkAction
            });

            showMessage('success', `Tags ${bulkAction === 'attach' ? 'agregados' : bulkAction === 'detach' ? 'removidos' : 'sincronizados'} exitosamente`);
            
            // Refresh data
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            showMessage('error', 'Error al actualizar tags');
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
                    <div className="flex items-end">
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

            {/* Bulk Actions */}
            <div className={`p-6 rounded-lg shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <h2 className="text-2xl font-bold mb-4">Acciones Masivas</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Acción
                        </label>
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <option value="attach">Agregar Tags</option>
                            <option value="detach">Remover Tags</option>
                            <option value="sync">Reemplazar Tags</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Seleccionar Tags
                        </label>
                        <select
                            multiple
                            value={bulkTags}
                            onChange={(e) => setBulkTags(Array.from(e.target.selectedOptions, option => option.value))}
                            className={`w-full px-3 py-2 border rounded-lg ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300'
                            }`}
                        >
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
                    <div className="flex items-end">
                        <button
                            onClick={handleBulkTagUpdate}
                            disabled={loading || selectedProducts.length === 0}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                isDarkMode
                                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800'
                                    : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                            } text-white disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Procesando...' : 'Aplicar'}
                        </button>
                    </div>
                    <div className="flex items-end">
                        <span className="text-sm">
                            {selectedProducts.length} productos seleccionados
                        </span>
                    </div>
                </div>
            </div>

            {/* Products List */}
            <div className={`p-6 rounded-lg shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Productos ({productos.length})</h2>
                    <button
                        onClick={handleSelectAll}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            isDarkMode
                                ? 'bg-gray-600 hover:bg-gray-700'
                                : 'bg-gray-500 hover:bg-gray-600'
                        } text-white`}
                    >
                        {selectedProducts.length === productos.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                    </button>
                </div>
                
                <div className={`overflow-x-auto rounded-lg border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <table className="w-full">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === productos.length && productos.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded"
                                    />
                                </th>
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
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(producto.id_producto)}
                                            onChange={() => handleProductSelection(producto.id_producto)}
                                            className="rounded"
                                        />
                                    </td>
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