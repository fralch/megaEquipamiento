import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiRefreshCcw } from 'react-icons/fi';
import CRMLayout from '../CRMLayout';
import { useTheme } from '../../../storage/ThemeContext';
import CreateSectorModal from './componentes/CreateSectorModal';
import EditSectorModal from './componentes/EditSectorModal';

export default function Sectores() {
    const { isDarkMode } = useTheme();
    const [sectores, setSectores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSector, setSelectedSector] = useState(null);

    const loadSectores = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get('/crm/clientes/sectores');
            setSectores(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar sectores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSectores();
    }, []);

    const filteredSectores = sectores.filter(s =>
        s.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (s.descripcion || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        setShowCreateModal(true);
    };

    const handleEdit = (sector) => {
        setSelectedSector(sector);
        setShowEditModal(true);
    };

    const handleDelete = async (sector) => {
        if (!confirm(`¿Eliminar sector "${sector.nombre}"?`)) return;
        try {
            await axios.post(`/crm/clientes/sectores/${sector.id_sector}/delete`);
            await loadSectores();
        } catch (err) {
            alert(err?.response?.data?.message || 'No se pudo eliminar el sector');
        }
    };

    const handleToggleActivo = async (sector) => {
        try {
            await axios.post(`/crm/clientes/sectores/${sector.id_sector}/toggle-activo`);
            await loadSectores();
        } catch (err) {
            alert('No se pudo actualizar el estado');
        }
    };

    return (
        <>
            <Head title="Sectores" />
            <CRMLayout title="Sectores de Clientes">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Gestión de Sectores
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra los sectores asignables a clientes y empresas
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadSectores}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                title="Recargar"
                            >
                                <FiRefreshCcw className="w-4 h-4" />
                                Recargar
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FiPlus className="w-4 h-4" />
                                Nuevo Sector
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o descripción..."
                            className={`w-full md:w-1/2 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>

                    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <table className="w-full">
                            <thead className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Descripción</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {loading && (
                                    <tr>
                                        <td colSpan={4} className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Cargando sectores...
                                        </td>
                                    </tr>
                                )}
                                {error && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-red-600">{error}</td>
                                    </tr>
                                )}
                                {!loading && filteredSectores.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            No hay sectores para mostrar
                                        </td>
                                    </tr>
                                )}
                                {filteredSectores.map((sector) => (
                                    <tr key={sector.id_sector} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sector.nombre}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{sector.descripcion || '—'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${sector.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {sector.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(sector)}
                                                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                                                    title="Editar"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActivo(sector)}
                                                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                                                    title="Activar/Desactivar"
                                                >
                                                    {sector.activo ? (
                                                        <FiToggleRight className="w-5 h-5" />
                                                    ) : (
                                                        <FiToggleLeft className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sector)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Modals */}
                    {showCreateModal && (
                        <CreateSectorModal
                            isOpen={showCreateModal}
                            onClose={() => { setShowCreateModal(false); loadSectores(); }}
                        />
                    )}

                    {showEditModal && selectedSector && (
                        <EditSectorModal
                            isOpen={showEditModal}
                            onClose={() => { setShowEditModal(false); setSelectedSector(null); loadSectores(); }}
                            sector={selectedSector}
                        />
                    )}
                </div>
            </CRMLayout>
        </>
    );
}