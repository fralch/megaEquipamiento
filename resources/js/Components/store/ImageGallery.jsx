import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../storage/ThemeContext';
import ZoomImage from './ZoomImage';
import axios from 'axios';

const ImageGallery = ({ images, productId, productName, onImagesUpdate, canEdit = false }) => {
    const { isDarkMode } = useTheme();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const thumbnailsRef = useRef(null);
    const fileInputRef = useRef(null);

    // Configuración para validación de archivos
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_FILES = 10;

    // Normalizar imágenes - puede ser string o array
    const normalizedImages = React.useMemo(() => {
        if (!images) return [];
        
        if (Array.isArray(images)) {
            return images.filter(img => img && img.trim() !== '');
        }
        
        return images.trim() !== '' ? [images] : [];
    }, [images]);

    // Función para obtener URL completa de imagen
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        return imagePath.startsWith('http') ? imagePath : `/${imagePath}`;
    };

    // Función para validar archivos
    const validateFiles = (files) => {
        const newErrors = [];
        const validFiles = [];

        if (files.length > MAX_FILES) {
            newErrors.push(`Máximo ${MAX_FILES} archivos permitidos`);
            return { validFiles: [], errors: newErrors };
        }

        files.forEach((file, index) => {
            // Validar tipo
            if (!ALLOWED_TYPES.includes(file.type)) {
                newErrors.push(`${file.name}: Tipo de archivo no permitido`);
                return;
            }

            // Validar tamaño
            if (file.size > MAX_FILE_SIZE) {
                newErrors.push(`${file.name}: Archivo demasiado grande (máx. 5MB)`);
                return;
            }

            validFiles.push(file);
        });

        return { validFiles, errors: newErrors };
    };

    // Función para procesar archivos seleccionados
    const processFiles = useCallback((files) => {
        const { validFiles, errors } = validateFiles(Array.from(files));
        
        setErrors(errors);
        
        if (validFiles.length > 0) {
            setSelectedImages(prev => [...prev, ...validFiles]);
            
            // Crear previsualizaciones
            const newPreviews = validFiles.map(file => ({
                url: URL.createObjectURL(file),
                file: file,
                name: file.name
            }));
            
            setPreviewImages(prev => [...prev, ...newPreviews]);
        }
    }, []);

    // Función para manejar la selección de archivos
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    // Funciones para drag and drop
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    // Funciones para reordenar imágenes mediante drag and drop
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDropReorder = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== dropIndex) {
            handleReorderImage(draggedIndex, dropIndex);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Función para cambiar imagen actual
    const handleImageChange = (index) => {
        if (index >= 0 && index < normalizedImages.length) {
            setCurrentImageIndex(index);
        }
    };

    // Función para imagen anterior
    const handlePrevImage = () => {
        const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : normalizedImages.length - 1;
        handleImageChange(newIndex);
    };

    // Función para imagen siguiente
    const handleNextImage = () => {
        const newIndex = currentImageIndex < normalizedImages.length - 1 ? currentImageIndex + 1 : 0;
        handleImageChange(newIndex);
    };

    // Función para guardar las nuevas imágenes
    const handleSaveImages = async () => {
        if (selectedImages.length === 0) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);
        setErrors([]);

        try {
            const formData = new FormData();
            formData.append('id_producto', productId);
            
            selectedImages.forEach((file, index) => {
                formData.append(`imagen[${index}]`, file);
            });

            const response = await axios.post('/productos/actualizar-imagen', formData, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.data && response.data.imagen) {
                // Actualizar las imágenes en el componente padre
                if (onImagesUpdate) {
                    onImagesUpdate(response.data.imagen);
                }
                handleCancelEdit();
            }
        } catch (error) {
            console.error('Error updating images:', error);
            setErrors(['Error al actualizar las imágenes. Por favor, inténtalo de nuevo.']);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    // Función para cancelar la edición
    const handleCancelEdit = () => {
        setIsEditing(false);
        setSelectedImages([]);
        
        // Limpiar URLs de objeto para evitar memory leaks
        previewImages.forEach(preview => {
            URL.revokeObjectURL(preview.url);
        });
        setPreviewImages([]);
        
        setErrors([]);
        setUploadProgress(0);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Función para eliminar una imagen de la previsualización
    const handleRemovePreview = (indexToRemove) => {
        const imageToRemove = previewImages[indexToRemove];
        URL.revokeObjectURL(imageToRemove.url);
        
        const newSelectedImages = selectedImages.filter((_, index) => index !== indexToRemove);
        const newPreviewImages = previewImages.filter((_, index) => index !== indexToRemove);
        
        setSelectedImages(newSelectedImages);
        setPreviewImages(newPreviewImages);
    };

    // Función para reordenar imágenes
    const handleReorderImage = (fromIndex, toIndex) => {
        const newSelectedImages = [...selectedImages];
        const newPreviewImages = [...previewImages];
        
        const [movedFile] = newSelectedImages.splice(fromIndex, 1);
        const [movedPreview] = newPreviewImages.splice(fromIndex, 1);
        
        newSelectedImages.splice(toIndex, 0, movedFile);
        newPreviewImages.splice(toIndex, 0, movedPreview);
        
        setSelectedImages(newSelectedImages);
        setPreviewImages(newPreviewImages);
    };

    // Componente de imagen principal
    const renderMainImage = () => {
        if (normalizedImages.length === 0) {
            return (
                <div className={`w-full h-96 flex items-center justify-center rounded-lg border-2 border-dashed ${
                    isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'
                }`}>
                    <div className={`text-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Sin imagen disponible</p>
                    </div>
                </div>
            );
        }
        
        if (normalizedImages.length === 1) {
            return (
                <ZoomImage 
                    imageSrc={getImageUrl(normalizedImages[0])} 
                    productId={productId} 
                />
            );
        }
        
        return (
            <div className="relative">
                <ZoomImage 
                    imageSrc={getImageUrl(normalizedImages[currentImageIndex])} 
                    productId={productId} 
                />
                
                {/* Controles de navegación */}
                {normalizedImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className={`absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                                isDarkMode 
                                    ? 'bg-gray-800/80 hover:bg-gray-700/90 text-white' 
                                    : 'bg-white/80 hover:bg-white/90 text-gray-800'
                            } shadow-lg hover:shadow-xl`}
                            aria-label="Imagen anterior"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <button
                            onClick={handleNextImage}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                                isDarkMode 
                                    ? 'bg-gray-800/80 hover:bg-gray-700/90 text-white' 
                                    : 'bg-white/80 hover:bg-white/90 text-gray-800'
                            } shadow-lg hover:shadow-xl`}
                            aria-label="Imagen siguiente"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        
                        {/* Indicador de imagen actual */}
                        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm font-medium ${
                            isDarkMode 
                                ? 'bg-gray-800/80 text-white' 
                                : 'bg-white/80 text-gray-800'
                        } shadow-lg`}>
                            {currentImageIndex + 1} / {normalizedImages.length}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="w-full space-y-4">
            {/* Botones de control */}
            <div className="flex justify-between items-center mb-2">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {normalizedImages.length} imagen{normalizedImages.length !== 1 ? 'es' : ''}
                </div>
                <div className="flex gap-2">
                    {!isEditing && canEdit ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isDarkMode 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } shadow-md hover:shadow-lg flex items-center gap-2`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {normalizedImages.length === 0 ? 'Agregar Primera Imagen' : 'Agregar Imágenes'}
                        </button>
                    ) : canEdit && isEditing ? (
                        <>
                            <button
                                onClick={handleSaveImages}
                                disabled={isLoading || selectedImages.length === 0}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                    isLoading || selectedImages.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : isDarkMode 
                                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                } shadow-md hover:shadow-lg`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Subiendo... {uploadProgress}%
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {normalizedImages.length === 0 ? 'Subir Imágenes' : `Actualizar (${selectedImages.length})`}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isDarkMode 
                                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                                } shadow-md hover:shadow-lg`}
                            >
                                Cancelar
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {/* Modo de edición */}
            {isEditing && canEdit && (
                <div className={`border rounded-lg p-4 mb-4 ${
                    isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
                }`}>
                    {/* Zona de subida con drag and drop */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                            dragActive
                                ? isDarkMode 
                                    ? 'border-blue-400 bg-blue-900/20 text-blue-300' 
                                    : 'border-blue-500 bg-blue-50 text-blue-600'
                                : isDarkMode 
                                    ? 'border-gray-600 hover:border-blue-400 bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                    : 'border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50 text-gray-600'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                        
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        
                        <p className="text-lg font-medium mb-1">
                            {dragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
                        </p>
                        <p className="text-sm opacity-75">
                            Máximo {MAX_FILES} archivos, 5MB cada uno
                        </p>
                        <p className="text-xs opacity-60 mt-1">
                            Formatos: JPG, PNG, WebP, GIF
                        </p>
                    </div>

                    {/* Errores */}
                    {errors.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-700 font-medium">Errores encontrados:</span>
                            </div>
                            <ul className="text-red-600 text-sm space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Barra de progreso */}
                    {isLoading && uploadProgress > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    Subiendo imágenes...
                                </span>
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    {uploadProgress}%
                                </span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                                <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Vista previa de nuevas imágenes */}
                    {previewImages.length > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className={`text-sm font-medium ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Imágenes seleccionadas ({previewImages.length})
                                </h4>
                                <p className={`text-xs ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    Arrastra para reordenar
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {previewImages.map((preview, index) => (
                                    <div 
                                        key={index} 
                                        className={`relative border rounded-lg p-2 group cursor-move transition-all duration-200 ${
                                            draggedIndex === index 
                                                ? 'opacity-50 scale-95' 
                                                : dragOverIndex === index 
                                                    ? isDarkMode 
                                                        ? 'border-blue-400 bg-blue-900/30 scale-105' 
                                                        : 'border-blue-500 bg-blue-100 scale-105'
                                                    : isDarkMode 
                                                        ? 'border-gray-600 bg-gray-700 hover:border-blue-400' 
                                                        : 'border-gray-300 bg-white hover:border-blue-400'
                                        }`}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDropReorder(e, index)}
                                    >
                                        {/* Indicador de orden */}
                                        <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                        } shadow-lg`}>
                                            {index + 1}
                                        </div>
                                        
                                        {/* Icono de arrastrar */}
                                        <div className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                        }`}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                            </svg>
                                        </div>
                                        
                                        <img
                                            src={preview.url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded"
                                            draggable={false}
                                        />
                                        <button
                                            onClick={() => handleRemovePreview(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                        >
                                            ×
                                        </button>
                                        <p className={`text-xs text-center mt-1 truncate ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`} title={preview.name}>
                                            {preview.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Imagen principal */}
            {renderMainImage()}
            
            {/* Miniaturas */}
            {normalizedImages.length > 1 && (
                <div className="relative">
                    <div 
                        ref={thumbnailsRef}
                        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        {normalizedImages.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => handleImageChange(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                    index === currentImageIndex
                                        ? (isDarkMode ? 'border-blue-400 shadow-lg' : 'border-blue-500 shadow-lg')
                                        : (isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')
                                }`}
                                aria-label={`Ver imagen ${index + 1}`}
                            >
                                <img
                                    src={getImageUrl(image)}
                                    alt={`${productName} - Imagen ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;