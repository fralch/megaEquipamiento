import { Head } from "@inertiajs/react";
import { FiMapPin, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';

export default function AreasClientes() {
    const { isDarkMode } = useTheme();

    const areas = [
        { id: 1, nombre: "Ventas", descripcion: "Área de ventas y comercialización", empleados: 15, estado: "Activo" },
        { id: 2, nombre: "Soporte Técnico", descripcion: "Soporte y mantenimiento", empleados: 8, estado: "Activo" },
        { id: 3, nombre: "Administración", descripcion: "Gestión administrativa", empleados: 5, estado: "Inactivo" },
        { id: 4, nombre: "Logística", descripcion: "Distribución y logística", empleados: 12, estado: "Activo" }
    ];

    return (
        <>
            <Head title="Áreas de Clientes" />
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
                                <FiMapPin className="w-5 h-5" />
                                <span className="font-medium text-sm">Áreas de Clientes</span>
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
                                        Áreas de Clientes
                                    </h1>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <FiPlus className="w-4 h-4" />
                                    Agregar Área
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="p-6">
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
                </main>
            </div>
        </>
    );
}