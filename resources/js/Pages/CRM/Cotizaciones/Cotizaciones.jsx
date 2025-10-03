import { Head } from "@inertiajs/react";
import { FiBarChart, FiEdit, FiTrash2, FiPlus, FiEye, FiSearch, FiDownload, FiSend, FiClock, FiUser, FiCalendar } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import { useState } from 'react';
import CRMLayout from '../CRMLayout';
import ShowCotizaciones from './components/ShowCotizaciones';
import CreateCotizaciones from './components/CreateCotizaciones';
import EditCotizaciones from './components/EditCotizaciones';

export default function Cotizaciones() {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('all');
    const [activeModal, setActiveModal] = useState(null);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);

    // Simulated data - replace with actual API calls
    const cotizaciones = [
        {
            id: 1,
            numero: "COT-2024-001",
            fecha_cotizacion: "2024-01-15",
            fecha_vencimiento: "2024-02-15",
            entrega: "15 días hábiles",
            lugar_entrega: "Lima, Perú",
            garantia: "12 meses",
            forma_pago: "50% adelanto, 50% contra entrega",
            cliente_id: 1,
            cliente: "Laboratorio San Marcos",
            contacto: "Ana García",
            email: "ana.garcia@sanmarcos.com",
            telefono: "+51 987 654 321",
            usuario_id: 1,
            vendedor: "Carlos Mendoza",
            miempresa_id: 1,
            moneda: "soles",
            tipo_cambio: 3.75,
            productos: [
                { id: 1, nombre: "Microscopio Óptico Professional", cantidad: 2, precio_unitario: 15500, subtotal: 31000 },
                { id: 2, nombre: "Balanza Analítica 0.1mg", cantidad: 1, precio_unitario: 8200, subtotal: 8200 }
            ],
            total_monto_productos: 39200,
            productos_adicionales: [
                { id: 1, nombre: "Instalación y capacitación", cantidad: 1, precio_unitario: 3500, subtotal: 3500 },
                { id: 2, nombre: "Mantenimiento preventivo (1 año)", cantidad: 1, precio_unitario: 2620, subtotal: 2620 }
            ],
            total_adicionales_monto: 6120,
            total: 45320,
            estado: "pendiente"
        },
        {
            id: 2,
            numero: "COT-2024-002",
            fecha_cotizacion: "2024-01-18",
            fecha_vencimiento: "2024-02-18",
            entrega: "20 días hábiles",
            lugar_entrega: "Lima, Perú",
            garantia: "24 meses",
            forma_pago: "30 días",
            cliente_id: 2,
            cliente: "Universidad San Marcos",
            contacto: "Dr. Mario López",
            email: "mario.lopez@unmsm.edu.pe",
            telefono: "+51 976 543 210",
            usuario_id: 2,
            vendedor: "José Ruiz",
            miempresa_id: 1,
            moneda: "soles",
            tipo_cambio: 3.75,
            productos: [
                { id: 3, nombre: "Centrífuga de Mesa Digital", cantidad: 1, precio_unitario: 12500, subtotal: 12500 },
                { id: 4, nombre: "Kit de Reactivos Químicos", cantidad: 3, precio_unitario: 3950, subtotal: 11850 }
            ],
            total_monto_productos: 24350,
            productos_adicionales: [
                { id: 3, nombre: "Instalación especializada", cantidad: 1, precio_unitario: 4400, subtotal: 4400 }
            ],
            total_adicionales_monto: 4400,
            total: 28750,
            estado: "aprobada"
        },
        {
            id: 3,
            numero: "COT-2024-003",
            fecha_cotizacion: "2024-01-20",
            fecha_vencimiento: "2024-02-20",
            entrega: "10 días hábiles",
            lugar_entrega: "Lima, Perú",
            garantia: "18 meses",
            forma_pago: "Contado",
            cliente_id: 3,
            cliente: "BioLab Perú",
            contacto: "Laura Fernández",
            email: "laura.fernandez@biolab.com",
            telefono: "+51 954 321 098",
            usuario_id: 1,
            vendedor: "Carlos Mendoza",
            miempresa_id: 1,
            moneda: "soles",
            tipo_cambio: 3.75,
            productos: [
                { id: 5, nombre: "Espectrofotómetro UV-Vis", cantidad: 1, precio_unitario: 45000, subtotal: 45000 },
                { id: 6, nombre: "Sistema de Purificación de Agua", cantidad: 1, precio_unitario: 12800, subtotal: 12800 }
            ],
            total_monto_productos: 57800,
            productos_adicionales: [
                { id: 4, nombre: "Calibración inicial", cantidad: 1, precio_unitario: 5000, subtotal: 5000 },
                { id: 5, nombre: "Kit de mantenimiento", cantidad: 1, precio_unitario: 5090, subtotal: 5090 }
            ],
            total_adicionales_monto: 10090,
            total: 67890,
            estado: "enviada"
        }
    ];

    const estadisticas = [
        { titulo: "Total Cotizaciones", valor: cotizaciones.length.toString(), color: "blue", cambio: "+8%" },
        { titulo: "Monto Total", valor: `S/ ${cotizaciones.reduce((sum, cot) => sum + cot.total, 0).toLocaleString()}`, color: "green", cambio: "+15%" },
        { titulo: "Pendientes", valor: cotizaciones.filter(c => c.estado === 'pendiente').length.toString(), color: "yellow", cambio: "+3%" },
        { titulo: "Aprobadas", valor: cotizaciones.filter(c => c.estado === 'aprobada').length.toString(), color: "purple", cambio: "+12%" }
    ];

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

    const filteredCotizaciones = cotizaciones.filter(cotizacion => {
        const matchesSearch = cotizacion.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cotizacion.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cotizacion.contacto.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEstado = filterEstado === 'all' || cotizacion.estado === filterEstado;
        return matchesSearch && matchesEstado;
    });

    const formatCurrency = (amount, currency) => {
        const symbol = currency === 'dolares' ? '$' : 'S/';
        return `${symbol} ${amount.toLocaleString()}`;
    };

    const handleShowDetails = (cotizacion) => {
        setSelectedCotizacion(cotizacion);
        setActiveModal('show');
    };

    const handleEdit = (cotizacion) => {
        setSelectedCotizacion(cotizacion);
        setActiveModal('edit');
    };

    const handleCreate = () => {
        setSelectedCotizacion(null);
        setActiveModal('create');
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedCotizacion(null);
    };

    return (
        <>
            <Head title="Cotizaciones" />
            <CRMLayout title="Gestión de Cotizaciones">
                <div className="p-6">

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {estadisticas.map((stat, index) => (
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
                                        <p className="text-sm text-green-600 mt-1">
                                            {stat.cambio}
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
                                    {filteredCotizaciones.map((cotizacion) => {
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
                                                            Vendedor: {cotizacion.vendedor}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {cotizacion.cliente}
                                                        </div>
                                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {cotizacion.contacto}
                                                        </div>
                                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {cotizacion.email}
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
                                                                {cotizacion.fecha_cotizacion}
                                                            </span>
                                                        </div>
                                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Vence: {cotizacion.fecha_vencimiento}
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
                                                        <button className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors duration-200" title="Descargar PDF">
                                                            <FiDownload className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEdit(cotizacion)}
                                                            className="p-1 rounded hover:bg-yellow-100 text-yellow-600 transition-colors duration-200" 
                                                            title="Editar"
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors duration-200" title="Eliminar">
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer con información adicional */}
                        <div className={`px-6 py-3 border-t ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                    Mostrando <span className="font-medium">{filteredCotizaciones.length}</span> de{' '}
                                    <span className="font-medium">{cotizaciones.length}</span> cotizaciones
                                </div>
                                <div className="flex gap-2">
                                    <button className={`px-3 py-1 rounded text-sm ${
                                        isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                        Exportar Excel
                                    </button>
                                    <button className={`px-3 py-1 rounded text-sm ${
                                        isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                        Imprimir
                                    </button>
                                </div>
                            </div>
                        </div>
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
                        onSave={(newCotizacion) => {
                            // TODO: integrar persistencia real
                            closeModal();
                        }}
                    />
                )}

                {activeModal === 'edit' && selectedCotizacion && (
                    <EditCotizaciones 
                        isOpen={activeModal === 'edit'}
                        cotizacion={selectedCotizacion}
                        onClose={closeModal}
                        onSave={(updatedCotizacion) => {
                            // TODO: integrar persistencia real
                            closeModal();
                        }}
                    />
                )}
            </CRMLayout>
        </>
    );
}
