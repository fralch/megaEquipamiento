import React, { useState, useEffect } from 'react';

const Modal_Features = ({ product, type, onSave, onClose, initialData }) => {
  const [data, setData] = useState({});
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

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

  const handleSave = () => {
    onSave(JSON.stringify(data));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Características
          </h3>
          <div className="mt-2 px-7 py-3">
            <input
              type="text"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none mb-2"
              placeholder="ID"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <input
              type="text"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none mb-2"
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
            <textarea
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              rows="4"
              value={JSON.stringify(data, null, 2)}
              readOnly
            />
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
              className="ml-3 px-4 py-2 bg-gray-100 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
