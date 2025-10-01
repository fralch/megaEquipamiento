import { Head } from "@inertiajs/react";
import { FiPackage, FiEdit, FiTrash, FiPlus, FiLoader } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../../../Components/CRM/CRMLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Productos() {
    const { isDarkMode } = useTheme();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);

    const fetchProductos = async (page = 1, itemsPerPage = 20) => {
        try {
            setLoading(true);
            const response = await axios.get('/api/productos/excluye-servicios', {
                params: {
                    page: page,
                    per_page: itemsPerPage
                }
            });
            
            const data = response.data;
            setProductos(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setTotal(data.total || 0);
            setPerPage(data.per_page || 20);
        } catch (error) {
            console.error('Error fetching productos:', error);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos(currentPage, perPage);
    }, [currentPage, perPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'No disponible';
        return `S/ ${parseFloat(price).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    };

    const getStockStatus = (stock) => {
        if (!stock || stock === 0) return { text: 'Agotado', class: 'bg-red-100 text-red-800' };
        if (stock <= 5) return { text: 'Bajo Stock', class: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Disponible', class: 'bg-green-100 text-green-800' };
    };

    return (
        <>
            <Head title="Productos" />
            <CRMLayout title="Gestión de Productos">
                <div className="p-6">
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Mostrando {productos.length} de {total} productos
                            </span>
                            <select 
                                value={perPage} 
                                onChange={(e) => setPerPage(parseInt(e.target.value))}
                                className={`px-3 py-1 rounded border text-sm ${
                                    isDarkMode 
                                        ? 'bg-gray-800 border-gray-700 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            >
                                <option value={10}>10 por página</option>
                                <option value={20}>20 por página</option>
                                <option value={50}>50 por página</option>
                                <option value={100}>100 por página</option>
                            </select>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <FiPlus className="w-4 h-4" />
                            Agregar Producto
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Cargando productos...
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className={`rounded-xl shadow-sm border overflow-hidden ${
                                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                            }`}>
                                <table className="w-full">
                                    <thead className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                        <tr>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Nombre</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Marca</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Precio</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Stock</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Estado</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                        {productos.length > 0 ? productos.map((producto) => {
                                            const stockStatus = getStockStatus(producto.stock);
                                            return (
                                                <tr key={producto.id} className={`${
                                                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                                }`}>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                        <div className="max-w-xs truncate" title={producto.nombre}>
                                                            {producto.nombre}
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>{producto.marca?.nombre || 'Sin marca'}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>{formatPrice(producto.precio)}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>{producto.stock || 0}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap`}>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}>
                                                            {stockStatus.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex gap-2">
                                                            <button className="text-blue-600 hover:text-blue-900" title="Editar">
                                                                <FiEdit className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-900" title="Eliminar">
                                                                <FiTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="6" className={`px-6 py-8 text-center text-sm ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    No se encontraron productos
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Página {currentPage} de {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded border text-sm ${
                                                currentPage === 1
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-100'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            Anterior
                                        </button>
                                        
                                        {/* Números de página */}
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-3 py-1 rounded border text-sm ${
                                                        currentPage === pageNum
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : isDarkMode 
                                                                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                                                                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded border text-sm ${
                                                currentPage === totalPages
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-100'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </CRMLayout>
        </>
    );
}