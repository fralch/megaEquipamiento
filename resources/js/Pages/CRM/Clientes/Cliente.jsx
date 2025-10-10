import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import CRMLayout from '../CRMLayout';
import { useTheme } from '../../../storage/ThemeContext';
import CreateClienteModal from './componentes/CreateClienteModal';
import EditClienteModal from './componentes/EditClienteModal';
import ShowClienteModal from './componentes/ShowClienteModal';

export default function Cliente({ clientes = [], filters = {}, usuarios = [], empresas = [], areas = [] }) {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedClientes, setSelectedClientes] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombrecompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.ruc_dni && cliente.ruc_dni.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectCliente = (clienteId) => {
        setSelectedClientes(prev =>
            prev.includes(clienteId)
                ? prev.filter(id => id !== clienteId)
                : [...prev, clienteId]
        );
    };

    const handleSelectAll = () => {
        if (selectedClientes.length === filteredClientes.length) {
            setSelectedClientes([]);
        } else {
            setSelectedClientes(filteredClientes.map(cliente => cliente.id));
        }
    };

    const handleSearch = () => {
        router.get(route('crm.clientes.particulares'), {
            search: searchTerm
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleDelete = (clienteId) => {
        if (confirm('¿Está seguro de eliminar este cliente?')) {
            router.delete(route('crm.clientes.particulares.destroy', clienteId), {
                onSuccess: () => {
                    alert('Cliente eliminado exitosamente');
                },
                onError: () => {
                    alert('Error al eliminar el cliente');
                }
            });
        }
    };

    const handleCreate = () => {
        setShowCreateModal(true);
    };

    const handleEdit = (cliente) => {
        setSelectedCliente(cliente);
        setShowEditModal(true);
    };

    const handleView = (cliente) => {
        setSelectedCliente(cliente);
        setShowViewModal(true);
    };

    return (
        <CRMLayout>
            <Head title="Empleados - Clientes Particulares" />
            
            <div className="p-6">
                <div className="mb-6">
                    <h1 className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Empleados - Clientes Particulares</h1>
                    <p className={`${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Gestiona los empleados asignados a clientes particulares</p>
                </div>

                <div className={`rounded-lg shadow-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className={`p-6 border-b ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div className="flex-1 max-w-md flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Buscar clientes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Buscar
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Agregar Cliente
                                </button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    Exportar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedClientes.length === filteredClientes.length && filteredClientes.length > 0}
                                            onChange={handleSelectAll}
                                            className={`rounded text-blue-600 focus:ring-blue-500 ${
                                                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                                            }`}
                                        />
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Cliente
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Contacto
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        RUC/DNI
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Cargo
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Vendedor
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${
                                isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                            }`}>
                                {filteredClientes.map((cliente) => (
                                    <tr key={cliente.id} className={`transition-colors ${
                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedClientes.includes(cliente.id)}
                                                onChange={() => handleSelectCliente(cliente.id)}
                                                className={`rounded text-blue-600 focus:ring-blue-500 ${
                                                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                                    {cliente.nombrecompleto.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className={`text-sm font-medium ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>{cliente.nombrecompleto}</div>
                                                    <div className={`text-sm ${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>ID: {cliente.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{cliente.email || 'N/A'}</div>
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>{cliente.telefono || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{cliente.ruc_dni || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{cliente.cargo || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{cliente.vendedor?.nombre || 'N/A'} {cliente.vendedor?.apellido || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleView(cliente)}
                                                    className={`${
                                                        isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'
                                                    }`}
                                                >
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(cliente)}
                                                    className={`${
                                                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                                    }`}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cliente.id)}
                                                    className={`${
                                                        isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                                    }`}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredClientes.length === 0 && (
                        <div className="p-8 text-center">
                            <div className={`mb-2 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>No se encontraron clientes</div>
                            <div className={`text-sm ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega el primer cliente'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateClienteModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    empresas={empresas}
                    usuarios={usuarios}
                    areas={areas}
                />
            )}

            {showEditModal && selectedCliente && (
                <EditClienteModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    cliente={selectedCliente}
                    empresas={empresas}
                    usuarios={usuarios}
                    areas={areas}
                />
            )}

            {showViewModal && selectedCliente && (
                <ShowClienteModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    cliente={selectedCliente}
                />
            )}
        </CRMLayout>
    );
}
