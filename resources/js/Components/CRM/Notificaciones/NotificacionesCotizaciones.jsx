import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import {
    FiBell,
    FiAlertTriangle,
    FiAlertCircle,
    FiX,
    FiCheck,
    FiTrash2,
    FiClock,
    FiExternalLink
} from 'react-icons/fi';
import { useNotificacionesCotizaciones } from '../../../hooks/useNotificacionesCotizaciones';

export default function NotificacionesCotizaciones({ isDarkMode = false }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [viewMode, setViewMode] = useState('todas'); // 'todas' | 'danger' | 'warning'
    const dropdownRef = useRef(null);

    // Estado para modal de detalle de cotización
    const [showDetail, setShowDetail] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);
    const [cotizacionDetalle, setCotizacionDetalle] = useState(null);

    // Hook personalizado para gestionar notificaciones
    const {
        notificaciones,
        loading,
        conteo,
        porUrgencia,
        fetchNotificaciones,
        fetchPorUrgencia,
        marcarComoVisualizada,
        marcarTodasComoVisualizadas,
        eliminarNotificacion
    } = useNotificacionesCotizaciones(true, null); // Solo carga inicial, sin auto-refresh

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cargar notificaciones por urgencia al abrir el dropdown
    useEffect(() => {
        if (showDropdown) {
            fetchPorUrgencia();
        }
    }, [showDropdown]);

    const handleMarcarVisualizada = async (notificacionId, e) => {
        e.stopPropagation();
        try {
            await marcarComoVisualizada(notificacionId);
        } catch (error) {
            console.error('Error al marcar notificación:', error);
        }
    };

    const handleEliminar = async (notificacionId, e) => {
        e.stopPropagation();
        try {
            await eliminarNotificacion(notificacionId);
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
        }
    };

    const handleMarcarTodas = async () => {
        try {
            await marcarTodasComoVisualizadas();
        } catch (error) {
            console.error('Error al marcar todas:', error);
        }
    };

    const handleVerCotizacion = async (cotizacionId, e) => {
        if (e) e.stopPropagation();
        setShowDropdown(false);
        setShowDetail(true);
        setDetailLoading(true);
        setDetailError(null);

        try {
            const res = await axios.get(`/crm/cotizaciones/${cotizacionId}`, {
                headers: { Accept: 'application/json' },
            });

            const payload = res?.data ?? {};
            setCotizacionDetalle({
                info: payload.data || payload,
                detalles: payload.detalles_productos || [],
                adicionales: payload.productos_adicionales || [],
                vendedor: payload.vendedor_data || null,
                empresa: payload.empresa || null,
                success: payload.success,
            });
        } catch (error) {
            console.error('Error al obtener detalle de cotización:', error);
            setDetailError('No se pudo cargar la cotización.');
        } finally {
            setDetailLoading(false);
        }
    };

    const getNotificacionesFiltradas = () => {
        if (viewMode === 'todas') {
            return [...porUrgencia.danger, ...porUrgencia.warning, ...porUrgencia.info];
        }
        return porUrgencia[viewMode] || [];
    };

    const getIconoUrgencia = (nivel) => {
        switch (nivel) {
            case 'danger':
                return <FiAlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
            default:
                return <FiClock className="w-5 h-5 text-blue-500" />;
        }
    };

    const getColorUrgencia = (nivel) => {
        switch (nivel) {
            case 'danger':
                return isDarkMode
                    ? 'border-red-800 bg-red-900/10 hover:bg-red-900/20'
                    : 'border-red-200 bg-red-50 hover:bg-red-100';
            case 'warning':
                return isDarkMode
                    ? 'border-yellow-800 bg-yellow-900/10 hover:bg-yellow-900/20'
                    : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
            default:
                return isDarkMode
                    ? 'border-blue-800 bg-blue-900/10 hover:bg-blue-900/20'
                    : 'border-blue-200 bg-blue-50 hover:bg-blue-100';
        }
    };

    const notificacionesFiltradas = getNotificacionesFiltradas();
    const totalDanger = porUrgencia.danger?.length || 0;
    const totalWarning = porUrgencia.warning?.length || 0;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de Notificaciones */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Notificaciones de cotizaciones"
            >
                <FiBell className="w-5 h-5" />

                {/* Badge de contador */}
                {conteo > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-white bg-red-500 rounded-full px-1">
                        {conteo > 99 ? '99+' : conteo}
                    </span>
                )}

                {/* Indicador de urgencia */}
                {totalDanger > 0 && (
                    <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                )}
            </button>

            {/* Dropdown de Notificaciones */}
            {showDropdown && (
                <div
                    className={`absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}
                >
                    {/* Header */}
                    <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Notificaciones
                            </h3>
                            {conteo > 0 && (
                                <button
                                    onClick={handleMarcarTodas}
                                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
                                        isDarkMode
                                            ? 'text-blue-400 hover:bg-gray-800'
                                            : 'text-blue-600 hover:bg-blue-50'
                                    }`}
                                    title="Marcar todas como leídas"
                                >
                                    <FiCheck className="w-3 h-3" />
                                    Marcar todas
                                </button>
                            )}
                        </div>

                        {/* Filtros de urgencia */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('todas')}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    viewMode === 'todas'
                                        ? 'bg-blue-600 text-white'
                                        : isDarkMode
                                        ? 'bg-gray-800 text-gray-400 hover:text-white'
                                        : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Todas ({conteo})
                            </button>
                            {totalDanger > 0 && (
                                <button
                                    onClick={() => setViewMode('danger')}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                        viewMode === 'danger'
                                            ? 'bg-red-600 text-white'
                                            : isDarkMode
                                            ? 'bg-gray-800 text-red-400 hover:text-red-300'
                                            : 'bg-gray-100 text-red-600 hover:text-red-700'
                                    }`}
                                >
                                    <FiAlertCircle className="w-3 h-3" />
                                    Crítico ({totalDanger})
                                </button>
                            )}
                            {totalWarning > 0 && (
                                <button
                                    onClick={() => setViewMode('warning')}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                        viewMode === 'warning'
                                            ? 'bg-yellow-600 text-white'
                                            : isDarkMode
                                            ? 'bg-gray-800 text-yellow-400 hover:text-yellow-300'
                                            : 'bg-gray-100 text-yellow-600 hover:text-yellow-700'
                                    }`}
                                >
                                    <FiAlertTriangle className="w-3 h-3" />
                                    Alerta ({totalWarning})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista de Notificaciones */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : notificacionesFiltradas.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {notificacionesFiltradas.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 border-l-4 cursor-pointer transition-all ${getColorUrgencia(
                                            notif.nivel_urgencia
                                        )}`}
                                      
                                    >
                                        <div className="flex items-start gap-3">
                                            {getIconoUrgencia(notif.nivel_urgencia)}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4
                                                        className={`text-sm font-semibold truncate ${
                                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {notif.cotizacion?.numero || 'Cotización'}
                                                    </h4>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                                            notif.nivel_urgencia === 'danger'
                                                                ? 'bg-red-600 text-white'
                                                                : notif.nivel_urgencia === 'warning'
                                                                ? 'bg-yellow-600 text-white'
                                                                : 'bg-blue-600 text-white'
                                                        }`}
                                                    >
                                                        {notif.dias_vencimiento} días
                                                    </span>
                                                </div>

                                                <p
                                                    className={`text-xs mb-2 ${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}
                                                >
                                                    {notif.mensaje}
                                                </p>

                                                {notif.cotizacion && (
                                                    <div
                                                        className={`text-xs ${
                                                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                                        }`}
                                                    >
                                                        Cliente:{' '}
                                                        {notif.cotizacion.cliente_nombre || 'Sin cliente'}
                                                    </div>
                                                )}

                                                {/* Acciones */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={(e) => handleMarcarVisualizada(notif.id, e)}
                                                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                                            isDarkMode
                                                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                        title="Marcar como leída"
                                                    >
                                                        <FiCheck className="w-3 h-3" />
                                                        Marcar como notificacion leída
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <FiBell
                                    className={`w-12 h-12 mb-3 ${
                                        isDarkMode ? 'text-gray-700' : 'text-gray-300'
                                    }`}
                                />
                                <p
                                    className={`text-sm font-medium ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                                >
                                    No hay notificaciones
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Todas las cotizaciones están al día
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notificacionesFiltradas.length > 0 && (
                        <div
                            className={`px-4 py-3 border-t ${
                                isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
                            }`}
                        >
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    router.visit('/crm/cotizaciones');
                                }}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Ver todas las cotizaciones
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Detalle de Cotización */}
            {showDetail && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
                    <div
                        className={`w-full max-w-4xl mx-4 rounded-2xl shadow-2xl overflow-hidden ${
                            isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
                        }`}
                    >
                        {/* Header */}
                        <div className={`px-6 py-4 flex items-center justify-between ${isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-200'}`}>
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Detalle de Cotización
                            </h3>
                            <button
                                onClick={() => {
                                    setShowDetail(false);
                                    setCotizacionDetalle(null);
                                    setDetailError(null);
                                }}
                                className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                                title="Cerrar"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            {detailLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                </div>
                            ) : detailError ? (
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>{detailError}</div>
                            ) : cotizacionDetalle ? (
                                <div className="space-y-6">
                                    {/* Resumen */}
                                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
                                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
                                            <div className="text-xs text-gray-500">Número</div>
                                            <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cotizacionDetalle.info?.numero || '—'}
                                            </div>
                                        </div>
                                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
                                            <div className="text-xs text-gray-500">Vencimiento</div>
                                            <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cotizacionDetalle.info?.fecha_vencimiento || cotizacionDetalle.info?.fecha_vencimiento_formateada || '—'}
                                            </div>
                                        </div>
                                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
                                            <div className="text-xs text-gray-500">Moneda</div>
                                            <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cotizacionDetalle.info?.moneda || '—'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cliente y Vendedor */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-sm font-medium mb-2">Cliente</div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {cotizacionDetalle.info?.cliente?.nombre || cotizacionDetalle.info?.cliente_nombre || 'Sin cliente'}
                                            </div>
                                        </div>
                                        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-sm font-medium mb-2">Vendedor</div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {cotizacionDetalle.vendedor?.nombre || '—'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalle de Productos */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold">Productos</h4>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className={`min-w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                    <tr>
                                                        <th className="text-left px-3 py-2">Producto</th>
                                                        <th className="text-right px-3 py-2">Cantidad</th>
                                                        <th className="text-right px-3 py-2">Precio</th>
                                                        <th className="text-right px-3 py-2">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cotizacionDetalle.detalles?.length ? (
                                                        cotizacionDetalle.detalles.map((d, idx) => (
                                                            <tr key={idx} className={`${isDarkMode ? 'border-gray-800' : 'border-gray-200'} border-b`}>
                                                                <td className="px-3 py-2">{d.producto?.nombre || d.producto_nombre || '—'}</td>
                                                                <td className="px-3 py-2 text-right">{d.cantidad ?? 1}</td>
                                                                <td className="px-3 py-2 text-right">{formatMoney(d.precio_unitario ?? d.precio)}</td>
                                                                <td className="px-3 py-2 text-right">{formatMoney(d.subtotal ?? (d.cantidad || 1) * ((d.precio_unitario ?? d.precio) || 0))}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className="px-3 py-3" colSpan="4">No hay productos</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Adicionales */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold">Adicionales</h4>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className={`min-w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                    <tr>
                                                        <th className="text-left px-3 py-2">Concepto</th>
                                                        <th className="text-right px-3 py-2">Cantidad</th>
                                                        <th className="text-right px-3 py-2">Precio</th>
                                                        <th className="text-right px-3 py-2">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cotizacionDetalle.adicionales?.length ? (
                                                        cotizacionDetalle.adicionales.map((a, idx) => (
                                                            <tr key={idx} className={`${isDarkMode ? 'border-gray-800' : 'border-gray-200'} border-b`}>
                                                                <td className="px-3 py-2">{a.nombre || '—'}</td>
                                                                <td className="px-3 py-2 text-right">{a.cantidad ?? 1}</td>
                                                                <td className="px-3 py-2 text-right">{formatMoney(a.precio_unitario ?? a.precio)}</td>
                                                                <td className="px-3 py-2 text-right">{formatMoney(a.subtotal ?? (a.cantidad || 1) * ((a.precio_unitario ?? a.precio) || 0))}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className="px-3 py-3" colSpan="4">No hay adicionales</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Totales */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
                                            <div className="text-xs text-gray-500">Total Productos</div>
                                            <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {formatMoney(cotizacionDetalle.info?.total_monto_productos)}
                                            </div>
                                        </div>
                                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
                                            <div className="text-xs text-gray-500">Total Adicionales</div>
                                            <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {formatMoney(cotizacionDetalle.info?.total_adicionales_monto)}
                                            </div>
                                        </div>
                                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
                                            <div className="text-xs text-gray-500">Monto Total</div>
                                            <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {formatMoney(cotizacionDetalle.info?.monto_total || cotizacionDetalle.info?.total_general)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>Sin información disponible</div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-4 flex items-center justify-end ${isDarkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
                            <button
                                onClick={() => {
                                    setShowDetail(false);
                                    setCotizacionDetalle(null);
                                    setDetailError(null);
                                }}
                                className={`px-4 py-2 rounded-lg mr-3 ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => router.visit('/crm/cotizaciones')}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Ir a cotizaciones
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Utilidad simple para formatear dinero
function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(num);
}
