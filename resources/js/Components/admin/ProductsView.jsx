import React, { useState, useEffect } from 'react';
import { useTheme } from '../../storage/ThemeContext';

const URL_API = import.meta.env.VITE_API_URL;

const ProductsView = () => {
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Obtener productos con paginación
  const fetchProducts = async (page = 1, itemsPerPage = 20) => {
    setLoading(true);
    try {
      const res = await fetch(`${URL_API}/product/all?page=${page}&per_page=${itemsPerPage}`);
      const data = await res.json();

      if (data?.data) {
        setProducts(data.data);
        setFilteredProducts(data.data);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setTotalProducts(data.total);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('Error al cargar los productos');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage]);

  // Filtrar productos
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter((p) =>
      (p.nombre || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term) ||
      (p.marca?.nombre || '').toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Auto-clear mensajes
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
    return () => clearTimeout(t);
  }, [message]);

  // Eliminar producto
  const handleDelete = async (productId, productName) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}"?`)) return;

    setDeleteLoading(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await fetch(`${URL_API}/product/delete/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const data = await response.json();
      if (response.ok && data?.success) {
        setMessage(`Producto "${productName}" eliminado exitosamente`);
        setMessageType('success');
        fetchProducts(currentPage, perPage);
      } else {
        setMessage(data?.message || 'Error al eliminar el producto');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('Error al eliminar el producto');
      setMessageType('error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Formatear precio
  const formatPrice = (price) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price || 0);

  // Paginación
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const max = 5;
    const half = Math.floor(max / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) end = Math.min(totalPages, max);
    if (currentPage + half >= totalPages) start = Math.max(1, totalPages - max + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-lg transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Gestión de Productos
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
          Total de productos: {totalProducts}
        </p>
      </div>

      {/* Mensajes */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-md border ${
            messageType === 'success'
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-red-100 text-red-700 border-red-300'
          }`}
        >
          {message}
        </div>
      )}

      {/* Buscador + controles */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            Mostrar:
          </label>
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className={`px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>por página</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div
            className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
              isDarkMode ? 'border-blue-400' : 'border-blue-600'
            }`}
          />
          <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Cargando productos...
          </span>
        </div>
      )}

      {/* Tabla de productos (sin columna de imágenes) */}
      {!loading && (
        <div className="overflow-x-auto rounded-lg border border-transparent">
          <table
            className={`min-w-full table-auto border-collapse ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <thead>
              <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                {[
                  'SKU',
                  'Nombre',
                  'Marca',
                  'Precio',
                  'Acciones',
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b sticky top-0 z-10 ${
                      isDarkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-200'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className={`${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id_producto}
                    className={`transition-colors duration-150 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td
                      className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}
                      title={product.sku}
                    >
                      {product.sku}
                    </td>

                    <td
                      className={`px-4 py-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}
                      title={product.nombre}
                    >
                      <div className="max-w-xs truncate">{product.nombre}</div>
                    </td>

                    <td
                      className={`px-4 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}
                      title={product.marca?.nombre || 'Sin marca'}
                    >
                      {product.marca?.nombre ? (
                        product.marca.nombre
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Sin marca
                        </span>
                      )}
                    </td>

                    <td
                      className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}
                      title={formatPrice(product.precio_igv)}
                    >
                      {formatPrice(product.precio_igv)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <a
                          href={`/product/show/${product.id_producto}`}
                          className={`px-3 py-1 rounded-md text-xs transition-colors duration-200 ${
                            isDarkMode
                              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400'
                              : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300'
                          }`}
                        >
                          Ver
                        </a>

                        <button
                          onClick={() => handleDelete(product.id_producto, product.nombre)}
                          disabled={deleteLoading}
                          className={`px-3 py-1 rounded-md text-xs transition-colors duration-200 ${
                            deleteLoading
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : isDarkMode
                              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400'
                              : 'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300'
                          }`}
                          title="Eliminar producto"
                        >
                          {deleteLoading ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className={`px-4 py-10 text-center text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {searchTerm
                      ? 'No se encontraron productos que coincidan con la búsqueda'
                      : 'No hay productos disponibles'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            Mostrando {Math.min((currentPage - 1) * perPage + 1, totalProducts)} a{' '}
            {Math.min(currentPage * perPage, totalProducts)} de {totalProducts} productos
          </div>

          <nav className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                currentPage === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Anterior
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === page
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductsView;
