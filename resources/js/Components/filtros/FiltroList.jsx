import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTheme } from "../../storage/ThemeContext";

// Componente Range Slider Mejorado
const ImprovedRangeSlider = ({ filtro, filtrosSeleccionados, setFiltrosSeleccionados, isDarkMode }) => {
  const currentMin = filtrosSeleccionados[filtro.id_filtro]?.min ?? filtro.min_value ?? 0;
  const currentMax = filtrosSeleccionados[filtro.id_filtro]?.max ?? filtro.max_value ?? 100;
  const minValue = filtro.min_value ?? 0;
  const maxValue = filtro.max_value ?? 100;
  
  const [isDragging, setIsDragging] = useState(false);
  
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

  return (
    <div className="space-y-4">
      {/* Displays de valores mejorados */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`relative overflow-hidden rounded-xl p-3 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50' 
            : 'bg-gradient-to-br from-white to-gray-50/80 border border-gray-200/50 shadow-sm'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
          <div className="relative">
            <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Mínimo
            </div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentMin.toLocaleString()}
              <span className={`text-xs font-normal ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {filtro.unidad}
              </span>
            </div>
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-xl p-3 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50' 
            : 'bg-gradient-to-br from-white to-gray-50/80 border border-gray-200/50 shadow-sm'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
          <div className="relative">
            <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Máximo
            </div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentMax.toLocaleString()}
              <span className={`text-xs font-normal ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {filtro.unidad}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Container Mejorado */}
      <div className={`relative p-4 rounded-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/30' 
          : 'bg-gradient-to-br from-gray-50/80 to-white border border-gray-200/50'
      }`}>
        <div className="relative py-6">
          {/* Labels de límites */}
          <div className="flex justify-between mb-4">
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}>
              {minValue} {filtro.unidad}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}>
              {maxValue} {filtro.unidad}
            </div>
          </div>

          <div className="relative h-3">
            {/* Background track con gradiente */}
            <div className={`absolute w-full h-3 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-700/80 to-gray-600/80' 
                : 'bg-gradient-to-r from-gray-200 to-gray-300'
            }`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            {/* Active track con gradiente animado */}
            <div
              className={`absolute h-3 rounded-full transition-all duration-300 shadow-lg ${
                isDragging ? 'shadow-blue-500/50' : 'shadow-blue-500/30'
              }`}
              style={{
                left: `${((currentMin - minValue) / (maxValue - minValue)) * 100}%`,
                right: `${100 - ((currentMax - minValue) / (maxValue - minValue)) * 100}%`,
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)' 
                  : 'linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb)'
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>
              {isDragging && (
                <div className="absolute inset-0 rounded-full animate-pulse bg-white/20"></div>
              )}
            </div>

            {/* Min slider */}
            <input
              type="range"
              min={minValue}
              max={maxValue}
              step="1"
              className="absolute w-full h-3 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto range-slider-improved"
              value={currentMin}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
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
              className="absolute w-full h-3 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto range-slider-improved"
              value={currentMax}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onChange={(e) => {
                const newMax = parseFloat(e.target.value);
                updateRange(currentMin, newMax);
              }}
            />
          </div>

          {/* Indicador de progreso */}
          <div className="flex justify-between items-center mt-4 px-1">
            <div className={`flex items-center gap-2 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Rango seleccionado
            </div>
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {Math.round(((currentMax - currentMin) / (maxValue - minValue)) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Reset button */}
      {hasChanges && (
        <div className="flex justify-center">
          <button
            onClick={resetRange}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
              isDarkMode
                ? 'text-blue-400 hover:bg-gray-800/80 hover:text-blue-300 bg-gray-800/40 border border-gray-700/50'
                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 bg-blue-50/50 border border-blue-200/50'
            }`}
          >
            <RotateCcw size={14} />
            Resetear rango
          </button>
        </div>
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
                        <ImprovedRangeSlider
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

            {/* Estilos CSS mejorados para los sliders */}
            <style jsx global>{`
                .range-slider-improved {
                    -webkit-appearance: none;
                    appearance: none;
                    background: transparent;
                    cursor: pointer;
                }

                .range-slider-improved::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ffffff, #f8fafc);
                    border: 3px solid #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: auto;
                }

                .range-slider-improved::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(0, 0, 0, 0.15);
                    border-color: #2563eb;
                }

                .range-slider-improved::-webkit-slider-thumb:active {
                    transform: scale(1.2);
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.6), 0 4px 8px rgba(0, 0, 0, 0.2);
                }

                .range-slider-improved::-moz-range-thumb {
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ffffff, #f8fafc);
                    border: 3px solid #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: auto;
                }

                .range-slider-improved::-moz-range-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(0, 0, 0, 0.15);
                    border-color: #2563eb;
                }

                .range-slider-improved::-moz-range-track {
                    background: transparent;
                    height: 12px;
                    border-radius: 6px;
                    border: none;
                }

                /* Dark mode adjustments */
                .dark .range-slider-improved::-webkit-slider-thumb {
                    background: linear-gradient(135deg, #1f2937, #374151);
                    border-color: #60a5fa;
                    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .dark .range-slider-improved::-webkit-slider-thumb:hover {
                    border-color: #93c5fd;
                    box-shadow: 0 6px 16px rgba(96, 165, 250, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4);
                }

                .dark .range-slider-improved::-moz-range-thumb {
                    background: linear-gradient(135deg, #1f2937, #374151);
                    border-color: #60a5fa;
                    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .dark .range-slider-improved::-moz-range-thumb:hover {
                    border-color: #93c5fd;
                    box-shadow: 0 6px 16px rgba(96, 165, 250, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4);
                }
            `}</style>
        </>
    );
}