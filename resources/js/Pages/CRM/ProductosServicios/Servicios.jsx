import { Head } from "@inertiajs/react";
import { FiSettings, FiEdit, FiTrash, FiPlus, FiLoader, FiEye, FiImage } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';
import ServiceModal from './components/ServiceModal';
import EditProductModal from './components/EditProductModal';
import { useState, useEffect } from 'react';

export default function Servicios() {
    const { isDarkMode } = useTheme();
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [selectedService, setSelectedService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState(null);

    const fetchServicios = async (page = 1, itemsPerPage = 20) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/productos/solo-servicios?page=${page}&per_page=${itemsPerPage}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar los servicios');
            }
            
            const data = await response.json();
            setServicios(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setTotal(data.total || 0);
            setError(null);
        } catch (err) {
            setError(err.message);
            setServicios([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicios(currentPage, perPage);
    }, [currentPage, perPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1);
    };

    const formatPrice = (price) => {
        if (!price) return 'S/ 0.00';
        return `S/ ${parseFloat(price).toFixed(2)}`;
    };

    const getServiceStatus = (servicio) => {
        // Determinar estado basado en el nombre o descripción
        if (servicio.nombre && servicio.nombre.toLowerCase().includes('inactivo')) {
            return { status: 'Inactivo', color: 'bg-red-100 text-red-800' };
        }
        return { status: 'Activo', color: 'bg-green-100 text-green-800' };
    };

    const handleEditService = (servicio) => {
        setServiceToEdit(servicio);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setServiceToEdit(null);
    };

    const handleSaveService = (updatedService) => {
        // Actualizar la lista de servicios con el servicio actualizado
        setServicios(prevServicios =>
            prevServicios.map(s =>
                s.id_producto === updatedService.id_producto ? updatedService : s
            )
        );
        handleCloseEditModal();
    };

    if (loading) {
        return (
            <>
                <Head title="Servicios" />
                <CRMLayout title="Servicios">
                    <div className="p-6">
                        <div className="flex items-center justify-center h-64">
                            <div className="flex items-center gap-3">
                                <FiLoader className="w-6 h-6 animate-spin text-blue-600" />
                                <span className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Cargando servicios...
                                </span>
                            </div>
                        </div>
                    </div>
                </CRMLayout>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head title="Servicios" />
                <CRMLayout title="Servicios">
                    <div className="p-6">
                        <div className="flex items-center justify-center h-64">
                            <div className={`text-center p-6 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                <p className="text-lg font-medium">Error al cargar servicios</p>
                                <p className="text-sm mt-2">{error}</p>
                                <button 
                                    onClick={() => fetchServicios(currentPage, perPage)}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                </CRMLayout>
            </>
        );
    }

    return (
        <>
            <Head title="Servicios" />
            <CRMLayout title="Servicios">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Gestión de Servicios
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra los servicios ofrecidos por la empresa ({total} servicios)
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FiPlus className="w-4 h-4" />
                            Agregar Servicio
                        </button>
                    </div>

                    {/* Controles de paginación superior */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                className={`px-3 py-2 rounded-lg border text-sm ${
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
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    currentPage <= 1
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                                Anterior
                            </button>
                            
                            <span className={`px-3 py-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Página {currentPage} de {totalPages}
                            </span>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    currentPage >= totalPages
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>

                    <div className={`rounded-xl shadow-sm border overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Imagen</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Servicio</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Marca</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>SKU</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Precio Base</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Estado</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                    {servicios.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className={`px-6 py-8 text-center text-sm ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                No se encontraron servicios
                                            </td>
                                        </tr>
                                    ) : (
                                        servicios.map((servicio) => {
                                            const serviceStatus = getServiceStatus(servicio);
                                            const primeraImagen = servicio.imagenes && servicio.imagenes.length > 0 
                                                ? servicio.imagenes[0] 
                                                : null;
                                            
                                            // Debug: Console logs para verificar datos de imágenes
                                            console.log('Servicios.jsx - Servicio:', servicio.nombre);
                                            console.log('Servicios.jsx - servicio.imagenes:', servicio.imagenes);
                                            console.log('Servicios.jsx - Tipo de servicio.imagenes:', typeof servicio.imagenes);
                                            console.log('Servicios.jsx - Array.isArray(servicio.imagenes):', Array.isArray(servicio.imagenes));
                                            console.log('Servicios.jsx - primeraImagen:', primeraImagen);
                                            console.log('Servicios.jsx - Ruta de imagen construida:', primeraImagen ? `/${primeraImagen}` : 'Sin imagen');
                                            
                                            return (
                                                <tr key={servicio.id} className={`${
                                                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                                }`}>
                                                    {/* Imagen */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            {primeraImagen ? (
                                                <img 
                                                    src={primeraImagen}
                                                    alt={servicio.nombre}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center ${primeraImagen ? 'hidden' : ''}`}>
                                                <FiImage className={`w-6 h-6 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                            </div>
                                        </div>
                                    </td>
                                                    
                                                    {/* Servicio */}
                                                    <td className={`px-6 py-4 text-sm font-medium ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                        <div className="max-w-xs">
                                                            <div className="font-medium truncate" title={servicio.nombre}>
                                                                {servicio.nombre}
                                                            </div>
                                                            {servicio.descripcion && (
                                                                <div className={`text-xs mt-1 truncate ${
                                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                                }`} title={servicio.descripcion}>
                                                                    {servicio.descripcion}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Marca */}
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>
                                                        {servicio.marca?.nombre || 'Sin marca'}
                                                    </td>
                                                    
                                                    {/* SKU */}
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                        {servicio.sku || 'N/A'}
                                                    </td>
                                                    
                                                    {/* Precio Base */}
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                        isDarkMode ? 'text-green-400' : 'text-green-600'
                                                    }`}>
                                                        {formatPrice(servicio.precio_sin_ganancia || servicio.precio)}
                                                    </td>
                                                    
                                                    {/* Estado */}
                                                    <td className={`px-6 py-4 whitespace-nowrap`}>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${serviceStatus.color}`}>
                                                            {serviceStatus.status}
                                                        </span>
                                                    </td>
                                                    
                                                    {/* Acciones */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedService(servicio);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                title="Ver detalles"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditService(servicio)}
                                                                className="text-green-600 hover:text-green-900 transition-colors"
                                                                title="Editar"
                                                            >
                                                                <FiEdit className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-900 transition-colors" title="Eliminar">
                                                                <FiTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Controles de paginación inferior */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Mostrando {((currentPage - 1) * perPage) + 1} a {Math.min(currentPage * perPage, total)} de {total} servicios
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage <= 1}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        currentPage <= 1
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                    Primera
                                </button>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        currentPage <= 1
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                    Anterior
                                </button>
                                
                                <span className={`px-3 py-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {currentPage} / {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        currentPage >= totalPages
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                    Siguiente
                                </button>
                                
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage >= totalPages}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        currentPage >= totalPages
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                    Última
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Modal de Vista de Servicio */}
                {isModalOpen && selectedService && (
                    <ServiceModal
                        servicio={selectedService}
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedService(null);
                        }}
                    />
                )}

                {/* Modal de Edición de Servicio */}
                <EditProductModal
                    producto={serviceToEdit}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveService}
                />
            </CRMLayout>
        </>
    );
}