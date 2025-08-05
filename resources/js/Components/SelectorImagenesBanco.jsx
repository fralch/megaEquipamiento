import React, { useState, useEffect } from 'react';
import { Search, X, Image, FileText, Video, Folder } from 'lucide-react';

const SelectorImagenesBanco = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    multiple = false, 
    tipoArchivo = 'image',
    seleccionados = [] 
}) => {
    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState(seleccionados);

    useEffect(() => {
        if (isOpen) {
            cargarImagenes();
        }
    }, [isOpen, busqueda, tipoArchivo]);

    const cargarImagenes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                q: busqueda,
                tipo: tipoArchivo,
                limite: 20
            });
            
            const response = await fetch(`/banco-imagenes/buscar?${params}`);
            const data = await response.json();
            setImagenes(data);
        } catch (error) {
            console.error('Error al cargar imágenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeleccionar = (imagen) => {
        if (multiple) {
            const yaSeleccionada = imagenesSeleccionadas.find(img => img.id === imagen.id);
            let nuevasSeleccionadas;
            
            if (yaSeleccionada) {
                nuevasSeleccionadas = imagenesSeleccionadas.filter(img => img.id !== imagen.id);
            } else {
                nuevasSeleccionadas = [...imagenesSeleccionadas, imagen];
            }
            
            setImagenesSeleccionadas(nuevasSeleccionadas);
        } else {
            onSelect(imagen);
            onClose();
        }
    };

    const handleConfirmarSeleccion = () => {
        onSelect(imagenesSeleccionadas);
        onClose();
    };

    const esImagen = (mimeType) => {
        return mimeType && mimeType.startsWith('image/');
    };

    const obtenerIconoArchivo = (mimeType) => {
        if (!mimeType) return <Folder className="w-8 h-8 text-gray-500" />;
        if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
        if (mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
        if (mimeType.includes('pdf') || mimeType.includes('word')) return <FileText className="w-8 h-8 text-red-500" />;
        return <Folder className="w-8 h-8 text-gray-500" />;
    };

    const estaSeleccionada = (imagen) => {
        return imagenesSeleccionadas.some(img => img.id === imagen.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Seleccionar {multiple ? 'Archivos' : 'Archivo'} del Banco
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Barra de búsqueda */}
                <div className="p-6 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar archivos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : imagenes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📁</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron archivos</h3>
                            <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {imagenes.map((imagen) => (
                                <div
                                    key={imagen.id}
                                    className={`relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                                        estaSeleccionada(imagen) ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
                                    }`}
                                    onClick={() => handleSeleccionar(imagen)}
                                >
                                    {/* Miniatura */}
                                    <div className="aspect-square flex items-center justify-center bg-gray-100 relative">
                                        {esImagen(imagen.tipo) ? (
                                            <img
                                                src={imagen.url}
                                                alt={imagen.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                {obtenerIconoArchivo(imagen.tipo)}
                                            </div>
                                        )}
                                        
                                        {/* Indicador de fuente */}
                                        <div className="absolute top-2 left-2">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                imagen.fuente === 'public' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {imagen.fuente === 'public' ? 'Pública' : 'Media'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Información */}
                                    <div className="p-3">
                                        <h4 className="text-sm font-medium text-gray-900 truncate" title={imagen.nombre}>
                                            {imagen.nombre}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 truncate" title={imagen.archivo}>
                                            {imagen.archivo}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-400">
                                                {imagen.tamano}
                                            </span>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {imagen.coleccion || 'Sin colección'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Indicador de selección */}
                                    {estaSeleccionada(imagen) && (
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {multiple && imagenesSeleccionadas.length > 0 && (
                            <span>{imagenesSeleccionadas.length} archivo(s) seleccionado(s)</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        {multiple && (
                            <button
                                onClick={handleConfirmarSeleccion}
                                disabled={imagenesSeleccionadas.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Seleccionar ({imagenesSeleccionadas.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectorImagenesBanco;