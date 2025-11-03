import { useState, useEffect } from "react";
import { FiX, FiHome, FiMail, FiPhone, FiMapPin, FiSave, FiUser, FiHash, FiGrid } from "react-icons/fi";
import { useTheme } from "../../../../storage/ThemeContext";
import { router } from "@inertiajs/react";
import axios from "axios";

export default function EditEmpresaModal({ isOpen, onClose, empresa, usuarios, clientes = [] }) {
  const { isDarkMode } = useTheme();
  const [sectores, setSectores] = useState([]);
  const [formData, setFormData] = useState({
    razon_social: "",
    ruc: "",
    sector_id: "",
    contacto_principal: "",
    email: "",
    telefono: "",
    direccion: "",
    usuario_id: "",
    cliente_id: "",
    activo: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch sectores activos
  useEffect(() => {
    const fetchSectores = async () => {
      try {
        const response = await axios.get('/crm/sectores/activos');
        setSectores(response.data);
      } catch (error) {
        console.error('Error al cargar sectores:', error);
      }
    };

    if (isOpen) {
      fetchSectores();
    }
  }, [isOpen]);

  useEffect(() => {
    if (empresa) {
      setFormData({
        razon_social: empresa.razon_social || "",
        ruc: empresa.ruc || "",
        sector_id: empresa.sector_id || "",
        contacto_principal: empresa.contacto_principal || "",
        email: empresa.email || "",
        telefono: empresa.telefono || "",
        direccion: empresa.direccion || "",
        usuario_id: empresa.usuario_id || "",
        cliente_id: empresa.cliente_id || "",
        activo: empresa.activo ?? true
      });
    }
  }, [empresa]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = "La razón social es requerida";
    }

    if (!formData.ruc.trim()) {
      newErrors.ruc = "El RUC es requerido";
    } else if (formData.ruc.length !== 11) {
      newErrors.ruc = "El RUC debe tener 11 dígitos";
    }


    if (!formData.contacto_principal.trim()) {
      newErrors.contacto_principal = "El contacto principal es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida";
    }

    if (!formData.usuario_id) {
      newErrors.usuario_id = "Debe seleccionar un usuario";
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
      router.put(route('crm.clientes.empresas.update', empresa.id), formData, {
        onSuccess: () => {
          onClose();
          setErrors({});
        },
        onError: (errors) => {
          setErrors(errors);
        },
        onFinish: () => {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
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
                Editar Empresa Cliente
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Actualiza la información de la empresa: {empresa.razon_social}
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
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiHome className="inline w-4 h-4 mr-1" />
                  Razón Social *
                </label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.razon_social ? 'border-red-500' : ''}`}
                  placeholder="Empresa S.A.C."
                />
                {errors.razon_social && (
                  <p className="mt-1 text-sm text-red-600">{errors.razon_social}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiHash className="inline w-4 h-4 mr-1" />
                  RUC *
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
                  <FiGrid className="inline w-4 h-4 mr-1" />
                  Sector
                </label>
                <select
                  name="sector_id"
                  value={formData.sector_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.sector_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccionar sector</option>
                  {sectores.map((sector) => (
                    <option key={sector.id_sector} value={sector.id_sector}>
                      {sector.nombre}
                    </option>
                  ))}
                </select>
                {errors.sector_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.sector_id}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Usuario Responsable *
                </label>
                <select
                  name="usuario_id"
                  value={formData.usuario_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.usuario_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccionar usuario</option>
                  {usuarios?.map((usuario) => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                      {usuario.nombre} {usuario.apellido} - {usuario.nombre_usuario}
                    </option>
                  ))}
                </select>
                {errors.usuario_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.usuario_id}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Cliente Enlazado (Opcional)
                </label>
                <select
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${errors.cliente_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Sin cliente enlazado</option>
                  {clientes?.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombrecompleto} - {cliente.ruc}
                    </option>
                  ))}
                </select>
                {errors.cliente_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>
                )}
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Seleccione un cliente para enlazar esta empresa con un contacto principal
                </p>
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
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Contacto Principal *
                </label>
                <input
                  type="text"
                  name="contacto_principal"
                  value={formData.contacto_principal}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.contacto_principal ? 'border-red-500' : ''}`}
                  placeholder="Juan Pérez"
                />
                {errors.contacto_principal && (
                  <p className="mt-1 text-sm text-red-600">{errors.contacto_principal}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiMail className="inline w-4 h-4 mr-1" />
                  Email *
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
                  Teléfono *
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

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FiMapPin className="inline w-4 h-4 mr-1" />
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${errors.direccion ? 'border-red-500' : ''}`}
                  placeholder="Av. Principal 123, Lima"
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
                )}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Empresa activa
              </span>
            </label>
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