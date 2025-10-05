import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";
import { useTheme } from '../../storage/ThemeContext';
import { CartContext } from '../../storage/CartContext';
import { useCurrency } from '../../storage/CurrencyContext';
import { useCompare } from '../../hooks/useCompare';
import countryCodeMap from '../store/countryJSON.json';

const SubcategoryProducts = ({ productId, currentProductSubcategoryId }) => {
    const { isDarkMode } = useTheme();
    const { formatPrice } = useCurrency();
    const { cart, dispatch } = useContext(CartContext);
    const { addToCompare, isInCompare, canAddMore } = useCompare();
    const [subcategoryProducts, setSubcategoryProducts] = useState([]);
    const [subcategoryName, setSubcategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredProductId, setHoveredProductId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchSubcategoryData = async () => {
            if (!currentProductSubcategoryId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Obtener productos de la subcategoría y información de la subcategoría en paralelo
                const [productsResponse, subcategoryResponse] = await Promise.all([
                    axios.get(`/product/subcategoria/${currentProductSubcategoryId}`),
                    axios.get(`/subcategoria_id/${currentProductSubcategoryId}`)
                ]);
                
                // Filtrar el producto actual para no mostrarlo en la lista
                const filteredProducts = productsResponse.data.filter(product => 
                    product.id_producto !== productId
                );
                
                setSubcategoryProducts(filteredProducts);
                setSubcategoryName(subcategoryResponse.data.nombre || '');
                setLoading(false);
            } catch (err) {
                console.error("Error fetching subcategory data:", err);
                setError("No se pudieron cargar los datos de la subcategoría.");
                setLoading(false);
            }
        };

        fetchSubcategoryData();
    }, [currentProductSubcategoryId, productId]);

    // Función para añadir al carrito
    const handleAddToCart = useCallback((e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
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
            stock: 1,
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

    const renderProductCard = (product) => {
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
                            {product.marca?.nombre !== 'aralab' && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-2xl font-bold text-blue-400">{formatPrice(product.precio_ganancia)}</span>
                                </div>
                            )}
                            <div className="text-xs text-gray-400">
                                SKU: {product.sku}
                            </div>
                        </div>
                    </div>
                </Link>
                
                {/* Overlay con información detallada */}
                {showDetails && (
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
                                         ? 'bg-gray-600 hover:bg-gray-700 text-white hover:shadow-lg'  
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

    if (loading) {
        return (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cargando productos de la subcategoría...
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center py-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {error}
            </div>
        );
    }

    if (subcategoryProducts.length === 0) {
        return null;
    }

    const itemsPerRow = window.innerWidth >= 1536 ? 6 : window.innerWidth >= 1280 ? 5 : window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 3 : 1;
    const displayedProducts = isExpanded ? subcategoryProducts : subcategoryProducts.slice(0, itemsPerRow);
    const hasMoreProducts = subcategoryProducts.length > itemsPerRow;

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="mb-8">
            <div className="mb-4">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {subcategoryName ? (
                        <>
                            Productos de{' '}
                            <Link 
                                href={`/subcategoria/${currentProductSubcategoryId}`}
                                className={`hover:underline transition-colors duration-200 ${
                                    isDarkMode ? 'text-white hover:text-blue-500' : 'text-black hover:text-blue-700'
                                }`}
                            >
                                {subcategoryName}
                            </Link>
                        </>
                    ) : 'Productos de la misma subcategoría'}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Otros productos que podrían interesarte de esta subcategoría
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {displayedProducts.map(product => renderProductCard(product))}
            </div>
            {hasMoreProducts && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={toggleExpanded}
                        className={`w-[95%] px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            isDarkMode 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                        {isExpanded ? `Ocultar (${subcategoryProducts.length - itemsPerRow})` : `Ver más productos (${subcategoryProducts.length})`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubcategoryProducts;