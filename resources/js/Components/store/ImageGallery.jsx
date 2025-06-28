import React, { useState, useRef } from 'react';
import { useTheme } from '../../storage/ThemeContext';
import ZoomImage from './ZoomImage';

const ImageGallery = ({ images, productId, productName }) => {
    const { isDarkMode } = useTheme();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const thumbnailsRef = useRef(null);

    // Normalizar imágenes - puede ser string o array
    const normalizedImages = React.useMemo(() => {
        if (!images) return [];
        
        if (Array.isArray(images)) {
            return images.filter(img => img && img.trim() !== '');
        }
        
        // Si es string, convertir a array
        return images.trim() !== '' ? [images] : [];
    }, [images]);

    // Función para obtener URL completa de imagen
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        return imagePath.startsWith('http') ? imagePath : `/${imagePath}`;
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

    // Si no hay imágenes, mostrar placeholder
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

    // Si solo hay una imagen, usar ZoomImage directamente
    if (normalizedImages.length === 1) {
        return (
            <ZoomImage 
                imageSrc={getImageUrl(normalizedImages[0])} 
                productId={productId} 
            />
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Imagen principal con zoom */}
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