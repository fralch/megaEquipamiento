import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser, FiMail, FiCalendar, FiPhone, FiMapPin, FiLogOut } from "react-icons/fi";
import { useTheme } from "@/storage/ThemeContext";
import { router } from "@inertiajs/react";

export default function UserProfileModal({ isOpen, onClose, user }) {
    const { isDarkMode } = useTheme();

    const handleLogout = () => {
        router.post("/logout");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No especificado";
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (!user) return null;

    // Access user data from the nested structure
    const userData = user.usuario || user;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={`w-full max-w-md rounded-xl shadow-2xl ${
                            isDarkMode
                                ? "bg-gray-800 text-white border border-gray-700"
                                : "bg-white text-gray-900 border border-gray-200"
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between p-6 border-b ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                    isDarkMode ? "bg-blue-600" : "bg-blue-100"
                                }`}>
                                    <FiUser className={`w-5 h-5 ${
                                        isDarkMode ? "text-white" : "text-blue-600"
                                    }`} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Mi Perfil</h2>
                                    <p className={`text-sm ${
                                        isDarkMode ? "text-gray-400" : "text-gray-500"
                                    }`}>
                                        Información de usuario
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors ${
                                    isDarkMode
                                        ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* User Info Grid */}
                            <div className="grid gap-4">
                                {/* Name */}
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                    }`}>
                                        <FiUser className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-medium uppercase tracking-wide ${
                                            isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                            Nombre
                                        </p>
                                        <p className="font-medium">
                                            {userData.nombre || "No especificado"}
                                            {userData.apellido && ` ${userData.apellido}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                    }`}>
                                        <FiUser className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-medium uppercase tracking-wide ${
                                            isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                            Usuario
                                        </p>
                                        <p className="font-medium">
                                            {userData.nombre_usuario || "No especificado"}
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                    }`}>
                                        <FiMail className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-medium uppercase tracking-wide ${
                                            isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                            Email
                                        </p>
                                        <p className="font-medium break-all">
                                            {userData.correo || "No especificado"}
                                        </p>
                                    </div>
                                </div>

                                {/* Phone */}
                                {userData.telefono && (
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                        }`}>
                                            <FiPhone className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-xs font-medium uppercase tracking-wide ${
                                                isDarkMode ? "text-gray-400" : "text-gray-500"
                                            }`}>
                                                Teléfono
                                            </p>
                                            <p className="font-medium">
                                                {userData.telefono}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Address */}
                                {userData.direccion && (
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                        }`}>
                                            <FiMapPin className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-xs font-medium uppercase tracking-wide ${
                                                isDarkMode ? "text-gray-400" : "text-gray-500"
                                            }`}>
                                                Dirección
                                            </p>
                                            <p className="font-medium">
                                                {userData.direccion}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Created At */}
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                    }`}>
                                        <FiCalendar className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-medium uppercase tracking-wide ${
                                            isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                            Miembro desde
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(userData.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer with Logout */}
                        <div className={`p-6 border-t ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}>
                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    isDarkMode
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-red-500 hover:bg-red-600 text-white"
                                } shadow-sm hover:shadow-md`}
                            >
                                <FiLogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}