import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { FiHome, FiEdit, FiTrash, FiEye, FiPlus } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import CRMLayout from '../CRMLayout';
import CreateEmpresaModal from './components/CreateEmpresaModal';
import EditEmpresaModal from './components/EditEmpresaModal';
import ShowEmpresaModal from './components/ShowEmpresaModal';

export default function VerEmpresas({ empresas, usuarios }) {
    const { isDarkMode } = useTheme();

    const fallbackUsuarios = [
        {
            id_usuario: 1,
            nombre: 'María',
            apellido: 'Gómez',
            nombre_usuario: 'mgomez',
            correo: 'maria.gomez@megaequipamiento.com',
        },
        {
            id_usuario: 2,
            nombre: 'Carlos',
            apellido: 'Ramírez',
            nombre_usuario: 'cramirez',
            correo: 'carlos.ramirez@megaequipamiento.com',
        },
        {
            id_usuario: 3,
            nombre: 'Lucía',
            apellido: 'Fernández',
            nombre_usuario: 'lfernandez',
            correo: 'lucia.fernandez@megaequipamiento.com',
        },
    ];

    const fallbackEmpresas = [
        {
            id: 101,
            nombre: 'BioLab Perú S.A.C.',
            ruc: '20604587123',
            email: 'contacto@biolabperu.com',
            telefono: '+51 1 550 2345',
            imagen_destacada: null,
            id_usuario: fallbackUsuarios[0].id_usuario,
            usuario: fallbackUsuarios[0],
            created_at: '2024-01-12T09:30:00Z',
            updated_at: '2024-02-05T15:45:00Z',
        },
        {
            id: 102,
            nombre: 'Clínica Vida Integral',
            ruc: '20587412365',
            email: 'compras@clinicavidaintegral.pe',
            telefono: '+51 987 654 321',
            imagen_destacada: null,
            id_usuario: fallbackUsuarios[1].id_usuario,
            usuario: fallbackUsuarios[1],
            created_at: '2023-11-28T14:10:00Z',
            updated_at: '2024-02-18T11:20:00Z',
        },
        {
            id: 103,
            nombre: 'Laboratorio Andino EIRL',
            ruc: '10456987321',
            email: 'ventas@laboratorioandino.com',
            telefono: '+51 1 440 9876',
            imagen_destacada: null,
            id_usuario: fallbackUsuarios[2].id_usuario,
            usuario: fallbackUsuarios[2],
            created_at: '2023-09-05T08:05:00Z',
            updated_at: '2024-01-30T19:15:00Z',
        },
    ];

    const empresasData = Array.isArray(empresas?.data)
        ? empresas.data
        : Array.isArray(empresas)
        ? empresas
        : fallbackEmpresas;

    const usuariosData = Array.isArray(usuarios?.data)
        ? usuarios.data
        : Array.isArray(usuarios)
        ? usuarios
        : fallbackUsuarios;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);

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

    const handleDelete = (empresa) => {
        if (confirm(`¿Estás seguro de eliminar la empresa "${empresa.nombre}"?`)) {
            router.delete(route('crm.empresas.destroy', empresa.id), {
                onSuccess: () => {
                    // Optionally show a success message
                },
                onError: (errors) => {
                    console.error('Error al eliminar empresa:', errors);
                }
            });
        }
    };

    return (
        <>
            <Head title="Ver Empresas" />
            <CRMLayout title="Ver Empresas">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Lista de todas las empresas registradas ({empresasData.length})
                        </p>
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                        >
                            <FiPlus className="w-4 h-4 mr-2" />
                            Nueva Empresa
                        </button>
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
                                    {empresasData.length > 0 ? (
                                        empresasData.map((empresa) => (
                                            <tr key={empresa.id} className={`${
                                                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                            }`}>
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    <div className="flex items-center">
                                                        {empresa.imagen_destacada && (
                                                            <img
                                                                src={`/storage/${empresa.imagen_destacada}`}
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
                    </div>
                </div>

                {/* Modals */}
                <CreateEmpresaModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    usuarios={usuariosData}
                />

                <EditEmpresaModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedEmpresa(null);
                    }}
                    empresa={selectedEmpresa}
                    usuarios={usuariosData}
                />

                <ShowEmpresaModal
                    isOpen={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedEmpresa(null);
                    }}
                    empresa={selectedEmpresa}
                />
            </CRMLayout>
        </>
    );
}
