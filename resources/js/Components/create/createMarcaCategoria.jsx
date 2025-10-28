import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useTheme } from '../../storage/ThemeContext';

const MarcaCategoria = ({ onSubmit }) => {
  const { isDarkMode } = useTheme();

  // States for form
  const [form, setForm] = useState({
    marca_id: "",
    categoria_id: "",
  });

  // States for data
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [relaciones, setRelaciones] = useState([]);

  // States for UI
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    fetchMarcas();
    fetchCategorias();
    fetchRelaciones();
  }, []);

  const fetchMarcas = async () => {
    try {
      const response = await axios.get('/marca-categoria/marcas');
      setMarcas(response.data);
    } catch (error) {
      console.error('Error fetching marcas:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get('/marca-categoria/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchRelaciones = async () => {
    try {
      const response = await axios.get('/marca-categoria/all');
      setRelaciones(response.data);
    } catch (error) {
      console.error('Error fetching relaciones:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.marca_id || !form.categoria_id) {
      setMessage({ type: 'error', text: 'Por favor selecciona una marca y una categoría.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post('/marca-categoria/create', form, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        }
      });

      if (response.status === 201) {
        setMessage({ type: 'success', text: response.data.message || 'Relación creada exitosamente!' });

        // Reset form
        setForm({
          marca_id: "",
          categoria_id: "",
        });

        // Refresh relations list
        await fetchRelaciones();
      }
    } catch (error) {
      console.error('Error creating relation:', error);

      if (error.response?.status === 409) {
        setMessage({ type: 'error', text: 'Esta relación ya existe.' });
      } else if (error.response?.status === 422) {
        setMessage({ type: 'error', text: 'Error de validación. Verifica los datos ingresados.' });
      } else {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Error al crear la relación.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRelacion = async (marca_id, categoria_id, marca_nombre, categoria_nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar la relación entre "${marca_nombre}" y "${categoria_nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleteLoading(`${marca_id}-${categoria_id}`);
    setMessage({ type: '', text: '' });

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post(`/marca-categoria/delete/${marca_id}/${categoria_id}`, {}, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        }
      });

      if (response.status === 200) {
        setMessage({ type: 'success', text: `Relación eliminada correctamente.` });

        // Update local state
        setRelaciones(prevRelaciones =>
          prevRelaciones.filter(rel =>
            !(rel.marca_id === marca_id && rel.categoria_id === categoria_id)
          )
        );

        // Adjust current page if needed
        const remainingItems = relaciones.length - 1;
        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > newTotalPages && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.error('Error deleting relation:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar la relación.' });
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filter relations based on search term
  const filteredRelaciones = relaciones.filter(relacion => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const marcaNombre = relacion.marca_nombre?.toLowerCase() || '';
    const categoriaNombre = relacion.categoria_nombre?.toLowerCase() || '';

    return marcaNombre.includes(searchLower) || categoriaNombre.includes(searchLower);
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRelaciones = filteredRelaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRelaciones.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 w-full mx-auto transition-colors duration-200`}>
      <h1 className={`text-xl sm:text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
        Gestionar Relación Marca - Categoría
      </h1>

      {/* Message display */}
      {message.text && (
        <div className={`p-3 mb-4 rounded transition-colors duration-200 ${
          message.type === 'success'
            ? (isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700')
            : (isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-700')
        }`}>
          {message.text}
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mb-8">
        <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
          Agregar Relación
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Marca Select */}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="marca_id" className={`block text-xs sm:text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
              Marca *
            </label>
            <select
              id="marca_id"
              name="marca_id"
              value={form.marca_id}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            >
              <option value="">Seleccione una marca</option>
              {marcas.map((marca) => (
                <option key={marca.id_marca} value={marca.id_marca}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria Select */}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="categoria_id" className={`block text-xs sm:text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
              Categoría *
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 px-6 py-3 font-bold rounded-lg w-full sm:w-auto min-h-[44px] transition-colors duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Guardando...' : 'Guardar Relación'}
        </button>
      </form>

      {/* Relations Table */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-4 sm:p-6 w-full transition-colors duration-200`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
            Relaciones Existentes ({filteredRelaciones.length}{searchTerm && ` de ${relaciones.length}`})
          </h2>

          {/* Search Box */}
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <input
              type="text"
              placeholder="Buscar por marca o categoría..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors duration-200 ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
                title="Limpiar búsqueda"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {!searchTerm && (
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-200`}>
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Marca
                </th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Categoría
                </th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} transition-colors duration-200`}>
              {currentRelaciones.length > 0 ? currentRelaciones.map((relacion, index) => (
                <tr key={`${relacion.marca_id}-${relacion.categoria_id}-${index}`} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                  <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    <div className="flex items-center">
                      {relacion.marca_imagen && (
                        <img
                          src={relacion.marca_imagen}
                          alt={relacion.marca_nombre}
                          className="h-8 w-8 rounded-full mr-2 object-cover"
                        />
                      )}
                      <span>{relacion.marca_nombre}</span>
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    <div className="flex items-center">
                      {relacion.categoria_imagen && (
                        <img
                          src={relacion.categoria_imagen}
                          alt={relacion.categoria_nombre}
                          className="h-8 w-8 rounded-full mr-2 object-cover"
                        />
                      )}
                      <span>{relacion.categoria_nombre}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <button
                      onClick={() => handleDeleteRelacion(
                        relacion.marca_id,
                        relacion.categoria_id,
                        relacion.marca_nombre,
                        relacion.categoria_nombre
                      )}
                      disabled={deleteLoading === `${relacion.marca_id}-${relacion.categoria_id}`}
                      className={`py-1 px-2 rounded min-h-[32px] transition-colors duration-200 ${
                        isDarkMode
                          ? 'text-red-400 hover:text-red-300'
                          : 'text-red-600 hover:text-red-900'
                      } ${deleteLoading === `${relacion.marca_id}-${relacion.categoria_id}` ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {deleteLoading === `${relacion.marca_id}-${relacion.categoria_id}` ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className={`px-3 sm:px-6 py-4 text-center text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                    No hay relaciones para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center overflow-x-auto">
            <div className="flex">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`mx-1 px-3 py-2 border rounded transition-colors duration-200 min-h-[40px] text-xs sm:text-sm ${
                    currentPage === pageNumber
                      ? 'bg-blue-500 text-white border-blue-500'
                      : isDarkMode
                        ? 'bg-gray-700 text-blue-400 border-gray-600 hover:bg-gray-600'
                        : 'bg-white text-blue-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarcaCategoria;
