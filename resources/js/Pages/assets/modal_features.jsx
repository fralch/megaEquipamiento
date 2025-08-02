import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../storage/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const FeatureItem = ({ 
  featureKey, 
  featureValue, 
  onEdit, 
  onDelete, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  isDragging,
  isDragOver,
  index 
}) => {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(featureKey);
  const [editValue, setEditValue] = useState(featureValue);
  const itemRef = useRef(null);

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
    <motion.div
      ref={itemRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        y: 0,
        scale: isDragOver ? 1.02 : 1,
        boxShadow: isDragOver 
          ? '0 8px 16px rgba(0,0,0,0.1)' 
          : '0 2px 4px rgba(0,0,0,0.05)'
      }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, featureKey, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, featureKey, index)}
      className={`group relative flex items-center justify-between p-3 mb-2 border-2 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging 
          ? 'opacity-50 border-blue-400' 
          : isDragOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
      } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      {/* Indicador de posición para drop */}
      {isDragOver && (
        <motion.div
          layoutId="drop-indicator"
          className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.15 }}
        />
      )}

      {isEditing ? (
        <div className="flex-1 flex gap-2 items-center">
          <input
            type="text"
            value={editKey}
            onChange={(e) => setEditKey(e.target.value)}
            className={`flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
            }`}
            placeholder="Característica"
            autoFocus
          />
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
            }`}
            placeholder="Valor"
          />
          <div className="flex gap-1">
            <button
              onClick={handleSaveEdit}
              className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              title="Guardar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              title="Cancelar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex items-center gap-3">
            {/* Icono de drag mejorado */}
            <div 
              className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              title="Arrastrar para reordenar"
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${
                  isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                }`} />
              ))}
            </div>
            
            <div className="flex-1">
              <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {featureKey}
              </span>
              <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {featureValue}
              </span>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className={`p-1.5 rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
              }`}
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(featureKey)}
              className={`p-1.5 rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
              }`}
              title="Eliminar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

const Modal_Features = ({ product, type, onSave, onClose, initialData }) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState({});
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

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
    if (key.trim() && value.trim()) {
      setData(prevData => ({
        ...prevData,
        [key.trim()]: value.trim()
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

  const handleDragStart = (e, key, index) => {
    setDraggedItem(key);
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', key);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetKey, targetIndex) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetKey) {
      const entries = Object.entries(data);
      const draggedIndex = entries.findIndex(([key]) => key === draggedItem);
      
      if (draggedIndex !== -1) {
        const newEntries = [...entries];
        const [draggedEntry] = newEntries.splice(draggedIndex, 1);
        newEntries.splice(targetIndex, 0, draggedEntry);
        
        const newData = {};
        newEntries.forEach(([key, value]) => {
          newData[key] = value;
        });
        
        setData(newData);
      }
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
    setDraggingIndex(null);
  };

  const handleSave = () => {
    onSave(JSON.stringify(data));
  };

  const entries = Object.entries(data);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-2xl rounded-xl ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="text-center">
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Características del Producto
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                    : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
                }`}
                placeholder="Característica (Ej: Color)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              />
              <input
                type="text"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                    : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
                }`}
                placeholder="Valor (Ej: Rojo)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              />
            </div>
            
            <button
              onClick={handleAddFeature}
              disabled={!key.trim() || !value.trim()}
              className="w-full px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg shadow-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Agregar Característica
            </button>
          </div>

          <div className="mt-6">
            <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Características actuales ({entries.length})
            </h4>
            
            <div className={`max-h-64 overflow-y-auto rounded-lg border-2 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } ${entries.length === 0 ? 'p-8' : 'p-3'}`}>
              <AnimatePresence>
                {entries.length > 0 ? (
                  entries.map(([featureKey, featureValue], index) => (
                    <FeatureItem
                      key={featureKey}
                      index={index}
                      featureKey={featureKey}
                      featureValue={featureValue}
                      onEdit={handleEditFeature}
                      onDelete={handleDeleteFeature}
                      onDragStart={handleDragStart}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, featureKey, index)}
                      onDragLeave={handleDragLeave}
                      isDragging={draggedItem === featureKey}
                      isDragOver={dragOverIndex === index}
                    />
                  ))
                ) : (
                  <div className="text-center">
                    <svg className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No hay características agregadas aún
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={entries.length === 0}
              className="px-6 py-2 bg-green-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Modal_Features;