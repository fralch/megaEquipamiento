import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";
import { useTheme } from '../../storage/ThemeContext';

const ModalRelatedProducts = ({ productId, relatedProductId, initialRelated = [], onSave, onClose, isPendingRelation = false }) => {
    const { isDarkMode } = useTheme();
    const [relatedProducts, setRelatedProducts] = useState(initialRelated);
    const [selectedType, setSelectedType] = useState('accesorio');
    const [relationTypes, setRelationTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Obtener tipos de relaciones
    useEffect(() => {
        const fetchRelationTypes = async () => {
            try {
                const response = await axios.get('/tipos-relacion-productos');
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

    const handleAddRelation = async () => {
        if (!relatedProductId) {
            alert('No se ha especificado un producto para relacionar');
            return;
        }
        
        setIsLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };
              
            const response = await axios.post('/product/agregar-relacion', {
                id: productId,
                relacionado_id: relatedProductId,
                tipo: selectedType
            }, config);
            
            const relatedProductInfo = response.data.producto || {
                id: relatedProductId,
                nombre: response.data.nombre || 'Producto relacionado',
                sku: response.data.sku || ''
            };

            setRelatedProducts(prev => [...prev, {
                ...relatedProductInfo,
                tipo: selectedType
            }]);
            
            onSave && onSave(relatedProductInfo, selectedType);
        } catch (error) {
            console.error('Error al relacionar productos:', error);
            alert('Error al relacionar los productos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveProduct = async (relatedProduct) => {
        if (!window.confirm(`¿Estás seguro de eliminar la relación con el producto "${relatedProduct.nombre}"?`)) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };

            const response = await axios.post('/product/eliminar-relacion', {
                id: productId,
                relacionado_id: relatedProduct.id_producto || relatedProduct.id
            }, config);

            console.log('Respuesta del servidor:', response.data.message);

            setRelatedProducts(prev =>
                prev.filter(p => (p.id_producto || p.id) !== (relatedProduct.id_producto || relatedProduct.id))
            );

            alert('Relación eliminada correctamente');

        } catch (err) {
            console.error('Error al eliminar relación:', err);
            setError('Error al eliminar la relación. Por favor, inténtalo de nuevo.');
            alert('Error al eliminar la relación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg z-50 max-w-md w-full p-6`}>
                <h3 className="text-lg font-bold mb-4">
                    {isPendingRelation ? 'Establecer Relación Pendiente' : 'Agregar Relación de Producto'}
                </h3>
                
                <div className="mb-4">
                    {isPendingRelation && (
                        <div className={`mb-4 p-3 ${isDarkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded`}>
                            <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                                Este producto tiene una relación pendiente. Seleccione el tipo de relación para establecer la conexión inversa.
                            </p>
                        </div>
                    )}

                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Tipo de relación
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className={`w-full border rounded px-3 py-2 mb-3 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                        {relationTypes.map(type => (
                            <option key={type.id} value={type.nombre}>
                                {type.nombre.charAt(0).toUpperCase() + type.nombre.slice(1)}
                            </option>
                        ))}
                    </select>
                    
                    <button
                        onClick={handleAddRelation}
                        disabled={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300"
                    >
                        {isLoading ? 'Agregando...' : isPendingRelation ? 'Establecer Relación' : 'Agregar Relación'}
                    </button>
                </div>

                {!isPendingRelation && (
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Productos relacionados:</h4>
                        {relatedProducts.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {relatedProducts.map((product) => (
                                    <div key={product.id} className="py-2 flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{product.nombre}</div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                SKU: {product.sku} | Tipo: {product.tipo}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveProduct(product)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                No hay productos relacionados.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`py-2 px-4 rounded ${
                            isDarkMode 
                                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                        }`}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const RelatedProducts = ({ productId }) => {
    const { isDarkMode } = useTheme();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relationTypes, setRelationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingRelations, setPendingRelations] = useState([]);
    const [loadingPending, setLoadingPending] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isPendingRelation, setIsPendingRelation] = useState(false);
    const [pendingProduct, setPendingProduct] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Obtener tipos de relaciones y agrupar productos
    const groupedProducts = relationTypes.reduce((acc, type) => {
        acc[type.nombre] = relatedProducts.filter(
            product => product.pivot?.tipo === type.nombre
        );
        return acc;
    }, {});

    useEffect(() => {
        const fetchRelationTypes = async () => {
            try {
                const response = await axios.get('/tipos-relacion-productos');
                setRelationTypes(response.data);
            } catch (err) {
                console.error("Error fetching relation types:", err);
            }
        };

        fetchRelationTypes();
    }, []);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/product/relacion/${productId}`);
                setRelatedProducts(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching related products:", err);
                setError("No se pudieron cargar los productos relacionados.");
                setLoading(false);
            }
        };

        if (productId) {
            fetchRelatedProducts();
        }
    }, [productId]);

    useEffect(() => {
        const fetchPendingRelations = async () => {
            try {
                setLoadingPending(true);
                const response = await axios.get(`/product/con-relacion/${productId}`);
                setPendingRelations(response.data);
                setLoadingPending(false);
            } catch (err) {
                console.error("Error fetching pending relations:", err);
                setLoadingPending(false);
            }
        };

        if (productId) {
            fetchPendingRelations();
        }
    }, [productId]);

    const filteredPendingRelations = pendingRelations.filter(pendingProduct => {
        return !relatedProducts.some(relatedProduct => 
            relatedProduct.id_producto === pendingProduct.id_producto
        );
    });

    const openRelationModal = (relatedProductId, isPending = false, product = null) => {
        setSelectedProductId(relatedProductId);
        setIsPendingRelation(isPending);
        setPendingProduct(product);
        setShowModal(true);
    };

    const handleSaveRelation = (relatedProduct, relationType) => {
        setRelatedProducts(prevProducts => {
            const exists = prevProducts.some(p => p.id_producto === relatedProduct.id);
            if (exists) {
                return prevProducts.map(p => 
                    p.id_producto === relatedProduct.id 
                        ? { ...p, pivot: { ...p.pivot, tipo: relationType } } 
                        : p
                );
            } else {
                return [...prevProducts, {
                    ...relatedProduct,
                    pivot: { tipo: relationType }
                }];
            }
        });
        
        if (isPendingRelation) {
            setPendingRelations(prev => 
                prev.filter(p => p.id_producto !== relatedProduct.id)
            );
        }
        
        setShowModal(false);
    };

    const handleRemoveRelationDirectly = async (productToRemove) => {
        if (!window.confirm(`¿Estás seguro de eliminar la relación con el producto "${productToRemove.nombre}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };

            await axios.post('/product/eliminar-relacion', {
                id: productId,
                relacionado_id: productToRemove.id_producto || productToRemove.id
            }, config);

            setRelatedProducts(prev =>
                prev.filter(p => (p.id_producto || p.id) !== (productToRemove.id_producto || productToRemove.id))
            );

            alert('Relación eliminada correctamente');
            window.location.reload();

        } catch (error) {
            console.error('Error al eliminar relación:', error);
            alert('Error al eliminar la relación');
        } finally {
            setIsDeleting(false);
        }
    };

    const renderProductCard = (product, isPending = false) => (
        <div key={product.id_producto} className={`${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600' 
                : 'bg-white border-gray-200 shadow-lg'
        } rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border`}>
            <Link href={`/producto/${product.id_producto}`}>
                <div className="relative">
                    {/* Área de imagen con fondo adaptable */}
                    <div className={`h-56 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <img 
                            src={(
                                Array.isArray(product.imagen) 
                                    ? (product.imagen[0]?.startsWith('http') ? product.imagen[0] : `/${product.imagen[0]}`)
                                    : (product.imagen?.startsWith('http') ? product.imagen : `/${product.imagen}`)
                            ) || '/api/placeholder/300/200'}
                            alt={product.nombre} 
                            className="w-full h-full object-contain p-4"
                        />
                    </div>
                    
                    {/* Badge de marca */}
                    <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                            {product.marca?.nombre || 'PRODUCTO'}
                        </span>
                    </div>
                </div>
                
                {/* Área de información del producto */}
                <div className={`p-5 ${
                    isDarkMode 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-white text-gray-800'
                }`}>
                    <h3 className="text-lg font-bold mb-2 leading-tight" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                        {product.nombre}
                    </h3>
                    
                    {/* Especificaciones técnicas */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Capacidad:</span>
                            <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                {product.capacidad || '25 Litros'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Velocidad:</span>
                            <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                {product.velocidad || '1000 Rpm'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Viscosidad:</span>
                            <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                {product.viscosidad || '30000 mPa·s'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Torque:</span>
                            <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                {product.torque || '40 Ncm'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Precio y SKU */}
                    <div className="border-t border-slate-600 pt-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-2xl font-bold text-blue-400">S/ {product.precio_sin_ganancia}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                            SKU: {product.sku}
                        </div>
                    </div>
                </div>
            </Link>
            
            {/* Botón de acción */}
            <div className={`px-5 pb-4 ${
                isDarkMode 
                    ? 'bg-slate-800' 
                    : 'bg-white'
            }`}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (isPending) {
                            openRelationModal(product.id_producto, true, product);
                        } else {
                            handleRemoveRelationDirectly(product);
                        }
                    }}
                    disabled={isDeleting && !isPending}
                    className={`w-full text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${
                        isPending
                            ? isDarkMode 
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : isDarkMode
                                ? 'bg-red-700 hover:bg-red-800 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isPending ? 'Establecer Relación' : (isDeleting ? 'Eliminando...' : 'Eliminar Relación')}
                </button>
            </div>
        </div>
    );

    const renderProductGroup = (type, products) => {
        if (!products || products.length === 0) return null;
        
        return (
            <div key={type} className="mb-8">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map(product => renderProductCard(product))}
                </div>
            </div>
        );
    };

    const renderPendingRelations = () => {
        if (loadingPending) return null;
        if (!filteredPendingRelations || filteredPendingRelations.length === 0) return null;

        return (
            <div className={`mb-8 p-4 rounded-lg border ${
                isDarkMode 
                    ? 'bg-yellow-900 border-yellow-700' 
                    : 'bg-yellow-50 border-yellow-200'
            }`}>
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                    Relaciones Pendientes
                </h2>
                <p className={`mb-4 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    Los siguientes productos tienen relación con este producto, pero no existe la relación inversa:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredPendingRelations.map(product => renderProductCard(product, true))}
                </div>
                <div className={`mt-4 text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    <p>Haga clic en "Establecer Relación" para crear la relación inversa.</p>
                </div>
            </div>
        );
    };

    return (
        <div className={`py-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {renderPendingRelations()}
            
            {loading ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cargando productos relacionados...
                </div>
            ) : relatedProducts.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay productos relacionados disponibles.
                </div>
            ) : (
                relationTypes.map(type => (
                    renderProductGroup(type.nombre, groupedProducts[type.nombre])
                ))
            )}

            {showModal && (
                <ModalRelatedProducts 
                    productId={productId}
                    relatedProductId={selectedProductId}
                    initialRelated={relatedProducts.filter(p => p.id_producto === selectedProductId)}
                    onSave={handleSaveRelation}
                    onClose={() => setShowModal(false)}
                    isPendingRelation={isPendingRelation}
                />
            )}
        </div>
    );
};

export default RelatedProducts;

const ModalSearchRelatedProducts = ({ productId, initialRelated, onSave, onClose }) => {
    const { isDarkMode } = useTheme();
    const [localRelated, setLocalRelated] = useState(initialRelated);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [selectedType, setSelectedType] = useState('accesorio');
    const [relationTypes, setRelationTypes] = useState([]);

    useEffect(() => {
        const fetchRelationTypes = async () => {
            try {
                const response = await axios.get('/tipos-relacion-productos');
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

    const searchProducts = async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSearch(true);
        try {
            const response = await axios.post('/productos/buscar', { producto: term });
            if (Array.isArray(response.data)) {
                const relatedIds = localRelated.map(p => p.id_producto || p.id);
                const filteredResults = response.data.filter(p =>
                    p.id_producto !== productId && !relatedIds.includes(p.id_producto)
                );
                setSearchResults(filteredResults);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, localRelated]);

    const handleAddProduct = async (selectedProduct) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };
            await axios.post('/product/agregar-relacion', {
                id: productId,
                relacionado_id: selectedProduct.id_producto,
                tipo: selectedType
            }, config);

            setLocalRelated(prev => [...prev, {
                ...selectedProduct,
                pivot: { tipo: selectedType }
            }]);

            setSearchTerm('');
            setSearchResults([]);

        } catch (error) {
            console.error('Error al agregar relación:', error);
            alert('Error al agregar la relación');
        }
    };

    const handleSaveChanges = () => {
        onSave(localRelated);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg z-50 max-w-lg w-full p-6 max-h-[80vh] flex flex-col`}>
                <h3 className="text-lg font-bold mb-4">Buscar y Agregar Productos Relacionados</h3>

                <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tipo de relación:
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className={`w-full border rounded px-3 py-2 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                        {relationTypes.map(type => (
                            <option key={type.id} value={type.nombre}>
                                {type.nombre.charAt(0).toUpperCase() + type.nombre.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar productos por nombre o SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full border rounded px-3 py-2 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                    />
                </div>

                <div className={`flex-grow overflow-y-auto mb-4 border rounded-md ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    {isLoadingSearch ? (
                        <p className={`p-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Buscando...</p>
                    ) : searchResults.length > 0 ? (
                        <ul>
                            {searchResults.map(product => (
                                <li key={product.id_producto} className={`p-3 border-b flex justify-between items-center ${
                                    isDarkMode 
                                        ? 'border-gray-700 hover:bg-gray-700' 
                                        : 'border-gray-200 hover:bg-gray-50'
                                }`}>
                                    <div>
                                        <span className="font-medium">{product.nombre}</span>
                                        <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            (SKU: {product.sku})
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleAddProduct(product)}
                                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                    >
                                        Agregar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : searchTerm.length >= 2 ? (
                        <p className={`p-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No se encontraron resultados.
                        </p>
                    ) : (
                        <p className={`p-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Ingrese al menos 2 caracteres para buscar.
                        </p>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded ${
                            isDarkMode 
                                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                        }`}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};