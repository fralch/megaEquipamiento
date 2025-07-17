import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../storage/ThemeContext';

const ModalRelatedProducts = ({ productId, initialRelated = [], onSave, onClose }) => {
    const { isDarkMode } = useTheme();
    const [relatedProducts, setRelatedProducts] = useState(initialRelated);
    const [pendingRelations, setPendingRelations] = useState([]); // Estado temporal para relaciones pendientes
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Estado para el botón guardar
    const [selectedType, setSelectedType] = useState('accesorio');
    const [relationTypes, setRelationTypes] = useState([]);

    // Obtener tipos de relaciones
    useEffect(() => {
        const fetchRelationTypes = async () => {
            try {
                const response = await axios.get('/tipos-relacion-productos');
                console.log(response.data);
                setRelationTypes(response.data);
                if (response.data.length > 0) {
                    setSelectedType(response.data[0].nombre);
                }
            } catch (error) {
                console.error('Error al obtener tipos de relaciones:', error);
            }
        };

        fetchRelationTypes();
    }, []);

    // Búsqueda de productos
    const searchProducts = async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/productos/buscar', {
                producto: term
            });

            // Verifica que la respuesta sea un array
            if (Array.isArray(response.data)) {
                const filteredResults = response.data.filter(p => p.id_producto !== productId);
                setSearchResults(filteredResults);
            } else {
                console.error('La respuesta no es un array:', response.data);
                setSearchResults([]);
            }

        } catch (error) {
            console.error('Error en la búsqueda:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleAddProduct = (selectedProduct) => {
        // Verificar si el producto ya está en relaciones existentes o pendientes
        const isAlreadyRelated = relatedProducts.some(p => p.id === selectedProduct.id && p.tipo === selectedType);
        const isAlreadyPending = pendingRelations.some(p => p.id === selectedProduct.id && p.tipo === selectedType);

        if (isAlreadyRelated || isAlreadyPending) {
            alert('El producto ya está relacionado con el tipo seleccionado');
            return;
        }

        // Agregar al estado temporal
        setPendingRelations(prev => [...prev, {
            ...selectedProduct,
            tipo: selectedType
        }]);

        setSearchTerm('');
        setSearchResults([]);
    };

    const handleRemoveProduct = async (relatedProduct) => {
        try {
            await axios.delete(`/api/productos/${productId}/relaciones/${relatedProduct.id}`);
            setRelatedProducts(prev => prev.filter(p => p.id !== relatedProduct.id));
        } catch (error) {
            console.error('Error al eliminar relación:', error);
            alert('Error al eliminar la relación');
        }
    };

    const handleRemovePendingProduct = (productToRemove) => {
        setPendingRelations(prev => prev.filter(p =>
            !(p.id === productToRemove.id && p.tipo === productToRemove.tipo)
        ));
    };

    const handleSaveRelations = async () => {
        if (pendingRelations.length === 0) {
            alert('No hay relaciones pendientes para guardar');
            return;
        }

        setIsSaving(true);
        try {
            // Guardar cada relación pendiente
            for (const relation of pendingRelations) {
                await axios.post('/product/agregar-relacion', {
                    id: productId,
                    relacionado_id: relation.id,
                    tipo: relation.tipo
                });
            }

            // Mover las relaciones pendientes a relaciones guardadas
            setRelatedProducts(prev => [...prev, ...pendingRelations]);
            setPendingRelations([]);

            alert('Relaciones guardadas exitosamente');

            // Llamar a onSave si está definido
            if (onSave) {
                onSave();
            }
        } catch (error) {
            console.error('Error al guardar relaciones:', error);

            if (error.response && error.response.status === 409) {
                alert('Una o más relaciones ya existen');
            } else {
                alert('Error al guardar las relaciones');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg z-50 max-w-md w-full p-6`}>
                <h3 className="text-lg font-bold mb-4">Agregar Productos Relacionados</h3>

                <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tipo de relación
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className={`w-full border rounded px-3 py-2 mb-3 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        }`}
                    >
                        {relationTypes.map(type => (
                            <option key={type.id} value={type.nombre}>
                                {type.nombre.charAt(0).toUpperCase() + type.nombre.slice(1)}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full border rounded px-3 py-2 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        }`}
                    />

                    {/* Sección de resultados de búsqueda */}
                    {isLoading ? (
                        <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Buscando...</div>
                    ) : (
                        <>
                            {searchResults.length > 0 ? (
                                <div className={`mt-2 border rounded-md max-h-60 overflow-y-auto ${
                                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                }`}>
                                    {searchResults.map(product => (
                                        <div
                                            key={product.id_producto}
                                            className={`p-2 cursor-pointer border-b ${
                                                isDarkMode 
                                                    ? 'hover:bg-gray-700 border-gray-600' 
                                                    : 'hover:bg-gray-100 border-gray-200'
                                            }`}
                                            onClick={() => handleAddProduct({
                                                id: product.id_producto,
                                                nombre: product.nombre,
                                                sku: product.sku
                                            })}
                                        >
                                            <div className="font-medium">{product.nombre}</div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                SKU: {product.sku}
                                                {product.marca && (
                                                    <span className="ml-2">
                                                        | Marca: {product.marca.nombre}
                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                searchTerm.length >= 2 && (
                                    <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        No se encontraron resultados para "{searchTerm}"
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                {/* Sección de relaciones pendientes */}
                {pendingRelations.length > 0 && (
                    <div className="mb-4">
                        <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Relaciones pendientes por guardar:</h4>
                        <div className={`divide-y rounded p-2 ${
                            isDarkMode 
                                ? 'bg-orange-900/20 divide-gray-600' 
                                : 'bg-orange-50 divide-gray-200'
                        }`}>
                            {pendingRelations.map((product, index) => (
                                <div key={`${product.id}-${product.tipo}-${index}`} className="py-2 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{product.nombre}</div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            SKU: {product.sku} | Tipo: {product.tipo}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemovePendingProduct(product)}
                                        className={`text-sm ${
                                            isDarkMode 
                                                ? 'text-red-400 hover:text-red-300' 
                                                : 'text-red-500 hover:text-red-700'
                                        }`}
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <h4 className="font-semibold mb-2">Productos relacionados guardados:</h4>
                    {relatedProducts.length > 0 ? (
                        <div className="divide-y">
                            {relatedProducts.map((product) => (
                                <div key={product.id} className="py-2 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{product.nombre}</div>
                                        <div className="text-sm text-gray-600">
                                            SKU: {product.sku} | Tipo: {product.tipo}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveProduct(product)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No hay productos relacionados guardados.</p>
                    )}
                </div>

                <div className="flex justify-end space-x-2">
                    {pendingRelations.length > 0 && (
                        <button
                            onClick={handleSaveRelations}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Relaciones'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalRelatedProducts;