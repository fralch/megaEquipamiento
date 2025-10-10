import { Head, router } from "@inertiajs/react";
import { FiBarChart, FiEdit, FiTrash2, FiPlus, FiEye, FiSearch, FiDownload, FiSend, FiClock, FiUser, FiCalendar } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import { useState, useEffect } from 'react';
import CRMLayout from '../CRMLayout';
import ShowCotizaciones from './components/ShowCotizaciones';
import CreateCotizaciones from './components/CreateCotizaciones';
import EditCotizaciones from './components/EditCotizaciones';
import axios from 'axios';

export default function Cotizaciones({ cotizaciones: initialCotizaciones = [], pagination: initialPagination = null, filters: initialFilters = {} }) {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [filterEstado, setFilterEstado] = useState(initialFilters.estado || 'all');
    const [activeModal, setActiveModal] = useState(null);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);
    const [cotizaciones, setCotizaciones] = useState(initialCotizaciones);
    const [pagination, setPagination] = useState(initialPagination);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        monto_total: 0,
        pendientes: 0,
        aprobadas: 0,
    });
    const [loading, setLoading] = useState(false);

    // Cargar estadísticas
    useEffect(() => {
        fetchEstadisticas();
    }, []);

    // Cargar cotizaciones cuando cambian los filtros
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCotizaciones();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filterEstado]);

    const fetchEstadisticas = async () => {
        try {
            const response = await axios.get('/crm/cotizaciones/estadisticas');
            if (response.data.success) {
                setEstadisticas(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const fetchCotizaciones = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (filterEstado !== 'all') params.estado = filterEstado;

            const response = await axios.get('/crm/cotizaciones', { params });

            if (response.data.data) {
                setCotizaciones(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    per_page: response.data.per_page,
                    total: response.data.total,
                });
            }
        } catch (error) {
            console.error('Error al cargar cotizaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Está seguro de eliminar esta cotización?')) return;

        try {
            const response = await axios.delete(`/crm/cotizaciones/${id}/delete`);
            if (response.data.success) {
                fetchCotizaciones();
                fetchEstadisticas();
                alert('Cotización eliminada exitosamente');
            }
        } catch (error) {
            console.error('Error al eliminar cotización:', error);
            alert('Error al eliminar cotización');
        }
    };

    const handleShowDetails = async (cotizacion) => {
        try {
            const response = await axios.get(`/crm/cotizaciones/${cotizacion.id}`);
            if (response.data.success) {
                setSelectedCotizacion(response.data.data);
                setActiveModal('show');
            }
        } catch (error) {
            console.error('Error al cargar detalles:', error);
            alert('Error al cargar detalles de la cotización');
        }
    };

    const handleEdit = async (cotizacion) => {
        try {
            const response = await axios.get(`/crm/cotizaciones/${cotizacion.id}`);
            if (response.data.success) {
                setSelectedCotizacion(response.data.data);
                setActiveModal('edit');
            }
        } catch (error) {
            console.error('Error al cargar cotización:', error);
            alert('Error al cargar cotización');
        }
    };

    const handleCreate = () => {
        setSelectedCotizacion(null);
        setActiveModal('create');
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedCotizacion(null);
    };

    const handleSaveSuccess = () => {
        closeModal();
        fetchCotizaciones();
        fetchEstadisticas();
    };

    const getEstadoInfo = (estado) => {
        const estados = {
            'pendiente': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
            'enviada': { label: 'Enviada', color: 'bg-blue-100 text-blue-800', icon: FiSend },
            'aprobada': { label: 'Aprobada', color: 'bg-green-100 text-green-800', icon: FiEye },
            'rechazada': { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: FiTrash2 },
            'negociacion': { label: 'En Negociación', color: 'bg-purple-100 text-purple-800', icon: FiUser }
        };
        return estados[estado] || estados['pendiente'];
    };

    const formatCurrency = (amount, currency = 'soles') => {
        const symbol = currency === 'dolares' ? '$' : 'S/';
        return `${symbol} ${parseFloat(amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-PE');
    };

    const estadisticasDisplay = [
        {
            titulo: "Total Cotizaciones",
            valor: estadisticas.total?.toString() || '0',
            color: "blue"
        },
        {
            titulo: "Monto Total",
            valor: formatCurrency(estadisticas.monto_total || 0),
            color: "green"
        },
        {
            titulo: "Pendientes",
            valor: estadisticas.pendientes?.toString() || '0',
            color: "yellow"
        },
        {
            titulo: "Aprobadas",
            valor: estadisticas.aprobadas?.toString() || '0',
            color: "purple"
        }
    ];

    return (
        <>
            <Head title="Cotizaciones" />
            <CRMLayout title="Gestión de Cotizaciones">
                <div className="p-6">

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {estadisticasDisplay.map((stat, index) => (
                            <div key={index} className={`rounded-xl shadow-sm border p-6 transition-all duration-300 hover:shadow-lg ${
                                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            {stat.titulo}
                                        </p>
                                        <p className={`text-2xl font-bold mt-1 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {stat.valor}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${
                                        stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                        stat.color === 'green' ? 'bg-green-100 text-green-600' :
                                        stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-purple-100 text-purple-600'
                                    }`}>
                                        <FiBarChart className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controles */}
                    <div className={`rounded-xl shadow-sm border p-6 mb-6 ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Búsqueda */}
                                <div className="relative">
                                    <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                    <input
                                        type="text"
                                        placeholder="Buscar cotizaciones..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`pl-10 pr-4 py-2 w-64 rounded-lg border ${
                                            isDarkMode
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                                    />
                                </div>

                                {/* Filtro por estado */}
                                <select
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                    className={`px-4 py-2 rounded-lg border ${
                                        isDarkMode
                                            ? 'bg-gray-800 border-gray-700 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="pendiente">Pendientes</option>
                                    <option value="enviada">Enviadas</option>
                                    <option value="aprobada">Aprobadas</option>
                                    <option value="rechazada">Rechazadas</option>
                                    <option value="negociacion">En Negociación</option>
                                </select>
                            </div>

                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <FiPlus className="w-4 h-4" />
                                Nueva Cotización
                            </button>
                        </div>
                    </div>

                    {/* Tabla de cotizaciones */}
                    <div className={`rounded-xl shadow-sm border overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <tr>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    Cotización
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    Cliente
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    Monto
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    Fechas
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    Estado
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                            {cotizaciones && cotizaciones.length > 0 ? (
                                                cotizaciones.map((cotizacion) => {
                                                    const estadoInfo = getEstadoInfo(cotizacion.estado);
                                                    const EstadoIcon = estadoInfo.icon;
                                                    return (
                                                        <tr key={cotizacion.id} className={`hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {cotizacion.numero}
                                                                    </div>
                                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        Vendedor: {cotizacion.vendedor_nombre || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {cotizacion.cliente_nombre || 'N/A'}
                                                                    </div>
                                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {cotizacion.cliente_contacto || ''}
                                                                    </div>
                                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {cotizacion.cliente_email || ''}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {formatCurrency(cotizacion.total, cotizacion.moneda)}
                                                                    </div>
                                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        Productos: {formatCurrency(cotizacion.total_monto_productos, cotizacion.moneda)}
                                                                    </div>
                                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        Adicionales: {formatCurrency(cotizacion.total_adicionales_monto, cotizacion.moneda)}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="flex items-center gap-1">
                                                                        <FiCalendar className="w-3 h-3 text-gray-400" />
                                                                        <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                            {formatDate(cotizacion.fecha_cotizacion)}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        Vence: {formatDate(cotizacion.fecha_vencimiento)}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <EstadoIcon className="w-4 h-4" />
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.color}`}>
                                                                        {estadoInfo.label}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleShowDetails(cotizacion)}
                                                                        className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors duration-200"
                                                                        title="Ver detalles"
                                                                    >
                                                                        <FiEye className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEdit(cotizacion)}
                                                                        className="p-1 rounded hover:bg-yellow-100 text-yellow-600 transition-colors duration-200"
                                                                        title="Editar"
                                                                    >
                                                                        <FiEdit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(cotizacion.id)}
                                                                        className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors duration-200"
                                                                        title="Eliminar"
                                                                    >
                                                                        <FiTrash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center">
                                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            No hay cotizaciones para mostrar
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer con información adicional */}
                                <div className={`px-6 py-3 border-t ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                            Mostrando <span className="font-medium">{cotizaciones?.length || 0}</span> cotizaciones
                                            {pagination && <span> de <span className="font-medium">{pagination.total}</span></span>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Modals */}
                {activeModal === 'show' && selectedCotizacion && (
                    <ShowCotizaciones
                        isOpen={activeModal === 'show'}
                        cotizacion={selectedCotizacion}
                        onClose={closeModal}
                    />
                )}

                {activeModal === 'create' && (
                    <CreateCotizaciones
                        isOpen={activeModal === 'create'}
                        onClose={closeModal}
                        onSave={handleSaveSuccess}
                    />
                )}

                {activeModal === 'edit' && selectedCotizacion && (
                    <EditCotizaciones
                        isOpen={activeModal === 'edit'}
                        cotizacion={selectedCotizacion}
                        onClose={closeModal}
                        onSave={handleSaveSuccess}
                    />
                )}
            </CRMLayout>
        </>
    );
}
