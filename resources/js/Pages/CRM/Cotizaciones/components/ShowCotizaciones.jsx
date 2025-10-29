import { FiX, FiCalendar, FiUser, FiDollarSign, FiMapPin, FiClock, FiCreditCard, FiShield, FiTruck, FiHome, FiDownload } from "react-icons/fi";
import { useTheme } from '../../../../storage/ThemeContext';
import { useState } from 'react';

export default function ShowCotizaciones({ isOpen, onClose, cotizacion }) {
    const { isDarkMode } = useTheme();
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen || !cotizacion) return null;

    const formatCurrency = (amount, currency = 'soles') => {
        const symbol = currency === 'dolares' ? '$' : 'S/';
        return `${symbol} ${parseFloat(amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleExportPdf = async () => {
        setIsExporting(true);
        // Agrega cancelación y timeout para evitar que el botón quede bloqueado si el servidor se demora
        const controller = new AbortController();
        const TIMEOUT_MS = 30000; // 30s: suficiente para la mayoría de respuestas; ajusta según necesidad
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(`/crm/cotizaciones/${cotizacion.id}/export-pdf`, {
                signal: controller.signal,
            });
            if (!response.ok) throw new Error('Error al generar el PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `Cotizacion_${cotizacion.numero || cotizacion.id}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Limpieza con leve retraso para mayor compatibilidad en algunos navegadores
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 0);
        } catch (error) {
            const aborted = error?.name === 'AbortError' || String(error?.message || '').toLowerCase().includes('aborted');
            if (aborted) {
                alert('La generación del PDF está tardando más de lo esperado. Intente nuevamente o verifique el servidor.');
            } else {
                console.error('Error al exportar PDF:', error);
                alert('Error al generar el PDF. Por favor, intente nuevamente.');
            }
        } finally {
            clearTimeout(timeoutId);
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
                isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
                {/* Header */}
                <div className={`sticky top-0 px-6 py-4 border-b flex items-center justify-between ${
                    isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
                }`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Detalles de Cotización
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {cotizacion.numero || `COT-${cotizacion.id}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg hover:bg-gray-100 ${
                            isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'text-gray-500'
                        }`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Información General */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Información General
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <FiCalendar className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Fecha de Cotización
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {formatDate(cotizacion.fecha_cotizacion)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiClock className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Fecha de Vencimiento
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {formatDate(cotizacion.fecha_vencimiento)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiDollarSign className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Moneda
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {cotizacion.moneda === 'dolares' ? 'Dólares (USD)' : 'Soles (PEN)'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cliente y Vendedor */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Cliente y Vendedor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <FiUser className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Cliente
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {cotizacion.cliente?.nombre || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiUser className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Vendedor
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {cotizacion.vendedor?.nombre || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiHome className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Mi Empresa
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {cotizacion.mi_empresa?.nombre || 'No especificada'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Condiciones Comerciales */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Condiciones Comerciales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <FiTruck className={`w-5 h-5 mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Entrega
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {cotizacion.entrega || 'No especificada'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiMapPin className={`w-5 h-5 mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Lugar de Entrega
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {cotizacion.lugar_entrega || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiShield className={`w-5 h-5 mt-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Garantía
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {cotizacion.garantia || 'No especificada'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiCreditCard className={`w-5 h-5 mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Forma de Pago
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {cotizacion.forma_pago || 'No especificada'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {cotizacion.moneda === 'dolares' && cotizacion.tipo_cambio && (
                            <div className="mt-4 flex items-center gap-3">
                                <FiDollarSign className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Tipo de Cambio
                                    </p>
                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        S/ {parseFloat(cotizacion.tipo_cambio).toFixed(3)} por USD
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Productos */}
                    {cotizacion.productos && cotizacion.productos.length > 0 && (
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Productos
                            </h3>
                            <div className="overflow-x-auto">
                                <table className={`w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <thead>
                                        <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <th className="text-left py-2 px-3">Producto</th>
                                            <th className="text-center py-2 px-3">Cantidad</th>
                                            <th className="text-right py-2 px-3">Precio Unit.</th>
                                            <th className="text-right py-2 px-3">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cotizacion.productos.map((producto, index) => (
                                            <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <td className="py-2 px-3 font-medium">{producto.nombre}</td>
                                                <td className="py-2 px-3 text-center">{producto.cantidad}</td>
                                                <td className="py-2 px-3 text-right">{formatCurrency(producto.precio_unitario, cotizacion.moneda)}</td>
                                                <td className="py-2 px-3 text-right font-medium">{formatCurrency(producto.subtotal, cotizacion.moneda)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Total Productos:
                                    </span>
                                    <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {formatCurrency(cotizacion.total_monto_productos, cotizacion.moneda)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Productos Adicionales */}
                    {cotizacion.productos_adicionales && cotizacion.productos_adicionales.length > 0 && (
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Productos Adicionales
                            </h3>
                            <div className="overflow-x-auto">
                                <table className={`w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <thead>
                                        <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <th className="text-left py-2 px-3">Producto</th>
                                            <th className="text-center py-2 px-3">Cantidad</th>
                                            <th className="text-right py-2 px-3">Precio Unit.</th>
                                            <th className="text-right py-2 px-3">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cotizacion.productos_adicionales.map((producto, index) => (
                                            <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <td className="py-2 px-3 font-medium">{producto.nombre}</td>
                                                <td className="py-2 px-3 text-center">{producto.cantidad}</td>
                                                <td className="py-2 px-3 text-right">{formatCurrency(producto.precio_unitario, cotizacion.moneda)}</td>
                                                <td className="py-2 px-3 text-right font-medium">{formatCurrency(producto.subtotal, cotizacion.moneda)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Total Adicionales:
                                    </span>
                                    <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {formatCurrency(cotizacion.total_adicionales_monto, cotizacion.moneda)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Total General */}
                    <div className={`p-4 rounded-lg border-2 ${isDarkMode ? 'bg-gray-800 border-blue-600' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex justify-between items-center">
                            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Total General:
                            </span>
                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {formatCurrency(cotizacion.total, cotizacion.moneda)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex justify-between items-center ${
                    isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                }`}>
                    <button
                        onClick={handleExportPdf}
                        disabled={isExporting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            isExporting
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                    >
                        {isExporting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generando PDF...
                            </>
                        ) : (
                            <>
                                <FiDownload className="w-4 h-4" />
                                Exportar a PDF
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isExporting}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            isExporting
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        } ${
                            isDarkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}