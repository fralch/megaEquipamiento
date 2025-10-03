import { Head } from "@inertiajs/react";
import { FiMapPin, FiEdit, FiTrash, FiPlus, FiEye } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';
import { useState } from 'react';
import CreateRoleModal from './componentes/CreateRoleModal';
import EditRoleModal from './componentes/EditRoleModal';
import ShowRoleModal from './componentes/ShowRoleModal';

export default function RolesUsuarios({ roles }) {
    const { isDarkMode } = useTheme();
    
    // Datos mock para poder visualizar la UI sin depender del backend
    const fallbackRoles = [
        {
            id_rol: 1,
            nombre_rol: 'admin',
            descripcion: 'Acceso completo al CRM y a la configuración del sistema',
            usuarios_count: 6,
            permisos: ['Gestionar usuarios', 'Ver reportes', 'Configurar CRM'],
        },
        {
            id_rol: 2,
            nombre_rol: 'editor',
            descripcion: 'Puede administrar clientes, cotizaciones y catálogo de productos',
            usuarios_count: 12,
            permisos: ['Gestionar clientes', 'Gestionar cotizaciones', 'Ver reportes'],
        },
        {
            id_rol: 3,
            nombre_rol: 'usuario',
            descripcion: 'Acceso solo lectura a información comercial y seguimiento de clientes',
            usuarios_count: 18,
            permisos: ['Ver clientes', 'Ver cotizaciones'],
        },
        {
            id_rol: 4,
            nombre_rol: 'ventas',
            descripcion: 'Equipo comercial con permisos para registrar oportunidades y cotizaciones',
            usuarios_count: 9,
            permisos: ['Gestionar cotizaciones', 'Gestionar clientes asignados'],
        },
    ];

    const rolesData = Array.isArray(roles?.data)
        ? roles.data
        : Array.isArray(roles)
        ? roles
        : fallbackRoles;

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Handle modal actions
    const handleCreateRole = () => {
        setIsCreateModalOpen(true);
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
    };

    const handleShowRole = (role) => {
        setSelectedRole(role);
        setIsShowModalOpen(true);
    };

    const handleDeleteRole = async (role) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el rol "${role.nombre_rol}"?`)) {
            try {
                const response = await fetch(`/crm/usuarios/roles/${role.id_rol}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify({
                        _method: 'DELETE'
                    })
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    const errorData = await response.json();
                    alert(`Error al eliminar el rol: ${errorData.message || 'Error desconocido'}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar el rol. Por favor, inténtalo de nuevo.');
            }
        }
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsShowModalOpen(false);
        setSelectedRole(null);
    };

    return (
        <>
            <Head title="Roles de Usuarios" />
            <CRMLayout title="Roles de Usuarios">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Roles de Usuarios
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Administra los diferentes roles de usuarios en el sistema
                            </p>
                        </div>
                        <button 
                            onClick={handleCreateRole}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            Agregar Rol
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
                                    }`}>Nombre</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Descripción</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Usuarios</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Estado</th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {rolesData.map((role) => (
                                    <tr key={role.id_rol} className={`${
                                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            <div className="flex items-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                                                    role.nombre_rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    role.nombre_rol === 'editor' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {role.nombre_rol}
                                                </span>
                                                {role.nombre_rol.charAt(0).toUpperCase() + role.nombre_rol.slice(1)}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>{role.descripcion || 'Sin descripción'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>
                                            <span className="font-semibold">{role.usuarios_count || 0}</span> usuarios
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap`}>
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Activo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleShowRole(role)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Ver detalles"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleEditRole(role)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Editar rol"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteRole(role)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar rol"
                                                >
                                                    <FiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) }
                                {rolesData.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className={`px-6 py-4 text-center text-sm ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            No hay roles disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals */}
                <CreateRoleModal 
                    isOpen={isCreateModalOpen} 
                    onClose={closeModals} 
                />
                
                <EditRoleModal 
                    isOpen={isEditModalOpen} 
                    onClose={closeModals} 
                    role={selectedRole}
                />
                
                <ShowRoleModal 
                    isOpen={isShowModalOpen} 
                    onClose={closeModals} 
                    role={selectedRole}
                />
            </CRMLayout>
        </>
    );
}
