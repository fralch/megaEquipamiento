import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiImage, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';
import axios from 'axios';

export default function TemporalProductModal({ isOpen, onClose, onSave }) {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [marcas, setMarcas] = useState([]);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        precio: '',
        marca_id: '',
        procedencia: '',
        especificaciones_tecnicas: [{ clave: '', valor: '' }],
        imagenes: []
    });
    const [previewImages, setPreviewImages] = useState([]);
    const [errors, setErrors] = useState({});

    // Cargar marcas al abrir el modal
    useEffect(() => {
        if (isOpen) {
            fetchMarcas();
        }
    }, [isOpen]);

    const fetchMarcas = async () => {
        try {
            const response = await axios.get('/crm/productos-temporales/marcas');
            if (response.data.success) {
                setMarcas(response.data.marcas || []);
            }
        } catch (error) {
            console.error('Error al cargar marcas:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleEspecificacionChange = (index, field, value) => {
        const newEspecificaciones = [...formData.especificaciones_tecnicas];
        newEspecificaciones[index][field] = value;
        setFormData(prev => ({
            ...prev,
            especificaciones_tecnicas: newEspecificaciones
        }));
    };

    const addEspecificacion = () => {
        setFormData(prev => ({
            ...prev,
            especificaciones_tecnicas: [...prev.especificaciones_tecnicas, { clave: '', valor: '' }]
        }));
    };

    const removeEspecificacion = (index) => {
        if (formData.especificaciones_tecnicas.length > 1) {
            const newEspecificaciones = formData.especificaciones_tecnicas.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                especificaciones_tecnicas: newEspecificaciones
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Crear previews
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...previews]);

        // Agregar archivos al form data
        setFormData(prev => ({
            ...prev,
            imagenes: [...prev.imagenes, ...files]
        }));
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            imagenes: prev.imagenes.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.titulo.trim()) {
            newErrors.titulo = 'El título es requerido';
        }

        if (!formData.precio || parseFloat(formData.precio) <= 0) {
            newErrors.precio = 'El precio debe ser mayor a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('titulo', formData.titulo);
            formDataToSend.append('precio', formData.precio);

            if (formData.descripcion) {
                formDataToSend.append('descripcion', formData.descripcion);
            }

            if (formData.marca_id) {
                formDataToSend.append('marca_id', formData.marca_id);
            }

            if (formData.procedencia) {
                formDataToSend.append('procedencia', formData.procedencia);
            }

            // Filtrar especificaciones vacías y enviar como JSON
            const especificacionesValidas = formData.especificaciones_tecnicas
                .filter(e => e.clave.trim() && e.valor.trim())
                .reduce((acc, e) => {
                    acc[e.clave] = e.valor;
                    return acc;
                }, {});

            if (Object.keys(especificacionesValidas).length > 0) {
                formDataToSend.append('especificaciones_tecnicas', JSON.stringify(especificacionesValidas));
            }

            // Agregar imágenes
            formData.imagenes.forEach((imagen, index) => {
                formDataToSend.append(`imagenes[${index}]`, imagen);
            });

            const response = await axios.post('/crm/productos-temporales/store', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                onSave(response.data.producto);
                resetForm();
                onClose();
            }
        } catch (error) {
            console.error('Error al crear producto temporal:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error al crear el producto temporal');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            titulo: '',
            descripcion: '',
            precio: '',
            marca_id: '',
            procedencia: '',
            especificaciones_tecnicas: [{ clave: '', valor: '' }],
            imagenes: []
        });
        setPreviewImages([]);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={handleClose}
                ></div>

                {/* Modal */}
                <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    {/* Header */}
                    <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Crear Producto Temporal
                            </h3>
                            <button
                                onClick={handleClose}
                                className={`rounded-full p-1 hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                            >
                                <FiX className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </button>
                        </div>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Los productos temporales se pueden usar en cotizaciones sin estar en el catálogo principal
                        </p>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <div className="space-y-4">
                                {/* Título */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Título del Producto <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg ${
                                            isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.titulo ? 'border-red-500' : ''
                                        }`}
                                        placeholder="Ej: Microscopio Digital HD"
                                    />
                                    {errors.titulo && (
                                        <p className="mt-1 text-sm text-red-500">{errors.titulo}</p>
                                    )}
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Descripción
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-lg ${
                                            isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Ingrese detalles adicionales del producto (opcional)"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Precio */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Precio <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="precio"
                                            value={formData.precio}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                errors.precio ? 'border-red-500' : ''
                                            }`}
                                            placeholder="0.00"
                                        />
                                        {errors.precio && (
                                            <p className="mt-1 text-sm text-red-500">{errors.precio}</p>
                                        )}
                                    </div>

                                    {/* Marca */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Marca
                                        </label>
                                        <select
                                            name="marca_id"
                                            value={formData.marca_id}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="">Seleccione una marca</option>
                                            {marcas.map((marca) => (
                                                <option key={marca.id_marca} value={marca.id_marca}>
                                                    {marca.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Procedencia */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Procedencia
                                    </label>
                                    <input
                                        type="text"
                                        name="procedencia"
                                        value={formData.procedencia}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg ${
                                            isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Ej: China, USA, Alemania"
                                    />
                                </div>

                                {/* Especificaciones Técnicas */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Especificaciones Técnicas
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addEspecificacion}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            + Agregar
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.especificaciones_tecnicas.map((esp, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={esp.clave}
                                                    onChange={(e) => handleEspecificacionChange(index, 'clave', e.target.value)}
                                                    placeholder="Clave (ej: Voltaje)"
                                                    className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 border-gray-600 text-white'
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                />
                                                <input
                                                    type="text"
                                                    value={esp.valor}
                                                    onChange={(e) => handleEspecificacionChange(index, 'valor', e.target.value)}
                                                    placeholder="Valor (ej: 220V)"
                                                    className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                                                        isDarkMode
                                                            ? 'bg-gray-700 border-gray-600 text-white'
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                />
                                                {formData.especificaciones_tecnicas.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEspecificacion(index)}
                                                        className="text-red-600 hover:text-red-700 p-2"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Imágenes */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Imágenes
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className={`w-full text-sm ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                            }`}
                                        />
                                        {previewImages.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {previewImages.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <FiX className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                        isDarkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="w-4 h-4" />
                                            Crear Producto Temporal
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
