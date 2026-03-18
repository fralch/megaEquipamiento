import { Head, router, usePage } from "@inertiajs/react";
import {
    FiHome, FiUsers, FiDollarSign, FiActivity, FiChevronDown,
    FiSettings, FiShoppingBag, FiBarChart, FiBell, FiSearch,
    FiTrendingUp, FiCalendar, FiMail, FiPhone, FiPackage
} from "react-icons/fi";
import { useTheme } from '../../storage/ThemeContext';
import CRMLayout from './CRMLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

export default function CrmDashboard() {
    const { isDarkMode } = useTheme();
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [actividadReciente, setActividadReciente] = useState([]);
    const [tareasProximas, setTareasProximas] = useState([]);
    
    // Chart states
    const [evolutionCharts, setEvolutionCharts] = useState({ daily: [], weekly: [], monthly: [] });
    const [chartPeriod, setChartPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'
    const [loadingCharts, setLoadingCharts] = useState(true);

    // Helper format currency
    const formatCurrency = (amount) => {
        return `S/ ${parseFloat(amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Get chart data based on period
    const getChartData = () => {
        switch (chartPeriod) {
            case 'daily': return evolutionCharts.daily || [];
            case 'weekly': return evolutionCharts.weekly || [];
            case 'monthly': return evolutionCharts.monthly || [];
            default: return [];
        }
    };

    // Custom tooltip for chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <p className="font-bold mb-2">{label}</p>
                    <p className="text-sm text-blue-500">
                        Monto: {formatCurrency(payload[0]?.value)}
                    </p>
                    <p className="text-sm text-orange-500">
                        Cantidad: {payload[1]?.value}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Fetch dashboard statistics and charts
    useEffect(() => {
        const fetchEstadisticas = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/crm/dashboard/estadisticas');

                if (response.data.success) {
                    const data = response.data.data;

                    // Mapear datos a las estadísticas
                    const statsData = [
                        {
                            title: "Total Productos",
                            value: data.stats.total_productos.toLocaleString(),
                            change: "+12%",
                            icon: FiPackage,
                            color: "blue",
                            trend: "up"
                        },
                        {
                            title: "Cotizaciones Activas",
                            value: data.stats.cotizaciones_activas,
                            change: data.stats.cambio_cotizaciones >= 0
                                ? `+${data.stats.cambio_cotizaciones}%`
                                : `${data.stats.cambio_cotizaciones}%`,
                            icon: FiBarChart,
                            color: "green",
                            trend: data.stats.cambio_cotizaciones >= 0 ? "up" : "down"
                        },
                        {
                            title: "Ventas del Mes",
                            value: `S/ ${parseFloat(data.stats.ventas_mes).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            change: data.stats.cambio_ventas >= 0
                                ? `+${data.stats.cambio_ventas}%`
                                : `${data.stats.cambio_ventas}%`,
                            icon: FiDollarSign,
                            color: "purple",
                            trend: data.stats.cambio_ventas >= 0 ? "up" : "down"
                        },
                        {
                            title: "Cotizaciones Pendientes",
                            value: data.stats.cotizaciones_pendientes,
                            change: data.stats.cambio_pendientes >= 0
                                ? `+${data.stats.cambio_pendientes}%`
                                : `${data.stats.cambio_pendientes}%`,
                            icon: FiActivity,
                            color: "orange",
                            trend: data.stats.cambio_pendientes >= 0 ? "up" : "down"
                        }
                    ];

                    setStats(statsData);
                    setActividadReciente(data.actividad_reciente);
                    setTareasProximas(data.tareas_proximas);
                }
            } catch (error) {
                console.error('Error al obtener estadísticas:', error);
                // Set default empty stats on error
                setStats([
                    {
                        title: "Total Productos",
                        value: "0",
                        change: "0%",
                        icon: FiPackage,
                        color: "blue",
                        trend: "up"
                    },
                    {
                        title: "Cotizaciones Activas",
                        value: "0",
                        change: "0%",
                        icon: FiBarChart,
                        color: "green",
                        trend: "up"
                    },
                    {
                        title: "Ventas del Mes",
                        value: "S/ 0.00",
                        change: "0%",
                        icon: FiDollarSign,
                        color: "purple",
                        trend: "up"
                    },
                    {
                        title: "Cotizaciones Pendientes",
                        value: "0",
                        change: "0%",
                        icon: FiActivity,
                        color: "orange",
                        trend: "up"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        const fetchGraficos = async () => {
            try {
                setLoadingCharts(true);
                const response = await axios.get('/crm/dashboard/graficos');
                if (response.data.success) {
                    setEvolutionCharts(response.data.data.evolution_charts || { daily: [], weekly: [], monthly: [] });
                }
            } catch (error) {
                console.error('Error al obtener gráficos:', error);
            } finally {
                setLoadingCharts(false);
            }
        };

        fetchEstadisticas();
        fetchGraficos();
    }, []);


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
                        {loading ? (
                            // Loading skeleton
                            [...Array(4)].map((_, index) => (
                                <div key={index} className={`rounded-xl shadow-sm border p-6 ${
                                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                                }`}>
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
                                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            stats.map((stat, index) => (
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
                                                stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                <FiTrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
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
                            ))
                        )}
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
                            <button
                                onClick={() => router.visit('/crm/clientes/particulares')}
                                className={`flex items-center gap-3 p-4 rounded-lg transition-colors duration-200 ${
                                    isDarkMode
                                        ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800/50'
                                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                }`}
                            >
                                <FiUsers className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Ver Clientes</div>
                                    <div className="text-sm opacity-70">Gestionar clientes</div>
                                </div>
                            </button>
                            <button
                                onClick={() => router.visit('/crm/cotizaciones')}
                                className={`flex items-center gap-3 p-4 rounded-lg transition-colors duration-200 ${
                                    isDarkMode
                                        ? 'bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-800/50'
                                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                                }`}
                            >
                                <FiBarChart className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Cotizaciones</div>
                                    <div className="text-sm opacity-70">Ver y crear cotizaciones</div>
                                </div>
                            </button>
                            <button
                                onClick={() => router.visit('/crm/productos')}
                                className={`flex items-center gap-3 p-4 rounded-lg transition-colors duration-200 ${
                                    isDarkMode
                                        ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50'
                                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                                }`}
                            >
                                <FiPackage className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Ver Productos</div>
                                    <div className="text-sm opacity-70">Gestionar productos</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Gráfico de Evolución de Ventas */}
                    <div className={`rounded-xl shadow-sm border p-6 ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <FiTrendingUp className="w-5 h-5" />
                                </div>
                                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Evolución de Ventas
                                </h3>
                            </div>
                            
                            <div className="flex bg-gray-100 p-1 rounded-lg dark:bg-gray-800">
                                <button
                                    onClick={() => setChartPeriod('daily')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                        chartPeriod === 'daily'
                                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    Últimos 7 días
                                </button>
                                <button
                                    onClick={() => setChartPeriod('weekly')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                        chartPeriod === 'weekly'
                                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    Últimas 4 semanas
                                </button>
                                <button
                                    onClick={() => setChartPeriod('monthly')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                        chartPeriod === 'monthly'
                                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    Últimos 12 meses
                                </button>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            {loadingCharts ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={getChartData()}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke={isDarkMode ? '#9ca3af' : '#6b7280'} 
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis 
                                            yAxisId="left"
                                            orientation="left"
                                            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => `S/ ${value}`}
                                        />
                                        <YAxis 
                                            yAxisId="right"
                                            orientation="right"
                                            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar 
                                            yAxisId="left"
                                            dataKey="monto" 
                                            name="Monto Total" 
                                            fill="#3b82f6" 
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="count" 
                                            name="Cantidad" 
                                            stroke="#f97316" 
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
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
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : actividadReciente.length > 0 ? (
                                    actividadReciente.map((activity, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg">
                                            <div className={`p-2 rounded-full ${
                                                isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                <FiBarChart className="w-4 h-4" />
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
                                    ))
                                ) : (
                                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <p className="text-sm">No hay actividad reciente</p>
                                    </div>
                                )}
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
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : tareasProximas.length > 0 ? (
                                    tareasProximas.map((task, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg">
                                            <div className={`p-2 rounded-full ${
                                                task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300' :
                                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                                'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'
                                            }`}>
                                                <FiCalendar className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {task.task}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {task.client} • {task.due}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <p className="text-sm">No hay tareas próximas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CRMLayout>
        </>
    );
}
