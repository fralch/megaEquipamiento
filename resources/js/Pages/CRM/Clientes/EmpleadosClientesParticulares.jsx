import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import CRMLayout from '../../../Components/CRM/CRMLayout';
import { useTheme } from '../../../storage/ThemeContext';

export default function EmpleadosClientesParticulares() {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    // Mock data for employees
    const employees = [
        {
            id: 1,
            name: 'Juan Pérez',
            email: 'juan.perez@email.com',
            phone: '+54 11 1234-5678',
            position: 'Vendedor Senior',
            department: 'Ventas',
            status: 'Activo',
            joinDate: '2023-01-15'
        },
        {
            id: 2,
            name: 'María González',
            email: 'maria.gonzalez@email.com',
            phone: '+54 11 2345-6789',
            position: 'Gerente de Cuenta',
            department: 'Atención al Cliente',
            status: 'Activo',
            joinDate: '2022-08-20'
        },
        {
            id: 3,
            name: 'Carlos Rodríguez',
            email: 'carlos.rodriguez@email.com',
            phone: '+54 11 3456-7890',
            position: 'Técnico Especialista',
            department: 'Soporte Técnico',
            status: 'Inactivo',
            joinDate: '2023-03-10'
        }
    ];

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectEmployee = (employeeId) => {
        setSelectedEmployees(prev => 
            prev.includes(employeeId) 
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSelectAll = () => {
        if (selectedEmployees.length === filteredEmployees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(filteredEmployees.map(emp => emp.id));
        }
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
                            <div className="flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Buscar empleados..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Agregar Empleado
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
                                            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                                            onChange={handleSelectAll}
                                            className={`rounded text-blue-600 focus:ring-blue-500 ${
                                                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                                            }`}
                                        />
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Empleado
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Contacto
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Cargo
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Departamento
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        Estado
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
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className={`transition-colors ${
                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployees.includes(employee.id)}
                                                onChange={() => handleSelectEmployee(employee.id)}
                                                className={`rounded text-blue-600 focus:ring-blue-500 ${
                                                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                                    {employee.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className={`text-sm font-medium ${
                                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>{employee.name}</div>
                                                    <div className={`text-sm ${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>ID: {employee.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{employee.email}</div>
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>{employee.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{employee.position}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>{employee.department}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                employee.status === 'Activo' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {employee.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button className={`${
                                                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                                }`}>
                                                    Editar
                                                </button>
                                                <button className={`${
                                                    isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                                }`}>
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredEmployees.length === 0 && (
                        <div className="p-8 text-center">
                            <div className={`mb-2 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>No se encontraron empleados</div>
                            <div className={`text-sm ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega el primer empleado'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CRMLayout>
    );
}