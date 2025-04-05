import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModalRelatedProducts = ({ productId, initialRelated = [], onSave, onClose }) => {
    const [relatedProducts, setRelatedProducts] = useState(initialRelated);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('similar');

    const relationTypes = [
        { value: 'accesorio', label: 'Accesorio' },
        { value: 'suministro', label: 'Suministro' },
        { value: 'otro', label: 'Otro' }
    ];

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

    const handleAddProduct = async (selectedProduct) => {
        try {
            await axios.post('/api/productos/relacionar', {
                id: productId,
                relacionado_id: selectedProduct.id,
                tipo: selectedType
            });

            setRelatedProducts(prev => [...prev, {
                ...selectedProduct,
                tipo: selectedType
            }]);
            
            setSearchTerm('');
            setSearchResults([]);
        } catch (error) {
            console.error('Error al relacionar productos:', error);
            alert('Error al relacionar los productos');
        }
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

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg z-50 max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Agregar Productos Relacionados</h3>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de relación
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-3"
                    >
                        {relationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                    
                    {/* Sección de resultados de búsqueda */}
                    {isLoading ? (
                        <div className="text-sm text-gray-500 mt-2">Buscando...</div>
                    ) : (
                        <>
                            {searchResults.length > 0 ? (
                                <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                                    {searchResults.map(product => (
                                        <div
                                            key={product.id_producto}
                                            className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                                            onClick={() => handleAddProduct({
                                                id: product.id_producto,
                                                nombre: product.nombre,
                                                sku: product.sku
                                            })}
                                        >
                                            <div className="font-medium">{product.nombre}</div>
                                            <div className="text-sm text-gray-600">
                                                SKU: {product.sku}
                                                {product.marca && (
                                                    <span className="ml-2">
                                                        | Marca: {product.marca.nombre}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Precio: S/. {product.precio_igv}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                searchTerm.length >= 2 && (
                                    <div className="text-sm text-gray-500 mt-2">
                                        No se encontraron resultados para "{searchTerm}"
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                <div className="mb-4">
                    <h4 className="font-semibold mb-2">Productos relacionados:</h4>
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
                        <p className="text-gray-500 text-sm">No hay productos relacionados.</p>
                    )}
                </div>

                <div className="flex justify-end space-x-2">
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