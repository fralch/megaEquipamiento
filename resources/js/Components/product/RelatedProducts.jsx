import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import axios from "axios";
import { Link } from "@inertiajs/react";
import { CartContext } from '../../storage/CartContext';
import { useTheme } from '../../storage/ThemeContext';
import { useCurrency } from '../../storage/CurrencyContext';
import { useCompare } from '../../hooks/useCompare';

const URL_API = import.meta.env.VITE_API_URL;
const FALLBACK_IMAGE = 'https://megaequipamiento.com/wp-content/uploads/2024/08/MEGA-LOGO.webp';
const IMAGE_TIMEOUT = 3000; // 3 segundos timeout para imágenes

// Hook personalizado para manejar carga de imágenes con timeout
const useImageLoader = (src, fallbackSrc = FALLBACK_IMAGE) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    setIsError(false);
    
    const img = new Image();
    
    // Timeout para imágenes que tardan mucho en cargar
    timeoutRef.current = setTimeout(() => {
      setImageSrc(fallbackSrc);
      setIsLoaded(true);
      setIsError(true);
    }, IMAGE_TIMEOUT);

    img.onload = () => {
      clearTimeout(timeoutRef.current);
      setImageSrc(src);
      setIsLoaded(true);
      setIsError(false);
    };

    img.onerror = () => {
      clearTimeout(timeoutRef.current);
      setImageSrc(fallbackSrc);
      setIsLoaded(true);
      setIsError(true);
    };

    img.src = src;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, fallbackSrc]);

  return { imageSrc, isLoaded, isError };
};

// Componente optimizado para imágenes
const OptimizedImage = React.memo(({ src, alt, className, style, fallbackSrc = FALLBACK_IMAGE }) => {
  const { imageSrc, isLoaded } = useImageLoader(src, fallbackSrc);
  const { isDarkMode } = useTheme();

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div className={`animate-pulse h-6 w-6 rounded-full ${
          isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
        }`}></div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';


const Card = React.memo(({ product, isPending, onRemove, onSetRelation, isDeleting }) => {
    const { isDarkMode } = useTheme();
    const { formatPrice } = useCurrency();
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const cardRef = useRef(null);
    const { dispatch } = useContext(CartContext);
    const { addToCompare, isInCompare, canAddMore } = useCompare();
  
    // Observer para lazy loading
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
  
      const currentRef = cardRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }
  
      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, []);
  
    // Función para manejar la navegación al producto
    const navigateToProduct = useCallback((e) => {
      if (showDetails) {
        e.preventDefault();
      }
    }, [showDetails]);
  
    // Función para manejar click en overlay
    const handleOverlayClick = useCallback((e) => {
      if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'a') {
        e.stopPropagation();
      } else {
        window.location.href = product.link;
      }
    }, [product.link]);
  
    // Función para añadir al carrito
    const handleAddToCart = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        // Solo enviar los datos necesarios: imagen, título y precios
        const cartProduct = {
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          priceWithoutProfit: product.priceWithoutProfit,
          priceWithProfit: product.priceWithProfit
        };
        
        dispatch({ type: 'ADD', product: cartProduct });
        console.log('Adding to cart:', cartProduct);
        alert(`${product.title} añadido al carrito!`);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }, [dispatch, product]);
  
    // Función para comparar
    const handleCompare = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const productForCompare = {
        id: product.id,
        nombre: product.title,
        precio: product.price,
        descripcion: product.descripcion,
        imagen: product.image,
        stock: 1, // Asumiendo stock disponible
        especificaciones_tecnicas: product.especificaciones_tecnicas || product.summary,
        caracteristicas: product.caracteristicas || product.summary || {},
        marca: {
          nombre: product.nombre_marca
        }
      };
      
      if (isInCompare(product.id)) {
        alert('Este producto ya está en el comparador');
      } else if (canAddMore) {
        addToCompare(productForCompare);
        alert(`${product.title} agregado al comparador`);
      } else {
        alert('Máximo 4 productos para comparar. Elimina uno para agregar otro.');
      }
    }, [product, addToCompare, isInCompare, canAddMore]);
  
  
  
    // Renderizar entradas del summary de forma optimizada los 4 primeros
    const summaryEntries = useMemo(() => {
      if (!product.summary || typeof product.summary !== 'object') return [];
      return Object.entries(product.summary).slice(0, 4);
    }, [product.summary]);
  
  
    return (
      <div
        ref={cardRef}
        className={`w-full rounded-xl shadow-lg overflow-hidden border h-112 relative flex flex-col transition-all duration-300 hover:shadow-xl ${
          isDarkMode 
            ? 'bg-gray-800 hover:bg-gray-750 shadow-gray-900/50 border-gray-700' 
            : 'bg-white hover:bg-gray-50 border-gray-200'
        }`}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {/* Enlace al producto */}
        <a 
          href={product.link} 
          className="absolute inset-0 z-10"
          onClick={navigateToProduct}
          aria-label={`Ver detalles de ${product.title}`}
        />
  
        {/* Área de imagen (60% del card) */}
        <div className="flex items-center justify-center p-3 h-3/5">
          {isVisible && (
            <OptimizedImage
              src={product.image}
              alt={product.title}
              className="max-w-full max-h-full object-contain transition-opacity duration-300"
              style={{ opacity: 1 }}
            />
          )}
        </div>
  
        {/* Bandera y marca */}
        <div className="flex items-center justify-between px-4 mb-2">
          {isVisible && (
            <>
              {product.marca && (
                <OptimizedImage
                  src={product.marca}
                  alt={`Marca ${product.nombre_marca || 'desconocida'}`}
                  className="h-5 object-cover transition-opacity duration-300"
                  style={{ opacity: 1 }}
                />
              )}
              {product.flag && (
                <OptimizedImage
                  src={product.flag}
                  alt={`Bandera de ${product.origin || 'origen desconocido'}`}
                  className="w-9 h-5 object-cover transition-opacity duration-300"
                  style={{ opacity: 1 }}
                />
              )}
            </>
          )}
        </div>
  
        {/* Información del producto (40% restante) */}
        <div className="p-3 flex-grow overflow-y-auto min-h-40">
          <h2 className={`text-base font-semibold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>{product.title}</h2>
          {summaryEntries.map(([key, value], index) => (
            <p key={`${key}-${index}`} className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
  
        {/* Overlay con información detallada */}
        {showDetails && (
          <div 
            className={`absolute inset-0 bg-opacity-95 flex flex-col justify-start z-20 p-4 cursor-pointer transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 text-gray-100' 
                : 'bg-gray-800 text-white'
            }`}
            onClick={handleOverlayClick}
          >
            <a 
              href={product.link}
              className={`text-2xl font-semibold mb-2 text-center transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'hover:text-blue-300 text-gray-100' 
                  : 'hover:text-blue-300 text-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {product.title}
            </a>
            
            {/* Contenedor con scroll */}
            <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
              {/* product.summary */}
              {product.summary && Object.keys(product.summary).length > 0 && (
                <div className="mb-4">
                  <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-300'
                  }`}>Características</h3>
                  <div className={`text-sm space-y-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-300'
                  }`}>
                    {Object.entries(product.summary).map(([key, value], index) => (
                      <p key={`summary-${key}-${index}`}>
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
            
            {/* Botones fijos en la parte inferior */}
            <div className="flex space-x-4 mt-auto">
              <button
                className={`font-bold py-2 px-4 rounded-md flex-1 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                }`}
                onClick={handleAddToCart}
              >
                Añadir al carrito
              </button>
              <button 
                className={`font-bold py-2 px-4 rounded-md flex-1 transition-all duration-300 ${
                  isInCompare(product.id)
                    ? isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                    : isDarkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg' 
                      : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
                } ${
                  !canAddMore && !isInCompare(product.id) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleCompare}
                disabled={!canAddMore && !isInCompare(product.id)}
              >
                {isInCompare(product.id) ? 'En Comparador' : 'Comparar'}
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
  });
  
  Card.displayName = 'Card';

const ModalRelatedProducts = ({ productId, relatedProductId, initialRelated = [], onSave, onClose, isPendingRelation = false }) => {
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
            // Si la operación fue exitosa, actualizamos la lista local
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
        // Confirmar antes de eliminar
        if (!window.confirm(`¿Estás seguro de eliminar la relación con el producto "${relatedProduct.nombre}"?`)) {
            return;
        }

        setLoading(true); // Asumiendo que tienes un estado de carga 'loading'
        setError(null);   // Asumiendo que tienes un estado de error 'error'

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json', // Cambiado a application/json ya que no enviamos archivos
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };

            // Llamar al endpoint para eliminar la relación
            const response = await axios.post('/product/eliminar-relacion', {
                id: productId, // ID del producto principal
                relacionado_id: relatedProduct.id_producto || relatedProduct.id // ID del producto relacionado
            }, config);

            console.log('Respuesta del servidor:', response.data.message);

            // Actualizar la lista local de productos relacionados
            setRelatedProducts(prev =>
                prev.filter(p => (p.id_producto || p.id) !== (relatedProduct.id_producto || relatedProduct.id))
            );

            // Opcional: Mostrar mensaje de éxito
            alert('Relación eliminada correctamente');

        } catch (err) {
            console.error('Error al eliminar relación:', err);
            setError('Error al eliminar la relación. Por favor, inténtalo de nuevo.'); // Actualiza el estado de error
            alert('Error al eliminar la relación'); // Muestra alerta al usuario
        } finally {
            setLoading(false); // Finaliza el estado de carga
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg z-50 max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">
                    {isPendingRelation ? 'Establecer Relación Pendiente' : 'Agregar Relación de Producto'}
                </h3>
                
                <div className="mb-4">
                    {isPendingRelation && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-700">
                                Este producto tiene una relación pendiente. Seleccione el tipo de relación para establecer la conexión inversa.
                            </p>
                        </div>
                    )}

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de relación
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-3"
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
                                            className="text-blue-500 hover:text-blue-700"
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
                )}

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const RelatedProducts = ({ productId }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relationTypes, setRelationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingRelations, setPendingRelations] = useState([]);
    const [loadingPending, setLoadingPending] = useState(true);
    // Estado para controlar la visibilidad del modal
    const [showModal, setShowModal] = useState(false);
    // Estado para almacenar el ID del producto a relacionar
    const [selectedProductId, setSelectedProductId] = useState(null);
    // Estado para indicar si es una relación pendiente
    const [isPendingRelation, setIsPendingRelation] = useState(false);
    // Estado para almacenar información del producto pendiente
    const [pendingProduct, setPendingProduct] = useState(null);
    // Estado para manejar la carga durante la eliminación
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

    // Efecto para obtener relaciones pendientes
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

    // Filtrar las relaciones pendientes para excluir productos que ya están en relatedProducts
    const filteredPendingRelations = pendingRelations.filter(pendingProduct => {
        // Verificar si este producto pendiente ya existe en la lista de productos relacionados
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

    // Función para manejar el guardado de una nueva relación
    const handleSaveRelation = (relatedProduct, relationType) => {
        // Actualizar la lista de productos relacionados
        setRelatedProducts(prevProducts => {
            // Verificar si el producto ya existe en la lista
            const exists = prevProducts.some(p => p.id_producto === relatedProduct.id);
            if (exists) {
                return prevProducts.map(p => 
                    p.id_producto === relatedProduct.id 
                        ? { ...p, pivot: { ...p.pivot, tipo: relationType } } 
                        : p
                );
            } else {
                // Agregar el nuevo producto a la lista
                return [...prevProducts, {
                    ...relatedProduct,
                    pivot: { tipo: relationType }
                }];
            }
        });
        
        // Si era una relación pendiente, actualizar la lista de relaciones pendientes
        if (isPendingRelation) {
            setPendingRelations(prev => 
                prev.filter(p => p.id_producto !== relatedProduct.id)
            );
        }
        
        // Cerrar el modal
        setShowModal(false);
    };

    // Nueva función para manejar la eliminación directa de la relación
    const handleRemoveRelationDirectly = async (productToRemove) => {
        if (!window.confirm(`¿Estás seguro de eliminar la relación con el producto "${productToRemove.nombre}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json', // Cambiado a application/json si no envías archivos
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };
            // Llamar al endpoint para eliminar la relación
            await axios.post('/product/eliminar-relacion', {
                id: productId,
                relacionado_id: productToRemove.id_producto || productToRemove.id // Asegúrate de usar el ID correcto
            }, config);

            // Actualizar la lista local de productos relacionados (opcional antes de recargar)
            setRelatedProducts(prev =>
                prev.filter(p => (p.id_producto || p.id) !== (productToRemove.id_producto || productToRemove.id))
            );

            alert('Relación eliminada correctamente');
            // Añadir recarga de página aquí
            window.location.reload();

        } catch (error) {
            console.error('Error al eliminar relación:', error);
            alert('Error al eliminar la relación');
        } finally {
            setIsDeleting(false);
        }
    };


    const renderProductCard = (product, isPending = false) => (
        <Card
        key={product.id_producto}
        product={{
            id: product.id_producto,
            sku: product.sku || '',
            title: product.nombre || 'Sin título',
            summary: product.caracteristicas || {},
            caracteristicas: product.caracteristicas || {},
            origin: product.pais || '',
            price: parseFloat(product.precio_igv || 0),
            priceWithoutProfit: parseFloat(product.precio_sin_ganancia || 0),
            priceWithProfit: parseFloat(product.precio_ganancia || 0),
            image: (
                Array.isArray(product.imagen) 
                    ? (product.imagen[0]?.startsWith('http') ? product.imagen[0] : `/${product.imagen[0]}`)
                    : (product.imagen?.startsWith('http') ? product.imagen : `/${product.imagen}`)
            ) || FALLBACK_IMAGE,
            flag: '', // No flag for related products
            marca: product.marca?.imagen || '',
            nombre_marca: product.marca?.nombre || '',
            link: `/producto/${product.id_producto}`,
            descripcion: product.descripcion || '',
            video: product.video || '',
            envio: product.envio || '',
            soporte_tecnico: product.soporte_tecnico || '',
            archivos_adicionales: product.archivos_adicionales || [],
            especificaciones_tecnicas: product.especificaciones_tecnicas || {},
            subcategoria_id: product.id_subcategoria || null,
            marca_id: product.marca_id || null
        }}
        isPending={isPending}
        onRemove={() => handleRemoveRelationDirectly(product)}
        onSetRelation={() => openRelationModal(product.id_producto, true, product)}
        isDeleting={isDeleting}
    />
    );

    const renderProductGroup = (type, products) => {
        if (!products || products.length === 0) return null;
        
        return (
            <div key={type} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {products.map(product => renderProductCard(product))}
                </div>
            </div>
        );
    };

    const renderPendingRelations = () => {
        if (loadingPending) return null;
        if (!filteredPendingRelations || filteredPendingRelations.length === 0) return null;

        return (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h2 className="text-xl font-bold text-yellow-700 mb-4">
                    Relaciones Pendientes
                </h2>
                <p className="mb-4 text-yellow-600">
                    Los siguientes productos tienen relación con este producto, pero no existe la relación inversa:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {filteredPendingRelations.map(product => renderProductCard(product, true))}
                </div>
                <div className="mt-4 text-sm text-yellow-600">
                    <p>Haga clic en "Establecer Relación" para crear la relación inversa.</p>
                </div>
            </div>
        );
    };

    return (
        <div className="py-6">
            {renderPendingRelations()}
            
            {loading ? (
                <div className="text-center py-8">Cargando productos relacionados...</div>
            ) : relatedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay productos relacionados disponibles.</div>
            ) : (
                relationTypes.map(type => (
                    renderProductGroup(type.nombre, groupedProducts[type.nombre])
                ))
            )}

            {/* Modal para agregar/editar relaciones */}
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
    // ... Lógica del modal de búsqueda y adición ...
    // Similar a tu ModalRelatedProducts original pero enfocado en buscar y agregar

    const [localRelated, setLocalRelated] = useState(initialRelated);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [selectedType, setSelectedType] = useState('accesorio'); // O el tipo por defecto
    const [relationTypes, setRelationTypes] = useState([]);

    // Fetch relation types (similar a tu otro modal)
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


    // Search products function (similar a tu otro modal)
    const searchProducts = async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSearch(true);
        try {
            const response = await axios.post('/productos/buscar', { producto: term });
            if (Array.isArray(response.data)) {
                // Filtrar el producto actual y los ya relacionados
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

     // Debounce search
     useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, localRelated]); // Re-buscar si cambian los relacionados locales


    // Handle adding a product relation
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

            // Actualizar estado local en este modal
            setLocalRelated(prev => [...prev, {
                ...selectedProduct,
                pivot: { tipo: selectedType } // Simular la estructura pivot
            }]);

            setSearchTerm(''); // Limpiar búsqueda
            setSearchResults([]); // Limpiar resultados

        } catch (error) {
            console.error('Error al agregar relación:', error);
            alert('Error al agregar la relación');
        }
    };


    // Handle saving changes (pasar la lista actualizada al componente padre)
    const handleSaveChanges = () => {
        onSave(localRelated); // Llama a la función onSave del padre con la lista actualizada
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg z-50 max-w-lg w-full p-6 max-h-[80vh] flex flex-col">
                <h3 className="text-lg font-bold mb-4">Buscar y Agregar Productos Relacionados</h3>

                 {/* Selector de Tipo */}
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de relación:</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    >
                        {relationTypes.map(type => (
                            <option key={type.id} value={type.nombre}>
                                {type.nombre.charAt(0).toUpperCase() + type.nombre.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Input de Búsqueda */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar productos por nombre o SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Resultados de Búsqueda */}
                <div className="flex-grow overflow-y-auto mb-4 border rounded-md">
                    {isLoadingSearch ? (
                        <p className="p-3 text-gray-500">Buscando...</p>
                    ) : searchResults.length > 0 ? (
                        <ul>
                            {searchResults.map(product => (
                                <li key={product.id_producto} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-medium">{product.nombre}</span>
                                        <span className="text-sm text-gray-600 ml-2">(SKU: {product.sku})</span>
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
                        <p className="p-3 text-gray-500">No se encontraron resultados.</p>
                    ) : (
                         <p className="p-3 text-gray-400">Ingrese al menos 2 caracteres para buscar.</p>
                    )}
                </div>


                {/* Botones de Acción */}
                <div className="flex justify-end space-x-3">
                     <button
                        onClick={onClose} // Usar onClose directamente para cancelar
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        Cerrar
                    </button>
                    {/* El botón de guardar ahora solo cierra el modal,
                        ya que la adición se hace directamente */}
                    {/* <button
                        onClick={handleSaveChanges}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Guardar Cambios
                    </button> */}
                </div>
            </div>
        </div>
    );
};
