import { router } from "@inertiajs/react";
import {
    FiHome, FiUsers, FiDollarSign, FiActivity, FiChevronDown,
    FiSettings, FiShoppingBag, FiBarChart, FiBell, FiSearch,
    FiTrendingUp, FiCalendar, FiMail, FiPhone, FiPackage, FiSun, FiMoon
} from "react-icons/fi";
import { useTheme } from '../../storage/ThemeContext';
import { useCRM } from '../../storage/CRMContext';

export default function CRMLayout({ children, title }) {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { expandedMenus, toggleMenu } = useCRM();

    const menuItems = [
        {
            title: "USUARIOS Y ROLES",
            icon: FiUsers,
            key: "usuarios-roles",
            items: [
                "Usuarios",
                "Roles"
            ]
        },
        {
            title: "NUESTRAS EMPRESAS",
            icon: FiHome,
            key: "empresas",
            items: [
                "Ver Empresas"
            ]
        },
        {
            title: "CLIENTES",
            icon: FiUsers,
            key: "clientes",
            items: [
                "Empleados y clientes particulares",
                "Empresas de clientes",
                "Areas de clientes"
            ]
        },
        {
            title: "PRODUCTOS Y SERVICIOS",
            icon: FiPackage,
            key: "productos",
            items: [
                "PRODUCTOS",
                "SERVICIOS",
                "TAXONOMIAS",
                "MARCAS",
                "PROCEDENCIAS",
                "CATEGORIAS",
                "MONEDAS"
            ]
        },
        {
            title: "COTIZACIONES",
            icon: FiBarChart,
            key: "cotizaciones",
            items: [
                "COTIZACIONES"
            ]
        },
        {
            title: "CONEXIONES APIS",
            icon: FiSettings,
            key: "apis",
            items: [
                "CONEXIONES API"
            ]
        }
    ];

    // Mapeo de rutas para navegación
    const routeMap = {
        // Usuarios y Roles
        "Usuarios": "/crm/usuarios",
        "Roles": "/crm/roles",

        // Nuestras Empresas
        "Ver Empresas": "/crm/empresas/ver-empresas",

        // Clientes
        "Empleados y clientes particulares": "/crm/clientes/empleados-clientes-particulares",
        "Empresas de clientes": "/crm/clientes/empresas-clientes",
        "Areas de clientes": "/crm/clientes/areas-clientes",

        // Productos y Servicios
        "PRODUCTOS": "/crm/productos-servicios/productos",
        "SERVICIOS": "/crm/productos-servicios/servicios",
        "TAXONOMIAS": "/crm/productos-servicios/taxonomias",
        "MARCAS": "/crm/productos-servicios/marcas",
        "PROCEDENCIAS": "/crm/productos-servicios/procedencias",
        "CATEGORIAS": "/crm/productos-servicios/categorias",
        "MONEDAS": "/crm/productos-servicios/monedas",

        // Cotizaciones
        "COTIZACIONES": "/crm/cotizaciones/cotizaciones",

        // Conexiones APIs
        "CONEXIONES API": "/crm/apis/conexiones-api"
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
        }`}>
            {/* Sidebar Completo */}
            <aside className={`w-72 fixed inset-y-0 left-0 shadow-xl transition-colors duration-300 flex flex-col ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
            } border-r z-40`}>

                {/* Logo/Brand Section */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div>
                            <img
                                src="https://megaequipamiento.pe/img/logo2.jpg"
                                alt="CRM Pro Logo"
                                className="h-16 w-auto cursor-pointer"
                                onClick={() => router.visit('/crm/dashboard')}
                            />
                        </div>
                    </div>
                </div>

                {/* User Profile Section */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <span className="text-white text-lg font-bold">EK</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold truncate ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                Ezra Kreiger
                            </h3>
                            <p className={`text-sm truncate ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Administrador
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                        {menuItems.map((item, index) => (
                            <div key={index} className="mb-2">
                                <div
                                    onClick={() => toggleMenu(item.key)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                                        expandedMenus[item.key]
                                            ? (isDarkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-700 shadow-sm')
                                            : (isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900')
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-medium text-sm flex-1">{item.title}</span>
                                    <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                                        expandedMenus[item.key] ? 'rotate-180' : ''
                                    }`} />
                                </div>

                                {/* Submenu desplegable */}
                                {expandedMenus[item.key] && (
                                    <div className="ml-8 mt-2 space-y-1">
                                        {item.items.map((subItem, subIndex) => (
                                            <div
                                                key={subIndex}
                                                onClick={() => router.visit(routeMap[subItem])}
                                                className={`px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors duration-200 ${
                                                    isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                                }`}
                                            >
                                                {subItem}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="ml-72 transition-all duration-300">
                {/* Top Header */}
                <header className={`sticky top-0 z-30 shadow-sm border-b transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur-sm' : 'bg-white/95 border-gray-200 backdrop-blur-sm'
                }`}>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {title || 'CRM Dashboard'}
                                </h1>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Panel de Control del Sistema CRM
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Theme Toggle Button */}
                                <button
                                    onClick={toggleDarkMode}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        isDarkMode 
                                            ? 'hover:bg-gray-800 text-yellow-400 hover:text-yellow-300' 
                                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                                    }`}
                                    title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                                >
                                    {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                                </button>

                                {/* Search Bar */}
                                <div className="relative">
                                    <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className={`pl-10 pr-4 py-2 w-64 rounded-lg border transition-colors duration-300 ${
                                            isDarkMode
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    />
                                </div>

                                {/* Notifications */}
                                <div className="relative">
                                    <button className={`p-2 rounded-lg transition-colors duration-200 ${
                                        isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                    }`}>
                                        <FiBell className="w-5 h-5" />
                                    </button>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                {children}
            </main>
        </div>
    );
}