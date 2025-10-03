import { Head, router } from "@inertiajs/react";
import { FiMapPin, FiEdit, FiTrash, FiPlus, FiSave, FiX, FiGrid } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';
import { useState } from 'react';

export default function AreasClientes({ areas: initialAreas = [] }) {
    const { isDarkMode } = useTheme();
    const [showModal, setShowModal] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        estado: 'Activo'
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingArea) {
            router.put(`/crm/areas/${editingArea.id}`, formData, {
                onSuccess: () => {
                    setShowModal(false);
                    resetForm();
                }
            });
        } else {
            router.post('/crm/areas', formData, {
                onSuccess: () => {
                    setShowModal(false);
                    resetForm();
                }
            });
        }
    };

    const handleEdit = (area) => {
        setEditingArea(area);
        setFormData({
            nombre: area.nombre,
            descripcion: area.descripcion || '',
            estado: area.estado
        });
        setShowModal(true);
    };

    const handleDelete = (area) => {
        if (confirm(`¿Está seguro de eliminar el área "${area.nombre}"?`)) {
            router.delete(`/crm/areas/${area.id}`);
        }
    };

    const resetForm = () => {
        setFormData({ nombre: '', descripcion: '', estado: 'Activo' });
        setEditingArea(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };


    return (
        <>
            <Head title="Áreas de Clientes" />
            <CRMLayout title="Áreas de Clientes">
                <div className="p-6 space-y-6">
                    {/* Header Section */}
                    <div className={`rounded-xl p-6 border ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-lg ${
                                    isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                                }`}>
                                    <FiGrid className={`w-6 h-6 ${
                                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                    }`} />
                                </div>
                                <div>
                                    <h1 className={`text-2xl font-bold ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        Gestión de Áreas
                                    </h1>
                                    <p className={`text-sm ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        Administra las áreas organizacionales de tus clientes
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                <FiPlus className="w-4 h-4" />
                                Agregar Área
                            </button>
                        </div>
                    </div>
                    {/* Table Section */}
                    <div className={`rounded-xl shadow-sm border overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <div className={`px-6 py-4 border-b ${
                            isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
                        }`}>
                            <h3 className={`text-lg font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                Lista de Áreas
                            </h3>
                        </div>
                        <table className="w-full">
                            <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                <tr>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>Nombre</th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>Descripción</th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>Estado</th>
                                    <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {initialAreas.map((area) => (
                                    <tr key={area.id} className={`transition-colors duration-200 ${
                                        isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full mr-3 ${
                                                    area.estado === 'Activo' ? 'bg-green-400' : 'bg-red-400'
                                                }`}></div>
                                                <span className="text-sm font-medium">{area.nombre}</span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            {area.descripcion || (
                                                <span className={`italic ${
                                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                                }`}>Sin descripción</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap`}>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                area.estado === 'Activo'
                                                    ? isDarkMode 
                                                        ? 'bg-green-900/20 text-green-400 border border-green-800'
                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                    : isDarkMode
                                                        ? 'bg-red-900/20 text-red-400 border border-red-800'
                                                        : 'bg-red-100 text-red-800 border border-red-200'
                                            }`}>
                                                {area.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(area)}
                                                    className={`p-2 rounded-lg transition-colors duration-200 ${
                                                        isDarkMode 
                                                            ? 'text-blue-400 hover:bg-blue-900/20 hover:text-blue-300' 
                                                            : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                                                    }`}
                                                    title="Editar área"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(area)}
                                                    className={`p-2 rounded-lg transition-colors duration-200 ${
                                                        isDarkMode 
                                                            ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                                                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                    }`}
                                                    title="Eliminar área"
                                                >
                                                    <FiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {initialAreas.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className={`px-6 py-12 text-center ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            <FiGrid className={`w-12 h-12 mx-auto mb-4 ${
                                                isDarkMode ? 'text-gray-600' : 'text-gray-300'
                                            }`} />
                                            <p className="text-lg font-medium mb-2">No hay áreas registradas</p>
                                            <p className="text-sm">Comienza agregando tu primera área</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-md transform transition-all duration-300 ${
                            isDarkMode ? 'bg-gray-900' : 'bg-white'
                        } rounded-xl shadow-2xl border ${
                            isDarkMode ? 'border-gray-800' : 'border-gray-200'
                        }`}>
                            {/* Header */}
                            <div className={`px-6 py-4 border-b ${
                                isDarkMode ? 'border-gray-800' : 'border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${
                                            isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                                        }`}>
                                            <FiGrid className={`w-5 h-5 ${
                                                isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                            }`} />
                                        </div>
                                        <div>
                                            <h2 className={`text-lg font-semibold ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {editingArea ? 'Editar Área' : 'Nueva Área'}
                                            </h2>
                                            <p className={`text-sm ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {editingArea ? 'Modifica los datos del área' : 'Completa la información del área'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCloseModal}
                                        className={`p-2 rounded-lg transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300' 
                                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Información Básica */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <FiGrid className={`w-4 h-4 ${
                                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                        }`} />
                                        <h3 className={`text-sm font-semibold uppercase tracking-wide ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Información del Área
                                        </h3>
                                    </div>

                                    <div>
                                        <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            <FiMapPin className="w-4 h-4" />
                                            <span>Nombre del Área *</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            required
                                            className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                                                isDarkMode
                                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:ring-2 focus:ring-opacity-50`}
                                            placeholder="Ej: Recursos Humanos, Ventas, IT..."
                                        />
                                    </div>

                                    <div>
                                        <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            <FiEdit className="w-4 h-4" />
                                            <span>Descripción</span>
                                        </label>
                                        <textarea
                                            value={formData.descripcion}
                                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                            rows={3}
                                            className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 resize-none ${
                                                isDarkMode
                                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:ring-2 focus:ring-opacity-50`}
                                            placeholder="Describe las funciones y responsabilidades del área..."
                                        />
                                    </div>

                                    <div>
                                        <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            <div className={`w-2 h-2 rounded-full ${
                                                formData.estado === 'Activo' ? 'bg-green-400' : 'bg-red-400'
                                            }`}></div>
                                            <span>Estado *</span>
                                        </label>
                                        <select
                                            value={formData.estado}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                            required
                                            className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                                                isDarkMode
                                                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:ring-2 focus:ring-opacity-50`}
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className={`flex justify-end space-x-3 pt-6 border-t ${
                                    isDarkMode ? 'border-gray-800' : 'border-gray-200'
                                }`}>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                                            isDarkMode
                                                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                                    >
                                        <FiSave className="w-4 h-4 mr-2" />
                                        {editingArea ? 'Actualizar Área' : 'Crear Área'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </CRMLayout>
        </>
    );
}
