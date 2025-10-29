import React, { useState, useEffect, useRef } from 'react';
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

    const handleVerCotizacion = (cotizacionId) => {
        setShowDropdown(false);
        router.visit(`/crm/cotizaciones/${cotizacionId}`);
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
                                        onClick={() => handleVerCotizacion(notif.cotizacion_id)}
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
                                                        Leída
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleVerCotizacion(notif.cotizacion_id)}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                    >
                                                        <FiExternalLink className="w-3 h-3" />
                                                        Ver
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
        </div>
    );
}
