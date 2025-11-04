import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiHome, FiHash, FiBriefcase, FiGrid } from "react-icons/fi";
import { useTheme } from '../../../../storage/ThemeContext';
import axios from 'axios';

export default function CreateClienteModal({ isOpen, onClose, empresas = [], usuarios = [], areas = [] }) {
    const { isDarkMode } = useTheme();
    const [sectores, setSectores] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombrecompleto: '',
        ruc_dni: '',
        cargo: '',
        email: '',
        telefono: '',
        direccion: '',
        usuario_id: '',
        sector_id: '',
    });

    // Fetch sectores activos
    useEffect(() => {
        const fetchSectores = async () => {
            try {
                const response = await axios.get('/crm/clientes/sectores/activos');
                setSectores(response.data);
            } catch (error) {
                console.error('Error al cargar sectores:', error);
            }
        };

        if (isOpen) {
            fetchSectores();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('crm.clientes.particulares.store'), {
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <FiUser className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Nuevo Cliente/Empleado
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Registra un nuevo cliente o empleado en el sistema
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`p-2 rounded-lg hover:bg-gray-100 ${
                            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                        } transition-colors duration-200`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información básica */}
                    <div>
                        <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Información Básica
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiUser className="inline w-4 h-4 mr-1" />
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    value={data.nombrecompleto}
                                    onChange={(e) => setData('nombrecompleto', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } ${errors.nombrecompleto ? 'border-red-500' : ''}`}
                                    placeholder="Juan Pérez García"
                                    required
                                />
                                {errors.nombrecompleto && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nombrecompleto}</p>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiHash className="inline w-4 h-4 mr-1" />
                                    RUC/DNI
                                </label>
                                <input
                                    type="text"
                                    value={data.ruc_dni}
                                    onChange={(e) => setData('ruc_dni', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } ${errors.ruc_dni ? 'border-red-500' : ''}`}
                                    placeholder="20123456789 o 12345678"
                                />
                                {errors.ruc_dni && (
                                    <p className="mt-1 text-sm text-red-600">{errors.ruc_dni}</p>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiBriefcase className="inline w-4 h-4 mr-1" />
                                    Cargo
                                </label>
                                <input
                                    type="text"
                                    value={data.cargo}
                                    onChange={(e) => setData('cargo', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } ${errors.cargo ? 'border-red-500' : ''}`}
                                    placeholder="Gerente de Compras"
                                />
                                {errors.cargo && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cargo}</p>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiUser className="inline w-4 h-4 mr-1" />
                                    Vendedor Asignado *
                                </label>
                                <select
                                    value={data.usuario_id}
                                    onChange={(e) => setData('usuario_id', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    } ${errors.usuario_id ? 'border-red-500' : ''}`}
                                    required
                                >
                                    <option value="">Seleccionar vendedor</option>
                                    {usuarios.map((usuario) => (
                                        <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                            {usuario.nombre} {usuario.apellido}
                                        </option>
                                    ))}
                                </select>
                                {errors.usuario_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.usuario_id}</p>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiGrid className="inline w-4 h-4 mr-1" />
                                    Sector
                                </label>
                                <select
                                    value={data.sector_id}
                                    onChange={(e) => setData('sector_id', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    } ${errors.sector_id ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Seleccionar sector</option>
                                    {sectores.map((sector) => (
                                        <option key={sector.id_sector} value={sector.id_sector}>
                                            {sector.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.sector_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sector_id}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información de contacto */}
                    <div>
                        <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Información de Contacto
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiMail className="inline w-4 h-4 mr-1" />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } ${errors.email ? 'border-red-500' : ''}`}
                                    placeholder="juan.perez@email.com"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiPhone className="inline w-4 h-4 mr-1" />
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } ${errors.telefono ? 'border-red-500' : ''}`}
                                    placeholder="999 888 777"
                                />
                                {errors.telefono && (
                                    <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiMapPin className="inline w-4 h-4 mr-1" />
                                    Dirección
                                </label>
                                <textarea
                                    value={data.direccion}
                                    onChange={(e) => setData('direccion', e.target.value)}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } ${errors.direccion ? 'border-red-500' : ''}`}
                                    placeholder="Av. Principal 123, Lima, Perú"
                                />
                                {errors.direccion && (
                                    <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex justify-end space-x-3 pt-6 border-t ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                                isDarkMode
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center ${
                                processing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4 mr-2" />
                                    Guardar Cliente
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}