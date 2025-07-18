import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Link, usePage } from "@inertiajs/react";
import { useTheme } from '../../storage/ThemeContext';
import { CartContext } from '../../storage/CartContext';
import { useCurrency } from '../../storage/CurrencyContext';
import { useCompare } from '../../hooks/useCompare';
import countryCodeMap from '../store/countryJSON.json';

const ModalPendingRelation = ({ productId, relatedProductId, initialRelated = [], onSave, onClose, isPendingRelation = false }) => {
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
    const { formatPrice } = useCurrency();
    const { cart, dispatch } = useContext(CartContext);
    const { addToCompare, isInCompare, canAddMore } = useCompare();
    const { auth } = usePage().props;
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
    const [hoveredProductId, setHoveredProductId] = useState(null);

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
                console.log('Productos relacionados recibidos de la API:', response.data);
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

    // Función para añadir al carrito
    const handleAddToCart = useCallback((e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            // Transformar los datos del producto para que coincidan con el formato del carrito
            const cartProduct = {
                id: product.id_producto,
                title: product.nombre,
                image: Array.isArray(product.imagen) 
                    ? (product.imagen[0]?.startsWith('http') ? product.imagen[0] : `/${product.imagen[0]}`)
                    : (product.imagen?.startsWith('http') ? product.imagen : `/${product.imagen}`),
                price: parseFloat(product.precio_igv || product.precio_sin_ganancia || 0),
                priceWithoutProfit: parseFloat(product.precio_sin_ganancia || 0),
                priceWithProfit: parseFloat(product.precio_ganancia || 0)
            };
            
            dispatch({ type: 'ADD', product: cartProduct });
            console.log('Adding to cart:', cartProduct);
            alert(`${product.nombre} añadido al carrito!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error al añadir al carrito');
        }
    }, [dispatch]);

    // Función para comparar
    const handleCompare = useCallback((e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productForCompare = {
            id: product.id_producto,
            nombre: product.nombre,
            precio: parseFloat(product.precio_sin_ganancia || 0),
            descripcion: product.descripcion,
            imagen: Array.isArray(product.imagen) 
                ? (product.imagen[0]?.startsWith('http') ? product.imagen[0] : `/${product.imagen[0]}`)
                : (product.imagen?.startsWith('http') ? product.imagen : `/${product.imagen}`),
            stock: 1, // Asumiendo stock disponible
            especificaciones_tecnicas: product.especificaciones_tecnicas || product.caracteristicas || {},
            caracteristicas: product.caracteristicas || {},
            marca: {
                nombre: product.marca?.nombre || ''
            }
        };
        
        if (isInCompare(product.id_producto)) {
            alert('Este producto ya está en el comparador');
        } else if (canAddMore) {
            addToCompare(productForCompare);
            alert(`${product.nombre} agregado al comparador`);
        } else {
            alert('Máximo 4 productos para comparar. Elimina uno para agregar otro.');
        }
    }, [addToCompare, isInCompare, canAddMore]);

    const renderProductCard = (product, isPending = false) => {
        const showDetails = hoveredProductId === product.id_producto;
        
        return (
            <div 
                key={product.id_producto} 
                className={`${
                    isDarkMode 
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600' 
                        : 'bg-white border-gray-200 shadow-lg'
                } rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border relative`}
                onMouseEnter={() => setHoveredProductId(product.id_producto)}
                onMouseLeave={() => setHoveredProductId(null)}
            >
                <Link href={`/producto/${product.id_producto}`}>
                    <div className="relative">
                        {/* Área de imagen con fondo adaptable */}
                        <div className={`h-40 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
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
                        
                        {/* Badge de marca y bandera */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                                {product.marca?.nombre || 'PRODUCTO'}
                            </span>
                            {product.pais && (() => {
                                const countryName = (product.pais || '').toLowerCase();
                                const countryCode = countryCodeMap[countryName] || 'unknown';
                                return countryCode !== 'unknown' ? (
                                    <img 
                                        src={`https://flagcdn.com/w320/${countryCode}.png`}
                                        alt={product.pais}
                                        className="w-6 h-4 object-cover rounded shadow-sm"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : null;
                            })()}
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
                        {product.caracteristicas && Object.keys(product.caracteristicas).length > 0 && (
                            <div className="space-y-2 mb-4">
                                {Object.entries(product.caracteristicas).slice(0, 4).map(([key, value], index) => (
                                    <div key={`spec-${key}-${index}`} className="flex justify-between items-center text-sm">
                                        <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{key}:</span>
                                        <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Precio y SKU */}
                        <div className="border-t border-slate-600 pt-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl font-bold text-blue-400">{formatPrice(product.precio_sin_ganancia)}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                                SKU: {product.sku}
                            </div>
                        </div>
                    </div>
                </Link>
                
                {/* Overlay con información detallada para usuarios no autenticados */}
                {!auth.user && showDetails && (
                    <div 
                        className={`absolute inset-0 bg-opacity-95 flex flex-col justify-start z-20 p-4 cursor-pointer transition-all duration-300 ${
                            isDarkMode 
                                ? 'bg-gray-900 text-gray-100' 
                                : 'bg-gray-800 text-white'
                        }`}
                        onClick={(e) => {
                            if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'a') {
                                e.stopPropagation();
                            } else {
                                window.location.href = `/producto/${product.id_producto}`;
                            }
                        }}
                    >
                        <a 
                            href={`/producto/${product.id_producto}`}
                            className={`text-xl font-semibold mb-2 text-center transition-colors cursor-pointer ${
                                isDarkMode 
                                    ? 'hover:text-blue-300 text-gray-100' 
                                    : 'hover:text-blue-300 text-white'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {product.nombre}
                        </a>
                        
                        {/* Contenedor con scroll */}
                        <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
                            {/* Características del producto */}
                            {product.caracteristicas && Object.keys(product.caracteristicas).length > 0 && (
                                <div className="mb-4">
                                    <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                                        isDarkMode ? 'text-blue-300' : 'text-blue-300'
                                    }`}>Características</h3>
                                    <div className={`text-sm space-y-2 transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-300'
                                    }`}>
                                        {Object.entries(product.caracteristicas).slice(0, 6).map(([key, value], index) => (
                                            <p key={`characteristics-${key}-${index}`}>
                                                <strong>{key}:</strong> {value}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Especificaciones técnicas básicas */}
                            {product.caracteristicas && Object.keys(product.caracteristicas).length > 0 && (
                                <div className="mb-4">
                                    <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                                        isDarkMode ? 'text-blue-300' : 'text-blue-300'
                                    }`}>Especificaciones</h3>
                                    <div className={`text-sm space-y-2 transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-300'
                                    }`}>
                                        {Object.entries(product.caracteristicas).slice(0, 4).map(([key, value], index) => (
                                            <p key={`overlay-spec-${key}-${index}`}><strong>{key}:</strong> {value}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Descripción del producto */}
                            {product.descripcion && (
                                <div className="mb-4">
                                    <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                                        isDarkMode ? 'text-blue-300' : 'text-blue-300'
                                    }`}>Descripción</h3>
                                    <p className={`text-sm transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-100' : 'text-gray-200'
                                    }`}>{product.descripcion}</p>
                                </div>
                            )}
                            
                           
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="mt-auto space-y-2">
                            <button
                                onClick={(e) => handleAddToCart(e, product)}
                                className={`w-full font-bold py-2 px-4 rounded-md transition-all duration-300 ${
                                    isDarkMode 
                                        ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg' 
                                        : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
                                }`}
                            >
                                Añadir al Carrito
                            </button>
                            <button 
                                onClick={(e) => handleCompare(e, product)}
                                className={`w-full font-bold py-2 px-4 rounded-md transition-all duration-300 ${
                                    isInCompare(product.id_producto)
                                        ? isDarkMode 
                                         ? 'bg-gray-00 hover:bg-gray-700 text-white hover:shadow-lg'  
                                            : 'bg-gray-900 hover:bg-gray-900 text-white hover:shadow-lg'   
                                          
                                        : isDarkMode 
                                          ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                                           
                                } ${
                                    !canAddMore && !isInCompare(product.id_producto) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={!canAddMore && !isInCompare(product.id_producto)}
                            >
                                {isInCompare(product.id_producto) ? 'En Comparador' : 'Comparar'}
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Botones de acción en la parte inferior */}
                <div className={`px-5 pb-4 space-y-2 ${
                    isDarkMode 
                        ? 'bg-slate-800' 
                        : 'bg-white'
                }`}>
                                   
                    {/* Botón de administración - Solo visible si está logueado */}
                    {auth.user && (
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
                    )}
                </div>
                
                {/* CSS para el scrollbar personalizado */}
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
                    }
                `}</style>
            </div>
        );
    };

    const renderProductGroup = (type, products) => {
        if (!products || products.length === 0) return null;
        
        return (
            <div key={type} className="mb-8">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {products.map(product => renderProductCard(product))}
                </div>
            </div>
        );
    };

    const renderPendingRelations = () => {
        if (loadingPending) return null;
        if (!filteredPendingRelations || filteredPendingRelations.length === 0) return null;
        if (!auth.user) return null; // No mostrar si no está logueado

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
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
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
               <></>
            ) : (
                relationTypes.map(type => (
                    renderProductGroup(type.nombre, groupedProducts[type.nombre])
                ))
            )}

            {showModal && (
                <ModalPendingRelation 
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
