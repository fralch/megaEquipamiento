import { Head, useForm } from "@inertiajs/react";
import { FiHome, FiMail, FiPhone, FiMapPin, FiSave, FiUser, FiHash, FiArrowLeft } from "react-icons/fi";
import { useTheme } from "../../../storage/ThemeContext";
import { Link } from "@inertiajs/react";
import CRMLayout from "../CRMLayout";

export default function CrearEmpresaCliente({ usuarios }) {
  const { isDarkMode } = useTheme();
  const { data, setData, post, processing, errors, reset } = useForm({
    razon_social: "",
    ruc: "",
    sector: "",
    contacto_principal: "",
    email: "",
    telefono: "",
    direccion: "",
    usuario_id: "",
    activo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('empresas-clientes.store'), {
      onSuccess: () => {
        reset();
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(name, type === 'checkbox' ? checked : value);
  };

  return (
    <CRMLayout>
      <Head title="Crear Empresa Cliente - CRM" />

      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={route('empresas-clientes.index')}
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } transition-colors duration-200 shadow-sm`}
                >
                  <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Nueva Empresa Cliente
                  </h1>
                  <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Registra una nueva empresa cliente en el sistema
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className={`rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FiHome className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información de la Empresa
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Complete todos los campos requeridos
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Información básica */}
              <div>
                <h3 className={`text-lg font-medium mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      value={data.razon_social}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${errors.razon_social ? 'border-red-500' : ''}`}
                      placeholder="Empresa S.A.C."
                    />
                    {errors.razon_social && (
                      <p className="mt-2 text-sm text-red-600">{errors.razon_social}</p>
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
                      value={data.ruc}
                      onChange={handleInputChange}
                      maxLength="11"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${errors.ruc ? 'border-red-500' : ''}`}
                      placeholder="20123456789"
                    />
                    {errors.ruc && (
                      <p className="mt-2 text-sm text-red-600">{errors.ruc}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Sector *
                    </label>
                    <select
                      name="sector"
                      value={data.sector}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${errors.sector ? 'border-red-500' : ''}`}
                    >
                      <option value="">Seleccionar sector</option>
                      <option value="salud">Salud</option>
                      <option value="educacion">Educación</option>
                      <option value="industria">Industria</option>
                      <option value="gobierno">Gobierno</option>
                      <option value="mineria">Minería</option>
                      <option value="agricultura">Agricultura</option>
                      <option value="tecnologia">Tecnología</option>
                      <option value="construccion">Construcción</option>
                    </select>
                    {errors.sector && (
                      <p className="mt-2 text-sm text-red-600">{errors.sector}</p>
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
                      value={data.usuario_id}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      <p className="mt-2 text-sm text-red-600">{errors.usuario_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div>
                <h3 className={`text-lg font-medium mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      value={data.contacto_principal}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${errors.contacto_principal ? 'border-red-500' : ''}`}
                      placeholder="Juan Pérez"
                    />
                    {errors.contacto_principal && (
                      <p className="mt-2 text-sm text-red-600">{errors.contacto_principal}</p>
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
                      value={data.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="contacto@empresa.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
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
                      value={data.telefono}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${errors.telefono ? 'border-red-500' : ''}`}
                      placeholder="999 888 777"
                    />
                    {errors.telefono && (
                      <p className="mt-2 text-sm text-red-600">{errors.telefono}</p>
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
                      value={data.direccion}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${errors.direccion ? 'border-red-500' : ''}`}
                      placeholder="Av. Principal 123, Lima"
                    />
                    {errors.direccion && (
                      <p className="mt-2 text-sm text-red-600">{errors.direccion}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <h3 className={`text-lg font-medium mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Configuración
                </h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="activo"
                    id="activo"
                    checked={data.activo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="activo" className={`ml-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Empresa activa
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className={`flex justify-end space-x-4 pt-6 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <Link
                  href={route('empresas-clientes.index')}
                  className={`px-6 py-3 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className={`px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5 mr-2" />
                      Guardar Empresa
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}