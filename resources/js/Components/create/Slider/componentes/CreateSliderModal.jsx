import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiX, FiPlusCircle, FiSave } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';
import SliderFormFields from './SliderFormFields';

const initialForm = {
    tipo: 'imagen',
    titulo: '',
    subtitulo: '',
    subtitulo_2: '',
    subtitulo_pie: '',
    texto_boton: 'Ver más',
    url_boton: '',
    imagen: null,
    video_youtube_id: '',
    orden: 0,
    activo: true,
};

export default function CreateSliderModal({ isOpen, onClose }) {
    const { isDarkMode } = useTheme();
    const [form, setForm] = useState(initialForm);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoId, setVideoId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const reset = () => {
        setForm(initialForm);
        setImagePreview(null);
        setVideoId('');
        setErrors({});
    };

    const handleClose = () => {
        reset();
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const submitData = new FormData();
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

            await axios.post('/admin/slider/store', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            await Swal.fire({
                icon: 'success',
                title: 'Slide creado',
                text: 'El slide se creó exitosamente',
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
                text: err?.response?.data?.message || 'No se pudo crear el slide',
            });
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <FiPlusCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Nuevo Slide</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Crea un nuevo slide para el carrusel del home</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
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
                            {processing ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
