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
  
  // Updated state for multiple tables and text blocks
  const [contenidoTabla, setContenidoTabla] = useState({
    secciones: [],
    textoActual: ""
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
      
      // Check if the parsed value is already in our multi-section format
      if (parsedValue && Array.isArray(parsedValue.secciones)) {
        setContenidoTabla(parsedValue);
      } else if (Array.isArray(parsedValue) && parsedValue.length > 0) {
        // Handle old format (single table)
        setContenidoTabla({
          secciones: [{ tipo: 'tabla', datos: parsedValue }],
          textoActual: ""
        });
      } else {
        // Handle old format (single text)
        setContenidoTabla({
          secciones: [{ tipo: 'texto', datos: [form.especificaciones_tecnicas] }],
          textoActual: ""
        });
      }
    } catch (e) {
      // If not valid JSON, treat as text
      setContenidoTabla({
        secciones: [{ tipo: 'texto', datos: [form.especificaciones_tecnicas] }],
        textoActual: ""
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
    setContenidoTabla(prev => ({
      ...prev,
      textoActual: e.target.value
    }));
  };
  
  // Process and add content to sections
  const processTableContent = (texto) => {
    const tieneTab = texto.includes('\t');
    const tieneMultilineas = texto.trim().split('\n').length > 1;
    const tipo = tieneTab && tieneMultilineas ? 'tabla' : 'texto';
    
    let nuevaSeccion;
    if (tipo === 'tabla') {
      const filas = texto.trim().split('\n');
      const datosTabla = filas
        .filter(fila => fila.trim() !== '')
        .map((fila) => fila.split('\t'));
      
      nuevaSeccion = { tipo: 'tabla', datos: datosTabla };
    } else {
      nuevaSeccion = { tipo: 'texto', datos: [texto] };
    }
    
    // Add the new section to our content
    const nuevasSecciones = [...contenidoTabla.secciones, nuevaSeccion];
    const nuevoContenido = {
      secciones: nuevasSecciones,
      textoActual: ""
    };
    
    setContenidoTabla(nuevoContenido);
    
    // Update the form with the stringified multi-section content
    setForm(prev => ({ 
      ...prev, 
      especificaciones_tecnicas: JSON.stringify(nuevoContenido) 
    }));
  };

  // Add current text as a new section
  const agregarTextoActual = () => {
    if (!contenidoTabla.textoActual.trim()) return;
    
    const nuevaSeccion = { 
      tipo: 'texto', 
      datos: [contenidoTabla.textoActual.trim()] 
    };
    
    const nuevasSecciones = [...contenidoTabla.secciones, nuevaSeccion];
    const nuevoContenido = {
      secciones: nuevasSecciones,
      textoActual: ""
    };
    
    setContenidoTabla(nuevoContenido);
    
    // Update the form with the stringified multi-section content
    setForm(prev => ({ 
      ...prev, 
      especificaciones_tecnicas: JSON.stringify(nuevoContenido) 
    }));
  };

  const limpiarTabla = () => {
    setContenidoTabla({ secciones: [], textoActual: "" });
    setForm(prev => ({ ...prev, especificaciones_tecnicas: "" }));
  };

  // Remove a specific section by index
  const eliminarSeccion = (index) => {
    const nuevasSecciones = contenidoTabla.secciones.filter((_, i) => i !== index);
    const nuevoContenido = {
      secciones: nuevasSecciones,
      textoActual: contenidoTabla.textoActual
    };
    
    setContenidoTabla(nuevoContenido);
    
    // Update the form with the stringified multi-section content
    setForm(prev => ({ 
      ...prev, 
      especificaciones_tecnicas: JSON.stringify(nuevoContenido) 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make sure any pending text is added before submitting
    if (contenidoTabla.textoActual.trim()) {
      agregarTextoActual();
    }

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
        setContenidoTabla({ secciones: [], textoActual: "" });
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
      const contenido = JSON.parse(jsonStr);
      
      if (contenido.secciones && Array.isArray(contenido.secciones)) {
        // New multi-section format
        return (
          <div className="text-xs">
            <span className="text-blue-500">
              {contenido.secciones.length} secciones: {
                contenido.secciones.filter(s => s.tipo === 'tabla').length
              } tablas, {
                contenido.secciones.filter(s => s.tipo === 'texto').length
              } textos
            </span>
          </div>
        );
      } else if (Array.isArray(contenido) && contenido.length > 0) {
        // Old format (single table)
        return (
          <div className="text-xs">
            <span className="text-blue-500">Tabla: {contenido.length} filas × {contenido[0].length} columnas</span>
          </div>
        );
      } else {
        // Old format (single text)
        return <span className="text-gray-500">Texto: {String(contenido).substring(0, 20)}...</span>;
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
    },
    seccion: {
      marginBottom: '20px',
      position: 'relative'
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
                También puedes ingresar texto simple y combinar múltiples tablas y textos.
              </div>
              
              {/* Display existing sections */}
              {contenidoTabla.secciones.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Contenido actual:</h3>
                  
                  {contenidoTabla.secciones.map((seccion, seccionIndex) => (
                    <div key={seccionIndex} style={tableStyles.seccion} className="mb-6 border-b pb-4 pt-2">
                      {/* Section type label */}
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Sección {seccionIndex + 1}: {seccion.tipo === 'tabla' ? 'Tabla' : 'Texto'}
                        </h4>
                        <button 
                          type="button"
                          onClick={() => eliminarSeccion(seccionIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                      
                      {/* Table content */}
                      {seccion.tipo === 'tabla' && (
                        <table style={tableStyles.container} className="border-collapse border border-gray-300">
                          <thead>
                            <tr>
                              {seccion.datos[0].map((celda, idx) => (
                                <th key={idx} style={tableStyles.header} className="bg-gray-100">
                                  {celda}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {seccion.datos.slice(1).map((fila, rowIdx) => (
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
                      )}
                      
                      {/* Text content */}
                      {seccion.tipo === 'texto' && (
                        <div style={tableStyles.text} className="p-3 bg-gray-50 rounded text-sm">
                          <div className="whitespace-pre-wrap">
                            {seccion.datos[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* New content input */}
              <div className="mb-2">
                <textarea 
                  id="especificaciones_tecnicas_input"
                  onPaste={handleTablaPaste}
                  onChange={handleTablaTextChange}
                  value={contenidoTabla.textoActual}
                  placeholder="Pega el contenido aquí (tabla o texto)" 
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  style={{ minHeight: '100px' }}
                />
                
                <div className="flex justify-between mt-2">
                  <button
                    type="button"
                    onClick={agregarTextoActual}
                    disabled={!contenidoTabla.textoActual.trim()}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Agregar como texto
                  </button>
                  
                  {contenidoTabla.secciones.length > 0 && (
                    <button 
                      type="button"
                      onClick={limpiarTabla}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>
              </div>
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