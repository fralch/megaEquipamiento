import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiX, FiEdit, FiSave } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';
import SliderFormFields from './SliderFormFields';

export default function EditSliderModal({ isOpen, onClose, slide }) {
    const { isDarkMode } = useTheme();
    const [form, setForm] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoId, setVideoId] = useState('');
    const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (slide && isOpen) {
            setForm({
                tipo: slide.tipo,
                titulo: slide.titulo || '',
                subtitulo: slide.subtitulo || '',
                subtitulo_2: slide.subtitulo_2 || '',
                subtitulo_pie: slide.subtitulo_pie || '',
                texto_boton: slide.texto_boton || 'Ver más',
                url_boton: slide.url_boton || '',
                imagen: null,
                video_youtube_id: slide.video_youtube_id || '',
                orden: slide.orden || 0,
                activo: !!slide.activo,
            });
            setVideoId(slide.video_youtube_id || '');
            setImagePreview(slide.imagen_url || null);
            setRemoveCurrentImage(false);
            setErrors({});
        }
    }, [slide, isOpen]);

    const handleClose = () => {
        setForm(null);
        setImagePreview(null);
        setVideoId('');
        setErrors({});
        setRemoveCurrentImage(false);
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form) return;
        setProcessing(true);
        setErrors({});

        try {
            const submitData = new FormData();
            submitData.append('_method', 'PUT');

            Object.keys(form).forEach((key) => {
                if (key === 'imagen') {
                    if (form.imagen) submitData.append('imagen', form.imagen);
                    return;
                }
                const value = form[key];
                if (value === null || value === '') return;
                // Laravel no acepta el string "false" como boolean — convertir a "1"/"0"
                if (typeof value === 'boolean') {
                    submitData.append(key, value ? '1' : '0');
                } else {
                    submitData.append(key, value);
                }
            });

            // Indicador para que el backend sepa si debe borrar la imagen previa sin subir nueva
            if (removeCurrentImage && !form.imagen && slide.imagen) {
                submitData.append('imagen', '');
            }

            await axios.post(`/admin/slider/${slide.id_slider}`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            await Swal.fire({
                icon: 'success',
                title: 'Slide actualizado',
                text: 'Los cambios se guardaron correctamente',
                timer: 1500,
                showConfirmButton: false,
            });

            handleClose();
        } catch (err) {
            if (err?.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.response?.data?.message || 'No se pudo actualizar el slide',
            });
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen || !form) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <FiEdit className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Editar Slide</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Slide #{slide.id_slider}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {form.tipo === 'imagen' && slide.imagen && !imagePreview?.startsWith('data:') && (
                        <div className={`mb-4 p-3 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'}`}>
                            <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Imagen actual:</p>
                            <img src={slide.imagen_url} alt="" className="w-full h-40 object-cover rounded mb-2" />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={removeCurrentImage}
                                    onChange={(e) => setRemoveCurrentImage(e.target.checked)}
                                    className="rounded"
                                />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    Eliminar imagen actual (al guardar)
                                </span>
                            </label>
                        </div>
                    )}

                    <SliderFormFields
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        imagePreview={imagePreview}
                        setImagePreview={setImagePreview}
                        videoId={videoId}
                        setVideoId={setVideoId}
                        darkMode={isDarkMode}
                    />

                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <FiSave className="w-4 h-4" />
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
