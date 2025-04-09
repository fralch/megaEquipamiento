import React, { useState } from "react";

const Marcas = ({ onSubmit }) => {
  const [marcas, setMarcas] = useState([]);
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
      
      setMarcas([...marcas, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        imagen: form.imagen ? URL.createObjectURL(form.imagen) : ''
      }]);

      setForm({
        nombre: "",
        descripcion: "",
        imagen: null,
      });

      // Move the onSubmit call here where formData is defined
      onSubmit(formData);

      alert('Marca created successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Remove this line as it's now moved inside handleSubmit
  // onSubmit(formData);
  

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
              {marcas.map((marca, index) => (
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
        </div>
      </div>
    </div>
  );
}; // End of Marcas component

export default Marcas;
