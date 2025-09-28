import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield } from "react-icons/fi";
import { useTheme } from "../../../../storage/ThemeContext";

export default function ShowUserModal({ isOpen, onClose, user }) {
  const { isDarkMode } = useTheme();

  if (!isOpen || !user) return null;

  // Generar avatar con iniciales
  const generateAvatar = (nombre) => {
    const words = nombre.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return nombre.substring(0, 2);
  };

  // Helper para label y color por rol
  const roleLabel = (nombreRol) => {
    switch(nombreRol) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'usuario': return 'Usuario';
      default: return nombreRol;
    }
  };

  const rolePillClasses = (nombreRol) => {
    switch(nombreRol) {
      case 'admin': return "bg-purple-100 text-purple-800";
      case 'editor': return "bg-blue-100 text-blue-800";
      case 'usuario': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl ${
          isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-white"
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUser className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Detalles del Usuario
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* User Avatar and Basic Info */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {generateAvatar(user.nombre).toUpperCase()}
            </div>
            <div className="flex-1">
              <h4 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {user.nombre}
              </h4>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                @{user.nombre_usuario}
              </p>
              <div className="mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${rolePillClasses(user.role?.nombre_rol || 'usuario')}`}>
                  <FiShield className="w-4 h-4 mr-1" />
                  {roleLabel(user.role?.nombre_rol || 'usuario')}
                </span>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <FiMail className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Correo electrónico
                </p>
                <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {user.correo}
                </p>
              </div>
            </div>

            {/* Phone */}
            {user.telefono && (
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <FiPhone className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Teléfono
                  </p>
                  <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {user.telefono}
                  </p>
                </div>
              </div>
            )}

            {/* Address */}
            {user.direccion && (
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <FiMapPin className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Dirección
                  </p>
                  <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {user.direccion}
                  </p>
                </div>
              </div>
            )}

            {/* Registration Date */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <FiCalendar className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Fecha de registro
                </p>
                <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <FiUser className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  ID de usuario
                </p>
                <p className={`text-sm font-mono ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  #{user.id_usuario}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-400">
                Usuario activo
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              El usuario tiene acceso completo al sistema
            </p>
          </div>

          {/* Close Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}