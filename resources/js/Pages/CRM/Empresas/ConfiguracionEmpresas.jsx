import { Head } from "@inertiajs/react";
import { FiSettings, FiSave } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import { useState } from 'react';

export default function ConfiguracionEmpresas() {
    const { isDarkMode } = useTheme();
    const [config, setConfig] = useState({
        permitirRegistroAutomatico: false,
        notificarNuevasEmpresas: true,
        validarRUC: true,
        limiteEmpleados: 1000,
        sectoresHabilitados: ['Tecnología', 'Manufactura', 'Comercio']
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig({
            ...config,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para guardar configuración
        console.log('Guardando configuración:', config);
    };

    return (
        <>
            <Head title="Configuración de Empresas" />
            <div className={`min-h-screen transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
            }`}>
                <aside className={`w-72 fixed inset-y-0 left-0 shadow-xl transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                } border-r z-40`}>
                    <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                        <img src="https://megaequipamiento.pe/img/logo2.jpg" alt="Logo" className="h-16 w-auto" />
                    </div>
                    <nav className="p-4">
                        <div className="space-y-2">
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                                isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                            }`}>
                                <FiSettings className="w-5 h-5" />
                                <span className="font-medium text-sm">Configuración de Empresas</span>
                            </div>
                        </div>
                    </nav>
                </aside>

                <main className="ml-72 transition-all duration-300">
                    <header className={`sticky top-0 z-30 shadow-sm border-b transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
                    }`}>
                        <div className="px-6 py-4">
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
                    </header>

                    <div className="p-6">
                        <div className={`max-w-2xl mx-auto rounded-xl shadow-sm border p-6 ${
                            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                        }`}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        Configuraciones Generales
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className={`text-sm font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Permitir registro automático
                                                </label>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Las empresas pueden registrarse sin aprobación
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="permitirRegistroAutomatico"
                                                    checked={config.permitirRegistroAutomatico}
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className={`text-sm font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Notificar nuevas empresas
                                                </label>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Enviar notificación cuando se registre una nueva empresa
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="notificarNuevasEmpresas"
                                                    checked={config.notificarNuevasEmpresas}
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className={`text-sm font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Validar RUC automáticamente
                                                </label>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Verificar la validez del RUC al registrar
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="validarRUC"
                                                    checked={config.validarRUC}
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Límite máximo de empleados por empresa
                                    </label>
                                    <input
                                        type="number"
                                        name="limiteEmpleados"
                                        value={config.limiteEmpleados}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                                            isDarkMode 
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                        min="1"
                                        max="10000"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        <FiSave className="w-4 h-4" />
                                        Guardar Configuración
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-6 py-2 border rounded-lg transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Restablecer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}