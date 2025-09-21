import { Head } from "@inertiajs/react";
import { FiSettings, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../../../Components/CRM/CRMLayout';

export default function Servicios() {
    const { isDarkMode } = useTheme();

    const servicios = [
        { id: 1, nombre: "Mantenimiento Preventivo", descripcion: "Servicio de mantenimiento programado", categoria: "Mantenimiento", precio: "S/ 350.00", duracion: "2 horas", estado: "Activo" },
        { id: 2, nombre: "Reparación de Motores", descripcion: "Reparación especializada de motores", categoria: "Reparación", precio: "S/ 850.00", duracion: "4 horas", estado: "Activo" },
        { id: 3, nombre: "Instalación de Equipos", descripcion: "Instalación profesional de maquinaria", categoria: "Instalación", precio: "S/ 450.00", duracion: "3 horas", estado: "Activo" },
        { id: 4, nombre: "Consultoría Técnica", descripcion: "Asesoramiento técnico especializado", categoria: "Consultoría", precio: "S/ 200.00", duracion: "1 hora", estado: "Activo" },
        { id: 5, nombre: "Calibración de Instrumentos", descripcion: "Calibración de equipos de medición", categoria: "Calibración", precio: "S/ 180.00", duracion: "1.5 horas", estado: "Inactivo" }
    ];

    return (
        <>
            <Head title="Servicios" />
            <CRMLayout title="Servicios">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Gestión de Servicios
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra los servicios ofrecidos por la empresa
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FiPlus className="w-4 h-4" />
                            Agregar Servicio
                        </button>
                    </div>

                    <div className={`rounded-xl shadow-sm border overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <table className="w-full">
                            <thead className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Nombre</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Categoría</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Precio</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Duración</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Estado</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {servicios.map((servicio) => (
                                    <tr key={servicio.id} className={`${
                                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{servicio.nombre}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{servicio.categoria}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{servicio.precio}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{servicio.duracion}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap`}>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                servicio.estado === 'Activo'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {servicio.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <FiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CRMLayout>
        </>
    );
}