import { Head } from "@inertiajs/react";
import { FiTag, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';

export default function Taxonomias() {
    const { isDarkMode } = useTheme();

    const taxonomias = [
        { id: 1, nombre: "Maquinaria Pesada", descripcion: "Equipos de gran tamaño para construcción", nivel: "Nivel 1", estado: "Activo", productos: 35 },
        { id: 2, nombre: "Herramientas Manuales", descripcion: "Herramientas de uso manual", nivel: "Nivel 1", estado: "Activo", productos: 58 },
        { id: 3, nombre: "Equipos Eléctricos", descripcion: "Dispositivos que funcionan con electricidad", nivel: "Nivel 1", estado: "Activo", productos: 42 },
        { id: 4, nombre: "Accesorios", descripcion: "Complementos y repuestos", nivel: "Nivel 2", estado: "Activo", productos: 73 },
        { id: 5, nombre: "Equipos Obsoletos", descripcion: "Equipos descontinuados", nivel: "Nivel 1", estado: "Inactivo", productos: 8 }
    ];

    return (
        <>
            <Head title="Taxonomías" />
            <CRMLayout title="Taxonomías">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Gestión de Taxonomías
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra la clasificación jerárquica de productos
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FiPlus className="w-4 h-4" />
                            Agregar Taxonomía
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
                                    }`}>Tipo</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Descripción</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Productos</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {taxonomias.map((taxonomia) => (
                                    <tr key={taxonomia.id} className={`${
                                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{taxonomia.nombre}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{taxonomia.tipo}</td>
                                        <td className={`px-6 py-4 text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{taxonomia.descripcion}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{taxonomia.productos}</td>
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