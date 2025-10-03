import { Head } from "@inertiajs/react";
import { FiAward, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';

export default function Marcas() {
    const { isDarkMode } = useTheme();

    const marcas = [
        { id: 1, nombre: "Caterpillar", descripcion: "Maquinaria pesada y equipos de construcción", pais: "Estados Unidos", estado: "Activo", productos: 45 },
        { id: 2, nombre: "Komatsu", descripcion: "Equipos de construcción y minería", pais: "Japón", estado: "Activo", productos: 32 },
        { id: 3, nombre: "Volvo", descripcion: "Maquinaria de construcción", pais: "Suecia", estado: "Activo", productos: 28 },
        { id: 4, nombre: "JCB", descripcion: "Equipos de construcción", pais: "Reino Unido", estado: "Inactivo", productos: 15 },
        { id: 5, nombre: "Liebherr", descripcion: "Grúas y equipos de construcción", pais: "Alemania", estado: "Activo", productos: 22 }
    ];

    return (
        <>
            <Head title="Marcas" />
            <CRMLayout title="Marcas">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Gestión de Marcas
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra las marcas de productos y equipos
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FiPlus className="w-4 h-4" />
                            Agregar Marca
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
                                    }`}>País</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Productos</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Estado</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {marcas.map((marca) => (
                                    <tr key={marca.id} className={`${
                                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{marca.nombre}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{marca.pais}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{marca.productos}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap`}>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                marca.estado === 'Activo' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {marca.estado}
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