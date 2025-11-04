import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiGrid, FiSave } from 'react-icons/fi';
import { useTheme } from '../../../../storage/ThemeContext';

export default function CreateSectorModal({ isOpen, onClose }) {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState({ nombre: '', descripcion: '', activo: true });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const reset = () => {
    setForm({ nombre: '', descripcion: '', activo: true });
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      await axios.post('/crm/clientes/sectores/store', form);
      handleClose();
    } catch (err) {
      const respErrors = err?.response?.data?.errors || {};
      setErrors(respErrors);
      alert(err?.response?.data?.message || 'No se pudo crear el sector');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-xl rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FiGrid className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Nuevo Sector</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Crea un nuevo sector para clientes/empresas</p>
            </div>
          </div>
          <button onClick={handleClose} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} ${errors.nombre ? 'border-red-500' : ''}`}
              placeholder="Ej. Salud, Minería, Educación"
              maxLength={100}
              required
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg resize-y min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="Descripción opcional del sector"
            />
            {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="activo"
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
              className="rounded"
            />
            <label htmlFor="activo" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Activo</label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleClose} className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Cancelar</button>
            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <FiSave className="w-4 h-4" />
              {processing ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}