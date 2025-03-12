import React, { useState, useEffect, useRef } from "react";
import Modal_Features from './assets/modal_features';
import EspecificacionesTecnicas from './assets/especificacionesTecnicas';

const URL_API = import.meta.env.VITE_API_URL;

const Productos = ({ onSubmit }) => {
  const especificacionesRef = useRef();
  const initialForm = {
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
  };
  
  // States
  const [form, setForm] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, subcategoriasRes, marcasRes] = await Promise.all([
          fetch(`${URL_API}/categorias-all`),
          fetch(`${URL_API}/subcategoria-all`),
          fetch(`${URL_API}/marca/all`)
        ]);
        
        const [categoriasData, subcategoriasData, marcasData] = await Promise.all([
          categoriasRes.json(),
          subcategoriasRes.json(),
          marcasRes.json()
        ]);
        
        setCategorias(categoriasData);
        setSubcategorias(subcategoriasData);
        setMarcas(marcasData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save pending text in specifications
    if (especificacionesRef.current) {
      especificacionesRef.current.saveText();
    }

    const formData = new FormData();
    
    // Add form fields to FormData
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'imagen' && value) {
        formData.append(key, value);
      } else if ((key === 'caracteristicas' || key === 'datos_tecnicos') && value) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
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
        alert('¡Producto creado exitosamente!');
        setForm(initialForm);
        setSelectedCategory('');
      } else {
        console.error('Error al crear el producto:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Modal handlers
  const toggleModal = (type = '') => {
    setModalType(type);
    setModalVisible(!!type);
  };

  const saveModalData = (value) => {
    try {
      const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      setForm(prev => ({ ...prev, [modalType]: jsonValue }));
    } catch (error) {
      console.error('Error saving modal data:', error);
      setForm(prev => ({ ...prev, [modalType]: {} }));
    }
    toggleModal();
  };

  // Filter subcategories based on selected category
  const filteredSubcategorias = subcategorias.filter(
    subcategory => subcategory.id_categoria === parseInt(selectedCategory)
  );

  // Styles for table
  const tableStyles = {
    container: { border: '1px solid #e5e7eb', borderCollapse: 'collapse', width: '100%', marginTop: '10px' },
    cell: { border: '1px solid #e5e7eb', padding: '8px', fontSize: '14px' },
    header: { border: '1px solid #e5e7eb', padding: '8px', fontSize: '14px', backgroundColor: '#f3f4f6', fontWeight: 'bold' },
    text: { padding: '10px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb', marginTop: '10px', fontSize: '14px' },
    seccion: { marginBottom: '20px', position: 'relative' }
  };

  // Form field definitions
  const formFields = [
    { label: "SKU", name: "sku", type: "text", placeholder: "Ingrese el código SKU del producto", required: true },
    { label: "Nombre", name: "nombre", type: "text", placeholder: "Ingrese el nombre del producto", required: true },
    {
      label: "Categoría",
      name: "categoria",
      type: "select",
      options: categorias.map(({ id_categoria, nombre }) => ({
        value: id_categoria,
        label: nombre
      })),
      placeholder: "Seleccione una categoría"
    },
    {
      label: "Subcategoría",
      name: "id_subcategoria",
      type: "select",
      options: filteredSubcategorias.map(({ id_subcategoria, nombre }) => ({
        value: id_subcategoria,
        label: nombre
      })),
      placeholder: "Seleccione una subcategoría",
      required: true
    },
    {
      label: "Marca",
      name: "marca_id",
      type: "select",
      options: marcas.map(({ id_marca, nombre }) => ({
        value: id_marca,
        label: nombre
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

  // Render form fields
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
          {options?.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
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
          {/* Render form fields */}
          {formFields.map(renderFormField)}

          <EspecificacionesTecnicas
            ref={especificacionesRef}
            form={form}
            setForm={setForm}
            tableStyles={tableStyles}
          />

          {/* Feature buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Características</label>
            <button
              type="button"
              onClick={() => toggleModal('caracteristicas')}
              className="mt-1 block w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.keys(form.caracteristicas || {}).length === 0 
                ? 'Click para agregar características' 
                : JSON.stringify(form.caracteristicas)}
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Datos Técnicos</label>
            <button
              type="button"
              onClick={() => toggleModal('datos_tecnicos')}
              className="mt-1 block w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.keys(form.datos_tecnicos || {}).length === 0 
                ? 'Click para agregar datos técnicos' 
                : JSON.stringify(form.datos_tecnicos)}
            </button>
          </div>

          {/* Image upload */}
          <div className="mb-4">
            <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">Imagen</label>
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
              {form.imagen && <p className="mt-1 text-sm text-gray-500">{form.imagen.name}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ingrese una descripción detallada del producto"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
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

      {/* Modal */}
      {modalVisible && (
        <Modal_Features
          product={form}
          type={modalType}
          onSave={saveModalData}
          onClose={() => toggleModal()}
        />
      )}
    </div>
  );
};

export default Productos;