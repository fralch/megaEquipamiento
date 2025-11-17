import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import countryCodeMap from './countryJSON.json';
import { CartContext } from '../../storage/CartContext';
import { useTheme } from '../../storage/ThemeContext';
import { useCurrency } from '../../storage/CurrencyContext';
import { useCompare } from '../../hooks/useCompare';

const URL_API = import.meta.env.VITE_API_URL;
const FALLBACK_IMAGE = '/img/logo2.jpg';
const IMAGE_TIMEOUT = 3000; // 3 segundos timeout para imágenes

// Currency formatting function moved to CurrencyContext

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

const ProductGrid = ({ products: initialProducts }) => {
  const { isDarkMode } = useTheme();
  const { formatPrice } = useCurrency();
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
    // Manejar imagen como array o string
    let image;
    if (Array.isArray(item.imagen)) {
      // Si es un array, tomar la primera imagen
      const firstImage = item.imagen[0];
      image = firstImage && firstImage.startsWith('http') 
        ? firstImage 
        : `${URL_API}/${firstImage}`;
    } else {
      // Mantener compatibilidad con string
      image = item.imagen && item.imagen.startsWith('http') 
        ? item.imagen 
        : `${URL_API}/${item.imagen}`;
    }
    
    return {
      id: item.id_producto,
      sku: item.sku || '',
      title: item.nombre || 'Sin título',
      summary: item.caracteristicas || {},
      caracteristicas: item.caracteristicas || {},

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

  // Función para obtener productos desde localStorage con validación mejorada
  const getStoredProducts = useCallback(() => {
    try {
      const storedData = localStorage.getItem('products');
      const storedTimestamp = localStorage.getItem('productsTimestamp');
      const currentTime = Date.now();
      const oneHour = 60 * 60 * 1000; // Reducido a 1 hora para datos más frescos

      if (storedData && storedTimestamp && (currentTime - parseInt(storedTimestamp)) < oneHour) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          return parsedData;
        }
      }
      // Limpiar datos obsoletos
      localStorage.removeItem('products');
      localStorage.removeItem('productsTimestamp');
      return null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      // Limpiar localStorage corrupto
      localStorage.removeItem('products');
      localStorage.removeItem('productsTimestamp');
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
          // Resetear a página 1 cuando cambian los productos
          setCurrentPage(1);
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

  // Función para cambiar de página con debouncing
  const handlePageChange = useCallback(async (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage || loading) {
      return;
    }
  
    setCurrentPage(pageNumber);
    
    const hasInitialProducts = initialProducts && Array.isArray(initialProducts) && initialProducts.length > 0;
    
    if (!hasInitialProducts) {
      // Verificar si necesitamos cargar más productos (solo para vista general)
      const totalProducts = products.length;
      const productsNeeded = pageNumber * productsPerPage;
      
      if (productsNeeded > totalProducts && !isAllProducts) {
        const nextPage = Math.ceil(totalProducts / productsPerPage) + 1;
        await fetchProducts(nextPage, true);
      }
    }
    
    // Scroll suave hacia arriba con requestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [currentPage, totalPages, products.length, productsPerPage, loading, isAllProducts, fetchProducts, initialProducts]);

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

  // Componente de loading optimizado
  const LoadingComponent = useMemo(() => {
    if (loading && products.length === 0) {
      return (
        <div className={`flex justify-center items-center min-h-screen transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className="text-center">
            <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4 ${
              isDarkMode ? 'border-blue-400' : 'border-blue-500'
            }`}></div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Cargando productos...</p>
          </div>
        </div>
      );
    }
    return null;
  }, [loading, products.length, isDarkMode]);

  // Componente de error optimizado
  const ErrorComponent = useMemo(() => {
    if (error && products.length === 0) {
      return (
        <div className={`flex justify-center items-center min-h-screen transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className="text-center max-w-md mx-auto p-6">
            <div className={`text-6xl mb-4 ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`}>⚠️</div>
            <h2 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>Error al cargar productos</h2>
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{error}</p>
            <button 
              onClick={() => fetchProducts(1)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return null;
  }, [error, products.length, isDarkMode, fetchProducts]);

  if (LoadingComponent) return LoadingComponent;
  if (ErrorComponent) return ErrorComponent;

  return (
    <div className={`container mx-auto px-4 py-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Grid modificado para mostrar 3 columnas en laptop 15" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
        {currentProducts.map((product) => (
          <Card 
            key={`product-${product.id}-${product.sku || 'no-sku'}`} 
            product={product} 
          />
        ))}
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4 mt-8 mb-8">
          <nav aria-label="Pagination">
            <ul className="flex flex-wrap justify-center items-center gap-2">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    currentPage === 1
                      ? (isDarkMode ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gray-300 cursor-not-allowed text-gray-500')
                      : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
                  }`}
                  aria-label="Previous Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline ml-2">Anterior</span>
                </button>
              </li>

              {getPageNumbers.map((pageNumber, index) => (
                <li key={`page-${index}`}>
                  {pageNumber === '...' ? (
                    <span className={`px-3 h-10 flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={loading}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                        currentPage === pageNumber 
                          ? (isDarkMode ? 'bg-blue-600 text-white font-bold' : 'bg-blue-600 text-white font-bold')
                          : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:bg-gray-800' : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100')
                      }`}
                      aria-label={`Page ${pageNumber}`}
                      aria-current={currentPage === pageNumber ? 'page' : undefined}
                    >
                      {pageNumber}
                    </button>
                  )}
                </li>
              ))}

              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className={`px-3 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    currentPage === totalPages || loading
                      ? (isDarkMode ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gray-300 cursor-not-allowed text-gray-500')
                      : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
                  }`}
                  aria-label="Next Page"
                >
                  <span className="hidden sm:inline mr-2">Siguiente</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Mostrando {paginationInfo.start}-{paginationInfo.end} de {paginationInfo.total} productos
            {loading && <span className="ml-2">(Cargando...)</span>}
          </div>
        </div>
      )}
    </div>
  );
};

// Función de comparación personalizada para React.memo
const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.title === nextProps.product.title &&
         prevProps.product.priceWithProfit === nextProps.product.priceWithProfit;
};

const Card = React.memo(({ product }) => {
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

  // Renderizar entradas de datos técnicos de forma optimizada
  const technicalDataEntries = useMemo(() => {
    if (!product.technicalData || typeof product.technicalData !== 'object') return [];
    return Object.entries(product.technicalData);
  }, [product.technicalData]);

  return (
    <div
      ref={cardRef}
      className={`w-full rounded-xl shadow-lg overflow-hidden border h-128 relative flex flex-col transition-all duration-300 hover:shadow-xl ${
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
      <div className="flex items-center justify-center p-4 h-3/5">
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
      <div className="flex items-center justify-between px-8 mb-2">
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
      <div className="p-4 flex-grow overflow-y-auto min-h-60">
        <h2 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
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
            {product.nombre_marca?.toLowerCase() !== 'aralab' && (
              <span className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {formatPrice(product.priceWithProfit)}
              </span>
            )}
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
          
          {/* Fixed buttons at bottom */}
          <div className="flex space-x-2 mt-auto">
            <button
              className={`text-sm py-1.5 px-3 rounded flex-1 transition ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={handleAddToCart}
            >
              Añadir a carrito
            </button>
            <button 
              className={`text-sm py-1.5 px-3 rounded flex-1 transition ${
                isInCompare(product.id)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } ${!canAddMore && !isInCompare(product.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleCompare}
              disabled={!canAddMore && !isInCompare(product.id)}
            >
              {isInCompare(product.id) ? 'En comparador' : 'Comparar'}
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
}, arePropsEqual);

Card.displayName = 'Card';

export default ProductGrid;