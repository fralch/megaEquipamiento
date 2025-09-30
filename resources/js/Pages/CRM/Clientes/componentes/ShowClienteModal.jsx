import { useTheme } from '../../../../storage/ThemeContext';

export default function ShowClienteModal({ isOpen, onClose, cliente }) {
    const { isDarkMode } = useTheme();

    if (!isOpen || !cliente) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className={`text-lg leading-6 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Detalles del Cliente/Empleado
                                </h3>
                                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Información completa del cliente o empleado
                                </p>

                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Nombre Completo
                                            </label>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cliente.nombrecompleto || 'No especificado'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                RUC
                                            </label>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cliente.ruc || 'No especificado'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Tipo de Cliente
                                            </label>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cliente.empresa_id ? 'Empleado' : 'Particular'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Email
                                            </label>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cliente.email || 'No especificado'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Teléfono
                                            </label>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cliente.telefono || 'No especificado'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Vendedor Asignado
                                            </label>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cliente.vendedor ? cliente.vendedor.nombre : 'No asignado'}
                                            </p>
                                        </div>
                                    </div>

                                    {cliente.empresa && (
                                        <>
                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Empresa
                                                </label>
                                                <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {cliente.empresa.razon_social}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Sucursal
                                                    </label>
                                                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {cliente.sucursal || 'No especificado'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Área
                                                    </label>
                                                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {cliente.area_relacion ? cliente.area_relacion.nombre : (cliente.area || 'No especificado')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Cargo
                                                </label>
                                                <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {cliente.cargo || 'No especificado'}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Dirección
                                        </label>
                                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {cliente.direccion || 'No especificado'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Fecha de Creación
                                            </label>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {new Date(cliente.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Última Actualización
                                            </label>
                                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {new Date(cliente.updated_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium ${
                                isDarkMode
                                    ? 'bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm`}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}