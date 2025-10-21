import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiEdit } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';

export default function EditRoleModal({ isOpen, onClose, role }) {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        nombre_rol: '',
        descripcion: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Update form data when role prop changes
    useEffect(() => {
        if (role) {
            setFormData({
                nombre_rol: role.nombre_rol || '',
                descripcion: role.descripcion || ''
            });
        }
    }, [role]);

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
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nombre_rol.trim()) {
            newErrors.nombre_rol = 'El nombre del rol es requerido';
        } else if (formData.nombre_rol.length > 50) {
            newErrors.nombre_rol = 'El nombre del rol no puede exceder 50 caracteres';
        }

        if (formData.descripcion && formData.descripcion.length > 255) {
            newErrors.descripcion = 'La descripción no puede exceder 255 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm() || !role) {
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch(`/crm/usuarios/roles/${role.id_rol}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    ...formData,
                    _method: 'PUT'
                })
            });

            if (response.ok) {
                handleClose();
                window.location.reload(); // Recargar la página para mostrar los cambios
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    alert('Error al actualizar el rol');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nombre_rol: '',
            descripcion: ''
        });
        setErrors({});
        setIsLoading(false);
        onClose();
    };

    if (!isOpen || !role) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md mx-4 rounded-xl shadow-xl ${
                isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    isDarkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FiEdit className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className={`text-lg font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Editar Rol
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Nombre del Rol */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Nombre del Rol *
                            </label>
                            <input
                                type="text"
                                name="nombre_rol"
                                value={formData.nombre_rol}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode 
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } ${errors.nombre_rol ? 'border-red-500' : ''}`}
                                placeholder="Ej: moderador, supervisor, etc."
                                maxLength="50"
                            />
                            {errors.nombre_rol && (
                                <p className="text-red-500 text-sm mt-1">{errors.nombre_rol}</p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                rows="3"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                    isDarkMode 
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } ${errors.descripcion ? 'border-red-500' : ''}`}
                                placeholder="Descripción opcional del rol..."
                                maxLength="255"
                            />
                            {errors.descripcion && (
                                <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                            )}
                            <p className={`text-xs mt-1 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                {formData.descripcion.length}/255 caracteres
                            </p>
                        </div>

                        {/* Role Info */}
                        <div className={`p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                            <p className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                <span className="font-medium">ID del Rol:</span> {role.id_rol}
                            </p>
                            <p className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                <span className="font-medium">Usuarios asignados:</span> {role.usuarios_count || 0}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                                isDarkMode 
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4" />
                                    Actualizar Rol
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
