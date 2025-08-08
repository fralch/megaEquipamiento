import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../storage/ThemeContext';

const EditSubcategoriaModal = ({ isOpen, onClose, subcategoria, onUpdate, categorias }) => {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    id_categoria: '',
  });
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (subcategoria) {
      setForm({
        nombre: subcategoria.nombre || '',
        descripcion: subcategoria.descripcion || '',
        id_categoria: subcategoria.id_categoria || '',
      });
      setImgPreview(subcategoria.img ? `/${subcategoria.img}` : null);
      setImg(null); // Reset image input on new subcategory
    }
  }, [subcategoria]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImg(null);
      setImgPreview(subcategoria.img ? `/${subcategoria.img}` : null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen excede los 2MB');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webm', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato de imagen no válido. Use JPEG, PNG, JPG, GIF o WEBM');
      return;
    }
    setImg(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const removeImage = () => {
    setImg(null);
    setImgPreview(null);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subcategoria) return;

    setLoading(true);
    setError(null);

    // Debug: Log form state before creating FormData
    console.log('Form state:', form);
    console.log('Subcategoria:', subcategoria);

    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion || '');
    formData.append('id_categoria', form.id_categoria);

    if (img) {
      formData.append('img', img);
    } else if (imgPreview === null) {
        formData.append('remove_image', '1');
    }


    try {
      // Debug: Log form data
      console.log('Form data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log('Subcategoria ID:', subcategoria.id_subcategoria);

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': csrfToken,
        },
      };

      const response = await axios.post(`/subcategoria/edit/${subcategoria.id_subcategoria}`, formData, config);
      setSuccessMessage('Subcategoría actualizada exitosamente');
      if (onUpdate) {
        onUpdate(response.data);
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error desconocido';
      if (error.response?.data?.errors) {
        // Laravel validation errors
        const validationErrors = Object.values(error.response.data.errors).flat();
        errorMessage = validationErrors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(`Error al actualizar la subcategoría: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Editar Subcategoría</h2>

        {successMessage && (
          <div className={`${isDarkMode ? 'bg-green-800 border-green-600 text-green-200' : 'bg-green-100 border-green-400 text-green-700'} px-4 py-3 rounded mb-4`}>
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className={`${isDarkMode ? 'bg-red-800 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded mb-4`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="edit-nombre" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit-nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="edit-id_categoria" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Categoría Padre <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-id_categoria"
                name="id_categoria"
                value={form.id_categoria}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 md:col-span-2">
              <label htmlFor="edit-descripcion" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Descripción
              </label>
              <textarea
                id="edit-descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="3"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div className="mb-4 md:col-span-2">
              <label htmlFor="edit-img" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Imagen
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  id="edit-img"
                  name="img"
                  onChange={handleImageChange}
                  className={`w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white file:bg-gray-500 file:text-white file:border-gray-400' : 'bg-white border-gray-300 text-gray-900 file:bg-gray-50 file:text-gray-700'}`}
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webm,image/webp"
                />
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Tamaño máximo: 2MB. Formatos: JPEG, PNG, JPG, GIF, WEBM, WEBP
              </p>
              {imgPreview && (
                <div className="mt-2">
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vista previa:</p>
                  <div className="relative inline-block">
                    <img
                      src={imgPreview}
                      alt="Vista previa"
                      className={`h-24 w-auto object-cover rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      title="Eliminar imagen"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 font-bold rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 font-bold rounded-lg ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {loading ? 'Actualizando...' : 'Actualizar Subcategoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubcategoriaModal;
