import React, { useState, useEffect } from "react";
import axios from "axios";

const Categorias = ({ onSubmit }) => {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
  });
  const [imagenes, setImagenes] = useState([]); // Array para las imágenes
  const [imagenesPreview, setImagenesPreview] = useState([]); // Array para vistas previas
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webm'];
      if (!validTypes.includes(file.type)) {
        setError(`Formato de imagen ${file.name} no válido. Use JPEG, PNG, JPG, GIF o WEBM`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Crear un objeto FormData para enviar los datos del formulario incluyendo las imágenes
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion || '');
    
    // Añadir las imágenes si existen
    if (imagenes.length > 0) {
      imagenes.forEach((img, index) => {
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
      
      // Mostramos mensaje de éxito
      alert('Categoría creada exitosamente');
      
      // Actualizamos la lista de categorías
      loadCategorias();
      
      // Reseteamos el formulario
      setForm({
        nombre: "",
        descripcion: "",
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
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Categorías</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h2 className="text-lg font-bold mb-4">Agregar Nueva Categoría</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Campo unificado para imágenes */}
        <div className="mb-4">
          <label htmlFor="imagenes" className="block text-sm font-medium text-gray-700">
            Imágenes (máximo 5)
          </label>
          <input
            type="file"
            id="imagenes"
            name="imagenes"
            onChange={handleImagenesChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            accept="image/jpeg,image/png,image/jpg,image/gif,image/webm"
            multiple
          />
          <p className="text-xs text-gray-500 mt-1">
            Puedes seleccionar hasta 5 imágenes (máx. 2MB cada una)
          </p>
          
          {/* Vista previa de imágenes */}
          {imagenesPreview.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-1">Vistas previas:</p>
              <div className="flex flex-wrap gap-2">
                {imagenesPreview.map((img, index) => (
                  <div key={img.id} className="relative">
                    <img 
                      src={img.preview} 
                      alt={`Vista previa ${index + 1}`} 
                      className="h-24 w-auto object-cover rounded border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      title="Eliminar imagen"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-bold rounded-lg transition-colors`}
          >
            {loading ? 'Guardando...' : 'Guardar Categoría'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">Categorías Existentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                {/* Columna de Imágenes eliminada */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th> {/* Nueva columna */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((categoria) => (
                  <tr key={categoria.id_categoria}>
                    <td className="px-6 py-4 whitespace-nowrap">{categoria.id_categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{categoria.nombre}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate">{categoria.descripcion || '-'}</div>
                    </td>
                    {/* Celda de Imágenes eliminada */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"> {/* Nueva celda para acciones */}
                      <button 
                        onClick={() => console.log('Editar categoría:', categoria.id_categoria)} // Placeholder para editar
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => console.log('Eliminar categoría:', categoria.id_categoria)} // Placeholder para eliminar
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  {/* Ajustar colspan */}
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No hay categorías disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {/* Previous Button */}
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>

                {/* Page Number Buttons */}
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                          : 'text-gray-700 hover:bg-gray-50'
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
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categorias;
