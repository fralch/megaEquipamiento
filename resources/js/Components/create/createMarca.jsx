import React, { useState, useEffect } from "react";
// Importa axios si aún no lo has hecho
import axios from 'axios';
import { useTheme } from '../../storage/ThemeContext';
import ImageBankModal from './ImageBankModal';

const Marcas = ({ onSubmit }) => {
  const { isDarkMode } = useTheme();
  // Add new state for modal
  const [previewImage, setPreviewImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageBank, setShowImageBank] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    imagen: null,
    video_url: "",
  });
  // Nuevos estados
  const [deleteLoading, setDeleteLoading] = useState(null); // Para saber qué ID se está eliminando
  const [message, setMessage] = useState({ type: '', text: '' }); // Para mensajes de éxito/error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Si es el campo video_url, actualizar la previsualización
    if (name === 'video_url') {
      setVideoPreview(getYouTubeEmbedUrl(value));
    }
  };

  // Función para convertir URL de YouTube a formato embed
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Patrones para diferentes formatos de URL de YouTube
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([\w-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, imagen: file });
    
    // Crear vista previa
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para manejar la selección de imágenes del banco
  const handleImageBankSelect = (bankImages) => {
    if (bankImages.length > 0) {
      const selectedImage = bankImages[0]; // Solo tomar la primera imagen para marcas
      
      // Actualizar la vista previa
      setPreviewImage(selectedImage.url);
      
      // Actualizar el formulario con la información de la imagen del banco
      setForm(prev => ({ 
        ...prev, 
        imagen: {
          url: selectedImage.url,
          name: selectedImage.name,
          isFromBank: true
        }
      }));
    }
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
    formData.append('video_url', form.video_url);
    
    // Manejar imagen del banco vs archivo subido
    if (form.imagen) {
      if (form.imagen.isFromBank) {
        // Si es del banco de imágenes, enviar la URL
        formData.append('imagen_url', form.imagen.url);
        formData.append('imagen_name', form.imagen.name);
      } else {
        // Si es un archivo subido, enviar el archivo
        formData.append('imagen', form.imagen);
      }
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
        video_url: "",
      });
      
      // Limpiar previsualizaciones
      setPreviewImage(null);
      setVideoPreview(null);

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
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 w-full mx-auto transition-colors duration-200`}>
      {/* Image Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-2 sm:p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-t-xl sm:rounded-lg max-w-full sm:max-w-2xl max-h-[90vh] w-full sm:w-auto overflow-auto transition-colors duration-200`}>
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

      {/* Video Preview Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-2 sm:p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-t-xl sm:rounded-lg max-w-full sm:max-w-4xl max-h-[90vh] w-full sm:w-auto overflow-auto transition-colors duration-200`}>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowVideoModal(false)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {videoPreview && (
              <iframe
                width="560"
                height="315"
                src={videoPreview}
                title="Video Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full max-w-full sm:max-w-2xl h-48 sm:h-64 md:h-80"
              ></iframe>
            )}
          </div>
        </div>
      )}

      <h1 className={`text-xl sm:text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Crear Marca</h1>
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
        <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Agregar / Editar Marca</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="mb-3 sm:mb-4">
            <label htmlFor="nombre" className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
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

          <div className="mb-3 sm:mb-4">
            <label htmlFor="descripcion" className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
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

          <div className="mb-3 sm:mb-4">
            <label htmlFor="imagen" className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
              Imagen
            </label>
            <div className="mt-1 flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                id="imagen"
                name="imagen"
                accept="image/*"
                onChange={handleImageChange}
                className={`flex-1 rounded-md shadow-sm transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-gray-500 focus:border-indigo-400 focus:ring-indigo-400' 
                    : 'bg-white border-gray-300 text-gray-900 file:bg-gray-50 file:text-gray-700 file:border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowImageBank(true)}
                className={`px-4 py-3 rounded-md shadow-sm text-sm font-medium transition duration-150 ease-in-out min-h-[44px] flex items-center justify-center whitespace-nowrap ${
                  isDarkMode 
                    ? 'bg-green-600 text-white hover:bg-green-700 border border-green-600' 
                    : 'bg-green-500 text-white hover:bg-green-600 border border-green-500'
                }`}
              >
                Banco de Imágenes
              </button>
            </div>
            {/* Vista previa de la imagen */}
            {previewImage && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vista previa:</span>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className={`text-sm underline transition-colors duration-200 ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Ver en pantalla completa
                  </button>
                </div>
                <img
                  src={previewImage}
                  alt="Vista previa"
                  className="w-full h-24 sm:h-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>

          <div className="mb-3 sm:mb-4">
            <label htmlFor="video_url" className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
              URL del Video
            </label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={form.video_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=example"
              className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {/* Previsualización del video */}
            {videoPreview && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vista previa:</span>
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className={`text-sm underline transition-colors duration-200 ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Ver en pantalla completa
                  </button>
                </div>
                <iframe
                  width="100%"
                  height="150"
                  src={videoPreview}
                  title="Video Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-md h-32 sm:h-48 md:h-56"
                ></iframe>
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          className={`mt-4 px-6 py-3 font-bold rounded-lg w-full sm:w-auto min-h-[44px] transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Guardar Marca
        </button>
      </form>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 w-full mx-auto transition-colors duration-200`}>
        <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Marcas Totales</h2>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-200`}>
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Nombre</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Descripción</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Imagen</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Video</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} transition-colors duration-200`}>
              {currentMarcas.length > 0 ? currentMarcas.map((marca) => (
                <tr key={marca.id_marca} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                  <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{marca.nombre}</td>
                  <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap max-w-xs truncate text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{marca.descripcion}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    {marca.imagen ? ( // Comprobar si existe imagen
                      <img
                        src={marca.imagen}
                        alt={marca.nombre}
                        className="h-8 sm:h-10 w-auto object-contain cursor-pointer" // Ajustado w-auto y object-contain
                        onClick={() => {
                          setPreviewImage(marca.imagen);
                          setShowModal(true);
                        }}
                      />
                    ) : (
                      <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-200`}>Sin imagen</span> // Mensaje si no hay imagen
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    {marca.video_url ? (
                      <a
                        href={marca.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs sm:text-sm underline transition-colors duration-200 ${
                          isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        Ver Video
                      </a>
                    ) : (
                      <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-200`}>Sin video</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                     {/* Botón Eliminar */}
                    <button
                      onClick={() => handleDeleteMarca(marca.id_marca, marca.nombre)}
                      disabled={deleteLoading === marca.id_marca}
                      className={`py-1 px-2 rounded min-h-[32px] transition-colors duration-200 ${
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
                    <td colSpan="5" className={`px-3 sm:px-6 py-4 text-center text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>No hay marcas para mostrar.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
         {/* Controles de Paginación */}
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
      
      {/* Modal del banco de imágenes */}
      {showImageBank && (
        <ImageBankModal
          isOpen={showImageBank}
          onClose={() => setShowImageBank(false)}
          onSelectImages={handleImageBankSelect}
        />
      )}
    </div>
  );
}; // End of Marcas component

export default Marcas;