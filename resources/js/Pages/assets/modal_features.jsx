import React, { useState, useEffect } from 'react';
import { useTheme } from '../../storage/ThemeContext';

const FeatureItem = ({ featureKey, featureValue, onEdit, onDelete, onDragStart, onDragOver, onDrop, isDragging }) => {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(featureKey);
  const [editValue, setEditValue] = useState(featureValue);

  const handleSaveEdit = () => {
    if (editKey.trim() && editValue.trim()) {
      onEdit(featureKey, editKey.trim(), editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditKey(featureKey);
    setEditValue(featureValue);
    setIsEditing(false);
  };

  return (
    <div 
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, featureKey)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, featureKey)}
      className={`flex items-center justify-between p-2 mb-2 border rounded cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${
        isDarkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-300 hover:bg-gray-50'
      }`}
    >
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={editKey}
            onChange={(e) => setEditKey(e.target.value)}
            className={`flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            placeholder="Característica"
          />
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
            placeholder="Valor"
          />
          <button
            onClick={handleSaveEdit}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            ✓
          </button>
          <button
            onClick={handleCancelEdit}
            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{featureKey}:</span>
            <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{featureValue}</span>
          </div>
          <div className="flex gap-1">
            <div className="px-2 py-1 text-gray-400 cursor-grab" title="Arrastrar para reordenar">
              <svg viewBox="0 0 320 512" className="w-3 h-3 fill-current">
                <path d="M40 352l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zm192 0l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 320c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 192l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 160c-22.1 0-40-17.9-40-40L0 72C0 49.9 17.9 32 40 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40z"/>
              </svg>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              title="Editar"
            >
              <svg viewBox="0 0 512 512" className="w-3 h-3 fill-current">
              <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/>
              </svg>
            </button>
            <button
              onClick={() => onDelete(featureKey)}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              title="Eliminar"
            >
              <svg viewBox="0 0 448 512" className="w-3 h-3 fill-current">
                <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Modal_Features = ({ product, type, onSave, onClose, initialData }) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState({});
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  useEffect(() => {
    try {
      if (typeof initialData === 'string') {
        setData(JSON.parse(initialData));
      } else if (typeof initialData === 'object') {
        setData(initialData);
      }
    } catch (error) {
      console.error('Invalid initial data:', error);
      setData({});
    }
  }, [initialData]);

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

  const handleEditFeature = (oldKey, newKey, newValue) => {
    setData(prevData => {
      const newData = { ...prevData };
      if (oldKey !== newKey) {
        delete newData[oldKey];
      }
      newData[newKey] = newValue;
      return newData;
    });
  };

  const handleDragStart = (e, key) => {
    setDraggedItem(key);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetKey) {
      const entries = Object.entries(data);
      const draggedIndex = entries.findIndex(([key]) => key === draggedItem);
      const targetIndex = entries.findIndex(([key]) => key === targetKey);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Reordenar las entradas
        const newEntries = [...entries];
        const [draggedEntry] = newEntries.splice(draggedIndex, 1);
        newEntries.splice(targetIndex, 0, draggedEntry);
        
        // Crear nuevo objeto con el orden actualizado
        const newData = {};
        newEntries.forEach(([key, value]) => {
          newData[key] = value;
        });
        
        setData(newData);
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleSave = () => {
    onSave(JSON.stringify(data));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className={`relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
        <div className="mt-3 text-center">
          <h3 className={`text-lg leading-6 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Características
          </h3>
          <div className="mt-2 px-7 py-3">
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none mb-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`}
              placeholder="ID"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none mb-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`}
              placeholder="Dato"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button
              onClick={handleAddFeature}
              className="w-full px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Agregar Característica
            </button>
          </div>
          <div className="mt-2 px-7 py-3">
            <h4 className={`text-md font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Características actuales:</h4>
            <div className={`max-h-40 overflow-y-auto border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
              {Object.keys(data).length > 0 ? (
                Object.entries(data).map(([featureKey, featureValue]) => (
                  <FeatureItem
                    key={featureKey}
                    featureKey={featureKey}
                    featureValue={featureValue}
                    onEdit={handleEditFeature}
                    onDelete={handleDeleteFeature}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragging={draggedItem === featureKey}
                  />
                ))
              ) : (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay características agregadas</p>
              )}
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Guardar
            </button>
            <button
              onClick={onClose}
              className={`ml-3 px-4 py-2 text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300'}`}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal_Features;
