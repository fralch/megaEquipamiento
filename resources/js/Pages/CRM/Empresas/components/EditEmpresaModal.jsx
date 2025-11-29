import { useState, useEffect } from "react";
import { FiX, FiHome, FiMail, FiPhone, FiSave, FiUser, FiHash, FiImage } from "react-icons/fi";
import { useTheme } from "../../../../storage/ThemeContext";
import { router } from "@inertiajs/react";

export default function EditEmpresaModal({ isOpen, onClose, empresa, usuarios }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    email: "",
    telefono: "",
    codigo_cotizacion: "",
    contador_cotizacion: 0,
    anio_cotizacion: "",
    id_usuario: "",
    imagen_logo: null,
    imagen_firma: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [firmaPreview, setFirmaPreview] = useState(null);

  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre: empresa.nombre || "",
        ruc: empresa.ruc || "",
        email: empresa.email || "",
        telefono: empresa.telefono || "",
        codigo_cotizacion: empresa.codigo_cotizacion || "",
        contador_cotizacion: empresa.contador_cotizacion || 0,
        anio_cotizacion: empresa.anio_cotizacion || "",
        id_usuario: empresa.id_usuario || "",
        imagen_logo: null,
        imagen_firma: null
      });

      // Set logo preview if exists
      if (empresa.imagen_logo) {
        setLogoPreview(empresa.imagen_logo_url || `/${empresa.imagen_logo}`);
      }

      // Set firma preview if exists
      if (empresa.imagen_firma) {
        setFirmaPreview(empresa.imagen_firma_url || `/${empresa.imagen_firma}`);
      }
    }
  }, [empresa]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen_logo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFirmaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen_firma: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFirmaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (formData.ruc && formData.ruc.length !== 11) {
      newErrors.ruc = "El RUC debe tener 11 dígitos";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('_method', 'PUT');

      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await fetch(route('crm.empresas.update', empresa.id), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Empresa actualizada exitosamente');
        onClose();
        setErrors({});
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert('Error al actualizar la empresa: ' + (data.message || 'Error desconocido'));
        }
      }
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      alert('Error al actualizar la empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !empresa) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <FiHome className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Editar Empresa
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Actualiza la información de: {empresa.nombre}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg hover:bg-gray-100 ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
            } transition-colors duration-200`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div>
            <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Información Básica
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiHome className="inline w-4 h-4 mr-1" />
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.nombre ? 'border-red-500' : ''}`}
                  placeholder="Empresa S.A.C."
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiHash className="inline w-4 h-4 mr-1" />
                  RUC
                </label>
                <input
                  type="text"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleInputChange}
                  maxLength="11"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.ruc ? 'border-red-500' : ''}`}
                  placeholder="20123456789"
                />
                {errors.ruc && (
                  <p className="mt-1 text-sm text-red-600">{errors.ruc}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Usuario Responsable
                </label>
                <select
                  name="id_usuario"
                  value={formData.id_usuario}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.id_usuario ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccionar usuario</option>
                  {usuarios?.map((usuario) => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                      {usuario.nombre} {usuario.apellido} - {usuario.nombre_usuario}
                    </option>
                  ))}
                </select>
                {errors.id_usuario && (
                  <p className="mt-1 text-sm text-red-600">{errors.id_usuario}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Información de Contacto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiMail className="inline w-4 h-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="contacto@empresa.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiPhone className="inline w-4 h-4 mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.telefono ? 'border-red-500' : ''}`}
                  placeholder="999 888 777"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                )}
              </div>
            </div>
          </div>

          {/* Configuración de Cotizaciones */}
          <div>
            <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Configuración de Cotizaciones
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiHash className="inline w-4 h-4 mr-1" />
                  Prefijo de Código (Ej: EIIL)
                </label>
                <input
                  type="text"
                  name="codigo_cotizacion"
                  value={formData.codigo_cotizacion}
                  onChange={handleInputChange}
                  placeholder="COT"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.codigo_cotizacion ? 'border-red-500' : ''}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiHash className="inline w-4 h-4 mr-1" />
                  Contador Actual
                </label>
                <input
                  type="number"
                  name="contador_cotizacion"
                  value={formData.contador_cotizacion}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.contador_cotizacion ? 'border-red-500' : ''}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiHash className="inline w-4 h-4 mr-1" />
                  Año del Código
                </label>
                <input
                  type="text"
                  name="anio_cotizacion"
                  value={formData.anio_cotizacion}
                  onChange={handleInputChange}
                  maxLength="4"
                  placeholder={new Date().getFullYear().toString()}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.anio_cotizacion ? 'border-red-500' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Logo de la empresa */}
          <div>
            <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Logo de la Empresa (Opcional)
            </h4>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FiImage className="inline w-4 h-4 mr-1" />
                Subir Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {logoPreview && (
                <div className="mt-4">
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Vista previa del logo:
                  </p>
                  <img src={logoPreview} alt="Logo Preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>
          </div>

          {/* Firma de la empresa */}
          <div>
            <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Firma de la Empresa (Opcional)
            </h4>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FiImage className="inline w-4 h-4 mr-1" />
                Subir Firma
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFirmaChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {firmaPreview && (
                <div className="mt-4">
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Vista previa de la firma:
                  </p>
                  <img src={firmaPreview} alt="Firma Preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex justify-end space-x-3 pt-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  Actualizar Empresa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
