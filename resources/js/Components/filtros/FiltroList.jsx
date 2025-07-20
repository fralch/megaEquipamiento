import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTheme } from "../../storage/ThemeContext";

// Componente Range Slider Simplificado
const SimplifiedRangeSlider = ({ filtro, filtrosSeleccionados, setFiltrosSeleccionados, isDarkMode }) => {
  const currentMin = filtrosSeleccionados[filtro.id_filtro]?.min ?? filtro.min_value ?? 0;
  const currentMax = filtrosSeleccionados[filtro.id_filtro]?.max ?? filtro.max_value ?? 100;
  const minValue = filtro.min_value ?? 0;
  const maxValue = filtro.max_value ?? 100;

  const hasChanges = currentMin !== minValue || currentMax !== maxValue;

  const updateRange = (newMin, newMax) => {
    const currentRange = filtrosSeleccionados[filtro.id_filtro] || {};
    setFiltrosSeleccionados({
      ...filtrosSeleccionados,
      [filtro.id_filtro]: {
        ...currentRange,
        min: Math.max(minValue, Math.min(newMin, newMax)),
        max: Math.min(maxValue, Math.max(newMin, newMax))
      }
    });
  };

  const resetRange = () => {
    const newFiltros = { ...filtrosSeleccionados };
    delete newFiltros[filtro.id_filtro];
    setFiltrosSeleccionados(newFiltros);
  };

  // Función para formatear números con coma como separador de miles
  const formatNumber = (num) => {
    return num.toLocaleString('es-PE');
  };

  return (
    <div className="space-y-3">
      {/* Valores actuales */}
      <div className="flex justify-between items-center">
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="font-medium">{formatNumber(currentMin)}</span>
          <span className="ml-1">{filtro.unidad}</span>
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="font-medium">{formatNumber(currentMax)}</span>
          <span className="ml-1">{filtro.unidad}</span>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative py-4">
        <div className="relative h-2">
          {/* Background track */}
          <div className={`absolute w-full h-2 rounded-full ${
            isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
          }`}></div>

          {/* Active track */}
          <div
            className="absolute h-2 rounded-full bg-blue-500"
            style={{
              left: `${((currentMin - minValue) / (maxValue - minValue)) * 100}%`,
              right: `${100 - ((currentMax - minValue) / (maxValue - minValue)) * 100}%`
            }}
          ></div>

          {/* Min slider */}
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step="1"
            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto range-slider-simple"
            value={currentMin}
            onChange={(e) => {
              const newMin = parseFloat(e.target.value);
              updateRange(newMin, currentMax);
            }}
          />

          {/* Max slider */}
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step="1"
            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto range-slider-simple"
            value={currentMax}
            onChange={(e) => {
              const newMax = parseFloat(e.target.value);
              updateRange(currentMin, newMax);
            }}
          />
        </div>
      </div>

      {/* Límites */}
      <div className="flex justify-between">
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatNumber(minValue)} {filtro.unidad}
        </span>
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatNumber(maxValue)} {filtro.unidad}
        </span>
      </div>

      {/* Reset button */}
      {hasChanges && (
        <button
          onClick={resetRange}
          className={`inline-flex items-center gap-1 text-sm hover:underline transition-colors duration-200 ${
            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          <RotateCcw size={14} />
          Resetear
        </button>
      )}
    </div>
  );
};

export default function FiltroList({ filtros, auth, onEditar, onEliminar, filtrosSeleccionados, setFiltrosSeleccionados }) {
    const { isDarkMode } = useTheme();
    
    return (
        <>
            {filtros.map((filtro) => (
                <div key={filtro.id_filtro} className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                            {filtro.nombre}
                        </h3>
                        {auth.user && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEditar(filtro)}
                                    className={`text-sm hover:underline transition-colors duration-200 ${
                                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                    }`}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => onEliminar(filtro)}
                                    className={`text-sm hover:underline transition-colors duration-200 ${
                                        isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                                    }`}
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {filtro.tipo_input === 'checkbox' && (
                        <div className="space-y-2">
                            {filtro.opciones.map((opcion) => (
                                <label key={opcion.id_opcion} className="flex items-center space-x-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-[#1e3a8a] rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25 transition-all duration-200"
                                        checked={Array.isArray(filtrosSeleccionados[filtro.id_filtro]) && filtrosSeleccionados[filtro.id_filtro].includes(opcion.id_opcion)}
                                        onChange={(e) => {
                                            const currentSelected = filtrosSeleccionados[filtro.id_filtro] || [];
                                            const newSelected = e.target.checked
                                                ? [...currentSelected, opcion.id_opcion]
                                                : currentSelected.filter(id => id !== opcion.id_opcion);
                                            setFiltrosSeleccionados({
                                                ...filtrosSeleccionados,
                                                [filtro.id_filtro]: newSelected
                                            });
                                        }}
                                    />
                                    <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-200 group-hover:${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                                        {opcion.etiqueta}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                    
                    {filtro.tipo_input === 'radio' && (
                        <div className="space-y-2">
                            {filtro.opciones.map((opcion) => (
                                <label key={opcion.id_opcion} className="flex items-center space-x-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name={`filtro-${filtro.id_filtro}`}
                                        className="form-radio h-4 w-4 text-[#1e3a8a] focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25 transition-all duration-200"
                                        checked={filtrosSeleccionados[filtro.id_filtro] === opcion.id_opcion || false}
                                        onChange={() => {
                                            setFiltrosSeleccionados({
                                                ...filtrosSeleccionados,
                                                [filtro.id_filtro]: opcion.id_opcion
                                            });
                                        }}
                                    />
                                    <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-200 group-hover:${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                                        {opcion.etiqueta}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                    
                    {filtro.tipo_input === 'range' && (
                        <SimplifiedRangeSlider
                            filtro={filtro}
                            filtrosSeleccionados={filtrosSeleccionados}
                            setFiltrosSeleccionados={setFiltrosSeleccionados}
                            isDarkMode={isDarkMode}
                        />
                    )}
                    
                    {filtro.tipo_input === 'select' && (
                        <select
                            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-25 transition-all duration-200 ${
                                isDarkMode 
                                    ? 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600' 
                                    : 'bg-white border border-gray-300 text-gray-900 hover:border-gray-400'
                            }`}
                            value={filtrosSeleccionados[filtro.id_filtro] !== undefined ? filtrosSeleccionados[filtro.id_filtro] : ''}
                            onChange={(e) => {
                                setFiltrosSeleccionados({
                                    ...filtrosSeleccionados,
                                    [filtro.id_filtro]: e.target.value
                                });
                            }}
                        >
                            <option value="">Seleccionar...</option>
                            {filtro.opciones.map((opcion) => (
                                <option key={opcion.id_opcion} value={opcion.id_opcion}>
                                    {opcion.etiqueta}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            ))}
            
            {/* Botón limpiar filtros al final */}
            {filtros.length > 0 && Object.keys(filtrosSeleccionados).length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => {
                            setFiltrosSeleccionados({});
                            window.location.reload();
                        }}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                            isDarkMode 
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                    >
                        Limpiar todos los filtros
                    </button>
                </div>
            )}

            {/* Estilos CSS simplificados para los sliders */}
            <style jsx global>{`
                .range-slider-simple {
                    -webkit-appearance: none;
                    appearance: none;
                    background: transparent;
                    cursor: pointer;
                }

                .range-slider-simple::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    pointer-events: auto;
                }

                .range-slider-simple::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    background: #2563eb;
                }

                .range-slider-simple::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    pointer-events: auto;
                }

                .range-slider-simple::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    background: #2563eb;
                }

                .range-slider-simple::-moz-range-track {
                    background: transparent;
                    height: 8px;
                    border-radius: 4px;
                    border: none;
                }

                /* Dark mode adjustments */
                .dark .range-slider-simple::-webkit-slider-thumb {
                    border-color: #374151;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
                }
                
                .dark .range-slider-simple::-moz-range-thumb {
                    border-color: #374151;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
                }
            `}</style>
        </>
    );
}