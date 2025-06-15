import React from "react";

import { useTheme } from "../../storage/ThemeContext";

export default function FiltroList({ filtros, auth, onEditar, onEliminar, filtrosSeleccionados, setFiltrosSeleccionados }) {
    const { isDarkMode } = useTheme();
    return (
        <>
            {filtros.map((filtro) => (
                <div key={filtro.id_filtro} className="mb-4">
                    <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{filtro.nombre}</h3>
                    {auth.user && (
                        <div className="flex justify-end space-x-2">
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
                    {filtro.tipo_input === 'checkbox' && (
                        <div className="space-y-2">
                            {filtro.opciones.map((opcion) => (
                                <label key={opcion.id_opcion} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-[#184f96]"
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
                                    <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-200`}>{opcion.etiqueta}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {filtro.tipo_input === 'radio' && (
                        <div className="space-y-2">
                            {filtro.opciones.map((opcion) => (
                                <label key={opcion.id_opcion} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name={`filtro-${filtro.id_filtro}`}
                                        className="form-radio h-4 w-4 text-[#184f96]"
                                        checked={filtrosSeleccionados[filtro.id_filtro] === opcion.id_opcion || false}
                                        onChange={() => {
                                            setFiltrosSeleccionados({
                                                ...filtrosSeleccionados,
                                                [filtro.id_filtro]: opcion.id_opcion
                                            });
                                        }}
                                    />
                                    <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-200`}>{opcion.etiqueta}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {filtro.tipo_input === 'range' && (
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                className="w-full"
                                value={filtrosSeleccionados[filtro.id_filtro] !== undefined ? filtrosSeleccionados[filtro.id_filtro] : 0}
                                onChange={(e) => {
                                    setFiltrosSeleccionados({
                                        ...filtrosSeleccionados,
                                        [filtro.id_filtro]: e.target.value
                                    });
                                }}
                            />
                            <div className={`flex justify-between text-sm transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                <span>0 {filtro.unidad}</span>
                                <span>100 {filtro.unidad}</span>
                            </div>
                        </div>
                    )}
                    {filtro.tipo_input === 'select' && (
                        <select
                            className={`w-full rounded focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50 transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
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
            {filtros.length > 0 && (
                <button
                    onClick={() => {
                        setFiltrosSeleccionados({});
                        window.location.reload();
                    }}
                    className={`w-full py-2 px-4 rounded transition-colors duration-200 ${
                        isDarkMode 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Limpiar filtros
                </button>
            )}
        </>
    );
}
