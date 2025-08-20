import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from '../../storage/ThemeContext';
import ImageBankModal from './ImageBankModal';
import EditSubcategoriaModal from './EditSubcategoriaModal';

const Subcategorias = ({ onSubmit }) => {
  const { isDarkMode } = useTheme();
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_categoria: "",
  });
  const [img, setImg] = useState(null); // Para la imagen de subcategoría
  const [imgPreview, setImgPreview] = useState(null); // Para la vista previa
  const [showImageBank, setShowImageBank] = useState(false); // Para el modal del banco de imágenes
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const totalPages = Math.ceil(subcategorias.length / itemsPerPage);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(null);

  const handleOpenEditModal = (subcategoria) => {
    setSelectedSubcategoria(subcategoria);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSubcategoria(null);
  };

  const handleUpdateSubcategoria = (updatedSubcategoria) => {
    fetchSubcategorias(); // Recargar la lista de subcategorías
  };

  // Function to fetch categories
  const fetchCategorias = async () => {
    try {
      const response = await axios.get('/categorias-all');
      setCategoriasOptions(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('No se pudieron cargar las categorías');
    }
  };

  // Function to fetch subcategories
  const fetchSubcategorias = async () => {
    try {
      const response = await axios.get('/subcategoria-all');
      setSubcategorias(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setError('No se pudieron cargar las subcategorías');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      await fetchCategorias();
      await fetchSubcategorias();
    };
    fetchData();
  }, []);

  // Auto-eliminar mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setImg(null);
      setImgPreview(null);
      return;
    }
    
    // Validar tamaño del archivo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen excede los 2MB');
      return;
    }
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webm', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato de imagen no válido. Use JPEG, PNG, JPG, GIF o WEBM');
      return;
    }
    
    // Guardar archivo
    setImg(file);
    
    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setError(null);
  };

  // Eliminar la imagen seleccionada
  const removeImage = () => {
    setImg(null);
    setImgPreview(null);
  };

  // Manejar selección de imagen del banco
  const handleImageBankSelect = (selectedImages) => {
    if (selectedImages.length > 0) {
      const selectedImage = selectedImages[0]; // Solo tomar la primera imagen
      
      // Actualizar la vista previa
      setImgPreview(selectedImage.url);
      
      // Actualizar el estado de la imagen con información del banco
      setImg({
        url: selectedImage.url,
        name: selectedImage.name,
        isFromBank: true
      });
      
      setShowImageBank(false);
    }
  };

  // Eliminar una subcategoría
  const handleDeleteSubcategoria = async (id, nombre) => {
    // Confirmar antes de eliminar
    if (!window.confirm(`¿Estás seguro de eliminar la subcategoría "${nombre}"? Esta acción también eliminará la imagen asociada y no se puede deshacer.`)) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      // Obtener el CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      // Configurar los headers para la petición DELETE
      const config = {
        headers: {
          'X-CSRF-TOKEN': csrfToken
        }
      };
      
      // Enviar petición DELETE a la ruta proporcionada
      await axios.post(`/subcategoria/delete/${id}`, config);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`Subcategoría "${nombre}" eliminada correctamente`);
      
      // Recargar la lista de subcategorías
      fetchSubcategorias();
      
      // Si estamos en la última página y no hay más elementos, volver a la página anterior
      const remainingItems = subcategorias.length - 1;
      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > newTotalPages && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      setError(`Error al eliminar la subcategoría: ${error.response?.data?.error || 'Error desconocido'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Crear un objeto FormData para enviar los datos del formulario incluyendo la imagen
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion || '');
    formData.append('id_categoria', form.id_categoria);
    
    // Manejar imagen del banco vs archivo subido
    if (img) {
      if (img.isFromBank) {
        // Si es del banco de imágenes, enviar la URL
        formData.append('img_url', img.url);
        formData.append('img_name', img.name);
      } else {
        // Si es un archivo subido, enviar el archivo
        formData.append('img', img);
      }
    }
    
    try {
      // Configurar los headers para envío de formData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      };
      
      const response = await axios.post('/subcategoria_post/create', formData, config);
      
      // Mostramos mensaje de éxito
      setSuccessMessage('Subcategoría creada exitosamente');
      
      // Actualizamos la lista de subcategorías
      fetchSubcategorias();
      
      // Reseteamos el formulario
      setForm({
        nombre: "",
        descripcion: "",
        id_categoria: "",
      });
      setImg(null);
      setImgPreview(null);
      
      // Si hay una función onSubmit, la llamamos con la respuesta
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination Logic ---
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 4;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage <= halfMaxPages) {
        endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage + halfMaxPages >= totalPages) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcular los índices de los elementos a mostrar
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...subcategorias].reverse().slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 w-full mx-auto transition-colors`}>
      <h1 className={`text-xl sm:text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gestión de Subcategorías</h1>
      
      {/* Mensajes de éxito o error */}
      {successMessage && (
        <div className={`${isDarkMode ? 'bg-green-800 border-green-600 text-green-200' : 'bg-green-100 border-green-400 text-green-700'} px-4 py-3 rounded mb-4 transition-colors`}>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className={`${isDarkMode ? 'bg-red-800 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded mb-4 transition-colors`}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} encType="multipart/form-data" className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 sm:p-4 rounded-lg transition-colors`}>
        <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Agregar Nueva Subcategoría</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="mb-3 sm:mb-4">
            <label htmlFor="nombre" className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="id_categoria" className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Categoria Padre <span className="text-red-500">*</span>
            </label>
            <select
              id="id_categoria"
              name="id_categoria"
              value={form.id_categoria}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categoriasOptions.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 sm:mb-4">
            <label htmlFor="descripcion" className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="3"
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Campo para imagen */}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="img" className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Imagen
            </label>
            <div className="mt-1 flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                id="img"
                name="img"
                onChange={handleImageChange}
                className={`flex-1 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-white file:bg-gray-500 file:text-white file:border-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 file:bg-gray-50 file:text-gray-700'
                }`}
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webm,image/webp"
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
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tamaño máximo: 2MB. Formatos: JPEG, PNG, JPG, GIF, WEBM, WEBP
            </p>

            {/* Vista previa de imagen */}
            {imgPreview && (
              <div className="mt-2">
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vista previa:</p>
                <div className="relative inline-block">
                  <img 
                    src={imgPreview} 
                    alt="Vista previa" 
                    className={`h-20 sm:h-24 w-auto object-cover rounded border transition-colors ${
                      isDarkMode ? 'border-gray-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-xs min-h-[20px] min-w-[20px]"
                    title="Eliminar imagen"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center sm:justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 min-h-[44px] w-full sm:w-auto ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-bold rounded-lg transition-colors`}
          >
            {loading ? 'Guardando...' : 'Guardar Subcategoría'}
          </button>
        </div>
      </form>

      <div className="mt-6 sm:mt-8">
        <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subcategorías Existentes</h2>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y transition-colors ${
            isDarkMode ? 'divide-gray-600' : 'divide-gray-200'
          }`}>
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>ID</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Nombre</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Descripción</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Categoría Padre</th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${
              isDarkMode ? 'bg-gray-800 divide-gray-600' : 'bg-white divide-gray-200'
            }`}>
              {currentItems.length > 0 ? (
                currentItems.map((subcategoria) => (
                  <tr key={subcategoria.id_subcategoria}>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{subcategoria.id_subcategoria}</td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{subcategoria.nombre}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className={`max-w-xs truncate text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{subcategoria.descripcion || '-'}</div>
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {categoriasOptions.find(cat => cat.id_categoria === subcategoria.id_categoria)?.nombre || ''}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                        <button 
                          onClick={() => handleOpenEditModal(subcategoria)}
                          className="text-indigo-600 hover:text-indigo-900 py-1 px-2 rounded min-h-[32px] text-xs sm:text-sm"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteSubcategoria(subcategoria.id_subcategoria, subcategoria.nombre)}
                          disabled={deleteLoading}
                          className={`py-1 px-2 rounded min-h-[32px] text-xs sm:text-sm ${
                            deleteLoading ? 'text-red-300' : 'text-red-600 hover:text-red-900'
                          } transition-colors`}
                        >
                          {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`px-3 sm:px-6 py-4 text-center text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No hay subcategorías disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px overflow-x-auto">
                {/* Previous Button */}
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-xs sm:text-sm font-medium transition-colors min-h-[40px] ${
                    isDarkMode 
                      ? `border-gray-600 bg-gray-700 ${
                          currentPage === 1
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-gray-300 hover:bg-gray-600'
                        }`
                      : `border-gray-300 bg-white ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`
                  }`}
                >
                  Anterior
                </button>

                {/* Page Number Buttons */}
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-xs sm:text-sm font-medium transition-colors min-h-[40px] ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-gray-300'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-xs sm:text-sm font-medium transition-colors min-h-[40px] ${
                        currentPage === page
                          ? isDarkMode
                            ? 'bg-blue-900 border-blue-400 text-blue-300 z-10'
                            : 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next Button */}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-xs sm:text-sm font-medium transition-colors min-h-[40px] ${
                    isDarkMode 
                      ? `border-gray-600 bg-gray-700 ${
                          currentPage === totalPages
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-gray-300 hover:bg-gray-600'
                        }`
                      : `border-gray-300 bg-white ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`
                  }`}
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal del banco de imágenes */}
      {showImageBank && (
        <ImageBankModal
          isOpen={showImageBank}
          onClose={() => setShowImageBank(false)}
          onSelectImages={handleImageBankSelect}
        />
      )}

      {isEditModalOpen && (
        <EditSubcategoriaModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          subcategoria={selectedSubcategoria}
          onUpdate={handleUpdateSubcategoria}
          categorias={categoriasOptions}
        />
      )}
    </div>
  );
};

export default Subcategorias;