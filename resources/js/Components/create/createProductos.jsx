import React, { useState, useEffect, useRef } from "react";
import { useTheme } from '../../storage/ThemeContext';
import Modal_Features from './assets/modal_features';
import EspecificacionesTecnicas from './assets/especificacionesTecnicas';
import { countryOptions } from '../countrys';

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
  especificaciones_tecnicas: "",
  archivos_adicionales: "",
};

const priceFields = [
  {
    label: "Precio Base (C)",
    name: "precio_sin_ganancia",
    type: "number",
    step: "0.01",
    placeholder: "Ingrese el costo base del producto",
  },
  {
    label: "Porcentaje de Ganancia (R%)",
    name: "porcentaje_ganancia",
    type: "number",
    step: "0.01",
    placeholder: "Ingrese el porcentaje de ganancia %",
  },
  {
    label: "Precio Final con IGV (P)",
    name: "precio_igv",
    type: "number",
    step: "0.01",
    placeholder: "Precio calculado automáticamente",
    readOnly: true,
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
  { id: 'tab4', label: 'Especificaciones Técnicas' },
  { id: 'tab5', label: 'Documentos/Descargas' },
  { id: 'tab6', label: 'Contenido de Envío' },
  { id: 'tab7', label: 'Soporte Técnico' },
  { id: 'tab8', label: 'Categorías' }
];

const FormInput = ({ label, id, name, value, onChange, type = "text", placeholder, required = false, step, className = "", readOnly = false }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className={`block text-sm font-medium transition-colors duration-300 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>{label}</label>
      {name === 'envio' || name === 'soporte_tecnico' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
          required={required}
          rows={4}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-300 ${
            readOnly 
              ? isDarkMode 
                ? 'bg-gray-600 border-gray-500 text-gray-300 placeholder-gray-400' 
                : 'bg-gray-100 border-gray-300 text-gray-600 placeholder-gray-500'
              : isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
          required={required}
          step={step}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

const FormTextarea = ({ label, id, name, value, onChange, placeholder, rows = 4 }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="mb-4 col-span-2">
      <label htmlFor={id} className={`block text-sm font-medium transition-colors duration-300 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
        }`}
        rows={rows}
      />
    </div>
  );
};

const CategorySelect = ({ categorias, selectedCategory, handleCategoryChange }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="mb-4">
      <label htmlFor="categoria" className={`block text-sm font-medium transition-colors duration-300 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>Categoría</label>
      <select
        id="categoria"
        name="categoria"
        value={selectedCategory}
        onChange={handleCategoryChange}
        className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400' 
            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
        }`}
      >
        <option value="">Seleccione una categoría</option>
        {categorias.map(({ id_categoria, nombre }) => (
          <option key={id_categoria} value={id_categoria}>{nombre}</option>
        ))}
      </select>
    </div>
  );
};

const SubcategorySelect = ({ filteredSubcategorias, value, onChange }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="mb-4">
      <label htmlFor="id_subcategoria" className={`block text-sm font-medium transition-colors duration-300 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>Subcategoría</label>
      <select
        id="id_subcategoria"
        name="id_subcategoria"
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400' 
            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
        }`}
        required
      >
        <option value="">Seleccione una subcategoría</option>
        {filteredSubcategorias.map(({ id_subcategoria, nombre }) => (
          <option key={id_subcategoria} value={id_subcategoria}>{nombre}</option>
        ))}
      </select>
    </div>
  );
};

const BrandSelect = ({ marcas, value, onChange }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="mb-4">
      <label htmlFor="marca_id" className={`block text-sm font-medium transition-colors duration-300 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>Marca</label>
      <select
        id="marca_id"
        name="marca_id"
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400' 
            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
        }`}
        required
      >
        <option value="">Seleccione una marca</option>
        {marcas.map(({ id_marca, nombre }) => (
          <option key={id_marca} value={id_marca}>{nombre}</option>
        ))}
      </select>
    </div>
  );
};

const VideoInput = ({ value, onChange }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="mb-4 col-span-2">
      <label htmlFor="video" className={`block text-sm font-medium transition-colors duration-300 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>Video del Producto</label>
      <div className="mt-1">
        <input
          type="text"
          id="video"
          name="video"
          value={value}
          onChange={onChange}
          placeholder="URL del video de YouTube"
          className={`block w-full rounded-md shadow-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
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
};

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

const ImageUpload = ({ previewImage, previewImages, handleImageChange, imageName, selectedImages, removeImage }) => (
  <div className="w-full lg:w-1/2 lg:pr-6 mb-6 lg:mb-0">
    <div className="border border-gray-300 rounded-lg p-4 mb-4 h-[300px] md:h-[400px] overflow-y-auto">
      {previewImages && previewImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {previewImages.map((preview, index) => (
            <div key={index} className="border rounded-lg p-2 relative">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
                title="Eliminar imagen"
              >
                ×
              </button>
              <img
                src={preview}
                alt={`Product Preview ${index + 1}`}
                className="w-full h-24 object-contain"
              />
              <p className="text-xs text-gray-500 text-center mt-1">
                {selectedImages && selectedImages[index] ? selectedImages[index].name : `Imagen ${index + 1}`}
              </p>
            </div>
          ))}
        </div>
      ) : previewImage ? (
        <div className="flex items-center justify-center h-full relative">
          {removeImage && (
            <button
              type="button"
              onClick={() => removeImage(0)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors z-10"
              title="Eliminar imagen"
            >
              ×
            </button>
          )}
          <img
            src={previewImage}
            alt="Product Preview"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 text-center">
          Vista previa de imágenes
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
        multiple
        className="hidden"
      />
      <label
        htmlFor="imagen"
        className="block w-full border border-gray-300 rounded-md shadow-sm hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 cursor-pointer bg-white text-indigo-600 py-2 px-4 text-sm font-medium text-center transition duration-150 ease-in-out"
      >
        Seleccionar archivos
      </label>
      {selectedImages && selectedImages.length > 0 && (
        <p className="mt-1 text-sm text-gray-500 text-center">
          {selectedImages.length} archivo(s) seleccionado(s)
        </p>
      )}
      {imageName && !selectedImages && <p className="mt-1 text-sm text-gray-500 text-center">{imageName}</p>}
    </div>
  </div>
);

const Productos = ({ onSubmit }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('tab1');
  const [form, setForm] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [porcentajeGanancia, setPorcentajeGanancia] = useState('');
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
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Para compatibilidad con imagen única
      const firstFile = files[0];
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(firstFile);
      
      // Manejar múltiples imágenes
      setSelectedImages(files);
      
      // Crear vistas previas para todas las imágenes
      const previews = [];
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews[index] = reader.result;
          if (previews.length === files.length) {
            setPreviewImages([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      // Actualizar el formulario con las imágenes
      setForm(prev => ({ 
        ...prev, 
        imagen: firstFile, // Mantener compatibilidad
        imagenes: files // Nuevas múltiples imágenes
      }));
    }
  };

  // Función para eliminar una imagen específica
  const removeImage = (index) => {
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);
    
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
    
    // Si no quedan imágenes, limpiar todo
    if (newSelectedImages.length === 0) {
      setPreviewImage(null);
      setForm(prev => ({ 
        ...prev, 
        imagen: null,
        imagenes: []
      }));
    } else {
      // Actualizar la imagen principal (primera imagen)
      const firstFile = newSelectedImages[0];
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(firstFile);
      
      // Actualizar el formulario
      setForm(prev => ({ 
        ...prev, 
        imagen: firstFile,
        imagenes: newSelectedImages
      }));
    }
  };

  const calculatePrices = (costoBase, porcentajeNum) => {
    if (!isNaN(costoBase) && !isNaN(porcentajeNum) && porcentajeNum < 100 && porcentajeNum >= 0) {
      // Calcular precio con ganancia (sin IGV): P = C × (100/(100-R))
      const precioConGanancia = costoBase * (100 / (100 - porcentajeNum));
      
      // El precio_igv es el precio con IGV (precio con ganancia + 18%)
      const precioConIGV = precioConGanancia * 1.18;
      
      return {
        precio_ganancia: precioConGanancia.toFixed(2),
        precio_igv: precioConIGV.toFixed(2)
      };
    }
    return null;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'porcentaje_ganancia') {
      setPorcentajeGanancia(value);
      const costoBase = parseFloat(form.precio_sin_ganancia);
      const porcentajeNum = parseFloat(value);
      
      const prices = calculatePrices(costoBase, porcentajeNum);
      if (prices) {
        setForm(prev => ({
          ...prev,
          ...prices
        }));
      }
      return;
    }
    
    // Actualizar el valor en el formulario
    setForm(prev => {
      const updatedForm = { ...prev, [name]: value };
      
      // Si se actualiza el precio sin ganancia (C), calcular automáticamente
      if (name === 'precio_sin_ganancia' && value) {
        const costoBase = parseFloat(value);
        const porcentajeNum = parseFloat(porcentajeGanancia);
        
        const prices = calculatePrices(costoBase, porcentajeNum);
        if (prices) {
          Object.assign(updatedForm, prices);
        }
      }
      
      return updatedForm;
    });
  };
  
  // Recalcular precios cuando cambie el porcentaje de ganancia
  useEffect(() => {
    if (form.precio_sin_ganancia && porcentajeGanancia) {
      const costoBase = parseFloat(form.precio_sin_ganancia);
      const porcentajeNum = parseFloat(porcentajeGanancia);
      
      const prices = calculatePrices(costoBase, porcentajeNum);
      if (prices) {
        setForm(prev => ({
          ...prev,
          ...prices
        }));
      }
    }
  }, [porcentajeGanancia, form.precio_sin_ganancia]);

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
      if (key === 'imagenes' && value && value.length > 0) {
        // Agregar múltiples imágenes
        value.forEach((imagen, index) => {
          formData.append(`imagenes[${index}]`, imagen);
        });
      } else if (key === 'imagen' && value && !form.imagenes) {
        // Mantener compatibilidad con imagen única si no hay múltiples
        formData.append(key, value);
      } else if (key === 'caracteristicas' && value) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined && key !== 'imagen' && key !== 'imagenes') {
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
        setPorcentajeGanancia('');
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
      setForm(prev => {
        const updatedForm = { 
          ...prev, 
          [modalType]: jsonValue // Reemplaza completamente los datos
        };
        
        return updatedForm;
      });
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
          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
            <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
              {Object.keys(form.caracteristicas || {}).length === 0 ? (
                <p className="text-gray-500">No hay características definidas.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <ul className="list-disc pl-5">
                    {Object.entries(form.caracteristicas).map(([key, val]) => (
                      <li key={key} className="mb-1">
                        <span className="font-medium">{key}:</span> {val}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                onClick={() => toggleModal('caracteristicas')}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Agregar Características
              </button>
            </div>
          </div>
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

      case 'tab5': // Documentos/Descargas
        return (
          <div className="space-y-4">
            <FormTextarea
              label="Enlaces de Documentos/Descargas"
              id="archivos_adicionales"
              name="archivos_adicionales"
              value={form.archivos_adicionales}
              onChange={handleChange}
              placeholder="Ingrese los enlaces de documentos o descargas (uno por línea)"
              rows={6}
            />
            <div className="text-sm text-gray-500">
              Ingrese cada enlace en una nueva línea. Ejemplo:
              <pre className="mt-1 p-2 bg-gray-100 rounded">https://ejemplo.com/manual.pdf</pre>
            </div>
          </div>
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
            <div className="mb-4">
              <label htmlFor="pais" className={`block text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>País</label>
              <select
                id="pais"
                name="pais"
                value={form.pais}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                required
              >
                <option value="">Seleccione un país</option>
                {countryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
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
    <div className={`container mx-auto px-4 py-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <h1 className={`text-2xl font-bold mb-4 text-center lg:text-left transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>Crear Producto</h1>
      
      <form onSubmit={handleSubmit}>
        <div className={`flex flex-col lg:flex-row shadow-md rounded-lg p-6 mb-8 w-full transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <ImageUpload
            previewImage={previewImage}
            previewImages={previewImages}
            handleImageChange={handleImageChange}
            imageName={form.imagen?.name}
            selectedImages={selectedImages}
            removeImage={removeImage}
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

              {priceFields.map(field => {
                if (field.name === 'porcentaje_ganancia') {
                  return (
                    <div key={field.name} className="mb-4">
                      <label htmlFor={field.name} className={`block text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{field.label}</label>
                      <div className="relative mt-1">
                        <input
                          type={field.type}
                          id={field.name}
                          name={field.name}
                          value={porcentajeGanancia}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className={`block w-full rounded-md shadow-sm pr-8 transition-colors duration-300 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
                          }`} 
                          step={field.step}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>%</span>
                        </div>
                      </div>
                      {porcentajeGanancia && (
                        <p className={`mt-1 text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-500'
                        }`}>
                          Porcentaje aplicado: {porcentajeGanancia}%
                        </p>
                      )}
                    </div>
                  );
                }
                
                if (field.name === 'precio_igv') {
                  return (
                    <div key={field.name} className="mb-4">
                      <label htmlFor={field.name} className={`block text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{field.label}</label>
                      <input
                        type={field.type}
                        id={field.name}
                        name={field.name}
                        value={form[field.name]}
                        placeholder={field.placeholder}
                        className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-gray-300 placeholder-gray-400' 
                            : 'bg-gray-100 border-gray-300 text-gray-600 placeholder-gray-500'
                        }`}
                        step={field.step}
                        readOnly
                      />
                      <p className={`mt-1 text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        IGV 18% incluido
                      </p>
                    </div>
                  );
                }
                
                return (
                  <FormInput
                    key={field.name}
                    {...field}
                    value={form[field.name]}
                    onChange={handleChange}
                  />
                );
              })}

              <VideoInput value={form.video} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className={`mt-8 shadow-md rounded-lg p-6 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`flex overflow-x-auto border-b transition-colors duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-150 ease-in-out whitespace-nowrap ${
                  activeTab === tab.id 
                    ? isDarkMode 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
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
            className={`px-6 py-2 text-white font-bold rounded-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
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