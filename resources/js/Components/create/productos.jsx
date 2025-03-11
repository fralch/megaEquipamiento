import React, { useState, useEffect } from "react";
import Modal_Features from './modal_features';

const URL_API = import.meta.env.VITE_API_URL;

const Productos = ({ onSubmit }) => {
  // Main states
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
    caracteristicas: {},
    datos_tecnicos: {},
    especificaciones_tecnicas: "",
  });

  // UI states
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [contenidoTabla, setContenidoTabla] = useState({
    tipo: null,
    datos: []
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, subcategoriasRes, marcasRes] = await Promise.all([
          fetch(`${URL_API}/categorias-all`),
          fetch(`${URL_API}/subcategoria-all`),
          fetch(`${URL_API}/marca/all`)
        ]);
        
        const categoriasData = await categoriasRes.json();
        const subcategoriasData = await subcategoriasRes.json();
        const marcasData = await marcasRes.json();
        
        setCategorias(categoriasData);
        setSubcategorias(subcategoriasData);
        setMarcas(marcasData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Initialize table component with existing value if present
  useEffect(() => {
    if (!form.especificaciones_tecnicas) return;
    
    try {
      const parsedValue = JSON.parse(form.especificaciones_tecnicas);
      setContenidoTabla({
        tipo: Array.isArray(parsedValue) && parsedValue.length > 0 ? 'tabla' : 'texto',
        datos: Array.isArray(parsedValue) ? parsedValue : [form.especificaciones_tecnicas]
      });
    } catch (e) {
      // If not valid JSON, treat as text
      setContenidoTabla({
        tipo: 'texto',
        datos: [form.especificaciones_tecnicas]
      });
    }
  }, []);

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setForm(prev => ({ ...prev, imagen: e.target.files[0] }));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setForm(prev => ({ ...prev, id_subcategoria: '' }));
  };

  // Table paste handler - detects and formats pasted content
  const handleTablaPaste = (event) => {
    event.preventDefault();
    const textoPegado = event.clipboardData.getData('text');
    processTableContent(textoPegado);
  };
  
  const handleTablaTextChange = (e) => {
    const texto = e.target.value;
    processTableContent(texto);
  };
  
  const processTableContent = (texto) => {
    const tieneTab = texto.includes('\t');
    const tieneMultilineas = texto.trim().split('\n').length > 1;
    const tipo = tieneTab && tieneMultilineas ? 'tabla' : 'texto';
    
    let nuevoContenido;
    if (tipo === 'tabla') {
      const filas = texto.trim().split('\n');
      const datosTabla = filas
        .filter(fila => fila.trim() !== '')
        .map((fila) => fila.split('\t'));
      
      nuevoContenido = { tipo: 'tabla', datos: datosTabla };
      
      setForm(prev => ({ 
        ...prev, 
        especificaciones_tecnicas: JSON.stringify(datosTabla) 
      }));
    } else {
      nuevoContenido = { tipo: 'texto', datos: [texto] };
      
      setForm(prev => ({ 
        ...prev, 
        especificaciones_tecnicas: JSON.stringify(texto) 
      }));
    }
    
    setContenidoTabla(nuevoContenido);
  };

  const limpiarTabla = () => {
    setContenidoTabla({ tipo: null, datos: [] });
    setForm(prev => ({ ...prev, especificaciones_tecnicas: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    // Add all form fields to FormData
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'imagen' && value) {
        formData.append(key, value);
      } else if (key === 'caracteristicas' || key === 'datos_tecnicos') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null) {
        formData.append(key, value);
      }
    });

    try {
      const response = await fetch(`${URL_API}/product/create`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Producto creado:', result);

        // Add new product to list
        setProductos(prev => [
          ...prev, 
          {
            ...form,
            imagen: form.imagen ? URL.createObjectURL(form.imagen) : ''
          }
        ]);

        // Reset form
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
          caracteristicas: {},
          datos_tecnicos: {},
          especificaciones_tecnicas: "",
        });
        
        // Clear table
        setContenidoTabla({ tipo: null, datos: [] });
      } else {
        console.error('Error al crear el producto:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Modal handlers
  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const saveModalData = (value) => {
    try {
      const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      setForm(prev => ({ ...prev, [modalType]: jsonValue }));
    } catch (error) {
      console.error('Error saving modal data:', error);
      setForm(prev => ({ ...prev, [modalType]: {} }));
    }
    closeModal();
  };

  // Helper functions
  const renderTablaPreview = (jsonStr) => {
    if (!jsonStr) return <span className="text-gray-500">Sin datos</span>;
    
    try {
      const tabla = JSON.parse(jsonStr);
      if (Array.isArray(tabla) && tabla.length > 0) {
        return (
          <div className="text-xs">
            <span className="text-blue-500">Tabla: {tabla.length} filas × {tabla[0].length} columnas</span>
          </div>
        );
      } else {
        return <span className="text-gray-500">Texto: {String(tabla).substring(0, 20)}...</span>;
      }
    } catch (error) {
      return <span className="text-gray-500">{String(jsonStr).substring(0, 20)}...</span>;
    }
  };

  // Filter subcategories based on selected category
  const filteredSubcategorias = subcategorias.filter(
    subcategory => subcategory.id_categoria === parseInt(selectedCategory)
  );

  // Styles for table
  const tableStyles = {
    container: {
      border: '1px solid #e5e7eb',
      borderCollapse: 'collapse',
      width: '100%',
      marginTop: '10px'
    },
    cell: {
      border: '1px solid #e5e7eb',
      padding: '8px',
      fontSize: '14px'
    },
    header: {
      border: '1px solid #e5e7eb',
      padding: '8px',
      fontSize: '14px',
      backgroundColor: '#f3f4f6',
      fontWeight: 'bold'
    },
    text: {
      padding: '10px',
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
      backgroundColor: '#f9fafb',
      marginTop: '10px',
      fontSize: '14px'
    }
  };

  // Form field definitions for reuse
  const formFields = [
    { label: "SKU", name: "sku", type: "text", placeholder: "Ingrese el código SKU del producto", required: true },
    { label: "Nombre", name: "nombre", type: "text", placeholder: "Ingrese el nombre del producto", required: true },
    {
      label: "Categoría",
      name: "categoria",
      type: "select",
      options: categorias.map(category => ({
        value: category.id_categoria,
        label: category.nombre
      })),
      placeholder: "Seleccione una categoría"
    },
    {
      label: "Subcategoría",
      name: "id_subcategoria",
      type: "select",
      options: filteredSubcategorias.map(subcategory => ({
        value: subcategory.id_subcategoria,
        label: subcategory.nombre
      })),
      placeholder: "Seleccione una subcategoría",
      required: true
    },
    {
      label: "Marca",
      name: "marca_id",
      type: "select",
      options: marcas.map(marca => ({
        value: marca.id_marca,
        label: marca.nombre
      })),
      placeholder: "Seleccione una marca",
      required: true
    },
    { label: "País", name: "pais", type: "text", placeholder: "Ingrese el país de origen" },
    { label: "Precio sin Ganancia", name: "precio_sin_ganancia", type: "number", step: "0.01", placeholder: "0.00" },
    { label: "Precio Ganancia", name: "precio_ganancia", type: "number", step: "0.01", placeholder: "0.00" },
    { label: "Precio IGV", name: "precio_igv", type: "number", step: "0.01", placeholder: "0.00" },
    { label: "Video", name: "video", type: "text", placeholder: "URL del video del producto" },
    { label: "Envío", name: "envio", type: "text", placeholder: "Información de envío" },
    { label: "Soporte Técnico", name: "soporte_tecnico", type: "text", placeholder: "Información de soporte técnico" },
  ];

  // Render form fields dynamically
  const renderFormField = ({ label, name, type, options, step, placeholder, required }) => (
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
          required={required}
        >
          <option value="">{placeholder}</option>
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
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Producto</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">Agregar / Editar Producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Render all form fields */}
          {formFields.map(renderFormField)}

          {/* Tabla component */}
          <div className="mb-4 col-span-1 md:col-span-2">
            <label htmlFor="especificaciones_tecnicas" className="block text-sm font-medium text-gray-700">
              Especificaciones Técnicas
            </label>
            <div className="mt-1 w-full">
              <div className="mb-2 text-sm text-gray-500">
                Pega una tabla desde Excel, Google Sheets o cualquier fuente tabular. 
                También puedes ingresar texto simple.
              </div>
              <textarea 
                id="especificaciones_tecnicas"
                onPaste={handleTablaPaste}
                onChange={handleTablaTextChange}
                value={contenidoTabla.tipo === 'texto' ? contenidoTabla.datos[0] || '' : ''}
                placeholder="Pega el contenido aquí (tabla o texto)" 
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                style={{ minHeight: '100px' }}
              />
              
              {/* Table preview */}
              {contenidoTabla.tipo === 'tabla' && contenidoTabla.datos.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h3>
                  <table style={tableStyles.container} className="border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        {contenidoTabla.datos[0].map((celda, idx) => (
                          <th key={idx} style={tableStyles.header} className="bg-gray-100">
                            {celda}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contenidoTabla.datos.slice(1).map((fila, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {fila.map((celda, cellIdx) => (
                            <td key={cellIdx} style={tableStyles.cell} className="border border-gray-300">
                              {celda}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    {contenidoTabla.datos.length} filas × {contenidoTabla.datos[0]?.length || 0} columnas
                  </div>
                  
                  <button 
                    type="button"
                    onClick={limpiarTabla}
                    className="mt-2 px-3 py-1 text-xs text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    Limpiar tabla
                  </button>
                </div>
              )}
              
              {/* Text preview */}
              {contenidoTabla.tipo === 'texto' && contenidoTabla.datos.length > 0 && contenidoTabla.datos[0] && (
                <div style={tableStyles.text} className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h3>
                  <div className="whitespace-pre-wrap">
                    {contenidoTabla.datos[0]}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Características and Datos Técnicos buttons */}
          <div className="mb-4">
            <label htmlFor="caracteristicas" className="block text-sm font-medium text-gray-700">
              Características
            </label>
            <button
              type="button"
              onClick={() => openModal('caracteristicas')}
              className="mt-1 block w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.keys(form.caracteristicas).length === 0 ? 'Click para agregar características' : JSON.stringify(form.caracteristicas)}
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="datos_tecnicos" className="block text-sm font-medium text-gray-700">
              Datos Técnicos
            </label>
            <button
              type="button"
              onClick={() => openModal('datos_tecnicos')}
              className="mt-1 block w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.keys(form.datos_tecnicos).length === 0 ? 'Click para agregar datos técnicos' : JSON.stringify(form.datos_tecnicos)}
            </button>
          </div>

          {/* Image upload */}
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

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ingrese una descripción detallada del producto"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 w-full md:w-auto"
        >
          Guardar Producto
        </button>
      </form>

      {/* Products table */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto mt-8">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especificaciones</th>
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
                    {renderTablaPreview(producto.especificaciones_tecnicas)}
                  </td>
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

      {/* Modal */}
      {modalVisible && (
        <Modal_Features
          product={form}
          type={modalType}
          onSave={saveModalData}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Productos;