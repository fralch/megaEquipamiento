import { Head } from "@inertiajs/react";
import { 
    FiHome, FiUsers, FiDollarSign, FiActivity, FiChevronDown, 
    FiSettings, FiShoppingBag, FiBarChart, FiBell, FiSearch,
    FiTrendingUp, FiCalendar, FiMail, FiPhone, FiPackage
} from "react-icons/fi";
import { useTheme } from '../../storage/ThemeContext';
import { useState } from 'react';

export default function CrmDashboard() {
    const { isDarkMode } = useTheme();
    
    // Estado para manejar qué secciones del menú están expandidas
    const [expandedMenus, setExpandedMenus] = useState({
        'usuarios-roles': true, // Por defecto expandido
        'empresas': false,
        'clientes': false,
        'productos': false,
        'cotizaciones': false,
        'apis': false
    });

    // Función para alternar la expansión de un menú
    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    // Datos de ejemplo para las métricas
    const stats = [
        {
            title: "Total Productos",
            value: "1,234",
            change: "+12%",
            icon: FiUsers,
            color: "blue",
            trend: "up"
        },
        {
            title: "Cotizaciones Activas",
            value: "56",
            change: "+8%",
            icon: FiBarChart,
            color: "green",
            trend: "up"
        },
        {
            title: "Ventas del Mes",
            value: "$24,580",
            change: "+15%",
            icon: FiDollarSign,
            color: "purple",
            trend: "up"
        },
        {
            title: "Ventas Pendientes",
            value: "18",
            change: "-5%",
            icon: FiActivity,
            color: "orange",
            trend: "down"
        }
    ];

    const menuItems = [
        {
            title: "USUARIOS Y ROLES",
            icon: FiUsers,
            key: "usuarios-roles",
            items: [
                "Empleados y clientes particulares",
                "Empresas de clientes", 
                "Areas de clientes"
            ]
        },
        {
            title: "NUESTRAS EMPRESAS",
            icon: FiHome,
            key: "empresas",
            items: [
                "Ver Empresas",
                "Agregar Empresa", 
                "Configuración de Empresas"
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

    return (
        <>
            <Head title="CRM Dashboard" />
            <div className={`min-h-screen transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
            }`}>
                {/* Sidebar Mejorado */}
                <aside className={`w-72 fixed inset-y-0 left-0 shadow-xl transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                } border-r z-40`}>
                    
                    {/* Logo/Brand Section */}
                    <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl font-bold">C</span>
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    CRM Pro
                                </h2>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Panel de Control
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* User Profile Section Mejorado */}
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

                    {/* Navigation Menu Mejorado */}
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
                                                <div key={subIndex} className={`px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors duration-200 ${
                                                    isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                                }`}>
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
                    {/* Top Header Mejorado */}
                    <header className={`sticky top-0 z-30 shadow-sm border-b transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur-sm' : 'bg-white/95 border-gray-200 backdrop-blur-sm'
                    }`}>
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Bienvenido de nuevo, Ezra
                                    </h1>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Aquí tienes un resumen de tu actividad hoy
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
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

                    {/* Dashboard Content */}
                    <div className="p-6 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className={`rounded-xl shadow-sm border p-6 transition-all duration-300 hover:shadow-lg ${
                                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm font-medium ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {stat.title}
                                            </p>
                                            <p className={`text-2xl font-bold mt-1 ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {stat.value}
                                            </p>
                                            <div className={`flex items-center gap-1 mt-2 text-sm ${
                                                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                <FiTrendingUp className="w-4 h-4" />
                                                <span>{stat.change}</span>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-full ${
                                            stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                            stat.color === 'green' ? 'bg-green-100 text-green-600' :
                                            stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                            'bg-orange-100 text-orange-600'
                                        }`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className={`rounded-xl shadow-sm border p-6 ${
                            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                        }`}>
                            <h3 className={`text-lg font-semibold mb-4 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                Acciones Rápidas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors duration-200">
                                    <FiUsers className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Agregar Cliente</div>
                                        <div className="text-sm opacity-70">Registrar nuevo cliente</div>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-4 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors duration-200">
                                    <FiBarChart className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Nueva Cotización</div>
                                        <div className="text-sm opacity-70">Crear cotización</div>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors duration-200">
                                    <FiDollarSign className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Agregar Producto</div>
                                        <div className="text-sm opacity-70">Nuevo producto/servicio</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity & Upcoming Tasks */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <div className={`rounded-xl shadow-sm border p-6 ${
                                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                            }`}>
                                <h3 className={`text-lg font-semibold mb-4 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Actividad Reciente
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { action: "Nueva cotización creada", client: "Empresa ABC", time: "Hace 2 horas", icon: FiBarChart },
                                        { action: "Cliente actualizado", client: "Juan Pérez", time: "Hace 4 horas", icon: FiUsers },
                                        { action: "Producto agregado", client: "Servicio Premium", time: "Ayer", icon: FiDollarSign }
                                    ].map((activity, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                                <activity.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {activity.action}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {activity.client} • {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upcoming Tasks */}
                            <div className={`rounded-xl shadow-sm border p-6 ${
                                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                            }`}>
                                <h3 className={`text-lg font-semibold mb-4 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Tareas Próximas
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { task: "Llamar a cliente potencial", due: "Hoy, 2:00 PM", priority: "high", icon: FiPhone },
                                        { task: "Revisar cotización #1234", due: "Mañana, 10:00 AM", priority: "medium", icon: FiBarChart },
                                        { task: "Enviar propuesta por email", due: "Viernes, 9:00 AM", priority: "low", icon: FiMail }
                                    ].map((task, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                            <div className={`p-2 rounded-full ${
                                                task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                                <task.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {task.task}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {task.due}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
