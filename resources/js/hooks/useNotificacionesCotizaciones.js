import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook personalizado para gestionar notificaciones de cotizaciones vencidas
 */
export function useNotificacionesCotizaciones(autoFetch = true, refreshInterval = null) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conteo, setConteo] = useState(0);
    const [porUrgencia, setPorUrgencia] = useState({
        danger: [],
        warning: [],
        info: []
    });

    /**
     * Obtener todas las notificaciones no visualizadas
     */
    const fetchNotificaciones = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/crm/notificaciones-cotizaciones', {
                params: {
                    visualizado: false,
                    ...params
                }
            });

            if (response.data.success) {
                setNotificaciones(response.data.data);
                setConteo(response.data.no_visualizadas);
                return response.data;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar notificaciones');
            console.error('Error fetching notificaciones:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener notificaciones agrupadas por urgencia
     */
    const fetchPorUrgencia = useCallback(async () => {
        try {
            const response = await axios.get('/crm/notificaciones-cotizaciones/por-urgencia');

            if (response.data.success) {
                setPorUrgencia(response.data.data);
                const total = response.data.totales.danger +
                             response.data.totales.warning +
                             response.data.totales.info;
                setConteo(total);
                return response.data;
            }
        } catch (err) {
            console.error('Error fetching notificaciones por urgencia:', err);
        }
    }, []);

    /**
     * Obtener solo el conteo de notificaciones no visualizadas
     */
    const fetchConteo = useCallback(async () => {
        try {
            const response = await axios.get('/crm/notificaciones-cotizaciones/conteo');

            if (response.data.success) {
                setConteo(response.data.count);
                return response.data.count;
            }
        } catch (err) {
            console.error('Error fetching conteo:', err);
        }
    }, []);

    /**
     * Marcar una notificación como visualizada
     */
    const marcarComoVisualizada = useCallback(async (notificacionId) => {
        try {
            const response = await axios.post(
                `/crm/notificaciones-cotizaciones/${notificacionId}/marcar-visualizada`
            );

            if (response.data.success) {
                // Actualizar el estado local
                setNotificaciones(prev =>
                    prev.filter(n => n.id !== notificacionId)
                );
                setConteo(prev => Math.max(0, prev - 1));

                // Actualizar porUrgencia si está disponible
                setPorUrgencia(prev => {
                    const updated = { ...prev };
                    ['danger', 'warning', 'info'].forEach(urgencia => {
                        updated[urgencia] = updated[urgencia].filter(n => n.id !== notificacionId);
                    });
                    return updated;
                });

                return response.data;
            }
        } catch (err) {
            console.error('Error marcando notificación:', err);
            throw err;
        }
    }, []);

    /**
     * Marcar todas las notificaciones como visualizadas
     */
    const marcarTodasComoVisualizadas = useCallback(async () => {
        try {
            const response = await axios.post('/crm/notificaciones-cotizaciones/marcar-todas');

            if (response.data.success) {
                setNotificaciones([]);
                setConteo(0);
                setPorUrgencia({
                    danger: [],
                    warning: [],
                    info: []
                });
                return response.data;
            }
        } catch (err) {
            console.error('Error marcando todas las notificaciones:', err);
            throw err;
        }
    }, []);

    /**
     * Eliminar una notificación
     */
    const eliminarNotificacion = useCallback(async (notificacionId) => {
        try {
            const response = await axios.delete(
                `/crm/notificaciones-cotizaciones/${notificacionId}`
            );

            if (response.data.success) {
                // Actualizar el estado local
                setNotificaciones(prev =>
                    prev.filter(n => n.id !== notificacionId)
                );
                setConteo(prev => Math.max(0, prev - 1));

                return response.data;
            }
        } catch (err) {
            console.error('Error eliminando notificación:', err);
            throw err;
        }
    }, []);

    /**
     * Efecto para cargar notificaciones al montar el componente
     */
    useEffect(() => {
        if (autoFetch) {
            fetchNotificaciones();
        }
    }, [autoFetch, fetchNotificaciones]);

    /**
     * Efecto para refrescar notificaciones periódicamente
     */
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            const interval = setInterval(() => {
                fetchConteo();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchConteo]);

    return {
        // Estado
        notificaciones,
        loading,
        error,
        conteo,
        porUrgencia,

        // Métodos
        fetchNotificaciones,
        fetchPorUrgencia,
        fetchConteo,
        marcarComoVisualizada,
        marcarTodasComoVisualizadas,
        eliminarNotificacion,

        // Helpers
        refetch: fetchNotificaciones,
        hasNotificaciones: conteo > 0
    };
}
