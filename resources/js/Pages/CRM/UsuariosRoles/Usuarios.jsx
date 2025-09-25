import { Head } from "@inertiajs/react";
import { FiUsers, FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter, FiEye, FiMail, FiPhone } from "react-icons/fi";
import { useTheme } from '../../../storage/ThemeContext';
import { useState } from 'react';
import CRMLayout from '../../../Components/CRM/CRMLayout';

export default function UsuariosEmpleados() {
    const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // Datos hardcodeados más detallados
    const usuarios = [
        {
            id: 1,
            nombre: "Carlos Mendoza",
            email: "carlos.mendoza@megaequip.pe",
            telefono: "+51 998 765 432",
            rol: "empleado",
            departamento: "Ventas",
            fechaRegistro: "2023-06-10",
            ultimaActividad: "2024-01-21",
            estado: "activo",
            avatar: "CM",
            tareasCompletadas: 45,
            proyectosActivos: 3
        },
        {
            id: 2,
            nombre: "José Ruiz",
            email: "jose.ruiz@megaequip.pe",
            telefono: "+51 965 432 109",
            rol: "empleado",
            departamento: "Técnico",
            fechaRegistro: "2023-11-05",
            ultimaActividad: "2024-01-21",
            estado: "activo",
            avatar: "JR",
            tareasCompletadas: 67,
            proyectosActivos: 2
        },
        {
            id: 3,
            nombre: "Ana Torres",
            email: "ana.torres@megaequip.pe",
            telefono: "+51 987 654 321",
            rol: "gerente",
            departamento: "Administración",
            fechaRegistro: "2023-01-15",
            ultimaActividad: "2024-01-20",
            estado: "activo",
            avatar: "AT",
            tareasCompletadas: 89,
            proyectosActivos: 5
        },
        {
            id: 4,
            nombre: "Miguel Sánchez",
            email: "miguel.sanchez@megaequip.pe",
            telefono: "+51 976 543 210",
            rol: "empleado",
            departamento: "Logística",
            fechaRegistro: "2023-08-20",
            ultimaActividad: "2024-01-19",
            estado: "activo",
            avatar: "MS",
            tareasCompletadas: 34,
            proyectosActivos: 1
        },
        {
            id: 5,
            nombre: "Lucía Ramírez",
            email: "lucia.ramirez@megaequip.pe",
            telefono: "+51 954 321 098",
            rol: "empleado",
            departamento: "Marketing",
            fechaRegistro: "2023-12-10",
            ultimaActividad: "2024-01-18",
            estado: "inactivo",
            avatar: "LR",
            tareasCompletadas: 23,
            proyectosActivos: 0
        },
        {
            id: 6,
            nombre: "Roberto Díaz",
            email: "roberto.diaz@megaequip.pe",
            telefono: "+51 943 210 987",
            rol: "supervisor",
            departamento: "Calidad",
            fechaRegistro: "2023-05-15",
            ultimaActividad: "2024-01-17",
            estado: "activo",
            avatar: "RD",
            tareasCompletadas: 78,
            proyectosActivos: 4
        }
    ];

    const estadisticas = [
        { titulo: "Total Usuarios", valor: "127", color: "blue", cambio: "+12%" },
        { titulo: "Empleados", valor: "23", color: "green", cambio: "+3%" },
        { titulo: "Gerentes/Supervisores", valor: "12", color: "purple", cambio: "+5%" },
        { titulo: "Activos Hoy", valor: "45", color: "orange", cambio: "+15%" }
    ];

    const filteredUsuarios = usuarios.filter(usuario => {
        const matchesSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            usuario.empresa.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || usuario.rol === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <>
            <Head title="Usuarios y Empleados" />
            <CRMLayout title="Usuarios y Empleados">
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
                                        stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                        'bg-orange-100 text-orange-600'
                                    }`}>
                                        <FiUsers className="w-6 h-6" />
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
                                        placeholder="Buscar empleados..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`pl-10 pr-4 py-2 w-64 rounded-lg border ${
                                            isDarkMode
                                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                                    />
                                </div>

                                {/* Filtro por rol */}
                                 <select
                                     value={filterRole}
                                     onChange={(e) => setFilterRole(e.target.value)}
                                     className={`px-4 py-2 rounded-lg border ${
                                         isDarkMode
                                             ? 'bg-gray-800 border-gray-700 text-white'
                                             : 'bg-white border-gray-300 text-gray-900'
                                     } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                                 >
                                     <option value="all">Todos los roles</option>
                                     <option value="empleado">Empleados</option>
                                     <option value="gerente">Gerentes</option>
                                     <option value="supervisor">Supervisores</option>
                                 </select>
                            </div>

                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                <FiPlus className="w-4 h-4" />
                                Agregar Empleado
                            </button>
                        </div>
                    </div>

                    {/* Tabla de usuarios */}
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
                                            Usuario
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            Contacto
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            Rol
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            Estado
                                        </th>
                                         <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                             isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                         }`}>
                                             Rendimiento
                                         </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                    {filteredUsuarios.map((usuario) => (
                                        <tr key={usuario.id} className={`hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {usuario.avatar}
                                                    </div>
                                                     <div className="ml-4">
                                                         <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                             {usuario.nombre}
                                                         </div>
                                                         <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                             {usuario.departamento}
                                                         </div>
                                                     </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FiMail className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {usuario.email}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FiPhone className="w-3 h-3 text-gray-400" />
                                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {usuario.telefono}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                     usuario.rol === 'empleado'
                                                         ? 'bg-green-100 text-green-800'
                                                         : usuario.rol === 'gerente'
                                                         ? 'bg-blue-100 text-blue-800'
                                                         : 'bg-purple-100 text-purple-800'
                                                 }`}>
                                                     {usuario.rol === 'empleado' ? 'Empleado' :
                                                      usuario.rol === 'gerente' ? 'Gerente' : 'Supervisor'}
                                                 </span>
                                             </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-1 ${
                                                        usuario.estado === 'activo'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Último: {usuario.ultimaActividad}
                                                    </span>
                                                </div>
                                            </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                                                 <div className="text-sm">
                                                     <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                         {usuario.tareasCompletadas} tareas
                                                     </div>
                                                     <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                         {usuario.proyectosActivos} proyectos activos
                                                     </div>
                                                 </div>
                                             </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors duration-200" title="Ver detalles">
                                                        <FiEye className="w-4 h-4" />
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
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className={`px-6 py-3 border-t ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                    Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredUsuarios.length}</span> de{' '}
                                    <span className="font-medium">{usuarios.length}</span> resultados
                                </div>
                                <div className="flex gap-2">
                                    <button className={`px-3 py-1 rounded text-sm ${
                                        isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                        Anterior
                                    </button>
                                    <button className={`px-3 py-1 rounded text-sm ${
                                        isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                        Siguiente
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