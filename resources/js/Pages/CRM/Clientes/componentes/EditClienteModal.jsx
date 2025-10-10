import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTheme } from '../../../../storage/ThemeContext';

export default function EditClienteModal({ isOpen, onClose, cliente, empresas = [], usuarios = [], areas = [] }) {
    const { isDarkMode } = useTheme();

    const { data, setData, put, processing, errors, reset } = useForm({
        nombrecompleto: '',
        ruc: '',
        empresa_id: '',
        area_id: '',
        sucursal: '',
        area: '',
        cargo: '',
        email: '',
        telefono: '',
        direccion: '',
        usuario_id: '',
    });

    useEffect(() => {
        if (cliente) {
            setData({
                nombrecompleto: cliente.nombrecompleto || '',
                ruc: cliente.ruc || '',
                empresa_id: cliente.empresa_id || '',
                area_id: cliente.area_id || '',
                sucursal: cliente.sucursal || '',
                area: cliente.area || '',
                cargo: cliente.cargo || '',
                email: cliente.email || '',
                telefono: cliente.telefono || '',
                direccion: cliente.direccion || '',
                usuario_id: cliente.usuario_id || '',
            });
        }
    }, [cliente]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('crm.clientes.particulares.update', cliente.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen || !cliente) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
                </div>

                <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <form onSubmit={handleSubmit}>
                        <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className={`text-lg leading-6 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Editar Cliente/Empleado
                                    </h3>
                                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Modifique la información del cliente o empleado
                                    </p>

                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Nombre Completo *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nombrecompleto}
                                                onChange={(e) => setData('nombrecompleto', e.target.value)}
                                                className={`mt-1 block w-full rounded-md shadow-sm ${
                                                    isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                                required
                                            />
                                            {errors.nombrecompleto && <p className="mt-1 text-sm text-red-600">{errors.nombrecompleto}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    RUC
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.ruc}
                                                    onChange={(e) => setData('ruc', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                {errors.ruc && <p className="mt-1 text-sm text-red-600">{errors.ruc}</p>}
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Empresa (opcional)
                                                </label>
                                                <select
                                                    value={data.empresa_id}
                                                    onChange={(e) => setData('empresa_id', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                >
                                                    <option value="">Cliente Particular</option>
                                                    {empresas.map((empresa) => (
                                                        <option key={empresa.id} value={empresa.id}>
                                                            {empresa.razon_social}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.empresa_id && <p className="mt-1 text-sm text-red-600">{errors.empresa_id}</p>}
                                            </div>
                                        </div>

                                        {data.empresa_id && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Sucursal
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.sucursal}
                                                        onChange={(e) => setData('sucursal', e.target.value)}
                                                        className={`mt-1 block w-full rounded-md shadow-sm ${
                                                            isDarkMode
                                                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    />
                                                    {errors.sucursal && <p className="mt-1 text-sm text-red-600">{errors.sucursal}</p>}
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Área
                                                    </label>
                                                    <select
                                                        value={data.area_id}
                                                        onChange={(e) => setData('area_id', e.target.value)}
                                                        className={`mt-1 block w-full rounded-md shadow-sm ${
                                                            isDarkMode
                                                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    >
                                                        <option value="">Seleccionar área</option>
                                                        {areas.map((area) => (
                                                            <option key={area.id} value={area.id}>
                                                                {area.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.area_id && <p className="mt-1 text-sm text-red-600">{errors.area_id}</p>}
                                                </div>
                                            </div>
                                        )}

                                        {data.empresa_id && (
                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Cargo
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.cargo}
                                                    onChange={(e) => setData('cargo', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                {errors.cargo && <p className="mt-1 text-sm text-red-600">{errors.cargo}</p>}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                    required
                                                />
                                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Teléfono
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.telefono}
                                                    onChange={(e) => setData('telefono', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Dirección
                                            </label>
                                            <textarea
                                                value={data.direccion}
                                                onChange={(e) => setData('direccion', e.target.value)}
                                                rows={3}
                                                className={`mt-1 block w-full rounded-md shadow-sm ${
                                                    isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                            />
                                            {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>}
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Vendedor Asignado
                                            </label>
                                            <select
                                                value={data.usuario_id}
                                                onChange={(e) => setData('usuario_id', e.target.value)}
                                                className={`mt-1 block w-full rounded-md shadow-sm ${
                                                    isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                            >
                                                <option value="">Seleccionar vendedor</option>
                                                {usuarios.map((usuario) => (
                                                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                                        {usuario.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.usuario_id && <p className="mt-1 text-sm text-red-600">{errors.usuario_id}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {processing ? 'Actualizando...' : 'Actualizar'}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium ${
                                    isDarkMode
                                        ? 'bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}