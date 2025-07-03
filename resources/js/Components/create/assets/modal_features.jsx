// ESTE MODAL ES PRINCIPALMENTE PARA LA GESTIÓN DE CARACTERÍSTICAS Y DATOS TÉCNICOS
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../storage/ThemeContext';

const Modal_Features = ({ product, type, onSave, onClose, initialData }) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState({});
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    try {
      if (typeof initialData === 'string') {
        setData(JSON.parse(initialData));
      } else if (typeof initialData === 'object' && initialData) {
        setData(initialData);
      } else if (product && product[type]) {
        setData(product[type]);
      }
    } catch (error) {
      console.error('Invalid initial data:', error);
      setData({});
    }
  }, [initialData, product, type]);

  const handleAddFeature = () => {
    if (key && value) {
      setData(prevData => ({
        ...prevData,
        [key]: value
      }));
      setKey('');
      setValue('');
    }
  };

  const handleDeleteFeature = (keyToDelete) => {
    setData(prevData => {
      const newData = { ...prevData };
      delete newData[keyToDelete];
      return newData;
    });
  };

  const handleSave = () => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {type === 'caracteristicas' ? 'Características' : 'Datos Técnicos'}
        </h2>
        
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Agregar nueva característica:</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Clave"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            />
            <input
              type="text"
              placeholder="Valor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            />
          </div>
          <button
            onClick={handleAddFeature}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Agregar
          </button>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Características actuales:</label>
          <div className={`space-y-2 max-h-60 overflow-y-auto border rounded-md p-2 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            {Object.keys(data).length === 0 ? (
              <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay características agregadas</p>
            ) : (
              Object.entries(data).map(([featureKey, featureValue]) => (
                <div key={featureKey} className={`flex items-center justify-between p-2 border rounded ${isDarkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                  <div className="flex-1">
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{featureKey}:</span> <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{featureValue}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFeature(featureKey)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    title="Eliminar"
                  >
                    <svg viewBox="0 0 448 512" className="w-3 h-3 fill-current">
                      <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-white rounded-md ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal_Features;
