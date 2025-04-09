import React, { useState, useEffect } from "react";

const Marcas = ({ onSubmit }) => {
  const [marcas, setMarcas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    imagen: null,
  });

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

      onSubmit(formData);
      alert('Marca created successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMarcas = marcas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(marcas.length / itemsPerPage);

  // Add pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Marca</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">Agregar / Editar Marca</h2>
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

          <div className="mb-4">
            <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
              Imagen
            </label>
            <input
              type="file"
              id="imagen"
              name="imagen"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 w-full md:w-auto"
        >
          Guardar Marca
        </button>
      </form>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
        <h2 className="text-lg font-bold mb-4">Marcas Totales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMarcas.map((marca, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{marca.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{marca.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {marca.imagen && (
                      <img src={marca.imagen} alt={marca.nombre} className="h-10 w-10 object-cover rounded-full"/>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, marcas.length)} of {marcas.length} entries
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; // End of Marcas component

export default Marcas;
