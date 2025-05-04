import React, { useState, useEffect, useRef, useContext } from 'react';
import countryCodeMap from './countryJSON.json';
import { CartContext } from '../../storage/CartContext';
const URL_API = import.meta.env.VITE_API_URL;

const ProductGrid = ({ products: initialProducts }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;
  const [loading, setLoading] = useState(true);
  // Add new state to track if we're fetching all products
  const [isAllProducts, setIsAllProducts] = useState(false);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        // Verifica si los datos ya están en el localStorage
        const storedData = localStorage.getItem('products');
        const storedTimestamp = localStorage.getItem('productsTimestamp');
        const currentTime = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

        // Usar datos del localStorage si existen y no son más antiguos que un día
        if (storedData && storedTimestamp && (currentTime - parseInt(storedTimestamp)) < oneDay) {
          setProducts(JSON.parse(storedData));
          setLoading(false);
        } else {
          const response = await fetch(`${URL_API}/product/all?page=1`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log("todos los productos");
          const transformedProducts = data.data.map(item => {
            console.log(item);
            const countryName = item.pais.toLowerCase();
            const countryCode = countryCodeMap[countryName] || 'unknown';
            const image = item.imagen && item.imagen.startsWith('http') ? item.imagen : `${URL_API}/${item.imagen}`;
            
            return {
              id: item.id_producto,
              sku: item.sku,
              title: item.nombre,
              summary: item.caracteristicas || {},
              technicalData: item.datos_tecnicos || {},
              origin: item.pais,
              price: parseFloat(item.precio_igv),
              priceWithoutProfit: parseFloat(item.precio_sin_ganancia),
              priceWithProfit: parseFloat(item.precio_ganancia),
              image,
              flag: `https://flagcdn.com/w320/${countryCode}.png`,
              marca: item.marca.imagen,
              nombre_marca: item.marca.nombre,
              link: `/producto/${item.id_producto}`,
              descripcion: item.descripcion || '',
              video: item.video || '',
              envio: item.envio || '',
              soporte_tecnico: item.soporte_tecnico || '',
              archivos_adicionales: item.archivos_adicionales,
              especificaciones_tecnicas: item.especificaciones_tecnicas,
              subcategoria_id: item.id_subcategoria,
              marca_id: item.marca_id
            };
          });

          setProducts(transformedProducts);
          // Guardar en localStorage para futuras visitas
          localStorage.setItem('products', JSON.stringify(transformedProducts));
          localStorage.setItem('productsTimestamp', currentTime.toString());
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Si hay un error pero tenemos datos antiguos en localStorage, úsalos como respaldo
        const storedData = localStorage.getItem('products');
        if (storedData) {
          setProducts(JSON.parse(storedData));
        }
        setLoading(false);
      }
    };

    if (!initialProducts || initialProducts.length === 0) {
      fetchInitialProducts();
    } else {
      try {
        const transformedProducts = initialProducts.map(item => {
          const countryName = (item.pais || '').toLowerCase();
          const countryCode = countryCodeMap[countryName] || 'unknown';
          const image = item.imagen && item.imagen.startsWith('http') ? item.imagen : `${URL_API}/${item.imagen}`;
          return {
            id: item.id_producto,
            title: item.nombre,
            summary: item.caracteristicas || {},
            technicalData: item.datos_tecnicos || {},
            origin: item.pais || '',
            price: parseFloat(item.precio_igv || 0),
            image,
            flag: countryName ? `https://flagcdn.com/w320/${countryCode}.png` : '',
            marca: item.marca?.imagen || '',
            nombre_marca: item.marca?.nombre || '',
            link: `/producto/${item.id_producto}` ,
            descripcion: item.descripcion || '',
          };
        });

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error transforming products:', error);
      }
      setLoading(false);
    }
  }, [initialProducts]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);

  // Fetch products function that gets called on page changes when needed
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${URL_API}/product/all?page=${page}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      const transformedProducts = data.data.map(item => {
        const countryName = item.pais.toLowerCase();
        const countryCode = countryCodeMap[countryName] || 'unknown';
        const image = item.imagen && item.imagen.startsWith('http') ? item.imagen : `${URL_API}/${item.imagen}`;
        
        return {
          id: item.id_producto,
          sku: item.sku,
          title: item.nombre,
          summary: item.caracteristicas || {},
          technicalData: item.datos_tecnicos || {},
          origin: item.pais,
          price: parseFloat(item.precio_igv),
          priceWithoutProfit: parseFloat(item.precio_sin_ganancia),
          priceWithProfit: parseFloat(item.precio_ganancia),
          image,
          flag: `https://flagcdn.com/w320/${countryCode}.png`,
          marca: item.marca.imagen,
          nombre_marca: item.marca.nombre,
          link: `/producto/${item.id_producto}`,
          descripcion: item.descripcion || '',
          video: item.video || '',
          envio: item.envio || '',
          soporte_tecnico: item.soporte_tecnico || '',
          archivos_adicionales: item.archivos_adicionales,
          especificaciones_tecnicas: item.especificaciones_tecnicas,
          subcategoria_id: item.id_subcategoria,
          marca_id: item.marca_id
        };
      });

      // Append new products instead of replacing them
      setProducts(prevProducts => [...prevProducts, ...transformedProducts]);
      setIsAllProducts(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    
    // Calculate if we need to fetch more products
    const totalProducts = products.length;
    const productsNeeded = pageNumber * productsPerPage;
    
    // If we need more products and we're not currently loading
    if (productsNeeded > totalProducts && !loading) {
      const nextPage = Math.ceil(totalProducts / productsPerPage) + 1;
      if (!isAllProducts) {
        await fetchProducts(nextPage);
      }
    }
    
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {currentProducts.map((product) => (
          <div key={product.id} className="block">
            <Card product={product} />
          </div>
        ))}
      </div>
      
      {/* Nueva paginación */}
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
            {Array.from({ length: totalPages }, (_, i) => {
              // Mostrar siempre primera y última página
              if (i === 0 || i === totalPages - 1) {
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }
              // Mostrar páginas cercanas a la actual
              if (
                i + 1 === currentPage ||
                i + 1 === currentPage - 1 ||
                i + 1 === currentPage + 1
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }
              // Mostrar puntos suspensivos
              if (
                i === 1 ||
                i === totalPages - 2
              ) {
                return <span key={i}>...</span>;
              }
              return null;
            })}
          </div>
      
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentPage === totalPages
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
          Mostrando {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} de {products.length} productos
        </div>
      </div>
    </div>
  );
};

const Card = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const { dispatch } = useContext(CartContext); // Obtener dispatch del contexto

  // Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Trigger when at least 10% of the element is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  // Prevenir que el evento de click se propague al enlace padre
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Función para manejar la navegación al producto
  const navigateToProduct = (e) => {
    if (showDetails) {
      // Si el overlay está abierto, evitamos la navegación
      e.preventDefault();
    }
    // Si el overlay está cerrado, dejamos que la navegación ocurra por defecto
  };

  // Modify the handleOverlayClick function
  const handleOverlayClick = (e) => {
    // Only stop propagation if clicking on buttons or links
    if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'a') {
      e.stopPropagation();
    } else {
      // Navigate to product page
      window.location.href = product.link;
    }
  };

  // Add these functions before the return statement in the Card component
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Usar dispatch para añadir el producto al carrito
    dispatch({ type: 'ADD', product: product });
    console.log('Adding to cart:', product);
    // Opcional: Mostrar alguna notificación al usuario
    alert(`${product.title} añadido al carrito!`);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement compare functionality
    console.log('Comparing product:', product.id);
  };

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
      ></a>

      {/* Placeholder mientras carga */}
      <div
        className={`absolute inset-0 bg-gray-200 transition-opacity duration-300 ${imageLoaded && isVisible ? 'opacity-0' : 'opacity-100'}`}
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
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://megaequipamiento.com/wp-content/uploads/2024/08/MEGA-LOGO.webp';
              setImageLoaded(true);
            }}
          />
        )}
      </div>

      {/* Bandera */}
      <div className="flex items-center justify-between px-8 mb-2">
        {isVisible && (
          <>
            {product.marca && (
              <img
                src={product.marca}
                alt={`Marca de ${product.nombre_marca || 'producto'}`}
                className="h-4 object-cover transition-opacity duration-300"
                style={{ opacity: imageLoaded ? 1 : 0 }}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            )}
            {product.flag && (
              <img
                src={product.flag}
                alt={`Bandera de ${product.origin || 'origen'}`}
                className="w-6 h-4 object-cover transition-opacity duration-300"
                style={{ opacity: imageLoaded ? 1 : 0 }}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
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
        {product.summary && Object.entries(product.summary).slice(0, 3).map(([key, value], index) => (
          <p key={index} className="text-sm text-gray-600">
            <strong>{key}:</strong> {value}
          </p>
        ))}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xl font-bold text-blue-600">
            ${product.price}
          </span>
        </div>
      </div>

      {/* Overlay con información detallada, descripción y botones */}
      {showDetails && (
        <div 
          ref={overlayRef}
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
            {product.technicalData && Object.keys(product.technicalData).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-blue-300 mb-2">Datos Técnicos</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  {Object.entries(product.technicalData).map(([key, value], index) => (
                    <p key={index}>
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
              onClick={handleAddToCart} // La función ahora usa dispatch
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
      <style jsx>{`
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
};

export default ProductGrid;