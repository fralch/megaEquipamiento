import React, { useState, useEffect } from 'react';
import { useTheme } from '../../storage/ThemeContext';

const BancoImagenesModal = ({ isOpen, onClose, onSelectImages }) => {
  const { isDarkMode } = useTheme();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('Todas las colecciones');
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/banco-imagenes/api/all');
      const data = await response.json();
      setImages(data.imagenes || []);
      
      const uniqueCollections = [...new Set(data.imagenes.map(img => img.collection_name || 'Sin colección'))];
      setCollections(['Todas las colecciones', ...uniqueCollections]);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollection = collectionFilter === 'Todas las colecciones' || 
                             (image.collection_name || 'Sin colección') === collectionFilter;
    return matchesSearch && matchesCollection;
  });

  const toggleImageSelection = (image) => {
    setSelectedImages(prev => {
      const isSelected = prev.find(img => img.url === image.url);
      if (isSelected) {
        return prev.filter(img => img.url !== image.url);
      } else {
        return [...prev, image];
      }
    });
  };

  const handleSelectImages = () => {
    onSelectImages(selectedImages);
    setSelectedImages([]);
    onClose();
  };

  const isImageSelected = (image) => {
    return selectedImages.find(img => img.url === image.url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-6xl max-h-[90vh] rounded-lg shadow-xl transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Banco de Imágenes
          </h2>
          <button
            onClick={onClose}
            className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className={`p-4 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar imágenes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                }`}
              />
            </div>
            <div className="md:w-64">
              <select
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                }`}
              >
                {collections.map(collection => (
                  <option key={collection} value={collection}>{collection}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className={`text-lg transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Cargando imágenes...
              </div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className={`text-lg transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                No se encontraron imágenes
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
                    isImageSelected(image)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : isDarkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleImageSelection(image)}
                >
                  {isImageSelected(image) && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm z-10">
                      ✓
                    </div>
                  )}
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-24 object-cover rounded"
                  />
                  <div className={`mt-2 text-xs text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <p className="truncate" title={image.name}>{image.name}</p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {image.collection_name || 'Sin colección'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-4 border-t transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {selectedImages.length} imagen(es) seleccionada(s)
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md border transition-colors duration-300 ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSelectImages}
              disabled={selectedImages.length === 0}
              className={`px-4 py-2 rounded-md text-white transition-colors duration-300 ${
                selectedImages.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Seleccionar ({selectedImages.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BancoImagenesModal;
