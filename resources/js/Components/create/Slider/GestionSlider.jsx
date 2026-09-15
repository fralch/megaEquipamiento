import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight,
    FiRefreshCcw, FiArrowUp, FiArrowDown, FiImage, FiVideo, FiEye, FiSearch
} from 'react-icons/fi';
import { useTheme } from '../../../storage/ThemeContext';
import CreateSliderModal from './componentes/CreateSliderModal';
import EditSliderModal from './componentes/EditSliderModal';
import DeleteSliderModal from './componentes/DeleteSliderModal';

export default function GestionSlider() {
    const { isDarkMode } = useTheme();
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSlide, setSelectedSlide] = useState(null);

    const loadSlides = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/admin/slider/data');
            setSlides(data.slides || []);
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los slides' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSlides();
    }, []);

    const filtered = slides.filter((s) => {
        const q = search.toLowerCase();
        return (
            (s.titulo || '').toLowerCase().includes(q) ||
            (s.subtitulo || '').toLowerCase().includes(q) ||
            (s.subtitulo_pie || '').toLowerCase().includes(q) ||
            (s.url_boton || '').toLowerCase().includes(q)
        );
    });

    const handleToggleActivo = async (slide) => {
        try {
            await axios.post(`/admin/slider/${slide.id_slider}/toggle-activo`);
            await loadSlides();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado' });
        }
    };

    const handleMove = async (slide, direction) => {
        const sorted = [...slides].sort((a, b) => a.orden - b.orden);
        const idx = sorted.findIndex((s) => s.id_slider === slide.id_slider);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;

        const items = sorted.map((s, i) => ({
            id_slider: s.id_slider,
            orden: i === idx ? sorted[swapIdx].orden : i === swapIdx ? slide.orden : s.orden,
        }));

        try {
            await axios.post('/admin/slider/reorder', { items });
            await loadSlides();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo reordenar' });
        }
    };

    const openEdit = (slide) => {
        setSelectedSlide(slide);
        setShowEditModal(true);
    };

    const openDelete = (slide) => {
        setSelectedSlide(slide);
        setShowDeleteModal(true);
    };

    const previewSlide = (slide) => {
        if (slide.tipo === 'video' && slide.video_youtube_id) {
            window.open(`https://www.youtube.com/watch?v=${slide.video_youtube_id}`, '_blank');
            return;
        }
        if (slide.imagen_url) {
            window.open(slide.imagen_url, '_blank');
        }
    };

    return (
        <>
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Gestión del Slider
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Edita los slides que aparecen en el carrusel principal de la página de inicio
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadSlides}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                            title="Recargar"
                        >
                            <FiRefreshCcw className="w-4 h-4" />
                            Recargar
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            Nuevo Slide
                        </button>
                    </div>
                </div>

                <div className="mb-4 relative max-w-md">
                    <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por título, subtítulo o URL..."
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                </div>

                <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                <tr>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Preview</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tipo</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Título</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Botón</th>
                                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Orden</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado</th>
                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {loading && (
                                    <tr>
                                        <td colSpan={7} className={`px-6 py-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </td>
                                    </tr>
                                )}
                                {!loading && filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className={`px-6 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {search ? 'No hay resultados para tu búsqueda' : 'No hay slides. Crea el primero con "Nuevo Slide".'}
                                        </td>
                                    </tr>
                                )}
                                {!loading && filtered.map((slide) => (
                                    <tr key={slide.id_slider} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                        <td className="px-4 py-3">
                                            <div className="w-20 h-12 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                                                {slide.tipo === 'video' ? (
                                                    slide.video_thumbnail ? (
                                                        <img src={slide.video_thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FiVideo className="w-5 h-5 text-gray-500" />
                                                    )
                                                ) : slide.imagen_url ? (
                                                    <img src={slide.imagen_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiImage className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {slide.tipo === 'video' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                                    <FiVideo className="w-3 h-3" /> Video
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                    <FiImage className="w-3 h-3" /> Imagen
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {slide.titulo || '—'}
                                            </div>
                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {slide.subtitulo} {slide.subtitulo_2}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{slide.texto_boton || '—'}</div>
                                            <div className={`text-xs truncate max-w-[180px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} title={slide.url_boton || ''}>
                                                {slide.url_boton || '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleMove(slide, 'up')}
                                                    className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                                                    title="Subir"
                                                >
                                                    <FiArrowUp className="w-4 h-4" />
                                                </button>
                                                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{slide.orden}</span>
                                                <button
                                                    onClick={() => handleMove(slide, 'down')}
                                                    className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                                                    title="Bajar"
                                                >
                                                    <FiArrowDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${slide.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {slide.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => previewSlide(slide)}
                                                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                                                    title="Vista previa"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEdit(slide)}
                                                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                                                    title="Editar"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActivo(slide)}
                                                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                                                    title="Activar/Desactivar"
                                                >
                                                    {slide.activo ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => openDelete(slide)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showCreateModal && (
                    <CreateSliderModal
                        isOpen={showCreateModal}
                        onClose={() => { setShowCreateModal(false); loadSlides(); }}
                    />
                )}

                {showEditModal && selectedSlide && (
                    <EditSliderModal
                        isOpen={showEditModal}
                        onClose={() => { setShowEditModal(false); setSelectedSlide(null); loadSlides(); }}
                        slide={selectedSlide}
                    />
                )}

                {showDeleteModal && selectedSlide && (
                    <DeleteSliderModal
                        isOpen={showDeleteModal}
                        onClose={() => { setShowDeleteModal(false); setSelectedSlide(null); loadSlides(); }}
                        slide={selectedSlide}
                    />
                )}
            </div>
        </>
    );
}
