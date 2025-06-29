import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../storage/ThemeContext';

export default function FiltroForm({ nuevoFiltro, setNuevoFiltro, filtroEnEdicion, onSubmit, onCancel, agregarOpcion, eliminarOpcion, actualizarOpcion }) {
    const { isDarkMode } = useTheme();

    const manejarCambioInput = (e, index) => {
        const valor = e.target.value;
        const nuevasOpciones = [...nuevoFiltro.opciones];
        nuevasOpciones[index] = {
            ...nuevasOpciones[index],
            valor: valor,
            etiqueta: valor
        };
        setNuevoFiltro({...nuevoFiltro, opciones: nuevasOpciones});
    };
    return (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4 mb-4 transition-colors duration-200`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {filtroEnEdicion ? 'Editar Filtro' : 'Nuevo Filtro'}
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
                    <input
                        type="text"
                        value={nuevoFiltro.nombre}
                        onChange={(e) => setNuevoFiltro({...nuevoFiltro, nombre: e.target.value})}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#1e3a8a] focus:ring focus:ring-[#1e3a8a] focus:ring-opacity-50 transition-colors duration-200 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tipo de Input</label>
                    <select
                        value={nuevoFiltro.tipo_input}
                        onChange={(e) => setNuevoFiltro({...nuevoFiltro, tipo_input: e.target.value})}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#1e3a8a] focus:ring focus:ring-[#1e3a8a] focus:ring-opacity-50 transition-colors duration-200 ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                        <option value="select">Select</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                    </select>
                </div>
                {nuevoFiltro.tipo_input === 'range' && (
                    <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Unidad</label>
                        <input
                            type="text"
                            value={nuevoFiltro.unidad}
                            onChange={(e) => setNuevoFiltro({...nuevoFiltro, unidad: e.target.value})}
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#1e3a8a] focus:ring focus:ring-[#1e3a8a] focus:ring-opacity-50 transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder="ej: kg, cm, etc."
                        />
                    </div>
                )}


                {['select', 'checkbox', 'radio'].includes(nuevoFiltro.tipo_input) && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Opciones</label>
                            <button
                                type="button"
                                onClick={agregarOpcion}
                                className={`text-sm px-3 py-1 rounded transition-colors duration-200 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-500'
                                }`}
                            >
                                + Agregar Opción
                            </button>
                        </div>
                        {nuevoFiltro.opciones.length === 0 && (
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Agrega al menos una opción para este tipo de filtro
                            </p>
                        )}
                        {nuevoFiltro.opciones.map((opcion, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={opcion.valor || ''}
                                        onChange={(e) => manejarCambioInput(e, index)}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#1e3a8a] focus:ring focus:ring-[#1e3a8a] focus:ring-opacity-50 transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                        placeholder="Valor/Etiqueta (ej: 200 km)"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => eliminarOpcion(index)}
                                    className={`mt-1 transition-colors duration-200 ${
                                        isDarkMode 
                                            ? 'text-red-400 hover:text-red-300' 
                                            : 'text-red-600 hover:text-red-800'
                                    }`}
                                    disabled={nuevoFiltro.opciones.length === 1}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`px-4 py-2 border rounded-md transition-colors duration-200 ${
                            isDarkMode 
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#1e3a8a] text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        Guardar Filtro
                    </button>
                </div>
            </form>
        </div>
    );
}
