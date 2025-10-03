import { Head } from "@inertiajs/react";
import { FiDollarSign, FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';

export default function Monedas() {
    const { isDarkMode } = useTheme();

    const monedas = [
        { id: 1, nombre: "Sol Peruano", simbolo: "S/", codigo: "PEN", tasa: 1.0, estado: "Activo" },
        { id: 2, nombre: "Dólar Estadounidense", simbolo: "$", codigo: "USD", tasa: 3.75, estado: "Activo" },
        { id: 3, nombre: "Euro", simbolo: "€", codigo: "EUR", tasa: 4.05, estado: "Activo" },
        { id: 4, nombre: "Libra Esterlina", simbolo: "£", codigo: "GBP", tasa: 4.65, estado: "Inactivo" },
        { id: 5, nombre: "Peso Mexicano", simbolo: "MX$", codigo: "MXN", tasa: 0.19, estado: "Activo" }
    ];

    return (
        <>
            <Head title="Monedas" />
            <CRMLayout title="Monedas">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Gestión de Monedas
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra las monedas y tipos de cambio
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FiPlus className="w-4 h-4" />
                            Agregar Moneda
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
                                        }`}>Símbolo</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Código</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Tasa de Cambio</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Estado</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                    {monedas.map((moneda) => (
                                        <tr key={moneda.id} className={`${
                                            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                        }`}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{moneda.nombre}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>{moneda.simbolo}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>{moneda.codigo}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                            }`}>{moneda.tasa}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap`}>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    moneda.estado === 'Activo' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {moneda.estado}
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