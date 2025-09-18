
import { Head } from "@inertiajs/react";
import { FiHome, FiUsers, FiDollarSign, FiActivity, FiChevronDown, FiSettings, FiShoppingBag, FiBarChart } from "react-icons/fi";
import { useTheme } from '../../storage/ThemeContext';

export default function CrmDashboard() {
    const { isDarkMode } = useTheme();

    return (
        <>
            <Head title="CRM Dashboard" />
            <div className={`min-h-screen transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
                {/* Sidebar */}
                <aside className={`w-64 fixed inset-y-0 left-0 shadow-lg transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border-r`}>
                    {/* User Profile Section */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                    <span className="text-white text-2xl font-bold">EK</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">0</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className={`font-semibold transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Bienvenido, Ezra Kreiger
                                </h3>
                                <p className={`text-sm transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Email: green.jayda@example.org
                                </p>
                                <p className={`text-xs transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    Cargo: Mr. Emery Roth
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-4">
                        <div className="space-y-2">
                            <div className="mb-4">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                                }`}>
                                    <FiUsers className="w-5 h-5" />
                                    <span className="font-medium">USUARIOS Y ROLES</span>
                                    <FiChevronDown className="w-4 h-4 ml-auto" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiShoppingBag className="w-5 h-5" />
                                    <span className="font-medium">NUESTRAS EMPRESAS</span>
                                    <FiChevronDown className="w-4 h-4 ml-auto" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiUsers className="w-5 h-5" />
                                    <span className="font-medium">CLIENTES</span>
                                    <FiChevronDown className="w-4 h-4 ml-auto" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiDollarSign className="w-5 h-5" />
                                    <span className="font-medium">PRODUCTOS Y SERVICIOS</span>
                                    <FiChevronDown className="w-4 h-4 ml-auto" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiBarChart className="w-5 h-5" />
                                    <span className="font-medium">COTIZACIONES</span>
                                    <FiChevronDown className="w-4 h-4 ml-auto" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiSettings className="w-5 h-5" />
                                    <span className="font-medium">CONEXIONES APIS</span>
                                    <FiChevronDown className="w-4 h-4 ml-auto" />
                                </div>
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="ml-64 transition-all duration-300">
                    {/* Top Header */}
                    <header className={`shadow-sm border-b transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    bienvenido
                                </h1>
                                <div className="flex items-center gap-4">
                                    <div className={`text-sm transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        Panel de Control
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Welcome Content */}
                    <div className="p-8">
                        <div className={`rounded-lg shadow-sm border transition-colors duration-300 ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <div className="p-8 text-center">
                                <div className="mb-6">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                        <FiHome className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                
                                <h2 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    ¡Bienvenido al Panel CRM!
                                </h2>
                                
                                <p className={`text-lg mb-8 max-w-2xl mx-auto transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    Gestiona tus clientes, productos, servicios y cotizaciones desde un solo lugar. 
                                    Utiliza el menú lateral para navegar entre las diferentes secciones del sistema.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                    <div className={`p-6 rounded-lg border transition-colors duration-300 ${
                                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <FiUsers className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${
                                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                        }`} />
                                        <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Gestión de Clientes
                                        </h3>
                                        <p className={`text-sm transition-colors duration-300 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            Administra tu base de clientes y mantén un seguimiento detallado
                                        </p>
                                    </div>

                                    <div className={`p-6 rounded-lg border transition-colors duration-300 ${
                                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <FiDollarSign className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${
                                            isDarkMode ? 'text-green-400' : 'text-green-600'
                                        }`} />
                                        <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Productos y Servicios
                                        </h3>
                                        <p className={`text-sm transition-colors duration-300 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            Controla tu catálogo de productos y servicios ofrecidos
                                        </p>
                                    </div>

                                    <div className={`p-6 rounded-lg border transition-colors duration-300 ${
                                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <FiBarChart className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${
                                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                        }`} />
                                        <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Cotizaciones
                                        </h3>
                                        <p className={`text-sm transition-colors duration-300 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            Crea y gestiona cotizaciones para tus clientes potenciales
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
