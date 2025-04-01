import React, { useState, useEffect, useRef } from "react";
import Modal_Features from './assets/modal_features';
import EspecificacionesTecnicas from './assets/especificacionesTecnicas';

const URL_API = import.meta.env.VITE_API_URL;

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

const priceFields = [
  {
    label: "Precio sin Ganancia",
    name: "precio_sin_ganancia",
    type: "number",
    step: "0.01",
    placeholder: "Ingrese el precio sin ganancia",
  },
  {
    label: "Precio con Ganancia",
    name: "precio_ganancia",
    type: "number",
    step: "0.01",
    placeholder: "Ingrese el precio con ganancia",
  },
  {
    label: "Precio con IGV",
    name: "precio_igv",
    type: "number",
    step: "0.01",
    placeholder: "Ingrese el precio con IGV",
  },
];

const tableStyles = {
  container: { border: '1px solid #e5e7eb', borderCollapse: 'collapse', width: '100%', marginTop: '10px' },
  cell: { border: '1px solid #e5e7eb', padding: '8px', fontSize: '14px' },
  header: { border: '1px solid #e5e7eb', padding: '8px', fontSize: '14px', backgroundColor: '#f3f4f6', fontWeight: 'bold' },
  text: { padding: '10px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb', marginTop: '10px', fontSize: '14px' },
  seccion: { marginBottom: '20px', position: 'relative' }
};

const tabs = [
  { id: 'tab1', label: 'Descripción' },
  { id: 'tab2', label: 'Características' },
  { id: 'tab3', label: 'Datos Técnicos' },
  { id: 'tab4', label: 'Especificaciones Técnicas' },
  { id: 'tab5', label: 'Documentos/Descargas' },
  { id: 'tab6', label: 'Contenido de Envío' },
  { id: 'tab7', label: 'Soporte Técnico' },
  { id: 'tab8', label: 'Categorías' }
];

const FormInput = ({ label, id, name, value, onChange, type = "text", placeholder, required = false, step, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
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
    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
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
    <label htmlFor="id_subcategoria" className="block text-sm font-medium text-gray-700">Subcategoría</label>
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
    <label htmlFor="marca_id" className="block text-sm font-medium text-gray-700">Marca</label>
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
    <label htmlFor="video" className="block text-sm font-medium text-gray-700">Video del Producto</label>
    <div className="mt-1">
      <input
        type="text"
        id="video"
        name="video"
        value={value}
        onChange={onChange}
        placeholder="URL del video de YouTube"
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

const FeaturesButton = ({ label, value, onClick, onRemoveItem }) => (
  <div className="mb-4 w-full">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <button
      type="button"
      onClick={onClick}
      className="mt-1 block w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
    >
      {Object.keys(value || {}).length === 0 ? (
        `Click para agregar ${label.toLowerCase()}`
      ) : (
        <div className="max-h-60 overflow-y-auto">
          <ul className="list-disc pl-5">
            {Object.entries(value).map(([key, val]) => (
              <li key={key} className="mb-1 group flex items-center justify-between">
                <div>
                  <span className="font-medium">{key}:</span> {val}
                </div>
                {onRemoveItem && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(key);
                    }}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
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
        <div className="text-gray-400 text-center">Vista previa de imagen</div>
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

const Productos = ({ onSubmit }) => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [form, setForm] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const especificacionesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes, marRes] = await Promise.all([
          fetch(`${URL_API}/categorias-all`),
          fetch(`${URL_API}/subcategoria-all`),
          fetch(`${URL_API}/marca/all`)
        ]);
        
        const [categoriasData, subcategoriasData, marcasData] = await Promise.all([
          catRes.json(),
          subRes.json(),
          marRes.json()
        ]);
        
        setCategorias(categoriasData);
        setSubcategorias(subcategoriasData);
        setMarcas(marcasData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setForm(prev => ({ ...prev, imagen: file }));
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setForm(prev => ({ ...prev, id_subcategoria: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Save pending text in specifications if needed
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
        setPreviewImage(null);
      } else {
        console.error('Error al crear el producto:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const toggleModal = (type = '') => {
    setModalType(type);
    setModalVisible(!!type);
  };

  const saveModalData = (data) => {
    try {
      const jsonValue = typeof data === 'string' ? JSON.parse(data) : data;
      setForm(prev => ({ 
        ...prev, 
        [modalType]: { 
          ...prev[modalType], // Mantiene los datos existentes
          ...jsonValue         // Agrega los nuevos datos
        } 
      }));
    } catch (error) {
      console.error('Error saving modal data:', error);
      setForm(prev => ({ ...prev, [modalType]: {} }));
    }
    toggleModal();
  };

  const filteredSubcategorias = subcategorias.filter(
    sub => sub.id_categoria === parseInt(selectedCategory)
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tab1': // Descripción
        return (
          <div className="space-y-4">
            <FormTextarea
              label="Descripción"
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción detallada del producto"
            />
          </div>
        );

      case 'tab2': // Características
        return (
          <FeaturesButton
          label="Características"
          value={form.caracteristicas}
          onClick={() => toggleModal('caracteristicas')}
          onRemoveItem={(key) => handleRemoveFeatureItem('caracteristicas', key)}
        />
        );

      case 'tab3': // Datos Técnicos
        return (
          <FeaturesButton
            label="Datos Técnicos"
            value={form.datos_tecnicos}
            onClick={() => toggleModal('datos_tecnicos')}
          />
        );

      case 'tab4': // Especificaciones Técnicas
        return (
          <EspecificacionesTecnicas
            ref={especificacionesRef}
            form={form}
            setForm={setForm}
            tableStyles={tableStyles}
          />
        );

      case 'tab6': // Contenido de Envío
        return (
          <FormInput
            label="Envío"
            id="envio"
            name="envio"
            value={form.envio}
            onChange={handleChange}
            placeholder="Información de envío"
          />
        );

      case 'tab7': // Soporte Técnico
        return (
          <FormInput
            label="Soporte Técnico"
            id="soporte_tecnico"
            name="soporte_tecnico"
            value={form.soporte_tecnico}
            onChange={handleChange}
            placeholder="Información de soporte"
          />
        );

      case 'tab8': // Otros
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="País de origen"
            />
          </div>
        );

      default:
        return <div className="p-4">Seleccione una pestaña para ver el contenido</div>;
    }
  };

  const handleRemoveFeatureItem = (key) => {
    setForm(prev => {
      const newFeatures = { ...prev[modalType] };
      delete newFeatures[key];
      return { ...prev, [modalType]: newFeatures };
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-center lg:text-left">Crear Producto</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row bg-white shadow-md rounded-lg p-6 mb-8 w-full">
          <ImageUpload
            previewImage={previewImage}
            handleImageChange={handleImageChange}
            imageName={form.imagen?.name}
          />

          <div className="w-full lg:w-1/2 lg:pl-6">
            <FormInput
              label="Nombre"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ingrese el nombre del producto"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="SKU"
                id="sku"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="Ingrese el código SKU"
                required
              />

              {priceFields.map(field => (
                <FormInput
                  key={field.name}
                  {...field}
                  value={form[field.name]}
                  onChange={handleChange}
                />
              ))}

              <VideoInput value={form.video} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-150 ease-in-out whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            Guardar Producto
          </button>
        </div>
      </form>

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