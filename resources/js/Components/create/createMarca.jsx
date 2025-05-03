import React, { useState, useEffect } from "react";
// Importa axios si aún no lo has hecho
import axios from 'axios';

const Marcas = ({ onSubmit }) => {
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
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
      {/* Image Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
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

      <h1 className="text-2xl font-bold mb-4">Crear Marca</h1>
      {/* Mostrar mensajes de éxito/error */}
      {message.text && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
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
              {currentMarcas.length > 0 ? currentMarcas.map((marca) => ( // Añadido chequeo por si está vacío
                <tr key={marca.id_marca}> {/* Usar id_marca como key */}
                  <td className="px-6 py-4 whitespace-nowrap">{marca.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{marca.descripcion}</td> {/* Truncar descripción larga */}
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
                      <span className="text-gray-400 text-sm">Sin imagen</span> // Mensaje si no hay imagen
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     {/* Botón Eliminar */}
                    <button
                      onClick={() => handleDeleteMarca(marca.id_marca, marca.nombre)}
                      disabled={deleteLoading === marca.id_marca} // Deshabilita mientras se elimina esta marca
                      className={`text-red-600 hover:text-red-900 ${deleteLoading === marca.id_marca ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {deleteLoading === marca.id_marca ? 'Eliminando...' : 'Eliminar'}
                    </button>
                    {/* Aquí podrías añadir un botón de Editar en el futuro */}
                    {/* <button className="text-indigo-600 hover:text-indigo-900 ml-4">Editar</button> */}
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No hay marcas para mostrar.</td>
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
                        className={`mx-1 px-3 py-1 border rounded ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
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
