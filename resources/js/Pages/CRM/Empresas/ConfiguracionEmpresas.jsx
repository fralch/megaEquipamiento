import { Head } from "@inertiajs/react";
import { FiSettings, FiSave, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import { useState } from 'react';
import CRMLayout from '../../../Components/CRM/CRMLayout';

export default function ConfiguracionEmpresas() {
    const { isDarkMode } = useTheme();

    const configuraciones = [
        { id: 1, parametro: "Límite de Crédito", valor: "S/ 50,000.00", descripcion: "Límite máximo de crédito por empresa", estado: "Activo" },
        { id: 2, parametro: "Días de Gracia", valor: "30 días", descripcion: "Días de gracia para pagos", estado: "Activo" },
        { id: 3, parametro: "Descuento Máximo", valor: "15%", descripcion: "Descuento máximo permitido", estado: "Activo" },
        { id: 4, parametro: "Comisión Ventas", valor: "5%", descripcion: "Comisión por ventas realizadas", estado: "Activo" },
        { id: 5, parametro: "Validación Automática", valor: "Habilitado", descripcion: "Validación automática de documentos", estado: "Inactivo" }
    ];

    return (
        <>
            <Head title="Configuración de Empresas" />
            <CRMLayout title="Configuración de Empresas">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Configuración de Empresas
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra los parámetros de configuración para empresas
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FiPlus className="w-4 h-4" />
                            Agregar Configuración
                        </button>
                    </div>

                    <div className={`rounded-xl shadow-sm border overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Configuración de Empresas
                                    </h1>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Configure los parámetros generales para el manejo de empresas
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CRMLayout>
        </>
    );
}