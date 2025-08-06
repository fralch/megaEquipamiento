import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from '../../storage/ThemeContext';

const Categorias = ({ onSubmit }) => {
  const { isDarkMode } = useTheme();
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    video: "",
  });
  const [imagenes, setImagenes] = useState([]); // Array para las imágenes
  const [imagenesPreview, setImagenesPreview] = useState([]); // Array para vistas previas
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [marcas, setMarcas] = useState([]); // Array para las marcas
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    descripcion: "",
    video: "",
  });
  const [editImagenes, setEditImagenes] = useState([]); // Array para las imágenes en edición
  const [editImagenesPreview, setEditImagenesPreview] = useState([]); // Array para vistas previas en edición
  const [shouldClearImages, setShouldClearImages] = useState(false); // Para indicar si se deben limpiar las imágenes


  // Función para cargar las categorías
  const loadCategorias = async () => {
    try {
      const response = await axios.get('/categorias-all');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('No se pudieron cargar las categorías');
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategorias();
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

  // obtener las marcas
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await axios.get('/marca/all');
        setMarcas(response.data);
      } catch (error) {
        console.error('Error fetching marcas:', error);
        setError('No se pudieron cargar las marcas');
      }
    };
    fetchMarcas();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Manejar cambio de múltiples imágenes
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImagenes = [];
    const newPreviews = [];
    let hasError = false;

    // Validar que no se seleccionen más de 5 imágenes
    if (files.length > 5) {
      setError('No puedes seleccionar más de 5 imágenes');
      return;
    }

    // Validar cada archivo
    for (const file of files) {
      // Validar tamaño del archivo (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError(`La imagen ${file.name} excede los 2MB`);
        hasError = true;
        break;
      }
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webm', 'image/webp']; // Añadir 'image/webp'
      if (!validTypes.includes(file.type)) {
        setError(`Formato de imagen ${file.name} no válido. Use JPEG, PNG, JPG, GIF, WEBM o WEBP`); // Actualizar mensaje de error
        hasError = true;
        break;
      }
      
      newImagenes.push(file);
      
      // Crear vista previa para cada imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ id: file.name, preview: reader.result });
        // Si ya tenemos todas las previsualizaciones, actualizamos el estado
        if (newPreviews.length === files.length) {
          setImagenesPreview([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    if (!hasError) {
      setImagenes(newImagenes);
      setError(null);
    }
  };

  // Eliminar una imagen de la lista
  const removeImage = (index) => {
    const newImagenes = [...imagenes];
    newImagenes.splice(index, 1);
    setImagenes(newImagenes);
    
    const newPreviews = [...imagenesPreview];
    newPreviews.splice(index, 1);
    setImagenesPreview(newPreviews);
  };


  // Función para abrir modal de edición
  const handleEditCategoria = (categoria) => {
    setEditingCategoria(categoria);
    setEditForm({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
      video: categoria.video || "",
    });
    setShowEditModal(true);
  };

  // Función para cerrar modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCategoria(null);
    setEditForm({
      nombre: "",
      descripcion: "",
      video: "",
    });
    setEditImagenes([]);
    setEditImagenesPreview([]);
    setShouldClearImages(false);
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // Manejar cambio de múltiples imágenes en edición
  const handleEditImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImagenes = [];
    const newPreviews = [];
    let hasError = false;

    // Validar que no se seleccionen más de 5 imágenes
    if (files.length > 5) {
      setError('No puedes seleccionar más de 5 imágenes');
      return;
    }

    // Validar cada archivo
    for (const file of files) {
      // Validar tamaño del archivo (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError(`La imagen ${file.name} excede los 2MB`);
        hasError = true;
        break;
      }
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webm', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(`Formato de imagen ${file.name} no válido. Use JPEG, PNG, JPG, GIF, WEBM o WEBP`);
        hasError = true;
        break;
      }
      
      newImagenes.push(file);
      
      // Crear vista previa para cada imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ id: file.name, preview: reader.result });
        // Si ya tenemos todas las previsualizaciones, actualizamos el estado
        if (newPreviews.length === files.length) {
          setEditImagenesPreview([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    if (!hasError) {
      setEditImagenes(newImagenes);
      setError(null);
      setShouldClearImages(true); // Marcar que las imágenes deben ser actualizadas
    }
  };

  // Eliminar una imagen de la lista en edición
  const removeEditImage = (index) => {
    const newImagenes = [...editImagenes];
    newImagenes.splice(index, 1);
    setEditImagenes(newImagenes);
    
    const newPreviews = [...editImagenesPreview];
    newPreviews.splice(index, 1);
    setEditImagenesPreview(newPreviews);
  };


  // Función para limpiar todas las imágenes
  const handleClearEditImages = () => {
    setEditImagenes([]);
    setEditImagenesPreview([]);
    setShouldClearImages(true); // Marcar que se deben eliminar las imágenes existentes
  };

  // Función para actualizar categoría
  const handleUpdateCategoria = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Crear un objeto FormData para enviar los datos del formulario incluyendo las imágenes
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Method spoofing for Laravel
      formData.append('nombre', editForm.nombre);
      formData.append('descripcion', editForm.descripcion || '');
      formData.append('video', editForm.video || '');
      
      // Solo actualizar imágenes si se han seleccionado nuevas imágenes o se marcó para limpiar
      if (shouldClearImages) {
        formData.append('update_images', 'true');
        
        // Enviar solo archivos subidos
        if (editImagenes.length > 0) {
          editImagenes.forEach((img, index) => {
            // Solo procesar archivos subidos (no del banco)
            formData.append(`imagenes[${index}]`, img);
          });
        }
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      };
      
      await axios.post(`/categoria/update/${editingCategoria.id_categoria}`, formData, config);
      
      setSuccessMessage('Categoría actualizada exitosamente');
      loadCategorias();
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating category:', error);
      setError(`Error al actualizar la categoría: ${error.response?.data?.error || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para eliminar una categoría
  const handleDeleteCategoria = async (id, nombre) => {
    // Confirmar antes de eliminar
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${nombre}"? Esta acción también eliminará la carpeta de imágenes asociada y no se puede deshacer.`)) {
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
      await axios.delete(`/categoria/delete/${id}`, config);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`Categoría "${nombre}" eliminada correctamente`);
      
      // Recargar la lista de categorías
      loadCategorias();
      
      // Si estamos en la última página y no hay más elementos, volver a la página anterior
      const remainingItems = categorias.length - 1;
      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > newTotalPages && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(`Error al eliminar la categoría: ${error.response?.data?.error || 'Error desconocido'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Crear un objeto FormData para enviar los datos del formulario incluyendo las imágenes
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion || '');
    formData.append('video', form.video || '');
    
    // Añadir las imágenes si existen
    if (imagenes.length > 0) {
      imagenes.forEach((img, index) => {
        // Solo procesar archivos subidos
        formData.append(`imagenes[${index}]`, img);
      });
    }
    
    try {
      // Configurar los headers para envío de formData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      };
      
      const response = await axios.post('/categoria/create', formData, config);
      
     
      // TODO : enlazar la categoria con la marca
      if(response.data.length > 0){
        const config2 = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
          }
        };
      }
      // Mostramos mensaje de éxito
      setSuccessMessage('Categoría creada exitosamente');
      
      // Actualizamos la lista de categorías
      loadCategorias();
      
      // Reseteamos el formulario
      setForm({
        nombre: "",
        descripcion: "",
        video: "",
      });
      setImagenes([]);
      setImagenesPreview([]);
      
      // Si hay una función onSubmit, la llamamos con la respuesta
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular los índices de los elementos a mostrar
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...categorias].reverse().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categorias.length / itemsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  return (
    <div className={`shadow-md rounded-lg p-6 mb-8 w-full mx-auto transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h1 className={`text-2xl font-bold mb-6 border-b pb-2 transition-colors duration-300 ${
        isDarkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-200'
      }`}>Gestión de Categorías</h1>
      
      {/* Mensajes de éxito o error */}
      {successMessage && (
        <div className={`border px-4 py-3 rounded mb-6 flex items-center transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-green-900 border-green-600 text-green-300' 
            : 'bg-green-100 border-green-400 text-green-700'
        }`}>
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className={`border px-4 py-3 rounded mb-6 flex items-center transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-red-900 border-red-600 text-red-300' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      <div className={`p-4 rounded-lg mb-6 border transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <h2 className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Nueva Categoría
          </h2>
          
          {/* Grid principal más compacto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Información básica */}
            <div className="space-y-3">
              <div>
                <label htmlFor="nombre" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ingresa el nombre de la categoría"
                  className={`w-full px-3 py-2 text-sm rounded-md border transition-colors duration-300 focus:ring-2 focus:ring-opacity-50 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label htmlFor="marca" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Marca <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="marca"
                    name="marca"
                    value={form.marca}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors duration-300 focus:ring-2 focus:ring-opacity-50 appearance-none ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white focus:border-indigo-400 focus:ring-indigo-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    required
                  >
                    <option value="">Selecciona una marca</option>
                    {marcas.map((marca) => (
                      <option key={marca.id_marca} value={marca.id_marca}>
                        {marca.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="video" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  URL del Video
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="video"
                    name="video"
                    value={form.video}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`w-full px-3 py-2 pl-9 text-sm rounded-md border transition-colors duration-300 focus:ring-2 focus:ring-opacity-50 ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className={`mt-1 text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Opcional: YouTube, Vimeo u otras plataformas
                </p>
              </div>
            </div>

            {/* Descripción e imágenes */}
            <div className="space-y-3">
              <div>
                <label htmlFor="descripcion" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe la categoría (opcional)"
                  className={`w-full px-3 py-2 text-sm rounded-md border transition-colors duration-300 focus:ring-2 focus:ring-opacity-50 resize-none ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
              </div>

              {/* Sección de imágenes más compacta */}
              <div>
                <label htmlFor="imagenes" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Imágenes <span className={`text-xs font-normal transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>(máx. 5, 2MB c/u)</span>
                </label>
                
                <div className="flex gap-2">
                  <label className={`flex flex-col flex-1 h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    isDarkMode 
                      ? 'border-gray-500 hover:bg-gray-600 hover:border-gray-400' 
                      : 'border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                  }`}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="flex items-center space-x-2">
                        <svg className={`w-5 h-5 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Seleccionar imágenes
                        </span>
                      </div>
                      <span className={`text-xs mt-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        JPEG, PNG, GIF, WEBP
                      </span>
                    </div>
                    <input
                      type="file"
                      id="imagenes"
                      name="imagenes"
                      onChange={handleImagenesChange}
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webm,image/webp"
                      multiple
                    />
                  </label>
                  
                </div>
              </div>
            </div>
          </div>
          
          {/* Vista previa de imágenes en una sola fila */}
          {imagenesPreview.length > 0 && (
            <div className={`p-3 rounded-md border transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center mb-2">
                <svg className={`w-4 h-4 mr-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Vista previa ({imagenesPreview.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {imagenesPreview.map((img, index) => (
                  <div key={img.id} className="relative group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm border-2 border-transparent group-hover:border-indigo-300 transition-all duration-200">
                      <img 
                        src={img.preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de envío más prominente */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${
                loading 
                  ? (isDarkMode ? 'bg-blue-500' : 'bg-blue-400') 
                  : (isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700')
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Crear Categoría
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className={`text-lg font-bold mb-4 border-b pb-2 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'
        }`}>Categorías Existentes</h2>
        <div className={`overflow-x-auto rounded-lg border shadow-sm transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <table className={`min-w-full divide-y transition-colors duration-300 ${
            isDarkMode ? 'divide-gray-600' : 'divide-gray-200'
          }`}>
            <thead className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>ID</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Nombre</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Descripción</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Video</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 divide-gray-600' : 'bg-white divide-gray-200'
            }`}>
              {currentItems.length > 0 ? (
                currentItems.map((categoria) => (
                  <tr key={categoria.id_categoria} className={`transition-colors duration-300 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{categoria.id_categoria}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{categoria.nombre}</td>
                    <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <div className="max-w-xs truncate">{categoria.descripcion || '-'}</div>
                    </td>
                    <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {categoria.video ? (
                        <a 
                          href={categoria.video} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors duration-300 ${
                            isDarkMode 
                              ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          Ver Video
                        </a>
                      ) : (
                        <span className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>Sin video</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditCategoria(categoria)}
                          className={`px-3 py-1 rounded-md transition-colors duration-300 ${
                            isDarkMode 
                              ? 'bg-indigo-900 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-800' 
                              : 'bg-indigo-50 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100'
                          }`}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteCategoria(categoria.id_categoria, categoria.nombre)}
                          disabled={deleteLoading}
                          className={`px-3 py-1 rounded-md transition-colors duration-300 ${
                            deleteLoading 
                              ? (isDarkMode ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-300') 
                              : (isDarkMode 
                                  ? 'bg-red-900 text-red-300 hover:text-red-200 hover:bg-red-800' 
                                  : 'bg-red-50 text-red-600 hover:text-red-900 hover:bg-red-100'
                                )
                          }`}
                        >
                          {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`px-6 py-4 text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No hay categorías disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className={`px-6 py-3 flex items-center justify-between border-t transition-colors duration-300 ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-300 ${
                    currentPage === 1
                      ? (isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        )
                      : (isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        )
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-300 ${
                    currentPage === totalPages
                      ? (isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        )
                      : (isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        )
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {/* Previous Button */}
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium transition-colors duration-300 ${
                      currentPage === 1
                        ? (isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-600 cursor-not-allowed' 
                            : 'bg-white border-gray-300 text-gray-300 cursor-not-allowed'
                          )
                        : (isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          )
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page Number Buttons */}
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-300' 
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-300 ${
                          currentPage === page
                            ? (isDarkMode 
                                ? 'z-10 bg-indigo-600 border-indigo-600 text-white' 
                                : 'z-10 bg-indigo-500 border-indigo-500 text-indigo-600'
                              )
                            : (isDarkMode 
                                ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              )
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
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium transition-colors duration-300 ${
                      currentPage === totalPages
                        ? (isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-600 cursor-not-allowed' 
                            : 'bg-white border-gray-300 text-gray-300 cursor-not-allowed'
                          )
                        : (isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          )
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Editar Categoría
              </h3>
              <button
                onClick={handleCloseEditModal}
                className={`p-1 rounded-md transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategoria}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-nombre" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-nombre"
                    name="nombre"
                    value={editForm.nombre}
                    onChange={handleEditChange}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors duration-300 focus:ring-2 focus:ring-opacity-50 ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-descripcion" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Descripción
                  </label>
                  <textarea
                    id="edit-descripcion"
                    name="descripcion"
                    value={editForm.descripcion}
                    onChange={handleEditChange}
                    rows="3"
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors duration-300 focus:ring-2 focus:ring-opacity-50 resize-none ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-video" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    URL del Video
                  </label>
                  <input
                    type="url"
                    id="edit-video"
                    name="video"
                    value={editForm.video}
                    onChange={handleEditChange}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors duration-300 focus:ring-2 focus:ring-opacity-50 ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                
                {/* Sección de imágenes */}
                <div>
                  <label htmlFor="edit-imagenes" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Imágenes <span className={`text-xs font-normal transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>(máx. 5, 2MB c/u)</span>
                  </label>
                  
                  <div className="flex gap-2">
                    <label className={`flex flex-col flex-1 h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      isDarkMode 
                        ? 'border-gray-500 hover:bg-gray-600 hover:border-gray-400' 
                        : 'border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                    }`}>
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="flex items-center space-x-2">
                          <svg className={`w-5 h-5 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Seleccionar imágenes
                          </span>
                        </div>
                        <span className={`text-xs mt-1 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          JPEG, PNG, GIF, WEBP
                        </span>
                      </div>
                      <input
                        type="file"
                        id="edit-imagenes"
                        name="imagenes"
                        onChange={handleEditImagenesChange}
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webm,image/webp"
                        multiple
                      />
                    </label>
                    
                    
                    <button
                      type="button"
                      onClick={handleClearEditImages}
                      className={`px-4 py-2 h-24 border-2 border-dashed rounded-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center ${
                        isDarkMode 
                          ? 'border-red-500 hover:bg-red-600/20 hover:border-red-400 text-red-400' 
                          : 'border-red-300 hover:bg-red-50 hover:border-red-400 text-red-600'
                      }`}
                      title="Eliminar todas las imágenes"
                    >
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-xs font-medium">Limpiar</span>
                    </button>
                  </div>
                </div>
                
                {/* Vista previa de imágenes en edición */}
                {editImagenesPreview.length > 0 && (
                  <div className={`p-3 rounded-md border transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <svg className={`w-4 h-4 mr-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Vista previa ({editImagenesPreview.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editImagenesPreview.map((img, index) => (
                        <div key={img.id} className="relative group">
                          <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm border-2 border-transparent group-hover:border-indigo-300 transition-all duration-200">
                            <img 
                              src={img.preview} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Eliminar"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading 
                      ? (isDarkMode ? 'bg-blue-500' : 'bg-blue-400') 
                      : (isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700')
                  }`}
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      
    </div>
  );
};

export default Categorias;