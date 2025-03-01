import React, { useState, useEffect } from 'react';
import countryCodeMap from './countryJSON.json';
const URL_API = import.meta.env.VITE_API_URL;

const ProductGrid = ({ products: initialProducts }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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
            flag: `https://flagcdn.com/w320/${countryCode}.png`
          };
        });

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (!initialProducts || initialProducts.length === 0) {
      fetchProducts();
    } else {
      const transformedProducts = initialProducts.map(item => {
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
          flag: `https://flagcdn.com/w320/${countryCode}.png`
        };
      });

      setProducts(transformedProducts);
    }
  }, [initialProducts]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {currentProducts.map((product) => (
          <Card key={product.id} product={product} />
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
  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-128 relative group flex flex-col transition-all duration-300 hover:shadow-xl">
      {/* Área de imagen (60% del card) */}
      <div className="flex items-center justify-center p-4 h-3/5">
        <img
          src={product.image}
          alt={product.title}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.target.onerror = null; // Evita bucles infinitos si la imagen de respaldo falla
            e.target.src = 'https://megaequipamiento.com/wp-content/uploads/2024/08/MEGA-LOGO.webp'; // Imagen de respaldo
          }}
        />
      </div>
      
      {/* Bandera */}
      <div className="flex items-center justify-center mb-2">
        <img
          src={product.flag}
          alt={`Bandera de ${product.origin}`}
          className="w-6 h-4 object-cover mr-2"
          onError={(e) => {
            e.target.onerror = null; // Evita bucles infinitos para la bandera
            e.target.src = ''; // Imagen de respaldo para la bandera
          }}
        />
        <span className="text-xs text-gray-600">{product.origin}</span>
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