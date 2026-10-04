import React, { useRef } from 'react';
import { FiImage, FiVideo, FiUpload, FiX } from 'react-icons/fi';

// Acepta cualquiera de estos formatos:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/embed/ID
//   https://www.youtube.com/shorts/ID
//   https://m.youtube.com/watch?v=ID&t=42s
//   ID (11 caracteres) — para edición rápida
export function extractYouTubeId(input) {
    if (!input) return '';
    const trimmed = String(input).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

    const m = trimmed.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : '';
}

export default function SliderFormFields({
    form, setForm, errors, imagePreview, setImagePreview,
    videoId, setVideoId, darkMode,
}) {
    const fileInputRef = useRef(null);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleTipoChange = (tipo) => {
        setForm((prev) => ({ ...prev, tipo }));
        if (tipo === 'video') {
            setImagePreview(null);
        } else {
            setVideoId('');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            alert('La imagen no puede pesar más de 4MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
        updateField('imagen', file);
    };

    const clearImage = () => {
        setImagePreview(null);
        updateField('imagen', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const inputCls = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
    const labelCls = `block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;
    const errorCls = 'mt-1 text-sm text-red-600';

    return (
        <div className="space-y-4">
            {/* Tipo */}
            <div>
                <label className={labelCls}>Tipo de slide</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleTipoChange('imagen')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                            form.tipo === 'imagen'
                                ? (darkMode ? 'border-blue-500 bg-blue-900/20 text-blue-300' : 'border-blue-500 bg-blue-50 text-blue-700')
                                : (darkMode ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-600 hover:border-gray-400')
                        }`}
                    >
                        <FiImage className="w-5 h-5" /> Imagen
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTipoChange('video')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                            form.tipo === 'video'
                                ? (darkMode ? 'border-blue-500 bg-blue-900/20 text-blue-300' : 'border-blue-500 bg-blue-50 text-blue-700')
                                : (darkMode ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-300 text-gray-600 hover:border-gray-400')
                        }`}
                    >
                        <FiVideo className="w-5 h-5" /> Video YouTube
                    </button>
                </div>
            </div>

            {/* Contenido multimedia */}
            {form.tipo === 'imagen' ? (
                <div>
                    <label className={labelCls}>Imagen del slide</label>
                    <div className={`border-2 border-dashed rounded-lg p-4 ${darkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-300 bg-gray-50'}`}>
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded" />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                                    title="Quitar imagen"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <FiUpload className={`mx-auto w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Sube una imagen (JPG, PNG, WebP, máx. 4MB)
                                </p>
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Recomendado: 1920×800px o similar (formato panorámico)
                                </p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Seleccionar archivo
                                </button>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    {errors.imagen && <p className={errorCls}>{errors.imagen}</p>}
                </div>
            ) : (
                <div>
                    <label className={labelCls}>URL o ID del video de YouTube</label>
                    <input
                        type="text"
                        value={videoId}
                        onChange={(e) => {
                            const v = e.target.value;
                            setVideoId(v);
                            const id = extractYouTubeId(v);
                            updateField('video_youtube_id', id);
                        }}
                        placeholder="https://youtu.be/3vbogzQ9vYM  o  F8pMhuLK7nE"
                        className={`${inputCls} font-mono ${errors.video_youtube_id ? 'border-red-500' : ''}`}
                    />
                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Pega el enlace completo de YouTube (youtu.be, watch?v=, /embed/, /shorts/) o solo el ID de 11 caracteres.
                    </p>
                    {(() => {
                        const id = extractYouTubeId(videoId);
                        if (!id) return null;
                        return (
                            <>
                                <p className={`mt-1 text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                    ID detectado: <span className="font-mono">{id}</span>
                                </p>
                                <img
                                    src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                                    alt="preview"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    className="mt-2 w-full h-40 object-cover rounded"
                                />
                            </>
                        );
                    })()}
                    {videoId && !extractYouTubeId(videoId) && (
                        <p className={`mt-1 text-xs text-red-500`}>
                            No se pudo extraer un ID de YouTube válido de esa URL.
                        </p>
                    )}
                    {errors.video_youtube_id && <p className={errorCls}>{errors.video_youtube_id}</p>}
                </div>
            )}

            {/* Textos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls}>Título (línea 1)</label>
                    <input
                        type="text"
                        value={form.titulo || ''}
                        onChange={(e) => updateField('titulo', e.target.value)}
                        placeholder="Líder en Ventas de"
                        maxLength={255}
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls}>Subtítulo (línea 2)</label>
                    <input
                        type="text"
                        value={form.subtitulo || ''}
                        onChange={(e) => updateField('subtitulo', e.target.value)}
                        placeholder="Equipos de"
                        maxLength={255}
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls}>Subtítulo 2 (línea 3)</label>
                    <input
                        type="text"
                        value={form.subtitulo_2 || ''}
                        onChange={(e) => updateField('subtitulo_2', e.target.value)}
                        placeholder="Laboratorio"
                        maxLength={255}
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls}>Pie</label>
                    <input
                        type="text"
                        value={form.subtitulo_pie || ''}
                        onChange={(e) => updateField('subtitulo_pie', e.target.value)}
                        placeholder="En todas las regiones del Perú"
                        maxLength={255}
                        className={inputCls}
                    />
                </div>
            </div>

            {/* Botón */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls}>Texto del botón</label>
                    <input
                        type="text"
                        value={form.texto_boton || ''}
                        onChange={(e) => updateField('texto_boton', e.target.value)}
                        placeholder="Ver más"
                        maxLength={100}
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className={labelCls}>URL del botón</label>
                    <input
                        type="url"
                        value={form.url_boton || ''}
                        onChange={(e) => updateField('url_boton', e.target.value)}
                        placeholder="https://wa.me/51999999999"
                        maxLength={500}
                        className={`${inputCls} ${errors.url_boton ? 'border-red-500' : ''}`}
                    />
                    {errors.url_boton && <p className={errorCls}>{errors.url_boton}</p>}
                </div>
            </div>

            {/* Orden y activo */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className={labelCls}>Orden</label>
                    <input
                        type="number"
                        min="0"
                        value={form.orden ?? 0}
                        onChange={(e) => updateField('orden', parseInt(e.target.value || '0', 10))}
                        className={inputCls}
                    />
                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Menor = aparece antes</p>
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <input
                        id="activo"
                        type="checkbox"
                        checked={!!form.activo}
                        onChange={(e) => updateField('activo', e.target.checked)}
                        className="rounded"
                    />
                    <label htmlFor="activo" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Activo</label>
                </div>
            </div>
        </div>
    );
}
