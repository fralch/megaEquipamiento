import React, { useState, useEffect, useRef } from "react";
import Modal_Features from './assets/modal_features';
import EspecificacionesTecnicas from './assets/especificacionesTecnicas';

const URL_API = import.meta.env.VITE_API_URL;

// Form components
const FormInput = ({ label, id, name, value, onChange, type = "text", placeholder, required = false, step, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      required={required}
      step={step}
    />
  </div>
);

const FormTextarea = ({ label, id, name, value, onChange, placeholder, rows = 4 }) => (
  <div className="mb-4 col-span-2">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      rows={rows}
    />
  </div>
);

const CategorySelect = ({ categorias, selectedCategory, handleCategoryChange }) => (
  <div className="mb-4">
    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
      Categoría
    </label>
    <select
      id="categoria"
      name="categoria"
      value={selectedCategory}
      onChange={handleCategoryChange}
      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    >
      <option value="">Seleccione una categoría</option>
      {categorias.map(({ id_categoria, nombre }) => (
        <option key={id_categoria} value={id_categoria}>{nombre}</option>
      ))}
    </select>
  </div>
);

const SubcategorySelect = ({ filteredSubcategorias, value, onChange }) => (
  <div className="mb-4">
    <label htmlFor="id_subcategoria" className="block text-sm font-medium text-gray-700">
      Subcategoría
    </label>
    <select
      id="id_subcategoria"
      name="id_subcategoria"
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      required
    >
      <option value="">Seleccione una subcategoría</option>
      {filteredSubcategorias.map(({ id_subcategoria, nombre }) => (
        <option key={id_subcategoria} value={id_subcategoria}>{nombre}</option>
      ))}
    </select>
  </div>
);

const BrandSelect = ({ marcas, value, onChange }) => (
  <div className="mb-4">
    <label htmlFor="marca_id" className="block text-sm font-medium text-gray-700">
      Marca
    </label>
    <select
      id="marca_id"
      name="marca_id"
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      required
    >
      <option value="">Seleccione una marca</option>
      {marcas.map(({ id_marca, nombre }) => (
        <option key={id_marca} value={id_marca}>{nombre}</option>
      ))}
    </select>
  </div>
);

const VideoInput = ({ value, onChange }) => (
  <div className="mb-4 col-span-2">
    <label htmlFor="video" className="block text-sm font-medium text-gray-700">
      Video del Producto
    </label>
    <div className="mt-1">
      <input
        type="text"
        id="video"
        name="video"
        value={value}
        onChange={onChange}
        placeholder="URL del video de YouTube (ej: https://youtu.be/-r687V8yqKY?si=z52uM8cBOsxBmue3)"
        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    {value && (
      <div className="mt-2 aspect-video w-full">
        <iframe
          className="w-full h-96 rounded-md shadow-lg"
          src={value.replace("youtu.be", "www.youtube.com/embed")}
          title="Vista previa del video"
          allowFullScreen
        />
      </div>
    )}
  </div>
);

const FeaturesButton = ({ label, value, onClick }) => (
  <div className="mb-4 w-full">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <button
      type="button"
      onClick={onClick}
      className="mt-1 block w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
    >
      {Object.keys(value || {}).length === 0 
        ? `Click para agregar ${label.toLowerCase()}` 
        : JSON.stringify(value)}
    </button>
  </div>
);

const ImageUpload = ({ previewImage, handleImageChange, imageName }) => (
  <div className="w-full lg:w-1/2 lg:pr-6 mb-6 lg:mb-0">
    <div className="border border-gray-300 rounded-lg p-4 mb-4 flex items-center justify-center h-[300px] md:h-[400px]">
      {previewImage ? (
        <img 
          src={previewImage} 
          alt="Product Preview" 
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <div className="text-gray-400 text-center">
          Vista previa de imagen
        </div>
      )}
    </div>

    <div>
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
      {imageName && <p className="mt-1 text-sm text-gray-500 text-center">{imageName}</p>}
    </div>
  </div>
);

// Main Component
const Productos = ({ onSubmit }) => {
  // Constants
  const tableStyles = {
    container: { border: '1px solid #e5e7eb', borderCollapse: 'collapse', width: '100%', marginTop: '10px' },
    cell: { border: '1px solid #e5e7eb', padding: '8px', fontSize: '14px' },
    header: { border: '1px solid #e5e7eb', padding: '8px', fontSize: '14px', backgroundColor: '#f3f4f6', fontWeight: 'bold' },
    text: { padding: '10px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb', marginTop: '10px', fontSize: '14px' },
    seccion: { marginBottom: '20px', position: 'relative' }
  };
  
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
  
  // Refs
  const especificacionesRef = useRef();
  
  // States
  const [form, setForm] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  
  // Fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Data fetching function
  const fetchInitialData = async () => {
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

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm(prev => ({ ...prev, imagen: file }));
    
    // Create image preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

    // Create form data for submission
    const formData = createFormData();

    try {
      await submitProductData(formData);
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  // Helper functions
  const createFormData = () => {
    const formData = new FormData();
    
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'imagen' && value) {
        formData.append(key, value);
      } else if ((key === 'caracteristicas' || key === 'datos_tecnicos') && value) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    return formData;
  };

  const submitProductData = async (formData) => {
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
      resetForm();
    } else {
      console.error('Error al crear el producto:', response.statusText);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedCategory('');
    setPreviewImage(null);
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

  // Form field definitions
  const priceFields = [
    { label: "Precio sin Ganancia", name: "precio_sin_ganancia", type: "number", step: "0.01", placeholder: "0.00", className: "" },
    { label: "Precio Ganancia", name: "precio_ganancia", type: "number", step: "0.01", placeholder: "0.00", className: "" },
    { label: "Precio IGV", name: "precio_igv", type: "number", step: "0.01", placeholder: "0.00", className: "" },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-center lg:text-left">Crear Producto</h1>
      <div className="flex flex-col lg:flex-row bg-white shadow-md rounded-lg p-6 mb-8 w-full">
        {/* Left side: Product Image */}
        <ImageUpload 
          previewImage={previewImage} 
          handleImageChange={handleImageChange} 
          imageName={form.imagen?.name} 
        />

        {/* Right side: Product Details Form */}
        <div className="w-full lg:w-1/2 lg:pl-6">
          <form onSubmit={handleSubmit}>
            {/* Product Name - full width */}
            <FormInput
              label="Nombre"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ingrese el nombre del producto"
              required={true}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU */}
              <FormInput
                label="SKU"
                id="sku"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="Ingrese el código SKU del producto"
                required={true}
              />
              
              {/* Price Fields */}
              {priceFields.map((field) => (
                <FormInput
                  key={field.name}
                  label={field.label}
                  id={field.name}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  type={field.type}
                  step={field.step}
                  placeholder={field.placeholder}
                  className={field.className}
                />
              ))}
              
              {/* Shipping and Technical Support */}
              <FormInput
                label="Envío"
                id="envio"
                name="envio"
                value={form.envio}
                onChange={handleChange}
                placeholder="Información de envío"
              />
              
              <FormInput
                label="Soporte Técnico"
                id="soporte_tecnico"
                name="soporte_tecnico"
                value={form.soporte_tecnico}
                onChange={handleChange}
                placeholder="Información de soporte técnico"
              />

              {/* Categories section */}
              <div className="mb-4 col-span-2">
                <CategorySelect 
                  categorias={categorias} 
                  selectedCategory={selectedCategory} 
                  handleCategoryChange={handleCategoryChange} 
                />
                
                <SubcategorySelect 
                  filteredSubcategorias={filteredSubcategorias} 
                  value={form.id_subcategoria} 
                  onChange={handleChange} 
                />
                
                <BrandSelect 
                  marcas={marcas} 
                  value={form.marca_id} 
                  onChange={handleChange} 
                />
                
                <FormInput
                  label="País"
                  id="pais"
                  name="pais"
                  value={form.pais}
                  onChange={handleChange}
                  placeholder="Ingrese el país de origen"
                />
              </div>

              {/* Video Input */}
              <VideoInput 
                value={form.video} 
                onChange={handleChange} 
              />

              {/* Technical Specifications */}
              <EspecificacionesTecnicas
                ref={especificacionesRef}
                form={form}
                setForm={setForm}
                tableStyles={tableStyles}
              />

              {/* Feature buttons */}
              <FeaturesButton 
                label="Características" 
                value={form.caracteristicas} 
                onClick={() => toggleModal('caracteristicas')} 
              />
              
              <FeaturesButton 
                label="Datos Técnicos" 
                value={form.datos_tecnicos} 
                onClick={() => toggleModal('datos_tecnicos')} 
              />

              {/* Description */}
              <FormTextarea
                label="Descripción"
                id="descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Ingrese una descripción detallada del producto"
              />
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 w-full"
            >
              Guardar Producto
            </button>
          </form>
        </div>
      </div>

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