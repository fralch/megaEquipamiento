import React, { useState, useEffect } from "react";
// Importa axios si aún no lo has hecho
import axios from 'axios';
import { useTheme } from '../../storage/ThemeContext';

const Marcas = ({ onSubmit }) => {
  const { isDarkMode } = useTheme();
  // Add new state for modal
  const [previewImage, setPreviewImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    imagen: null,
  });
  // Nuevos estados
  const [deleteLoading, setDeleteLoading] = useState(null); // Para saber qué ID se está eliminando
  const [message, setMessage] = useState({ type: '', text: '' }); // Para mensajes de éxito/error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, imagen: file });
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  const fetchMarcas = async () => {
    try {
      const response = await fetch('/marca/all');
      if (!response.ok) {
        throw new Error('Error fetching marcas');
      }
      const data = await response.json();
      setMarcas(data.reverse()); // Reverse the array to show newest first
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion);
    if (form.imagen) {
      formData.append('imagen', form.imagen);
    }

    try {
      const response = await fetch('/marca/create', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error creating marca');
      }

      const data = await response.json();
      
      // After successful creation, fetch all marcas again
      await fetchMarcas();

      setForm({
        nombre: "",
        descripcion: "",
        imagen: null,
      });

      setMessage({ type: 'success', text: 'Marca creada exitosamente!' }); // Actualiza el mensaje
      // onSubmit(formData); // Comentado o eliminado si no se necesita
      // alert('Marca created successfully!'); // Reemplazado por el estado message
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMarcas = marcas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(marcas.length / itemsPerPage);

  // Nueva función para eliminar marca
  const handleDeleteMarca = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar la marca "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleteLoading(id); // Indica que esta marca se está eliminando
    setMessage({ type: '', text: '' }); // Limpia mensajes anteriores

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Aunque la ruta es GET, usamos POST para enviar el token CSRF y seguir buenas prácticas para acciones destructivas.
      // Si prefieres usar GET, asegúrate de que tu backend lo maneje adecuadamente (puede requerir ajustes en la protección CSRF).
      const response = await axios.post(`/marca/delete/${id}`, {}, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          // 'Content-Type': 'application/json' // No es necesario para una solicitud POST vacía
        }
      });

      if (response.status === 200) {
        setMessage({ type: 'success', text: `Marca "${nombre}" eliminada correctamente.` });
        // Actualiza el estado local eliminando la marca
        setMarcas(prevMarcas => prevMarcas.filter(marca => marca.id_marca !== id));
        // Opcional: Vuelve a cargar las marcas desde el servidor si prefieres
        // await fetchMarcas();

        // Ajusta la página actual si es necesario (si era la última marca en la página)
        const remainingItems = marcas.length - 1;
        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > newTotalPages && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

      } else {
        throw new Error(response.data.message || 'Error al eliminar la marca');
      }

    } catch (error) {
      console.error('Error deleting marca:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Error al eliminar la marca.' });
    } finally {
      setDeleteLoading(null); // Termina el estado de carga
    }
  };


  // Add pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Auto-limpiar mensaje después de 3 segundos
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Add modal component at the top level of the return statement
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-6 mb-8 w-full mx-auto transition-colors duration-200`}>
      {/* Image Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg max-w-2xl max-h-[90vh] overflow-auto transition-colors duration-200`}>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowModal(false)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}

      <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Crear Marca</h1>
      {/* Mostrar mensajes de éxito/error */}
      {message.text && (
        <div className={`p-3 mb-4 rounded transition-colors duration-200 ${
          message.type === 'success' 
            ? (isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700')
            : (isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-700')
        }`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Agregar / Editar Marca</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="nombre" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="descripcion" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="imagen" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
              Imagen
            </label>
            <input
              type="file"
              id="imagen"
              name="imagen"
              accept="image/*"
              onChange={handleImageChange}
              className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-gray-500 focus:border-indigo-400 focus:ring-indigo-400' 
                  : 'bg-white border-gray-300 text-gray-900 file:bg-gray-50 file:text-gray-700 file:border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
          </div>
        </div>
        <button
          type="submit"
          className={`mt-4 px-4 py-2 font-bold rounded-lg w-full md:w-auto transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Guardar Marca
        </button>
      </form>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-6 mb-8 w-full mx-auto transition-colors duration-200`}>
        <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Marcas Totales</h2>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-200`}>
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Nombre</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Descripción</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Imagen</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} transition-colors duration-200`}>
              {currentMarcas.length > 0 ? currentMarcas.map((marca) => (
                <tr key={marca.id_marca} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{marca.nombre}</td>
                  <td className={`px-6 py-4 whitespace-nowrap max-w-xs truncate ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{marca.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {marca.imagen ? ( // Comprobar si existe imagen
                      <img
                        src={marca.imagen}
                        alt={marca.nombre}
                        className="h-10 w-auto object-contain cursor-pointer" // Ajustado w-auto y object-contain
                        onClick={() => {
                          setPreviewImage(marca.imagen);
                          setShowModal(true);
                        }}
                      />
                    ) : (
                      <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-200`}>Sin imagen</span> // Mensaje si no hay imagen
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     {/* Botón Eliminar */}
                    <button
                      onClick={() => handleDeleteMarca(marca.id_marca, marca.nombre)}
                      disabled={deleteLoading === marca.id_marca}
                      className={`transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-red-600 hover:text-red-900'
                      } ${deleteLoading === marca.id_marca ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {deleteLoading === marca.id_marca ? 'Eliminando...' : 'Eliminar'}
                    </button>
                    {/* Aquí podrías añadir un botón de Editar en el futuro */}
                    {/* <button className="text-indigo-600 hover:text-indigo-900 ml-4">Editar</button> */}
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan="4" className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>No hay marcas para mostrar.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
         {/* Controles de Paginación */}
         {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`mx-1 px-3 py-1 border rounded transition-colors duration-200 ${
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
         )}
      </div>
    </div>
  );
}; // End of Marcas component

export default Marcas;
