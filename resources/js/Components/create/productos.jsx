import React, { useState, useEffect } from "react";

const Productos = ({ onSubmit }) => {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    sku: "",
    nombre: "",
    id_subcategoria: "",
    marca_id: "",
    pais: "",
    precio_sin_ganancia: "",
    precio_ganancia: "",
    precio_igv: "",
    imagen: null,
    descripcion: "",
    video: "",
    envio: "",
    soporte_tecnico: "",
    caracteristicas: "{}",
    datos_tecnicos: "{}",
    archivos_adicionales: "{}", // Cambiado de 'documentos' a 'archivos_adicionales'
  });

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]); // Nuevo estado para las marcas
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    // Fetch categorías
    fetch('http://equipamientoindustriales.hpservidor.com/categorias-all')
      .then(response => response.json())
      .then(data => setCategorias(data))
      .catch(error => console.error('Error fetching categorías:', error));

    // Fetch subcategorías
    fetch('http://equipamientoindustriales.hpservidor.com/subcategoria/all')
      .then(response => response.json())
      .then(data => setSubcategorias(data))
      .catch(error => console.error('Error fetching subcategorías:', error));

    // Fetch marcas
    fetch('http://equipamientoindustriales.hpservidor.com/marca/all')
      .then(response => response.json())
      .then(data => setMarcas(data))
      .catch(error => console.error('Error fetching marcas:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, imagen: file });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setForm({ ...form, id_subcategoria: '' }); // Reset subcategoría al cambiar de categoría
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('sku', form.sku);
    formData.append('nombre', form.nombre);
    formData.append('id_subcategoria', form.id_subcategoria);
    formData.append('marca_id', form.marca_id);
    formData.append('pais', form.pais);
    formData.append('precio_sin_ganancia', form.precio_sin_ganancia);
    formData.append('precio_ganancia', form.precio_ganancia);
    formData.append('precio_igv', form.precio_igv);
    formData.append('descripcion', form.descripcion);
    formData.append('video', form.video);
    formData.append('envio', form.envio);
    formData.append('soporte_tecnico', form.soporte_tecnico);
    formData.append('caracteristicas', form.caracteristicas);
    formData.append('datos_tecnicos', form.datos_tecnicos);
    formData.append('archivos_adicionales', form.archivos_adicionales); // Cambiado de 'documentos' a 'archivos_adicionales'
    if (form.imagen) {
      formData.append('imagen', form.imagen);
    }

    try {
      const response = await fetch('http://equipamientoindustriales.hpservidor.com/product/create', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Producto creado:', result);

        setProductos([...productos, {
          ...form,
          imagen: form.imagen ? URL.createObjectURL(form.imagen) : ''
        }]);

        setForm({
          sku: "",
          nombre: "",
          id_subcategoria: "",
          marca_id: "",
          pais: "",
          precio_sin_ganancia: "",
          precio_ganancia: "",
          precio_igv: "",
          imagen: null,
          descripcion: "",
          video: "",
          envio: "",
          soporte_tecnico: "",
          caracteristicas: "{}",
          datos_tecnicos: "{}",
          archivos_adicionales: "{}", // Cambiado de 'documentos' a 'archivos_adicionales'
        });
      } else {
        console.error('Error al crear el producto:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Filtrar subcategorías basadas en la categoría seleccionada
  const filteredSubcategorias = subcategorias.filter(
    subcategory => subcategory.id_categoria === parseInt(selectedCategory)
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Producto</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">Agregar / Editar Producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "SKU", name: "sku", type: "text" },
            { label: "Nombre", name: "nombre", type: "text" },
            {
              label: "Categoría",
              name: "categoria",
              type: "select",
              options: categorias.map(category => ({
                value: category.id_categoria,
                label: category.nombre
              }))
            },
            {
              label: "Subcategoría",
              name: "id_subcategoria",
              type: "select",
              options: filteredSubcategorias.map(subcategory => ({
                value: subcategory.id_subcategoria,
                label: subcategory.nombre
              }))
            },
            {
              label: "Marca",
              name: "marca_id",
              type: "select",
              options: marcas.map(marca => ({
                value: marca.id_marca,
                label: marca.nombre
              }))
            },
            { label: "País", name: "pais", type: "text" },
            { label: "Precio sin Ganancia", name: "precio_sin_ganancia", type: "number", step: "0.01" },
            { label: "Precio Ganancia", name: "precio_ganancia", type: "number", step: "0.01" },
            { label: "Precio IGV", name: "precio_igv", type: "number", step: "0.01" },
            { label: "Video", name: "video", type: "text" },
            { label: "Envío", name: "envio", type: "text" },
            { label: "Soporte Técnico", name: "soporte_tecnico", type: "text" },
            { label: "Características", name: "caracteristicas", type: "text" },
            { label: "Datos Técnicos", name: "datos_tecnicos", type: "text" },
            { label: "Archivos Adicionales", name: "archivos_adicionales", type: "text" }, // Cambiado de 'Documentos' a 'Archivos Adicionales'
          ].map(({ label, name, type, options, step }) => (
            <div key={name} className="mb-4">
              <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              {type === "select" ? (
                <select
                  id={name}
                  name={name}
                  value={name === "categoria" ? selectedCategory : form[name]}
                  onChange={name === "categoria" ? handleCategoryChange : handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required={name === "id_subcategoria" || name === "marca_id"}
                >
                  <option value="">--Selecciona una opción--</option>
                  {options && options.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  step={step}
                  required={name === "sku" || name === "nombre" || name === "id_subcategoria" || name === "marca_id"}
                />
              )}
            </div>
          ))}

          <div className="mb-4">
            <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
              Imagen
            </label>
            <div className="mt-1 block w-full">
              <input
                type="file"
                id="imagen"
                name="imagen"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="imagen"
                className="block w-full border border-gray-300 rounded-md shadow-sm hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 cursor-pointer bg-white text-indigo-600 py-2 px-4 text-sm font-medium text-center transition duration-150 ease-in-out"
              >
                Seleccionar archivo
              </label>
            </div>
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
          Guardar Producto
        </button>
      </form>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
        <h2 className="text-lg font-bold mb-4">Productos Totales</h2>
        <div className="overflow-x-auto">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {producto.imagen && (
                      <img src={producto.imagen} alt="Producto" className="h-10 w-10 object-cover rounded-full" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{producto.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Productos;
