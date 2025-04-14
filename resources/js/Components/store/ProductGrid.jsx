import React, { useState, useEffect, useRef } from 'react';
import countryCodeMap from './countryJSON.json';
const URL_API = import.meta.env.VITE_API_URL;

const ProductGrid = ({ products: initialProducts }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
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
          const response = await fetch(`${URL_API}/product/all`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();

          const transformedProducts = data.map(item => {
            const countryName = item.pais.toLowerCase();
            const countryCode = countryCodeMap[countryName] || 'unknown';
            const image = item.imagen && item.imagen.startsWith('http') ? item.imagen : `${URL_API}/${item.imagen}`;
            return {
              id: item.id_producto,
              title: item.nombre,
              summary: item.caracteristicas || {},
              technicalData: item.datos_tecnicos || {},
              origin: item.pais,
              price: parseFloat(item.precio_igv),
              image,
              flag: `https://flagcdn.com/w320/${countryCode}.png`,
              marca: item.marca.imagen,
              nombre_marca: item.marca.nombre,
              link: `/producto/${item.id_producto}` 
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
      fetchProducts();
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
            link: `/producto/${item.id_producto}` 
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
          <a key={product.id} href={product.link} className="block">
            <Card product={product} />
          </a>
        ))}
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const Card = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

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

  return (
    <div
      ref={cardRef}
      className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-96 relative group flex flex-col transition-all duration-300 hover:shadow-xl"
    >
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
              e.target.onerror = null; // Evita bucles infinitos si la imagen de respaldo falla
              e.target.src = 'https://megaequipamiento.com/wp-content/uploads/2024/08/MEGA-LOGO.webp'; // Imagen de respaldo
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
        {product.summary && Object.entries(product.summary).slice(0, 2).map(([key, value], index) => (
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

      {/* Overlay con información detallada y botones */}
      <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white flex flex-col justify-start items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-4 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">{product.title}</h2>
        <div className="text-sm text-gray-300 mb-2 space-y-2 overflow-y-auto flex-grow">
          {product.technicalData && Object.entries(product.technicalData).map(([key, value], index) => (
            <p key={index}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </div>
        <div className="flex space-x-4 mt-auto">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Añadir al carrito
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
            Comparar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;