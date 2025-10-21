import { Head, router, usePage } from "@inertiajs/react";
import {
    FiHome, FiUsers, FiDollarSign, FiActivity, FiChevronDown,
    FiSettings, FiShoppingBag, FiBarChart, FiBell, FiSearch,
    FiTrendingUp, FiCalendar, FiMail, FiPhone, FiPackage
} from "react-icons/fi";
import { useTheme } from '../../storage/ThemeContext';
import CRMLayout from './CRMLayout';

export default function CrmDashboard() {
    const { isDarkMode } = useTheme();
    const { auth } = usePage().props;

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


    return (
        <>
            <Head title="CRM Dashboard" description="Panel de Control CRM" />
            <CRMLayout title={`Bienvenido, ${auth.user?.nombre || auth.user?.name || 'Usuario'}`}>
                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Aquí tienes un resumen de tu actividad hoy
                    </p>

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
                                        stat.color === 'blue' 
                                            ? (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600')
                                            : stat.color === 'green' 
                                            ? (isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600')
                                            : stat.color === 'purple' 
                                            ? (isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600')
                                            : (isDarkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-600')
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
                            <button className={`flex items-center gap-3 p-4 rounded-lg transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800/50' 
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                            }`}>
                                <FiUsers className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Agregar Cliente</div>
                                    <div className="text-sm opacity-70">Registrar nuevo cliente</div>
                                </div>
                            </button>
                            <button className={`flex items-center gap-3 p-4 rounded-lg transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-800/50' 
                                    : 'bg-green-50 hover:bg-green-100 text-green-700'
                            }`}>
                                <FiBarChart className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Nueva Cotización</div>
                                    <div className="text-sm opacity-70">Crear cotización</div>
                                </div>
                            </button>
                            <button className={`flex items-center gap-3 p-4 rounded-lg transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50' 
                                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                            }`}>
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
                                        <div className={`p-2 rounded-full ${
                                            isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
                                        }`}>
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
            </CRMLayout>
        </>
    );
}
