import { FiX, FiHome, FiMail, FiPhone, FiMapPin, FiUser, FiHash, FiCalendar, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useTheme } from "../../../../storage/ThemeContext";

export default function ShowEmpresaModal({ isOpen, onClose, empresa }) {
  const { isDarkMode } = useTheme();

  if (!isOpen || !empresa) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSectorLabel = (sector) => {
    const sectores = {
      'salud': 'Salud',
      'educacion': 'Educación',
      'industria': 'Industria',
      'gobierno': 'Gobierno',
      'mineria': 'Minería',
      'agricultura': 'Agricultura',
      'tecnologia': 'Tecnología',
      'construccion': 'Construcción'
    };
    return sectores[sector] || sector;
  };

  const getSectorColor = (sector) => {
    const colores = {
      'salud': 'bg-red-100 text-red-800',
      'educacion': 'bg-blue-100 text-blue-800',
      'industria': 'bg-green-100 text-green-800',
      'gobierno': 'bg-purple-100 text-purple-800',
      'mineria': 'bg-yellow-100 text-yellow-800',
      'agricultura': 'bg-lime-100 text-lime-800',
      'tecnologia': 'bg-indigo-100 text-indigo-800',
      'construccion': 'bg-orange-100 text-orange-800'
    };
    return colores[sector] || 'bg-gray-100 text-gray-800';
  };

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
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FiHome className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Detalles de la Empresa
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Información completa de la empresa cliente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
            } transition-colors duration-200`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información principal */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {empresa.razon_social}
                </h4>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getSectorColor(empresa.sector)}`}>
                    {getSectorLabel(empresa.sector)}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                    empresa.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {empresa.activo ? (
                      <>
                        <FiCheckCircle className="w-4 h-4 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <FiXCircle className="w-4 h-4 mr-1" />
                        Inactivo
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de identificación */}
          <div>
            <h5 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Información de Identificación
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiHash className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    RUC
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {empresa.ruc}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiHome className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Sector
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getSectorLabel(empresa.sector)}
                </p>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h5 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Información de Contacto
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiUser className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Contacto Principal
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {empresa.contacto_principal}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiMail className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Email
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <a
                    href={`mailto:${empresa.email}`}
                    className={`hover:${isDarkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-200`}
                  >
                    {empresa.email}
                  </a>
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiPhone className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Teléfono
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <a
                    href={`tel:${empresa.telefono}`}
                    className={`hover:${isDarkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-200`}
                  >
                    {empresa.telefono}
                  </a>
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiMapPin className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Dirección
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {empresa.direccion}
                </p>
              </div>
            </div>
          </div>

          {/* Usuario responsable */}
          {empresa.usuario && (
            <div>
              <h5 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Usuario Responsable
              </h5>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-800 font-semibold">
                      {empresa.usuario.nombre?.[0]}{empresa.usuario.apellido?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {empresa.usuario.nombre} {empresa.usuario.apellido}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      @{empresa.usuario.nombre_usuario}
                    </p>
                    {empresa.usuario.correo && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {empresa.usuario.correo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información de fechas */}
          <div>
            <h5 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Información del Sistema
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiCalendar className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Fecha de Registro
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(empresa.created_at)}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiCalendar className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Última Actualización
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(empresa.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end p-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}