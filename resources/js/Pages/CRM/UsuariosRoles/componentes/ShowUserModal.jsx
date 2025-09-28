import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiCheck, FiStar } from "react-icons/fi";
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
      case 'admin': return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25";
      case 'editor': return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25";
      case 'usuario': return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25";
    }
  };

  const getAvatarGradient = (nombreRol) => {
    switch(nombreRol) {
      case 'admin': return "from-purple-500 via-purple-600 to-purple-700";
      case 'editor': return "from-blue-500 via-blue-600 to-blue-700";
      case 'usuario': return "from-green-500 via-green-600 to-green-700";
      default: return "from-gray-500 via-gray-600 to-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay con efecto glassmorphism */}
        <div 
          className="fixed inset-0 transition-all duration-300 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal con animación y efectos mejorados */}
        <div className={`inline-block w-full max-w-lg p-0 my-8 overflow-hidden text-left align-middle transition-all transform shadow-2xl rounded-2xl animate-in slide-in-from-bottom-4 duration-300 ${
          isDarkMode 
            ? "bg-gray-900/95 backdrop-blur-xl border border-gray-700/50" 
            : "bg-white/95 backdrop-blur-xl border border-gray-200/50"
        }`}>
          
          {/* Header con gradiente */}
          <div className={`relative px-6 py-4 ${
            isDarkMode 
              ? "bg-gradient-to-r from-gray-800/50 to-gray-900/50" 
              : "bg-gradient-to-r from-gray-50/50 to-white/50"
          } border-b ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                } backdrop-blur-sm`}>
                  <FiUser className={`w-5 h-5 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Perfil de Usuario
                  </h3>
                  <p className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Información detallada del usuario
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? "hover:bg-gray-800/50 text-gray-400 hover:text-white" 
                    : "hover:bg-gray-100/50 text-gray-500 hover:text-gray-700"
                } backdrop-blur-sm`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Avatar and Basic Info con diseño mejorado */}
          <div className="px-4 py-4">
            <div className={`relative p-4 rounded-xl ${
              isDarkMode 
                ? "bg-gradient-to-br from-gray-800/30 to-gray-900/30" 
                : "bg-gradient-to-br from-blue-50/50 to-purple-50/50"
            } backdrop-blur-sm border ${
              isDarkMode ? "border-gray-700/30" : "border-gray-200/30"
            } shadow-lg`}>
              
              {/* Decorative elements */}
              <div className="absolute top-3 right-3 opacity-20">
                <FiStar className={`w-4 h-4 ${
                  isDarkMode ? "text-yellow-400" : "text-yellow-500"
                }`} />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    getAvatarGradient(user.role?.nombre_rol || 'usuario')
                  } flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ${
                    isDarkMode ? "ring-gray-700/50" : "ring-white/50"
                  } transition-transform hover:scale-105 duration-200`}>
                    {generateAvatar(user.nombre).toUpperCase()}
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-sm">
                    <FiCheck className="w-2 h-2 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className={`text-lg font-bold mb-1 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {user.nombre}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    @{user.nombre_usuario}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full transition-all hover:scale-105 duration-200 ${
                      rolePillClasses(user.role?.nombre_rol || 'usuario')
                    }`}>
                      <FiShield className="w-3 h-3 mr-1" />
                      {roleLabel(user.role?.nombre_rol || 'usuario')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Details con diseño mejorado */}
          <div className="px-6 pb-6">
            <div className="space-y-3 mb-4">
              
              {/* Email */}
              <div className={`group p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                isDarkMode 
                  ? "bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30" 
                  : "bg-white/60 hover:bg-white/80 border border-gray-200/30"
              } backdrop-blur-sm shadow-sm hover:shadow-md`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                  } group-hover:scale-110 transition-transform duration-200`}>
                    <FiMail className={`w-4 h-4 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold mb-0.5 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Correo electrónico
                    </p>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {user.correo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              {user.telefono && (
                <div className={`group p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                  isDarkMode 
                    ? "bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30" 
                    : "bg-white/60 hover:bg-white/80 border border-gray-200/30"
                } backdrop-blur-sm shadow-sm hover:shadow-md`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? "bg-green-500/20" : "bg-green-100"
                    } group-hover:scale-110 transition-transform duration-200`}>
                      <FiPhone className={`w-4 h-4 ${
                        isDarkMode ? "text-green-400" : "text-green-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold mb-0.5 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Teléfono
                      </p>
                      <p className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {user.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {user.direccion && (
                <div className={`group p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                  isDarkMode 
                    ? "bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30" 
                    : "bg-white/60 hover:bg-white/80 border border-gray-200/30"
                } backdrop-blur-sm shadow-sm hover:shadow-md`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                    } group-hover:scale-110 transition-transform duration-200`}>
                      <FiMapPin className={`w-4 h-4 ${
                        isDarkMode ? "text-purple-400" : "text-purple-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold mb-0.5 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Dirección
                      </p>
                      <p className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {user.direccion}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Date and User ID in a row */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`group p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                  isDarkMode 
                    ? "bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30" 
                    : "bg-white/60 hover:bg-white/80 border border-gray-200/30"
                } backdrop-blur-sm shadow-sm hover:shadow-md`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${
                      isDarkMode ? "bg-orange-500/20" : "bg-orange-100"
                    } group-hover:scale-110 transition-transform duration-200`}>
                      <FiCalendar className={`w-3 h-3 ${
                        isDarkMode ? "text-orange-400" : "text-orange-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold mb-0.5 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Registro
                      </p>
                      <p className={`text-xs font-medium truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {new Date(user.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`group p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                  isDarkMode 
                    ? "bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30" 
                    : "bg-white/60 hover:bg-white/80 border border-gray-200/30"
                } backdrop-blur-sm shadow-sm hover:shadow-md`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${
                      isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100"
                    } group-hover:scale-110 transition-transform duration-200`}>
                      <FiUser className={`w-3 h-3 ${
                        isDarkMode ? "text-indigo-400" : "text-indigo-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold mb-0.5 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        ID
                      </p>
                      <p className={`text-xs font-mono font-medium truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                        #{user.id_usuario}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge mejorado */}
          <div className="px-6 pb-6">
            <div className={`relative p-3 rounded-lg ${
              isDarkMode 
                ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30" 
                : "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/30"
            } backdrop-blur-sm shadow-sm overflow-hidden`}>
              
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg"></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className={`text-sm font-bold ${
                      isDarkMode ? "text-green-400" : "text-green-800"
                    }`}>
                      Usuario Activo
                    </span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isDarkMode 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    ONLINE
                  </div>
                </div>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? "text-green-300/80" : "text-green-700/80"
                }`}>
                  El usuario está disponible y puede acceder al sistema
                </p>
              </div>
            </div>
          </div>

          {/* Footer con botones mejorados */}
          <div className={`px-4 py-3 ${
            isDarkMode 
              ? "bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-t border-gray-700/50" 
              : "bg-gradient-to-r from-gray-50/30 to-white/30 border-t border-gray-200/50"
          }`}>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] ${
                  isDarkMode
                    ? "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50"
                    : "bg-white/50 hover:bg-white/80 text-gray-700 hover:text-gray-900 border border-gray-200/50"
                } backdrop-blur-sm shadow-sm hover:shadow-md`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}