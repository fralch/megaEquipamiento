import React, { useState, useEffect } from "react";
import Modal_Features from './modal_features';

const URL_API = import.meta.env.VITE_API_URL;

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
    caracteristicas: {},
    datos_tecnicos: {},
    especificaciones_tecnicas: "", // Esto ahora será un JSON string de la tabla
  });

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Estado para la funcionalidad de TablaPegada
  const [contenidoTabla, setContenidoTabla] = useState({
    tipo: null, // 'tabla' o 'texto'
    datos: []
  });

  useEffect(() => {
    fetch(URL_API + "/categorias-all")
      .then(response => response.json())
      .then(data => setCategorias(data))
      .catch(error => console.error('Error fetching categorías:', error));

    fetch(URL_API + "/subcategoria-all")
      .then(response => response.json())
      .then(data => setSubcategorias(data))
      .catch(error => console.error('Error fetching subcategorías:', error));

    fetch(URL_API + "/marca/all")
      .then(response => response.json())
      .then(data => setMarcas(data))
      .catch(error => console.error('Error fetching marcas:', error));
  }, []);

  // Inicializar el componente TablaPegada con valor existente si lo hay
  useEffect(() => {
    if (form.especificaciones_tecnicas) {
      try {
        const parsedValue = JSON.parse(form.especificaciones_tecnicas);
        if (Array.isArray(parsedValue) && parsedValue.length > 0) {
          setContenidoTabla({
            tipo: 'tabla',
            datos: parsedValue
          });
        } else {
          setContenidoTabla({
            tipo: 'texto',
            datos: [form.especificaciones_tecnicas]
          });
        }
      } catch (e) {
        // Si no es JSON válido, tratarlo como texto
        setContenidoTabla({
          tipo: 'texto',
          datos: [form.especificaciones_tecnicas]
        });
      }
    }
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
    setForm({ ...form, id_subcategoria: '' });
  };

  // Función para detectar el tipo de contenido pegado
  const detectarTipoContenido = (texto) => {
    // Verifica si hay tabulaciones y múltiples líneas
    const tieneTab = texto.includes('\t');
    const tieneMultilineas = texto.trim().split('\n').length > 1;
    
    return tieneTab && tieneMultilineas ? 'tabla' : 'texto';
  };

  // Función para manejar el evento de pegar en la tabla
  const handleTablaPaste = (event) => {
    event.preventDefault();
    const textoPegado = event.clipboardData.getData('text');
    const tipo = detectarTipoContenido(textoPegado);
    
    let nuevoContenido;
    if (tipo === 'tabla') {
      const filas = textoPegado.trim().split('\n');
      const datosTabla = filas
        .filter(fila => fila.trim() !== '')
        .map((fila) => fila.split('\t'));
      
      nuevoContenido = {
        tipo: 'tabla',
        datos: datosTabla
      };
    } else {
      nuevoContenido = {
        tipo: 'texto',
        datos: [textoPegado]
      };
    }
    
    setContenidoTabla(nuevoContenido);
    
    // Actualizar el formulario con los datos en formato JSON
    const jsonData = nuevoContenido.tipo === 'tabla' 
      ? JSON.stringify(nuevoContenido.datos)
      : JSON.stringify(nuevoContenido.datos[0]);
    
    setForm({ ...form, especificaciones_tecnicas: jsonData });
  };

  // Función para manejar cambios en el textarea
  const handleTablaTextChange = (e) => {
    const texto = e.target.value;
    const tipo = detectarTipoContenido(texto);
    
    let nuevoContenido;
    if (tipo === 'tabla') {
      const filas = texto.trim().split('\n');
      const datosTabla = filas
        .filter(fila => fila.trim() !== '')
        .map((fila) => fila.split('\t'));
      
      nuevoContenido = {
        tipo: 'tabla',
        datos: datosTabla
      };
    } else {
      nuevoContenido = {
        tipo: 'texto',
        datos: [texto]
      };
    }
    
    setContenidoTabla(nuevoContenido);
    
    // Actualizar el formulario con los datos en formato JSON
    const jsonData = nuevoContenido.tipo === 'tabla' 
      ? JSON.stringify(nuevoContenido.datos)
      : JSON.stringify(texto);
    
    setForm({ ...form, especificaciones_tecnicas: jsonData });
  };

  // Función para limpiar la tabla
  const limpiarTabla = () => {
    setContenidoTabla({ tipo: null, datos: [] });
    setForm({ ...form, especificaciones_tecnicas: "" });
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
    formData.append('caracteristicas', JSON.stringify(form.caracteristicas));
    formData.append('datos_tecnicos', JSON.stringify(form.datos_tecnicos));
    formData.append('especificaciones_tecnicas', form.especificaciones_tecnicas);
    if (form.imagen) {
      formData.append('imagen', form.imagen);
    }

    try {
      const response = await fetch(URL_API + "/product/create", {
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
          caracteristicas: {},
          datos_tecnicos: {},
          especificaciones_tecnicas: "",
        });
        
        // Limpiar la tabla después de enviar
        setContenidoTabla({ tipo: null, datos: [] });
      } else {
        console.error('Error al crear el producto:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const filteredSubcategorias = subcategorias.filter(
    subcategory => subcategory.id_categoria === parseInt(selectedCategory)
  );

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const saveModalData = (value) => {
    try {
      // Ensure the value is properly parsed if it's a string
      const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      setForm({ ...form, [modalType]: jsonValue });
    } catch (error) {
      console.error('Error saving modal data:', error);
      // Set a default empty object if there's an error
      setForm({ ...form, [modalType]: {} });
    }
    closeModal();
  };

  // Función para renderizar el valor de la tabla en la lista de productos
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
        // Es un texto
        return <span className="text-gray-500">Texto: {String(tabla).substring(0, 20)}...</span>;
      }
    } catch (error) {
      return <span className="text-gray-500">{String(jsonStr).substring(0, 20)}...</span>;
    }
  };

  // Estilos para la tabla de TablaPegada
  const estiloTabla = {
    border: '1px solid #e5e7eb',
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '10px'
  };
  
  const estiloCelda = {
    border: '1px solid #e5e7eb',
    padding: '8px',
    fontSize: '14px'
  };
  
  const estiloEncabezado = {
    ...estiloCelda,
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold'
  };

  const estiloTexto = {
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    backgroundColor: '#f9fafb',
    marginTop: '10px',
    fontSize: '14px'
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Producto</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">Agregar / Editar Producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "SKU", name: "sku", type: "text", placeholder: "Ingrese el código SKU del producto" },
            { label: "Nombre", name: "nombre", type: "text", placeholder: "Ingrese el nombre del producto" },
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
              placeholder: "Seleccione una subcategoría"
            },
            {
              label: "Marca",
              name: "marca_id",
              type: "select",
              options: marcas.map(marca => ({
                value: marca.id_marca,
                label: marca.nombre
              })),
              placeholder: "Seleccione una marca"
            },
            { label: "País", name: "pais", type: "text", placeholder: "Ingrese el país de origen" },
            { label: "Precio sin Ganancia", name: "precio_sin_ganancia", type: "number", step: "0.01", placeholder: "0.00" },
            { label: "Precio Ganancia", name: "precio_ganancia", type: "number", step: "0.01", placeholder: "0.00" },
            { label: "Precio IGV", name: "precio_igv", type: "number", step: "0.01", placeholder: "0.00" },
            { label: "Video", name: "video", type: "text", placeholder: "URL del video del producto" },
            { label: "Envío", name: "envio", type: "text", placeholder: "Información de envío" },
            { label: "Soporte Técnico", name: "soporte_tecnico", type: "text", placeholder: "Información de soporte técnico" },
          ].map(({ label, name, type, options, step, placeholder }) => (
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
                  required={name === "sku" || name === "nombre" || name === "id_subcategoria" || name === "marca_id"}
                />
              )}
            </div>
          ))}

          {/* Componente TablaPegada integrado directamente */}
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
              
              {contenidoTabla.tipo === 'tabla' && contenidoTabla.datos.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h3>
                  <table style={estiloTabla} className="border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        {contenidoTabla.datos[0].map((celda, indexCelda) => (
                          <th key={indexCelda} style={estiloEncabezado} className="bg-gray-100">
                            {celda}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contenidoTabla.datos.slice(1).map((fila, indexFila) => (
                        <tr key={indexFila} className={indexFila % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {fila.map((celda, indexCelda) => (
                            <td key={indexCelda} style={estiloCelda} className="border border-gray-300">
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
              
              {contenidoTabla.tipo === 'texto' && contenidoTabla.datos.length > 0 && contenidoTabla.datos[0] && (
                <div style={estiloTexto} className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h3>
                  <div className="whitespace-pre-wrap">
                    {contenidoTabla.datos[0]}
                  </div>
                </div>
              )}
            </div>
          </div>

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
              placeholder="Ingrese una descripción detallada del producto"
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