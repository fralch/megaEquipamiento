import { Head } from "@inertiajs/react";
import { FiHome, FiSave } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import { useState } from 'react';
import CRMLayout from '../../../Components/CRM/CRMLayout';

export default function AgregarEmpresa() {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        nombre: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        sector: '',
        contacto: '',
        empleados: '',
        descripcion: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Datos de la empresa:', formData);
    };

    return (
        <>
            <Head title="Agregar Empresa" />
            <CRMLayout title="Agregar Empresa">
                <div className="p-6">
                    <div className="mb-6">
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Agregar Nueva Empresa
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Complete los datos para registrar una nueva empresa
                        </p>
                    </div>

                    <div className={`max-w-2xl mx-auto rounded-xl shadow-sm border p-6 ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Nombre de la Empresa
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                                            isDarkMode 
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                        placeholder="Ingrese el nombre de la empresa"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        RUC
                                    </label>
                                    <input
                                        type="text"
                                        name="ruc"
                                        value={formData.ruc}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                                            isDarkMode 
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                        placeholder="Ingrese el RUC"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Sector
                                    </label>
                                    <select
                                        name="sector"
                                        value={formData.sector}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                                            isDarkMode 
                                                ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                        required
                                    >
                                        <option value="">Seleccione un sector</option>
                                        <option value="Tecnología">Tecnología</option>
                                        <option value="Manufactura">Manufactura</option>
                                        <option value="Comercio">Comercio</option>
                                        <option value="Servicios">Servicios</option>
                                        <option value="Construcción">Construcción</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Número de Empleados
                                    </label>
                                    <input
                                        type="number"
                                        name="empleados"
                                        value={formData.empleados}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                                            isDarkMode 
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                        placeholder="Ingrese el número de empleados"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Descripción
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        rows="4"
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                                            isDarkMode 
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                        placeholder="Ingrese una descripción de la empresa"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        <FiSave className="w-4 h-4" />
                                        Guardar Empresa
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-6 py-2 border rounded-lg transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                        </form>
                    </div>
                </div>
            </CRMLayout>
        </>
    );
}