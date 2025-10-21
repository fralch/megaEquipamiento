import React from 'react';
import { FiX, FiUser, FiCalendar, FiInfo } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';

export default function ShowRoleModal({ isOpen, onClose, role }) {
    const { isDarkMode } = useTheme();

    if (!isOpen || !role) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleBadgeColor = (roleName) => {
        switch (roleName?.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'editor':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'usuario':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`w-full max-w-lg mx-4 rounded-xl shadow-xl ${
                isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    isDarkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FiInfo className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className={`text-lg font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Detalles del Rol
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-6">
                        {/* Role Name and Badge */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${
                                    isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : getRoleBadgeColor(role.nombre_rol)
                                }`}>
                                    {role.nombre_rol}
                                </span>
                            </div>
                            <h4 className={`text-xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                {role.nombre_rol?.charAt(0).toUpperCase() + role.nombre_rol?.slice(1)}
                            </h4>
                        </div>

                        {/* Role Information */}
                        <div className={`rounded-lg p-4 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                            <h5 className={`text-sm font-semibold mb-3 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Información General
                            </h5>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-medium ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        ID del Rol:
                                    </span>
                                    <span className={`text-sm ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                        {role.id_rol}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-medium ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        Nombre:
                                    </span>
                                    <span className={`text-sm ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                        {role.nombre_rol}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-medium ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        Descripción:
                                    </span>
                                    <span className={`text-sm text-right max-w-xs ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                        {role.descripcion || 'Sin descripción'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Users Statistics */}
                        <div className={`rounded-lg p-4 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                            <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                <FiUser className="w-4 h-4" />
                                Usuarios Asignados
                            </h5>
                            
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Total de usuarios con este rol:
                                </span>
                                <span className={`text-lg font-bold ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {role.usuarios_count || 0}
                                </span>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className={`rounded-lg p-4 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                            <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                <FiCalendar className="w-4 h-4" />
                                Fechas
                            </h5>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        Creado:
                                    </span>
                                    <span className={`text-sm text-right ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                        {formatDate(role.created_at)}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        Última actualización:
                                    </span>
                                    <span className={`text-sm text-right ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                        {formatDate(role.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-center">
                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                Estado: Activo
                            </span>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="mt-6">
                        <button
                            onClick={onClose}
                            className={`w-full px-4 py-2 border rounded-lg font-medium transition-colors ${
                                isDarkMode 
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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