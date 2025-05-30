import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import countryCodeMap from './countryJSON.json';
import { CartContext } from '../../storage/CartContext';
const URL_API = import.meta.env.VITE_API_URL;

const ProductGrid = ({ products: initialProducts }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAllProducts, setIsAllProducts] = useState(false);
  const [error, setError] = useState(null);
  
  const productsPerPage = 24;

  // Función para transformar productos con memoización
  const transformProduct = useCallback((item) => {
    if (!item || !item.id_producto) return null;
    
    const countryName = (item.pais || '').toLowerCase();
    const countryCode = countryCodeMap[countryName] || 'unknown';
    const image = item.imagen && item.imagen.startsWith('http') 
      ? item.imagen 
      : `${URL_API}/${item.imagen}`;
    
    return {
      id: item.id_producto,
      sku: item.sku || '',
      title: item.nombre || 'Sin título',
      summary: item.caracteristicas || {},
      technicalData: item.datos_tecnicos || {},
      origin: item.pais || '',
      price: parseFloat(item.precio_igv || 0),
      priceWithoutProfit: parseFloat(item.precio_sin_ganancia || 0),
      priceWithProfit: parseFloat(item.precio_ganancia || 0),
      image,
      flag: countryName ? `https://flagcdn.com/w320/${countryCode}.png` : '',
      marca: item.marca?.imagen || '',
      nombre_marca: item.marca?.nombre || '',
      link: `/producto/${item.id_producto}`,
      descripcion: item.descripcion || '',
      video: item.video || '',
      envio: item.envio || '',
      soporte_tecnico: item.soporte_tecnico || '',
      archivos_adicionales: item.archivos_adicionales || [],
      especificaciones_tecnicas: item.especificaciones_tecnicas || {},
      subcategoria_id: item.id_subcategoria || null,
      marca_id: item.marca_id || null
    };
  }, []);

  // Función para obtener productos desde localStorage con validación
  const getStoredProducts = useCallback(() => {
    try {
      const storedData = localStorage.getItem('products');
      const storedTimestamp = localStorage.getItem('productsTimestamp');
      const currentTime = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (storedData && storedTimestamp && (currentTime - parseInt(storedTimestamp)) < oneDay) {
        const parsedData = JSON.parse(storedData);
        return Array.isArray(parsedData) ? parsedData : [];
      }
      return null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }, []);

  // Función para guardar productos en localStorage
  const saveProductsToStorage = useCallback((products) => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.setItem('productsTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Función para obtener productos de la API
  const fetchProducts = useCallback(async (page = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${URL_API}/product/all?page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid API response format');
      }

      const transformedProducts = data.data
        .map(transformProduct)
        .filter(Boolean); // Filtrar productos nulos o inválidos

      if (append) {
        setProducts(prevProducts => {
          // Evitar duplicados basándose en el ID
          const existingIds = new Set(prevProducts.map(p => p.id));
          const newProducts = transformedProducts.filter(p => !existingIds.has(p.id));
          return [...prevProducts, ...newProducts];
        });
      } else {
        setProducts(transformedProducts);
        saveProductsToStorage(transformedProducts);
      }
      
      setIsAllProducts(data.data.length < productsPerPage);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      
      // Fallback a localStorage si hay error
      if (!append) {
        const storedProducts = getStoredProducts();
        if (storedProducts) {
          setProducts(storedProducts);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [transformProduct, saveProductsToStorage, getStoredProducts]);

  // Efecto para cargar productos iniciales
  useEffect(() => {
    const initializeProducts = async () => {
      // Si hay productos iniciales, usarlos
      if (initialProducts && Array.isArray(initialProducts) && initialProducts.length > 0) {
        try {
          const transformedProducts = initialProducts
            .map(transformProduct)
            .filter(Boolean);
          setProducts(transformedProducts);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error transforming initial products:', error);
        }
      }

      // Intentar cargar desde localStorage primero
      const storedProducts = getStoredProducts();
      if (storedProducts && storedProducts.length > 0) {
        setProducts(storedProducts);
        setLoading(false);
      } else {
        // Si no hay datos en localStorage, hacer fetch
        await fetchProducts(1);
      }
    };

    initializeProducts();
  }, [initialProducts, transformProduct, getStoredProducts, fetchProducts]);

  // Memoizar productos de la página actual
  const currentProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return products.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [products, currentPage, productsPerPage]);

  // Calcular páginas totales
  const totalPages = useMemo(() => {
    return Math.ceil(products.length / productsPerPage);
  }, [products.length, productsPerPage]);

  // Función para cambiar de página
  const handlePageChange = useCallback(async (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) {
      return;
    }

    setCurrentPage(pageNumber);
    
    // Verificar si necesitamos cargar más productos
    const totalProducts = products.length;
    const productsNeeded = pageNumber * productsPerPage;
    
    if (productsNeeded > totalProducts && !loading && !isAllProducts) {
      const nextPage = Math.ceil(totalProducts / productsPerPage) + 1;
      await fetchProducts(nextPage, true);
    }
    
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, totalPages, products.length, productsPerPage, loading, isAllProducts, fetchProducts]);

  // Generar números de página para la paginación
  const getPageNumbers = useMemo(() => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Información de paginación
  const paginationInfo = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const start = Math.min(indexOfFirstProduct + 1, products.length);
    const end = Math.min(indexOfLastProduct, products.length);
    
    return { start, end, total: products.length };
  }, [currentPage, productsPerPage, products.length]);

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar productos: {error}</p>
          <button 
            onClick={() => fetchProducts(1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {currentProducts.map((product) => (
          <Card 
            key={`product-${product.id}-${product.sku || 'no-sku'}`} 
            product={product} 
          />
        ))}
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-2 mt-8 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg flex items-center ${
                currentPage === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
        
            <div className="flex items-center space-x-2">
              {getPageNumbers.map((pageNumber, index) => (
                pageNumber === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2">...</span>
                ) : (
                  <button
                    key={`page-${pageNumber}`}
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNumber 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              ))}
            </div>
        
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`px-4 py-2 rounded-lg flex items-center ${
                currentPage === totalPages || loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Siguiente
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Mostrando {paginationInfo.start}-{paginationInfo.end} de {paginationInfo.total} productos
            {loading && <span className="ml-2">(Cargando...)</span>}
          </div>
        </div>
      )}
    </div>
  );
};

const Card = React.memo(({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef(null);
  const { dispatch } = useContext(CartContext);

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
      dispatch({ type: 'ADD', product: product });
      console.log('Adding to cart:', product);
      alert(`${product.title} añadido al carrito!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [dispatch, product]);

  // Función para comparar
  const handleCompare = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Comparing product:', product.id);
  }, [product.id]);

  // Manejar error de imagen
  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = 'https://megaequipamiento.com/wp-content/uploads/2024/08/MEGA-LOGO.webp';
    setImageLoaded(true);
  }, []);

  // Renderizar entradas del summary de forma optimizada
  const summaryEntries = useMemo(() => {
    if (!product.summary || typeof product.summary !== 'object') return [];
    return Object.entries(product.summary).slice(0, 4);
  }, [product.summary]);

  // Renderizar entradas de datos técnicos de forma optimizada
  const technicalDataEntries = useMemo(() => {
    if (!product.technicalData || typeof product.technicalData !== 'object') return [];
    return Object.entries(product.technicalData);
  }, [product.technicalData]);

  return (
    <div
      ref={cardRef}
      className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-128 relative flex flex-col transition-all duration-300 hover:shadow-xl"
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

      {/* Placeholder mientras carga */}
      <div
        className={`absolute inset-0 bg-gray-200 transition-opacity duration-300 ${
          imageLoaded && isVisible ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ zIndex: 1 }}
      >
        <div className="h-full w-full flex justify-center items-center">
          <div className="animate-pulse h-8 w-8 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Área de imagen (60% del card) */}
      <div className="flex items-center justify-center p-4 h-3/5">
        {isVisible && (
          <img
            src={product.image}
            alt={product.title}
            className="max-w-full max-h-full object-contain transition-opacity duration-300"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>

      {/* Bandera y marca */}
      <div className="flex items-center justify-between px-8 mb-2">
        {isVisible && (
          <>
            {product.marca && (
              <img
                src={product.marca}
                alt={`Marca ${product.nombre_marca || 'desconocida'}`}
                className="h-4 object-cover transition-opacity duration-300"
                style={{ opacity: imageLoaded ? 1 : 0 }}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            {product.flag && (
              <img
                src={product.flag}
                alt={`Bandera de ${product.origin || 'origen desconocido'}`}
                className="w-6 h-4 object-cover transition-opacity duration-300"
                style={{ opacity: imageLoaded ? 1 : 0 }}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Información del producto (40% restante) */}
      <div className="p-4 flex-grow overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{product.title}</h2>
        {summaryEntries.map(([key, value], index) => (
          <p key={`${key}-${index}`} className="text-sm text-gray-600">
            <strong>{key}:</strong> {value}
          </p>
        ))}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Overlay con información detallada */}
      {showDetails && (
        <div 
          className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white flex flex-col justify-start z-20 p-4 cursor-pointer"
          onClick={handleOverlayClick}
        >
          <a 
            href={product.link}
            className="text-2xl font-semibold mb-2 text-center hover:text-blue-300 transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {product.title}
          </a>
          
          {/* Contenedor con scroll */}
          <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
            {/* Datos técnicos */}
            {technicalDataEntries.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-blue-300 mb-2">Datos Técnicos</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  {technicalDataEntries.map(([key, value], index) => (
                    <p key={`tech-${key}-${index}`}>
                      <strong>{key}:</strong> {value}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Descripción del producto */}
            {product.descripcion && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-blue-300 mb-2">Descripción</h3>
                <p className="text-sm text-gray-200">{product.descripcion}</p>
              </div>
            )}
          </div>
          
          {/* Botones fijos en la parte inferior */}
          <div className="flex space-x-4 mt-auto">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex-1"
              onClick={handleAddToCart}
            >
              Añadir al carrito
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md flex-1"
              onClick={handleCompare}
            >
              Comparar
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
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
});

Card.displayName = 'Card';

export default ProductGrid;