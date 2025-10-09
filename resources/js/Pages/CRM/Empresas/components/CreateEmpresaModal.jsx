import { useState } from "react";
import { router } from "@inertiajs/react";
import { FiX, FiUpload } from "react-icons/fi";
import { useTheme } from '../../../../storage/ThemeContext';

export default function CreateEmpresaModal({ isOpen, onClose, usuarios }) {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        nombre: '',
        ruc: '',
        email: '',
        telefono: '',
        id_usuario: '',
        imagen_logo: null,
        imagen_firma: null
    });
    const [errors, setErrors] = useState({});
    const [logoPreview, setLogoPreview] = useState(null);
    const [firmaPreview, setFirmaPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imagen_logo: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFirmaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imagen_firma: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFirmaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('nombre', formData.nombre);
        if (formData.ruc) data.append('ruc', formData.ruc);
        if (formData.email) data.append('email', formData.email);
        if (formData.telefono) data.append('telefono', formData.telefono);
        if (formData.id_usuario) data.append('id_usuario', formData.id_usuario);
        if (formData.imagen_logo) data.append('imagen_logo', formData.imagen_logo);
        if (formData.imagen_firma) data.append('imagen_firma', formData.imagen_firma);

        try {
            const response = await fetch(route('crm.empresas.store'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: data
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Empresa creada exitosamente');
                handleClose();
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    alert('Error al crear la empresa: ' + (result.message || 'Error desconocido'));
                }
            }
        } catch (error) {
            console.error('Error al crear empresa:', error);
            alert('Error al crear la empresa');
        }
    };

    const handleClose = () => {
        setFormData({
            nombre: '',
            ruc: '',
            email: '',
            telefono: '',
            id_usuario: '',
            imagen_logo: null,
            imagen_firma: null
        });
        setErrors({});
        setLogoPreview(null);
        setFirmaPreview(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-2xl mx-4 rounded-xl shadow-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <h3 className={`text-xl font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        Nueva Empresa
                    </h3>
                    <button
                        onClick={handleClose}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre */}
                            <div className="md:col-span-2">
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.nombre
                                            ? 'border-red-500'
                                            : isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : 'border-gray-300 bg-white text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    required
                                />
                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
                                )}
                            </div>

                            {/* RUC */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    RUC
                                </label>
                                <input
                                    type="text"
                                    name="ruc"
                                    value={formData.ruc}
                                    onChange={handleChange}
                                    maxLength={11}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.ruc
                                            ? 'border-red-500'
                                            : isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : 'border-gray-300 bg-white text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                {errors.ruc && (
                                    <p className="mt-1 text-sm text-red-500">{errors.ruc}</p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.telefono
                                            ? 'border-red-500'
                                            : isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : 'border-gray-300 bg-white text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                {errors.telefono && (
                                    <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.email
                                            ? 'border-red-500'
                                            : isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : 'border-gray-300 bg-white text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Usuario Responsable */}
                            <div className="md:col-span-2">
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Usuario Responsable
                                </label>
                                <select
                                    name="id_usuario"
                                    value={formData.id_usuario}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.id_usuario
                                            ? 'border-red-500'
                                            : isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-white'
                                                : 'border-gray-300 bg-white text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                    <option value="">Seleccionar usuario</option>
                                    {usuarios?.map(usuario => (
                                        <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                            {usuario.nombre} {usuario.apellido} ({usuario.nombre_usuario})
                                        </option>
                                    ))}
                                </select>
                                {errors.id_usuario && (
                                    <p className="mt-1 text-sm text-red-500">{errors.id_usuario}</p>
                                )}
                            </div>

                            {/* Logo */}
                            <div className="md:col-span-2">
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Logo de la Empresa (Opcional)
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className={`flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                        isDarkMode
                                            ? 'border-gray-600 hover:border-gray-500 text-gray-400'
                                            : 'border-gray-300 hover:border-gray-400 text-gray-600'
                                    }`}>
                                        <FiUpload className="w-5 h-5 mr-2" />
                                        <span>Seleccionar logo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {logoPreview && (
                                        <img
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                </div>
                                {errors.imagen_logo && (
                                    <p className="mt-1 text-sm text-red-500">{errors.imagen_logo}</p>
                                )}
                            </div>

                            {/* Firma */}
                            <div className="md:col-span-2">
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Firma de la Empresa (Opcional)
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className={`flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                        isDarkMode
                                            ? 'border-gray-600 hover:border-gray-500 text-gray-400'
                                            : 'border-gray-300 hover:border-gray-400 text-gray-600'
                                    }`}>
                                        <FiUpload className="w-5 h-5 mr-2" />
                                        <span>Seleccionar firma</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFirmaChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {firmaPreview && (
                                        <img
                                            src={firmaPreview}
                                            alt="Firma Preview"
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                </div>
                                {errors.imagen_firma && (
                                    <p className="mt-1 text-sm text-red-500">{errors.imagen_firma}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`flex items-center justify-end gap-3 p-6 border-t ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                isDarkMode
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Crear Empresa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
