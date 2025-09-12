import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useTheme } from '../../storage/ThemeContext';

const TagParents = ({ initialTagParents = [] }) => {
  const { isDarkMode } = useTheme();
  const [tagParents, setTagParents] = useState(initialTagParents);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTagParent, setEditingTagParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    color: "#3B82F6",
    imagen: ""
  });

  const colors = [
    { value: "#F59E0B", label: "Amarillo" },
    { value: "#EF4444", label: "Rojo" },
    { value: "#10B981", label: "Verde" },
    { value: "#6366F1", label: "Índigo" },
    { value: "#3B82F6", label: "Azul" },
    { value: "#6B7280", label: "Gris" },
    { value: "#8B5CF6", label: "Púrpura" },
    { value: "#F97316", label: "Naranja" },
    { value: "#06B6D4", label: "Cian" },
    { value: "#84CC16", label: "Lima" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchTagParents = async () => {
    try {
      const response = await axios.get('/admin/tag-parents');
      setTagParents(response.data.tagParents || []);
    } catch (error) {
      console.error('Error al obtener sectores:', error);
      showMessage('error', 'Error al cargar los sectores');
    }
  };

  useEffect(() => {
    if (initialTagParents.length === 0) {
      fetchTagParents();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      showMessage('error', 'El nombre del sector es obligatorio');
      return;
    }

    setLoading(true);
    try {
      if (editingTagParent) {
        await axios.put(`/admin/tag-parents/${editingTagParent.id_tag_parent}`, form);
        showMessage('success', 'Sector actualizado exitosamente');
      } else {
        await axios.post('/admin/tag-parents', form);
        showMessage('success', 'Sector creado exitosamente');
      }
      
      setForm({ nombre: "", descripcion: "", color: "#3B82F6", imagen: "" });
      setEditingTagParent(null);
      fetchTagParents();
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', error.response?.data?.message || 'Error al procesar el sector');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tagParent) => {
    setEditingTagParent(tagParent);
    setForm({
      nombre: tagParent.nombre,
      descripcion: tagParent.descripcion || "",
      color: tagParent.color || "#3B82F6",
      imagen: tagParent.imagen || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingTagParent(null);
    setForm({ nombre: "", descripcion: "", color: "#3B82F6", imagen: "" });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este sector? Esto también eliminará todos los tags asociados.')) return;
    
    setDeleteLoading(id);
    try {
      await axios.delete(`/admin/tag-parents/${id}`);
      showMessage('success', 'Sector eliminado exitosamente');
      fetchTagParents();
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', 'Error al eliminar el sector');
    } finally {
      setDeleteLoading(null);
    }
  };

  const totalPages = Math.ceil(tagParents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTagParents = tagParents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={`p-6 rounded-lg shadow-lg transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">
          {editingTagParent ? 'Editar Sector' : 'Crear Sector'}
        </h1>
        
        {message.text && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre del Sector *
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Laboratorio, Instrumentación, etc."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción del sector"
              rows="3"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              URL de Imagen (Opcional)
            </label>
            <input
              type="url"
              name="imagen"
              value={form.imagen}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Color del Sector
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: colorOption.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.color === colorOption.value 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.label}
                />
              ))}
            </div>
            <input
              type="color"
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-20 h-10 rounded-lg border border-gray-300"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800'
                  : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300'
              } text-white disabled:cursor-not-allowed`}
            >
              {loading ? 'Procesando...' : (editingTagParent ? 'Actualizar Sector' : 'Crear Sector')}
            </button>
            
            {editingTagParent && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white`}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Sectores */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Sectores Existentes ({tagParents.length})</h2>
        
        {currentTagParents.length > 0 ? (
          <>
            <div className={`overflow-x-auto rounded-lg border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Tags Asociados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Vista Previa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {currentTagParents.map((tagParent) => (
                    <tr key={tagParent.id_tag_parent} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {tagParent.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm max-w-xs">
                        <div className="truncate" title={tagParent.descripcion}>
                          {tagParent.descripcion || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tagParent.tags_count || tagParent.tags?.length || 0} tags
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tagParent.color || 'Sin color'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: tagParent.color || '#3B82F6' }}
                        >
                          {tagParent.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(tagParent)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-yellow-600 hover:bg-yellow-700'
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          } text-white`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(tagParent.id_tag_parent)}
                          disabled={deleteLoading === tagParent.id_tag_parent}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-800'
                              : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
                          } text-white disabled:cursor-not-allowed`}
                        >
                          {deleteLoading === tagParent.id_tag_parent ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentPage === page
                        ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-8 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className="text-gray-500">No hay sectores creados aún</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagParents;