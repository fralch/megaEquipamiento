import { Head } from "@inertiajs/react";
import { FiUsers, FiEdit, FiTrash2, FiPlus, FiSearch, FiEye, FiMail, FiPhone } from "react-icons/fi";
import { useTheme } from "../../../storage/ThemeContext";
import { useState } from "react";
import CRMLayout from "../CRMLayout";
import EditUserModal from "./componentes/EditUserModal";
import ShowUserModal from "./componentes/ShowUserModal";
import CreateUserModal from "./componentes/CreateUserModal";

export default function UsuariosEmpleados({ usuarios, roles, estadisticas, filters }) {
  const { isDarkMode } = useTheme();
  
  // Datos hardcodeados para pruebas del frontend
  const fallbackUsuarios = {
    data: [
      {
        id_usuario: 1,
        nombre: "Juan Carlos",
        apellido: "Pérez García",
        nombre_usuario: "jperez",
        correo: "juan.perez@empresa.com",
        telefono: "987654321",
        direccion: "Av. Javier Prado 123, San Isidro",
        created_at: "2024-01-15T10:30:00Z",
        activo: true,
        ultima_conexion: "2024-03-05T08:15:00Z",
        role: { id_rol: 1, nombre_rol: "admin" },
      },
      {
        id_usuario: 2,
        nombre: "María Elena",
        apellido: "González López",
        nombre_usuario: "mgonzalez",
        correo: "maria.gonzalez@empresa.com",
        telefono: "987654322",
        direccion: "Calle Los Pinos 456, Miraflores",
        created_at: "2024-01-20T14:15:00Z",
        activo: false,
        ultima_conexion: "2024-02-28T17:40:00Z",
        role: { id_rol: 2, nombre_rol: "editor" },
      },
      {
        id_usuario: 3,
        nombre: "Carlos Alberto",
        apellido: "Rodríguez Silva",
        nombre_usuario: "crodriguez",
        correo: "carlos.rodriguez@empresa.com",
        telefono: "987654323",
        direccion: "Jr. Las Flores 789, San Borja",
        created_at: "2024-02-01T09:45:00Z",
        activo: true,
        ultima_conexion: "2024-03-02T10:05:00Z",
        role: { id_rol: 3, nombre_rol: "usuario" },
      },
      {
        id_usuario: 4,
        nombre: "Ana Sofía",
        apellido: "Martínez Torres",
        nombre_usuario: "amartinez",
        correo: "ana.martinez@empresa.com",
        telefono: "987654324",
        direccion: "Av. Arequipa 321, Lince",
        created_at: "2024-02-10T16:20:00Z",
        activo: true,
        ultima_conexion: null,
        role: { id_rol: 2, nombre_rol: "editor" },
      },
      {
        id_usuario: 5,
        nombre: "Luis Fernando",
        apellido: "Vásquez Morales",
        nombre_usuario: "lvasquez",
        correo: "luis.vasquez@empresa.com",
        telefono: "987654325",
        direccion: "Calle Real 654, Surco",
        created_at: "2024-02-15T11:10:00Z",
        activo: false,
        ultima_conexion: "2024-03-01T09:30:00Z",
        role: { id_rol: 3, nombre_rol: "usuario" },
      },
    ],
    from: 1,
    to: 5,
    total: 5,
  };

  const fallbackRoles = [
    { id_rol: 1, nombre_rol: "admin", descripcion: "Administrador del sistema" },
    { id_rol: 2, nombre_rol: "editor", descripcion: "Editor de contenido" },
    { id_rol: 3, nombre_rol: "usuario", descripcion: "Usuario estándar" },
  ];

  const fallbackEstadisticas = {
    total_usuarios: 5,
    usuarios_activos: 4,
    usuarios_inactivos: 1,
    nuevos_este_mes: 2,
  };

  const fallbackFilters = { search: "", role: "all", activo: "all" };

  const usuariosData = usuarios ?? fallbackUsuarios;
  const rolesData = roles ?? fallbackRoles;
  const estadisticasData = estadisticas ?? fallbackEstadisticas;
  const filtersData = filters ?? fallbackFilters;

  const initialStatusFilter = (() => {
    const value = filtersData.activo;
    if (value === true || value === 'true' || value === 1 || value === '1') return 'active';
    if (value === false || value === 'false' || value === 0 || value === '0') return 'inactive';
    return 'all';
  })();

  const [searchTerm, setSearchTerm] = useState(filtersData.search || "");
  const [filterRole, setFilterRole] = useState(filtersData.role || "all");
  const [filterStatus, setFilterStatus] = useState(initialStatusFilter);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const resolveUserRole = (entity) => entity?.role ?? entity?.rol ?? null;

  const toTitleCase = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .replace(/(^|\s|[-_\/])\p{L}/gu, (match) => match.toUpperCase());

  const normalizeRoleKey = (role) => {
    if (!role) return 'sin-rol';
    const candidates = [role.slug, role.key, role.codigo, role.nombre_interno, role.nombre_rol, role.nombre];
    const raw = candidates.find((item) =>
      (typeof item === 'string' && item.trim().length > 0) || typeof item === 'number'
    );
    return raw ? raw.toString().trim().toLowerCase() : 'sin-rol';
  };

  const formatRoleName = (role) => {
    if (!role) return 'Sin rol';
    const candidates = [role.nombre_rol, role.nombre, role.slug, role.key, role.codigo];
    const raw = candidates.find((item) => typeof item === 'string' && item.trim().length > 0);
    if (!raw) {
      return 'Sin rol';
    }
    return toTitleCase(raw);
  };

  const rolePillClasses = (roleKey) => {
    switch (roleKey) {
      case 'admin':
      case 'administrator':
      case 'administrador':
        return 'bg-purple-100 text-purple-800';
      case 'editor':
      case 'edicion':
        return 'bg-blue-100 text-blue-800';
      case 'usuario':
      case 'user':
      case 'cliente':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const userRoleMeta = (entity) => {
    const role = resolveUserRole(entity);
    const key = normalizeRoleKey(role);
    return {
      role,
      key,
      label: formatRoleName(role),
    };
  };

  const roleOptions = rolesData.reduce((acc, currentRole) => {
    const value = normalizeRoleKey(currentRole);
    if (!acc.some((option) => option.value === value)) {
      acc.push({ value, label: formatRoleName(currentRole) });
    }
    return acc;
  }, []);

  const formatDateValue = (value, options) => {
    if (!value) return null;
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
      return null;
    }

    try {
      return new Intl.DateTimeFormat('es-PE', options).format(dateValue);
    } catch (error) {
      return dateValue.toLocaleString('es-PE', options);
    }
  };

  const formatDateOnly = (value) => formatDateValue(value, { dateStyle: 'medium' });

  const formatDateTime = (value) => formatDateValue(value, { dateStyle: 'medium', timeStyle: 'short' });

  const statusBadgeClasses = (isActive) => {
    if (isActive) {
      return isDarkMode
        ? "bg-green-900/30 text-green-300 border border-green-500/30"
        : "bg-green-100 text-green-800";
    }

    return isDarkMode
      ? "bg-red-900/30 text-red-300 border border-red-500/30"
      : "bg-red-100 text-red-700";
  };

  const normalizeSearchValue = (value) => (value ?? "").toString().toLowerCase();

  // Generar avatar con iniciales
  const generateAvatar = (nombre = "", nombreUsuario = "") => {
    const source = nombre?.trim() || nombreUsuario?.trim();
    if (!source) {
      return "??";
    }
    const words = source.split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return source.substring(0, 2).toUpperCase();
  };

  const usuariosList = Array.isArray(usuariosData?.data) ? usuariosData.data : [];

  const hasUsersWithoutRole = usuariosList.some((userRecord) => userRoleMeta(userRecord).key === 'sin-rol');

  const filteredUsuarios = usuariosList.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      normalizeSearchValue(u.nombre).includes(q) ||
      normalizeSearchValue(u.apellido).includes(q) ||
      normalizeSearchValue(u.correo).includes(q) ||
      normalizeSearchValue(u.telefono).includes(q) ||
      normalizeSearchValue(u.nombre_usuario).includes(q) ||
      normalizeSearchValue(u.ultima_conexion).includes(q);
    const { key: roleKey } = userRoleMeta(u);
    const matchesRole =
      filterRole === "all" ||
      roleKey === filterRole;
    const isActive = u.activo !== false;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && isActive) ||
      (filterStatus === "inactive" && !isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Modal handlers
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleSaveUser = async (userId, userData) => {
    try {
      const response = await fetch(`/crm/usuarios/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({
          ...userData,
          _method: 'PUT'
        }),
      });

      if (response.ok) {
        // Recargar la página para mostrar los cambios
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar usuario:', errorData);
        
        // Mostrar errores de validación específicos si están disponibles
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join('\n');
          alert(`Error al actualizar el usuario:\n${errorMessages}`);
        } else {
          alert('Error al actualizar el usuario. Por favor, intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión. Por favor, intenta de nuevo.');
    }
  };

  const handleCreateNewUser = async (userData) => {
    try {
      const response = await fetch('/crm/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Recargar la página para mostrar el nuevo usuario
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Error al crear usuario:', errorData);
        
        // Mostrar errores de validación específicos si están disponibles
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join('\n');
          alert(`Error al crear el usuario:\n${errorMessages}`);
        } else {
          alert('Error al crear el usuario. Por favor, verifica los datos e intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/crm/usuarios/${userId}/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          },
          body: JSON.stringify({
            _method: 'DELETE'
          }),
        });

        if (response.ok) {
          // Recargar la página para mostrar los cambios
          window.location.reload();
        } else {
          const errorData = await response.json();
          console.error('Error al eliminar usuario:', errorData);
          
          // Mostrar mensaje de error específico si está disponible
          if (errorData.message) {
            alert(`Error al eliminar el usuario: ${errorData.message}`);
          } else {
            alert('Error al eliminar el usuario. Por favor, intenta de nuevo.');
          }
        }
      } catch (error) {
        console.error('Error de red:', error);
        alert('Error de conexión. Por favor, intenta de nuevo.');
      }
    }
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setShowCreateModal(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Head title="Usuarios y Empleados" />
      <CRMLayout title="Usuarios y Empleados">
        <div className="p-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {Object.entries(estadisticasData).map(([key, value]) => {
              const labels = {
                total_usuarios: "Total Usuarios",
                usuarios_activos: "Usuarios Activos",
                usuarios_inactivos: "Usuarios Inactivos",
                nuevos_este_mes: "Nuevos Este Mes",
              };

              return (
                <div
                  key={key}
                  className={`rounded-xl shadow-sm border p-6 transition-all duration-300 hover:shadow-lg ${
                    isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {labels[key] || key}
                      </p>
                      <p
                        className={`text-2xl font-bold mt-1 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${
                        isDarkMode
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <FiUsers className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles */}
          <div
            className={`rounded-xl shadow-sm border p-6 mb-6 ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <FiSearch
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, área…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 w-72 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  />
                </div>

                {/* Filtro por rol */}
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className={`px-4 py-2 rounded-lg border pr-10 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                >
                  <option value="all">Todos los roles</option>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {hasUsersWithoutRole && !roleOptions.some((option) => option.value === 'sin-rol') && (
                    <option value="sin-rol">Sin rol</option>
                  )}
                </select>

                {/* Filtro por estado */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg border pr-10 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo inactivos</option>
                </select>
              </div>

              <button 
                onClick={handleCreateUser}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FiPlus className="w-4 h-4" />
                Agregar Colaborador
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div
            className={`rounded-xl shadow-sm border overflow-hidden ${
              isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <tr>
                    {["Usuario", "Contacto", "Rol", "Estado", "Última conexión", "Acciones"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}
                >
                  {filteredUsuarios.map((u) => {
                    const { label: roleLabelValue, key: roleKey } = userRoleMeta(u);

                    return (
                      <tr
                        key={u.id_usuario}
                        className={`hover:${isDarkMode ? "bg-gray-800" : "bg-gray-50"} transition-colors duration-200`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {generateAvatar(u.nombre, u.nombre_usuario)}
                          </div>
                          <div className="ml-4">
                            <div
                              className={`text-sm font-medium ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {u.nombre}
                            </div>
                            <div
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              @{u.nombre_usuario}
                            </div>
                          </div>
                        </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          <div>
                            <div
                              className={`text-sm ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {u.correo}
                            </div>
                            {u.telefono && (
                              <div className="flex items-center gap-1">
                                <FiPhone className="w-3 h-3 text-gray-400" />
                                <div
                                  className={`text-xs ${
                                    isDarkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  {u.telefono}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rolePillClasses(
                            roleKey
                          )}`}
                        >
                          {roleLabelValue}
                        </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-1 ${
                              statusBadgeClasses(u.activo !== false)
                            }`}
                          >
                            {u.activo === false ? "Inactivo" : "Activo"}
                          </span>
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Registrado: {formatDateOnly(u.created_at) ?? "—"}
                          </span>
                        </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {formatDateTime(u.ultima_conexion) ?? "Sin registro"}
                        </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(u)}
                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(u)}
                            className="p-1 rounded hover:bg-yellow-100 text-yellow-600 transition-colors duration-200"
                            title="Editar"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id_usuario)}
                            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div
              className={`px-6 py-3 border-t ${
                isDarkMode ? "border-gray-800 bg-gray-800" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-700"}`}>
                  Mostrando <span className="font-medium">{usuariosData.from || 1}</span> a{" "}
                  <span className="font-medium">{usuariosData.to || filteredUsuarios.length}</span> de{" "}
                  <span className="font-medium">{usuariosData.total || filteredUsuarios.length}</span> resultados
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded text-sm ${
                      isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white text-gray-700 hover:bg-gray-50"
                    } border ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    Anterior
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-sm ${
                      isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white text-gray-700 hover:bg-gray-50"
                    } border ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditUserModal
          isOpen={showEditModal}
          onClose={closeModals}
          user={selectedUser}
          roles={rolesData}
          onSave={handleSaveUser}
        />
        
        <ShowUserModal
          isOpen={showViewModal}
          onClose={closeModals}
          user={selectedUser}
        />

        <CreateUserModal
          isOpen={showCreateModal}
          onClose={closeModals}
          roles={rolesData}
          onSave={handleCreateNewUser}
        />
      </CRMLayout>
    </>
  );
}
