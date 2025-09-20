import { Head } from "@inertiajs/react";
import { FiBarChart, FiEdit, FiTrash2, FiPlus, FiEye, FiSearch, FiDownload, FiSend, FiClock, FiUser, FiCalendar } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import { useState } from 'react';
import CRMLayout from '../../../Components/CRM/CRMLayout';

export default function Cotizaciones() {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('all');

    // Datos hardcodeados más detallados
    const cotizaciones = [
        {
            id: 1,
            numero: "COT-2024-001",
            cliente: "Laboratorio San Marcos",
            contacto: "Ana García",
            email: "ana.garcia@sanmarcos.com",
            telefono: "+51 987 654 321",
            total: "S/ 45,320",
            subtotal: "S/ 38,407",
            igv: "S/ 6,913",
            fecha: "2024-01-15",
            fechaVencimiento: "2024-02-15",
            estado: "pendiente",
            vendedor: "Carlos Mendoza",
            productos: [
                { nombre: "Microscopio Óptico Professional", cantidad: 2, precio: "S/ 15,500" },
                { nombre: "Balanza Analítica 0.1mg", cantidad: 1, precio: "S/ 8,200" }
            ],
            observaciones: "Cliente requiere entrega urgente en campus universitario"
        },
        {
            id: 2,
            numero: "COT-2024-002",
            cliente: "Universidad San Marcos",
            contacto: "Dr. Mario López",
            email: "mario.lopez@unmsm.edu.pe",
            telefono: "+51 976 543 210",
            total: "S/ 28,750",
            subtotal: "S/ 24,365",
            igv: "S/ 4,385",
            fecha: "2024-01-18",
            fechaVencimiento: "2024-02-18",
            estado: "aprobada",
            vendedor: "José Ruiz",
            productos: [
                { nombre: "Centrífuga de Mesa Digital", cantidad: 1, precio: "S/ 12,500" },
                { nombre: "Kit de Reactivos Químicos", cantidad: 3, precio: "S/ 3,950" }
            ],
            observaciones: "Cotización aprobada por comité de compras"
        },
        {
            id: 3,
            numero: "COT-2024-003",
            cliente: "BioLab Perú",
            contacto: "Laura Fernández",
            email: "laura.fernandez@biolab.com",
            telefono: "+51 954 321 098",
            total: "S/ 67,890",
            subtotal: "S/ 57,534",
            igv: "S/ 10,356",
            fecha: "2024-01-20",
            fechaVencimiento: "2024-02-20",
            estado: "enviada",
            vendedor: "Carlos Mendoza",
            productos: [
                { nombre: "Espectrofotómetro UV-Vis", cantidad: 1, precio: "S/ 45,000" },
                { nombre: "Sistema de Purificación de Agua", cantidad: 1, precio: "S/ 12,800" }
            ],
            observaciones: "Cotización enviada, esperando respuesta del cliente"
        },
        {
            id: 4,
            numero: "COT-2024-004",
            cliente: "Científica Lab",
            contacto: "Diego Vargas",
            email: "diego.vargas@cientifica.com",
            telefono: "+51 943 210 987",
            total: "S/ 22,150",
            subtotal: "S/ 18,771",
            igv: "S/ 3,379",
            fecha: "2024-01-22",
            fechaVencimiento: "2024-02-22",
            estado: "rechazada",
            vendedor: "Ana Torres",
            productos: [
                { nombre: "Incubadora de CO2", cantidad: 1, precio: "S/ 18,500" }
            ],
            observaciones: "Cliente optó por otra alternativa más económica"
        },
        {
            id: 5,
            numero: "COT-2024-005",
            cliente: "Instituto de Investigación",
            contacto: "Patricia Silva",
            email: "patricia.silva@instituto.pe",
            telefono: "+51 932 109 876",
            total: "S/ 156,750",
            subtotal: "S/ 132,838",
            igv: "S/ 23,912",
            fecha: "2024-01-25",
            fechaVencimiento: "2024-02-25",
            estado: "negociacion",
            vendedor: "José Ruiz",
            productos: [
                { nombre: "Sistema HPLC Completo", cantidad: 1, precio: "S/ 125,000" },
                { nombre: "Columnas Cromatográficas", cantidad: 5, precio: "S/ 6,300" }
            ],
            observaciones: "En proceso de negociación de términos y condiciones"
        }
    ];

    const estadisticas = [
        { titulo: "Total Cotizaciones", valor: "156", color: "blue", cambio: "+8%" },
        { titulo: "Monto Total", valor: "S/ 2,450,000", color: "green", cambio: "+15%" },
        { titulo: "Pendientes", valor: "23", color: "yellow", cambio: "+3%" },
        { titulo: "Aprobadas", valor: "45", color: "purple", cambio: "+12%" }
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

                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
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
                                                            {cotizacion.total}
                                                        </div>
                                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Subtotal: {cotizacion.subtotal}
                                                        </div>
                                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            IGV: {cotizacion.igv}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="flex items-center gap-1">
                                                            <FiCalendar className="w-3 h-3 text-gray-400" />
                                                            <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {cotizacion.fecha}
                                                            </span>
                                                        </div>
                                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Vence: {cotizacion.fechaVencimiento}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <estadoInfo.icon className="w-4 h-4" />
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.color}`}>
                                                            {estadoInfo.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors duration-200" title="Ver detalles">
                                                            <FiEye className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors duration-200" title="Descargar PDF">
                                                            <FiDownload className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 rounded hover:bg-yellow-100 text-yellow-600 transition-colors duration-200" title="Editar">
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
            </CRMLayout>
        </>
    );
}