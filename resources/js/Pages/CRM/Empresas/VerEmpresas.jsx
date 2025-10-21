import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { FiHome, FiEdit, FiTrash, FiEye, FiPlus, FiSearch, FiRefreshCw } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';
import CreateEmpresaModal from './components/CreateEmpresaModal';
import EditEmpresaModal from './components/EditEmpresaModal';
import ShowEmpresaModal from './components/ShowEmpresaModal';

export default function VerEmpresas({ auth }) {
    const { isDarkMode } = useTheme();
    
    // State management
    const [empresas, setEmpresas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEmpresas, setTotalEmpresas] = useState(0);
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);

    // Fetch empresas data
    const fetchEmpresas = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: '10'
            });
            
            if (search) {
                params.append('search', search);
            }

            const response = await fetch(`${route('crm.empresas.data')}?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setEmpresas(data.empresas?.data || []);
                setCurrentPage(data.empresas?.current_page || 1);
                setTotalPages(data.empresas?.last_page || 1);
                setTotalEmpresas(data.empresas?.total || 0);
            } else {
                console.error('Error fetching empresas:', response.statusText);
                setEmpresas([]);
            }
        } catch (error) {
            console.error('Error fetching empresas:', error);
            setEmpresas([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch usuarios data
    const fetchUsuarios = async () => {
        try {
            const response = await fetch(route('crm.empresas.usuarios'), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUsuarios(data.usuarios || []);
            }
        } catch (error) {
            console.error('Error fetching usuarios:', error);
            setUsuarios([]);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchEmpresas();
        fetchUsuarios();
    }, []);

    // Search handler
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchEmpresas(1, searchTerm);
    };

    // Pagination handlers
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchEmpresas(page, searchTerm);
    };

    // CRUD handlers
    const handleCreate = () => {
        setShowCreateModal(true);
    };

    const handleEdit = (empresa) => {
        setSelectedEmpresa(empresa);
        setShowEditModal(true);
    };

    const handleView = (empresa) => {
        setSelectedEmpresa(empresa);
        setShowViewModal(true);
    };

    const handleDelete = async (empresa) => {
        if (confirm(`¿Estás seguro de eliminar la empresa "${empresa.nombre}"?`)) {
            try {
                const response = await fetch(route('crm.empresas.destroy', empresa.id), {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    // Refresh the data
                    fetchEmpresas(currentPage, searchTerm);
                } else {
                    const errorData = await response.json();
                    alert('Error al eliminar la empresa: ' + (errorData.message || 'Error desconocido'));
                }
            } catch (error) {
                console.error('Error al eliminar empresa:', error);
                alert('Error al eliminar la empresa');
            }
        }
    };

    // Modal close handlers with data refresh
    const handleCreateModalClose = () => {
        setShowCreateModal(false);
        fetchEmpresas(currentPage, searchTerm); // Refresh data
    };

    const handleEditModalClose = () => {
        setShowEditModal(false);
        setSelectedEmpresa(null);
        fetchEmpresas(currentPage, searchTerm); // Refresh data
    };

    const handleViewModalClose = () => {
        setShowViewModal(false);
        setSelectedEmpresa(null);
    };

    // Refresh data
    const handleRefresh = () => {
        fetchEmpresas(currentPage, searchTerm);
        fetchUsuarios();
    };

    return (
        <>
            <Head title="Ver Empresas" />
            <CRMLayout title="Ver Empresas">
                <div className="p-6">
                    {/* Header with search and actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {loading ? 'Cargando...' : `Total de empresas: ${totalEmpresas}`}
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Search form */}
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Buscar empresas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode 
                                            ? 'bg-gray-800 border-gray-700 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <FiSearch className="w-4 h-4" />
                                </button>
                            </form>
                            
                            {/* Action buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRefresh}
                                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    title="Actualizar"
                                >
                                    <FiRefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                                >
                                    <FiPlus className="w-4 h-4 mr-2" />
                                    Nueva Empresa
                                </button>
                            </div>
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
                                        }`}>Nombre</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>RUC</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Email</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Teléfono</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Usuario Responsable</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className={`px-6 py-8 text-center ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                <div className="flex items-center justify-center">
                                                    <FiRefreshCw className="w-6 h-6 animate-spin mr-2" />
                                                    Cargando empresas...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : empresas.length > 0 ? (
                                        empresas.map((empresa) => (
                                            <tr key={empresa.id} className={`${
                                                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                            }`}>
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    <div className="flex items-center">
                                                        {empresa.imagen_destacada_url && (
                                                            <img
                                                                src={empresa.imagen_destacada_url}
                                                                alt={empresa.nombre}
                                                                className="w-10 h-10 rounded-full object-cover mr-3"
                                                            />
                                                        )}
                                                        <span className="font-medium">{empresa.nombre}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>{empresa.ruc || '-'}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>{empresa.email || '-'}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>{empresa.telefono || '-'}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    {empresa.usuario ? (
                                                        <span>
                                                            {empresa.usuario.nombre} {empresa.usuario.apellido}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleView(empresa)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <FiEye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(empresa)}
                                                            className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(empresa)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <FiTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className={`px-6 py-8 text-center ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                <div className="flex flex-col items-center">
                                                    <FiHome className="w-12 h-12 mb-2 opacity-50" />
                                                    <p>No hay empresas registradas</p>
                                                    <button
                                                        onClick={handleCreate}
                                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        Crear primera empresa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={`px-6 py-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Página {currentPage} de {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded ${
                                                currentPage === 1
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded ${
                                                currentPage === totalPages
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                <CreateEmpresaModal
                    isOpen={showCreateModal}
                    onClose={handleCreateModalClose}
                    usuarios={usuarios}
                />

                <EditEmpresaModal
                    isOpen={showEditModal}
                    onClose={handleEditModalClose}
                    empresa={selectedEmpresa}
                    usuarios={usuarios}
                />

                <ShowEmpresaModal
                    isOpen={showViewModal}
                    onClose={handleViewModalClose}
                    empresa={selectedEmpresa}
                />
            </CRMLayout>
        </>
    );
}
