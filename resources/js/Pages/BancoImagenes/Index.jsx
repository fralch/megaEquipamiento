import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Trash2, Upload, Search, Filter, Edit3, Eye, Download } from 'lucide-react';

export default function BancoImagenes({ auth, imagenes, filtros, colecciones }) {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    const [mostrarModalSubir, setMostrarModalSubir] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        archivo: null,
        nombre: '',
        coleccion: 'banco_imagenes'
    });

    const { data: filtroData, setData: setFiltroData, get } = useForm({
        buscar: filtros.buscar || '',
        tipo: filtros.tipo || 'image',
        coleccion: filtros.coleccion || ''
    });

    const handleSubirArchivo = (e) => {
        e.preventDefault();
        post(route('banco-imagenes.store'), {
            onSuccess: () => {
                reset();
                setMostrarModalSubir(false);
            }
        });
    };

    const handleEliminar = (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
            router.delete(route('banco-imagenes.destroy', id));
        }
    };

    const handleFiltrar = () => {
        get(route('banco-imagenes.index'), {
            preserveState: true,
            preserveScroll: true
        });
    };

    const abrirModal = (imagen) => {
        setImagenSeleccionada(imagen);
        setMostrarModal(true);
    };

    const esImagen = (mimeType) => {
        return mimeType && mimeType.startsWith('image/');
    };

    const obtenerIconoArchivo = (mimeType) => {
        if (!mimeType) return '📁';
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word')) return '📝';
        return '📁';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Banco de Imágenes</h2>}
        >
            <Head title="Banco de Imágenes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Barra de herramientas */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                {/* Filtros */}
                                <div className="flex flex-col md:flex-row gap-4 flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Buscar archivos..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={filtroData.buscar}
                                            onChange={(e) => setFiltroData('buscar', e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleFiltrar()}
                                        />
                                    </div>
                                    
                                    <select
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filtroData.tipo}
                                        onChange={(e) => setFiltroData('tipo', e.target.value)}
                                    >
                                        <option value="image">Solo Imágenes</option>
                                        <option value="video">Solo Videos</option>
                                        <option value="application">Documentos</option>
                                        <option value="todos">Todos los archivos</option>
                                    </select>

                                    <select
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filtroData.coleccion}
                                        onChange={(e) => setFiltroData('coleccion', e.target.value)}
                                    >
                                        <option value="">Todas las colecciones</option>
                                        {colecciones.map(coleccion => (
                                            <option key={coleccion} value={coleccion}>{coleccion}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleFiltrar}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Filter className="w-4 h-4" />
                                        Filtrar
                                    </button>
                                </div>

                                {/* Botón subir */}
                                <button
                                    onClick={() => setMostrarModalSubir(true)}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Subir Archivo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid de archivos */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {imagenes.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-6xl mb-4">📁</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay archivos</h3>
                                    <p className="text-gray-500">Sube tu primer archivo para comenzar</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                                    {imagenes.data.map((imagen) => (
                                        <div key={imagen.id} className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                            {/* Miniatura pequeña */}
                                            <div className="aspect-square flex items-center justify-center bg-gray-100 relative">
                                                {esImagen(imagen.mime_type) ? (
                                                    <img
                                                        src={imagen.url}
                                                        alt={imagen.name}
                                                        className="w-full h-full object-cover cursor-pointer"
                                                        onClick={() => abrirModal(imagen)}
                                                        title={imagen.name}
                                                    />
                                                ) : (
                                                    <div className="text-2xl cursor-pointer" onClick={() => abrirModal(imagen)} title={imagen.name}>
                                                        {obtenerIconoArchivo(imagen.mime_type)}
                                                    </div>
                                                )}
                                                {/* Indicador de fuente */}
                                                <div className="absolute top-1 left-1">
                                                    <span className={`text-xs px-1 py-0.5 rounded text-xs ${
                                                        imagen.fuente === 'public' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {imagen.fuente === 'public' ? 'P' : 'M'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Información compacta */}
                                            <div className="p-2">
                                                <h4 className="text-xs font-medium text-gray-900 truncate" title={imagen.name}>
                                                    {imagen.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate" title={imagen.collection_name}>
                                                    {imagen.collection_name || 'Sin colección'}
                                                </p>
                                            </div>

                                            {/* Acciones */}
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => abrirModal(imagen)}
                                                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                    </button>
                                                    {imagen.fuente === 'media_library' && (
                                                        <button
                                                            onClick={() => handleEliminar(imagen.id)}
                                                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Paginación */}
                            {imagenes.links && (
                                <div className="mt-6 flex justify-center">
                                    <div className="flex gap-2">
                                        {imagenes.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para subir archivo */}
            {mostrarModalSubir && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Subir Nuevo Archivo</h3>
                        
                        <form onSubmit={handleSubirArchivo}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Archivo
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    onChange={(e) => setData('archivo', e.target.files[0])}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                {errors.archivo && <p className="text-red-500 text-sm mt-1">{errors.archivo}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nombre personalizado"
                                />
                                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Colección
                                </label>
                                <input
                                    type="text"
                                    value={data.coleccion}
                                    onChange={(e) => setData('coleccion', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="banco_imagenes"
                                />
                                {errors.coleccion && <p className="text-red-500 text-sm mt-1">{errors.coleccion}</p>}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalSubir(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Subiendo...' : 'Subir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para ver detalles */}
            {mostrarModal && imagenSeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-medium">{imagenSeleccionada.name}</h3>
                                <button
                                    onClick={() => setMostrarModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Vista previa */}
                                <div className="flex items-center justify-center bg-gray-100 rounded-lg min-h-[300px]">
                                    {esImagen(imagenSeleccionada.mime_type) ? (
                                        <img
                                            src={imagenSeleccionada.url}
                                            alt={imagenSeleccionada.name}
                                            className="max-w-full max-h-[400px] object-contain"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">
                                                {obtenerIconoArchivo(imagenSeleccionada.mime_type)}
                                            </div>
                                            <p className="text-gray-600">{imagenSeleccionada.file_name}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Información */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                        <p className="mt-1 text-sm text-gray-900">{imagenSeleccionada.name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Archivo</label>
                                        <p className="mt-1 text-sm text-gray-900">{imagenSeleccionada.file_name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                        <p className="mt-1 text-sm text-gray-900">{imagenSeleccionada.mime_type}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                                        <p className="mt-1 text-sm text-gray-900">{imagenSeleccionada.tamano_formateado}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Colección</label>
                                        <p className="mt-1 text-sm text-gray-900">{imagenSeleccionada.collection_name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">URL</label>
                                        <p className="mt-1 text-sm text-gray-900 break-all">{imagenSeleccionada.url}</p>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2 pt-4">
                                        <a
                                            href={imagenSeleccionada.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar
                                        </a>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(imagenSeleccionada.url);
                                                alert('URL copiada al portapapeles');
                                            }}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                        >
                                            Copiar URL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}