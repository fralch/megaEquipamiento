import React, { useState } from "react";

const Subcategorias = ({ onSubmit }) => {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_categoria: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCategorias([...categorias, form]);
    setForm({
      nombre: "",
      descripcion: "",
    });
    onSubmit(form);
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

      <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
        <h2 className="text-lg font-bold mb-4">Subcategorías Totales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorias.map((subcategoria, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{subcategoria.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{subcategoria.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subcategorias;
