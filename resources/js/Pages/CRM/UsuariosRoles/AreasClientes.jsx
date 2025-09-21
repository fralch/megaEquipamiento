import { Head } from "@inertiajs/react";
import { FiMapPin, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../../../Components/CRM/CRMLayout';

export default function AreasClientes() {
    const { isDarkMode } = useTheme();

    const areas = [
        { id: 1, nombre: "Ventas", descripcion: "Área encargada de las ventas", responsable: "Juan Pérez", empleados: 8, estado: "Activo" },
        { id: 2, nombre: "Marketing", descripcion: "Área de marketing y publicidad", responsable: "María García", empleados: 5, estado: "Activo" },
        { id: 3, nombre: "Soporte Técnico", descripcion: "Área de soporte y mantenimiento", responsable: "Carlos López", empleados: 12, estado: "Activo" },
        { id: 4, nombre: "Administración", descripcion: "Área administrativa y contable", responsable: "Ana Rodríguez", empleados: 6, estado: "Activo" },
        { id: 5, nombre: "Logística", descripcion: "Área de logística y distribución", responsable: "Pedro Martín", empleados: 10, estado: "Inactivo" }
    ];

    return (
        <>
            <Head title="Áreas de Clientes" />
            <CRMLayout title="Áreas de Clientes">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Gestión de Áreas de Clientes
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra las diferentes áreas de atención al cliente
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FiPlus className="w-4 h-4" />
                            Agregar Área
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
                                    }`}>Descripción</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Empleados</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Estado</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {areas.map((area) => (
                                    <tr key={area.id} className={`${
                                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{area.nombre}</td>
                                        <td className={`px-6 py-4 text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{area.descripcion}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{area.empleados}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap`}>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                area.estado === 'Activo' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {area.estado}
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