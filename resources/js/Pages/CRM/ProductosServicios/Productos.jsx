import { Head } from "@inertiajs/react";
import { FiPackage, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../../../Components/CRM/CRMLayout';

export default function Productos() {
    const { isDarkMode } = useTheme();

    const productos = [
        { id: 1, nombre: "Generador Eléctrico 500kW", categoria: "Equipamiento Industrial", precio: "S/ 45,000", stock: 5, estado: "Disponible" },
        { id: 2, nombre: "Compresor de Aire 10HP", categoria: "Herramientas", precio: "S/ 8,500", stock: 12, estado: "Disponible" },
        { id: 3, nombre: "Torre de Enfriamiento", categoria: "Equipamiento Industrial", precio: "S/ 25,000", stock: 0, estado: "Agotado" },
        { id: 4, nombre: "Motor Trifásico 5HP", categoria: "Motores", precio: "S/ 3,200", stock: 8, estado: "Disponible" },
        { id: 5, nombre: "Sistema de Bombeo", categoria: "Bombas", precio: "S/ 15,000", stock: 3, estado: "Disponible" }
    ];

    return (
        <>
            <Head title="Productos" />
            <CRMLayout title="Gestión de Productos">
                <div className="p-6">
                    <div className="mb-6 flex justify-end">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <FiPlus className="w-4 h-4" />
                            Agregar Producto
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
                                        }`}>Stock</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Estado</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                    {productos.map((producto) => (
                                        <tr key={producto.id} className={`${
                                            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                        }`}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{producto.nombre}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>{producto.categoria}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>{producto.precio}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>{producto.stock}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap`}>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    producto.estado === 'Disponible' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {producto.estado}
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