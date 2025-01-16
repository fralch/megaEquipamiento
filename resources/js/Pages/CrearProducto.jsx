import React, { useState } from "react";

const Sidebar = () => (
  <div className="w-full md:w-1/4 bg-yellow-50 border-r border-yellow-200 p-4">
    <div className="mb-8">
      <img
        src="https://via.placeholder.com/150"
        alt="Logo"
        className="mb-4"
      />
      <h2 className="text-xl font-bold text-yellow-600">Tu Banca Mype</h2>
    </div>
    <div className="space-y-4">
      <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md font-medium">
        Registro PN
      </button>
      <button className="w-full bg-yellow-200 text-yellow-600 py-2 px-4 rounded-md font-medium">
        Registro PJ
      </button>
    </div>
    <div className="mt-8">
      <label className="flex items-center space-x-2">
        <input
          type="radio"
          name="tipo_cliente"
          className="text-yellow-500 focus:ring-yellow-500"
        />
        <span>Cliente Nuevo</span>
      </label>
      <label className="flex items-center space-x-2 mt-4">
        <input
          type="radio"
          name="tipo_cliente"
          className="text-yellow-500 focus:ring-yellow-500"
          defaultChecked
        />
        <span>Ya posee cuenta</span>
      </label>
    </div>
  </div>
);
const TablaProductos = ({ productos }) => (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full md:w-3/4">
      <h2 className="text-lg font-bold mb-4">Productos Totales</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {productos.map((producto, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{producto.sku}</td>
              <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap">{producto.id_subcategoria}</td>
              <td className="px-6 py-4 whitespace-nowrap">{producto.marca_id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{producto.pais}</td>
              <td className="px-6 py-4 whitespace-nowrap">{producto.precio_sin_ganancia}</td>
              <td className="px-6 py-4 whitespace-nowrap">{producto.imagen}</td>
              <td className="px-6 py-4 whitespace-nowrap">{producto.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

const FormularioProducto = () => {
    const [productos, setProductos] = useState([]);
    
  const [form, setForm] = useState({
    sku: "",
    nombre: "",
    id_subcategoria: "",
    marca_id: "",
    pais: "",
    precio_sin_ganancia: "",
    imagen: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", form);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full md:w-3/4">
      <h1>Crear Producto</h1>
      <form onSubmit={handleSubmit} >
      <h2 className="text-lg font-bold mb-4">Agregar / Editar Producto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/** Inputs del formulario */}
        {[
          { label: "SKU", name: "sku", type: "text" },
          { label: "Nombre", name: "nombre", type: "text" },
          { label: "Subcategoría", name: "id_subcategoria", type: "number" },
          { label: "Marca", name: "marca_id", type: "number" },
          { label: "País", name: "pais", type: "text" },
          { label: "Precio sin Ganancia", name: "precio_sin_ganancia", type: "number", step: "0.01" },
          { label: "Imagen (URL)", name: "imagen", type: "text" },
        ].map(({ label, name, type, step }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type={type}
              id={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              step={step}
              required={name !== "pais"}
            />
          </div>
        ))}

        {/** Textarea */}
        <div>
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
        className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
      >
        Guardar Producto
      </button>
    </form>
    <TablaProductos productos={productos} />
    </div>
  );
};

const CrearProducto = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
    <div className="bg-white w-full rounded-lg shadow-md p-8 flex flex-col md:flex-row">
      <Sidebar />
      <FormularioProducto />
    </div>
  </div>
);

export default CrearProducto;
