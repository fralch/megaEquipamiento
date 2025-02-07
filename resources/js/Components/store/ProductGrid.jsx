import React, { useState, useEffect } from 'react';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  useEffect(() => {
    // Simular una llamada a la API
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/product/all');
        const data = await response.json();

        // Transformar los datos de la API al formato esperado
        const transformedProducts = data.map(item => ({
          id: item.id_producto,
          title: item.nombre,
          diameter: item.caracteristicas?.Dimensiones || 'N/A',
          material: item.caracteristicas?.Marca || 'N/A',
          brand: item.caracteristicas?.Marca || 'N/A',
          origin: item.pais,
          price: parseFloat(item.precio_igv),
          image: item.imagen,
          flag: `https://flagcdn.com/w320/${item.pais.toLowerCase()}.png`,
          description: item.descripcion
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

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
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden border min-h-[400px] relative group">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-64 object-contain p-4"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{product.title}</h2>
        <p className="text-sm text-gray-600">
          <strong>Diámetro:</strong> {product.diameter}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Material:</strong> {product.material}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Marca:</strong> {product.brand}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Procedencia:</strong> {product.origin}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <img
            src={product.flag}
            alt="Bandera"
            className="w-6 h-4 object-cover"
          />
        </div>
      </div>

      {/* Contenido oculto que aparece con hover */}
      <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white flex flex-col justify-center items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">{product.title}</h2>
        <p className="text-sm text-gray-300 mb-2">
          <strong>Diámetro:</strong> {product.diameter}
        </p>
        <p className="text-sm text-gray-300 mb-2">
          <strong>Material:</strong> {product.material}
        </p>
        <p className="text-sm text-gray-300 mb-2">
          <strong>Marca:</strong> {product.brand}
        </p>
        <p className="text-sm text-gray-300 mb-2">
          <strong>Procedencia:</strong> {product.origin}
        </p>
        <p
          className="text-sm text-gray-300 mb-4"
          dangerouslySetInnerHTML={{ __html: product.description }}
        ></p>

        {/* Botones */}
        <div className="flex space-x-4">
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
