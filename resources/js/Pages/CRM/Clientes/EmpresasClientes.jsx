import { Head, Link, router } from "@inertiajs/react";
import { FiHome, FiEdit, FiTrash, FiPlus, FiEye, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import { useState } from 'react';
import CRMLayout from '../CRMLayout';
import CreateEmpresaModal from './componentes/CreateEmpresaModal';
import EditEmpresaModal from './componentes/EditEmpresaModal';
import ShowEmpresaModal from './componentes/ShowEmpresaModal';

export default function EmpresasClientes({ empresas = { data: [] }, usuarios = [], clientes = [] }) {
    const { isDarkMode } = useTheme();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);

    // Debug: verificar qué datos están llegando
    console.log('Empresas recibidas:', empresas);
    console.log('Estructura de empresas:', {
        total: empresas.total,
        currentPage: empresas.current_page,
        dataLength: empresas.data?.length
    });

    // Extraer el array de empresas del objeto paginado
    const empresasData = empresas.data || [];

    const handleDelete = (empresaId) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta empresa cliente?')) {
            router.delete(route('crm.clientes.empresas.destroy', empresaId));
        }
    };

    const handleToggleStatus = (empresaId) => {
        router.post(route('crm.clientes.empresas.toggle-activo', empresaId));
    };

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

    return (
        <>
            <Head title="Empresas de Clientes" />
            <CRMLayout title="Empresas de Clientes">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Gestión de Empresas Clientes
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra las empresas que son clientes de la organización
                            </p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            Agregar Empresa Cliente
                        </button>
                    </div>

                    <div className={`rounded-xl shadow-sm border overflow-hidden ${
                        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                        <table className="w-full">
                            <thead className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Razón Social</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>RUC</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Contacto Principal</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Email</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Estado</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {empresasData.length > 0 ? empresasData.map((empresa) => (
                                    <tr key={empresa.id} className={`${
                                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{empresa.razon_social}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{empresa.ruc}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{empresa.contacto_principal}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{empresa.email}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap`}>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                empresa.activo
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {empresa.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleView(empresa)}
                                                    className={`${
                                                        isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'
                                                    }`}
                                                    title="Ver detalles"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(empresa)}
                                                    className={`${
                                                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                                    }`}
                                                    title="Editar"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(empresa.id)}
                                                    className={`${
                                                        isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-900'
                                                    }`}
                                                    title={empresa.activo ? 'Desactivar' : 'Activar'}
                                                >
                                                    {empresa.activo ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(empresa.id)}
                                                    className={`${
                                                        isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                                    }`}
                                                    title="Eliminar"
                                                >
                                                    <FiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className={`px-6 py-8 text-center text-sm ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            No hay empresas clientes registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CRMLayout>

            {/* Modals */}
            {showCreateModal && (
                <CreateEmpresaModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    usuarios={usuarios}
                    clientes={clientes}
                />
            )}

            {showEditModal && selectedEmpresa && (
                <EditEmpresaModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    empresa={selectedEmpresa}
                    usuarios={usuarios}
                    clientes={clientes}
                />
            )}

            {showViewModal && selectedEmpresa && (
                <ShowEmpresaModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    empresa={selectedEmpresa}
                />
            )}
        </>
    );
}