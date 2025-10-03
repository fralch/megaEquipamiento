import { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';
import axios from 'axios';

export default function EditProductModal({ producto, isOpen, onClose, onSave }) {
    const { isDarkMode } = useTheme();
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (producto && isOpen) {
            setDescripcion(producto.descripcion || '');
            setError(null);
            setSuccess(false);
        }
    }, [producto, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!descripcion.trim()) {
            setError('La descripción es requerida');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.put(`/api/productos/crm/${producto.id_producto}`, {
                descripcion: descripcion
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSave(response.data.producto);
                    onClose();
                }, 1000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar la descripción');
            console.error('Error updating product:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                }`}>
                    {/* Header */}
                    <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Editar Descripción
                                </h3>
                                {producto && (
                                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {producto.nombre}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors ${
                                    isDarkMode
                                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4">
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
                                    ¡Descripción actualizada correctamente!
                                </div>
                            )}

                            {/* Descripción */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Descripción del Producto <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    rows={8}
                                    className={`w-full px-3 py-2 rounded-lg border ${
                                        isDarkMode
                                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="Ingrese una descripción detallada del producto..."
                                />
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {descripcion.length} caracteres
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isDarkMode
                                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !descripcion.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <FiLoader className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="w-4 h-4" />
                                            Guardar Descripción
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
