import React, { useState, useEffect, useRef } from "react";
import Modal_Features from './assets/modal_features';
import EspecificacionesTecnicas from './assets/especificacionesTecnicas';

const URL_API = import.meta.env.VITE_API_URL;

// Add this before the Form components
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

// Define priceFields
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

  // Add this ref
  const especificacionesRef = useRef(null);

  // States
  const [activeTab, setActiveTab] = useState('tab1');
  const [form, setForm] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // Add tabs configuration
  const tabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' },
    { id: 'tab4', label: 'Tab 4' },
    { id: 'tab5', label: 'Tab 5' }
  ];

  // Add tab content render function
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tab1':
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tab 1 Content</h2>
            <p>This is the content for Tab 1. You can replace this with any component you need.</p>
          </div>
        );
      case 'tab2':
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tab 2 Content</h2>
            <p>This is the content for Tab 2. You can replace this with any component you need.</p>
          </div>
        );
      case 'tab3':
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tab 3 Content</h2>
            <p>This is the content for Tab 3. You can replace this with any component you need.</p>
          </div>
        );
      case 'tab4':
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tab 4 Content</h2>
            <p>This is the content for Tab 4. You can replace this with any component you need.</p>
          </div>
        );
      case 'tab5':
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tab 5 Content</h2>
            <p>This is the content for Tab 5. You can replace this with any component you need.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Define handleImageChange function
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setForm({
        ...form,
        imagen: file,
      });
    }
  };

  // Define handleChange function
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  // Define handleCategoryChange function
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    // Aquí puedes agregar la lógica para filtrar las subcategorías según la categoría seleccionada
  };

  // Define handleSubmit function
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  // Define toggleModal function
  const toggleModal = (type = '') => {
    setModalType(type);
    setModalVisible(!modalVisible);
  };

  // Define saveModalData function
  const saveModalData = (data) => {
    setForm({
      ...form,
      [modalType]: data,
    });
    toggleModal();
  };

  // Define filteredSubcategorias
  const filteredSubcategorias = subcategorias.filter(
    (subcategoria) => subcategoria.id_categoria === selectedCategory
  );

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

      {/* Add this before the Modal */}
      <div className="mt-8">
        {/* Main content area */}
        <div className="mb-6">
          {renderTabContent()}
        </div>

        {/* Tabs navigation */}
        <div className="flex justify-center border-t border-gray-200 bg-white shadow-md rounded-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors duration-150 ease-in-out flex-1 text-center
                ${activeTab === tab.id
                  ? 'text-blue-600 border-t-2 border-blue-600 -mt-px'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
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
