import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';

export default function DeleteSliderModal({ isOpen, onClose, slide }) {
    const { isDarkMode } = useTheme();
    const [processing, setProcessing] = useState(false);

    if (!isOpen || !slide) return null;

    const handleDelete = async () => {
        setProcessing(true);
        try {
            const submitData = new FormData();
            submitData.append('_method', 'DELETE');
            await axios.post(`/admin/slider/${slide.id_slider}/delete`, submitData);

            await Swal.fire({
                icon: 'success',
                title: 'Slide eliminado',
                text: 'El slide y su imagen (si tenía) fueron eliminados',
                timer: 1500,
                showConfirmButton: false,
            });
            onClose?.();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.response?.data?.message || 'No se pudo eliminar el slide',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg mr-3">
                            <FiAlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Eliminar slide
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ¿Estás seguro de eliminar este slide? Esta acción no se puede deshacer.
                    </p>

                    <div className={`rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="h-32 bg-gray-200">
                            {slide.tipo === 'video' && slide.video_youtube_id ? (
                                <img src={slide.video_thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : slide.imagen_url ? (
                                <img src={slide.imagen_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                            )}
                        </div>
                        <div className={`p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                            <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {slide.titulo || '(sin título)'}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {slide.tipo === 'video' ? `Video: ${slide.video_youtube_id}` : (slide.imagen || 'Sin imagen')}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={processing}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <FiTrash2 className="w-4 h-4" />
                            {processing ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
