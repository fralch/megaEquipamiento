import React, { useState, useEffect } from "react";
import axios from "axios";

const Subcategorias = ({ onSubmit }) => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_categoria: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Function to fetch categories
  const fetchCategorias = async () => {
    try {
      const response = await axios.get('/categorias-all');
      setCategoriasOptions(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Function to fetch subcategories
  const fetchSubcategorias = async () => {
    try {
      // Changed this endpoint to what should be the correct one for subcategories
      const response = await axios.get('/subcategoria-all');
      setSubcategorias(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(form);
      const response = await axios.post('/subcategoria_post/create', form);
      setForm({
        nombre: "",
        descripcion: "",
        id_categoria: "",
      });
      
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      // Fetch updated list of subcategories after successful creation
      await fetchSubcategorias();
    } catch (error) {
      console.error('Error creating subcategory:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Subcategoría</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">Agregar / Editar Subcategoría</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
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
            <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">
              Categoria Padre
            </label>
            <select
              id="id_categoria"
              name="id_categoria"
              value={form.id_categoria}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 w-full md:w-auto"
        >
          Guardar Subcategoría
        </button>
      </form>

      <div className="bg-white shadow-md rounded-lg p-6 mt-8 w-full mx-auto">
        <h2 className="text-lg font-bold mb-4">Subcategorías Totales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria Padre</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...subcategorias]
                .reverse()
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((subcategoria, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{subcategoria.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subcategoria.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {categoriasOptions.find(cat => cat.id_categoria === subcategoria.id_categoria)?.nombre || ''}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination controls */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
               {Math.min((currentPage - 1) * itemsPerPage + 1, subcategorias.length)} al {' '}
              {Math.min(currentPage * itemsPerPage, subcategorias.length)} de {subcategorias.length} 
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(subcategorias.length / itemsPerPage)))}
                disabled={currentPage >= Math.ceil(subcategorias.length / itemsPerPage)}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subcategorias;