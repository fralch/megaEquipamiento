import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../storage/ThemeContext';

export default function FiltroForm({ nuevoFiltro, setNuevoFiltro, filtroEnEdicion, onSubmit, onCancel, agregarOpcion, eliminarOpcion, actualizarOpcion }) {
    const { isDarkMode } = useTheme();
    const [sugerencias, setSugerencias] = useState({});
    const [sugerenciaActiva, setSugerenciaActiva] = useState({});
    const [sugerenciaTexto, setSugerenciaTexto] = useState({});
    const [escribiendo, setEscribiendo] = useState({});
    const inputRefs = useRef({});
    const timeoutRefs = useRef({});

    // Limpiar timeouts al desmontar el componente
    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
        };
    }, []);

    // Función para extraer unidades de las opciones existentes
    const extraerUnidades = () => {
        const unidades = new Set();
        nuevoFiltro.opciones.forEach(opcion => {
            if (opcion.valor) {
                const match = opcion.valor.match(/\b(\w+)$/);
                if (match && isNaN(match[1])) {
                    unidades.add(match[1]);
                }
            }
        });
        return Array.from(unidades);
    };

    // Función para detectar si el texto termina con un número seguido de espacio
    const detectarNumeroConEspacio = (texto) => {
        const match = texto.match(/(\d+)\s*$/);
        return match ? match[1] : null;
    };

    // Función para manejar el input con autocompletado
    const manejarCambioInput = (e, index) => {
        const valor = e.target.value;
        const nuevasOpciones = [...nuevoFiltro.opciones];
        nuevasOpciones[index] = {
            ...nuevasOpciones[index],
            valor: valor,
            etiqueta: valor
        };
        setNuevoFiltro({...nuevoFiltro, opciones: nuevasOpciones});

        // Marcar que está escribiendo
        setEscribiendo(prev => ({
            ...prev,
            [index]: true
        }));

        // Limpiar timeout anterior
        if (timeoutRefs.current[index]) {
            clearTimeout(timeoutRefs.current[index]);
        }

        // Detectar si se escribió un número seguido de espacio
        const numeroDetectado = detectarNumeroConEspacio(valor);
        if (numeroDetectado && valor.endsWith(' ')) {
            const unidadesDisponibles = extraerUnidades();
            if (unidadesDisponibles.length > 0) {
                setSugerencias(prev => ({
                    ...prev,
                    [index]: unidadesDisponibles
                }));
                setSugerenciaActiva(prev => ({
                    ...prev,
                    [index]: 0
                }));
                setSugerenciaTexto(prev => ({
                    ...prev,
                    [index]: unidadesDisponibles[0]
                }));
            }
        } else {
            // Limpiar sugerencias si no hay número con espacio
            setSugerencias(prev => {
                const nuevas = {...prev};
                delete nuevas[index];
                return nuevas;
            });
            setSugerenciaActiva(prev => {
                const nuevas = {...prev};
                delete nuevas[index];
                return nuevas;
            });
            setSugerenciaTexto(prev => {
                const nuevas = {...prev};
                delete nuevas[index];
                return nuevas;
            });
        }

        // Configurar timeout para detectar cuando deja de escribir
        timeoutRefs.current[index] = setTimeout(() => {
            setEscribiendo(prev => ({
                ...prev,
                [index]: false
            }));
        }, 500); // 500ms después de dejar de escribir
    };

    // Función para manejar teclas especiales
    const manejarTecla = (e, index) => {
        const sugerenciasIndex = sugerencias[index];
        if (!sugerenciasIndex || sugerenciasIndex.length === 0) return;

        if (e.key === 'Tab') {
            e.preventDefault();
            const unidadSeleccionada = sugerenciasIndex[sugerenciaActiva[index] || 0];
            const valorActual = nuevoFiltro.opciones[index].valor;
            const valorSinEspacio = valorActual.replace(/\s+$/, '');
            const nuevoValor = valorSinEspacio + ' ' + unidadSeleccionada;
            
            const nuevasOpciones = [...nuevoFiltro.opciones];
            nuevasOpciones[index] = {
                ...nuevasOpciones[index],
                valor: nuevoValor,
                etiqueta: nuevoValor
            };
            setNuevoFiltro({...nuevoFiltro, opciones: nuevasOpciones});
            
            // Limpiar sugerencias
            setSugerencias(prev => {
                const nuevas = {...prev};
                delete nuevas[index];
                return nuevas;
            });
            setSugerenciaActiva(prev => {
                const nuevas = {...prev};
                delete nuevas[index];
                return nuevas;
            });
        } else if (e.key === 'ArrowUp' && sugerenciasIndex.length > 1) {
            e.preventDefault();
            const nuevoIndice = Math.max(0, (sugerenciaActiva[index] || 0) - 1);
            setSugerenciaActiva(prev => ({
                ...prev,
                [index]: nuevoIndice
            }));
            setSugerenciaTexto(prev => ({
                ...prev,
                [index]: sugerenciasIndex[nuevoIndice]
            }));
        } else if (e.key === 'ArrowDown' && sugerenciasIndex.length > 1) {
            e.preventDefault();
            const nuevoIndice = Math.min(sugerenciasIndex.length - 1, (sugerenciaActiva[index] || 0) + 1);
            setSugerenciaActiva(prev => ({
                ...prev,
                [index]: nuevoIndice
            }));
            setSugerenciaTexto(prev => ({
                ...prev,
                [index]: sugerenciasIndex[nuevoIndice]
            }));
        } else if (e.key === 'Escape') {
            setSugerencias(prev => {
                const nuevas = {...prev};
                delete nuevas[index];
                return nuevas;
            });
            setSugerenciaActiva(prev => {
                const nuevas = {...prev};
                delete nuevas[index];
                return nuevas;
            });
            setSugerenciaTexto(prev => {
                const nuevas = {...prev};
                delete nuevas[index];
                return nuevas;
            });
        }
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
                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50 transition-colors duration-200 ${
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
                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50 transition-colors duration-200 ${
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
                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50 transition-colors duration-200 ${
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
                                <div className="flex-1 relative">
                                    <div className="relative">
                                        <input
                                            ref={el => inputRefs.current[index] = el}
                                            type="text"
                                            value={opcion.valor || ''}
                                            onChange={(e) => manejarCambioInput(e, index)}
                                            onKeyDown={(e) => manejarTecla(e, index)}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50 transition-colors duration-200 relative z-10 bg-transparent ${
                                                isDarkMode 
                                                    ? 'border-gray-600 text-white placeholder-gray-400' 
                                                    : 'border-gray-300 text-gray-900'
                                            }`}
                                            placeholder="Valor/Etiqueta (ej: 200 km)"
                                            required
                                            style={{ backgroundColor: 'transparent' }}
                                        />
                                        {/* Texto de sugerencia en gris */}
                                        {sugerenciaTexto[index] && !escribiendo[index] && opcion.valor && opcion.valor.endsWith(' ') && (
                                            <div 
                                                className={`absolute top-0 left-0 right-0 bottom-0 mt-2 px-3  pointer-events-none z-0 rounded-md flex items-center ${
                                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                                }`}
                                                style={{
                                                    fontSize: 'inherit',
                                                    fontFamily: 'inherit',
                                                    lineHeight: 'inherit',
                                                    whiteSpace: 'pre',
                                                    marginTop: '-1px'
                                                }}
                                            >
                                                {opcion.valor}{sugerenciaTexto[index]}
                                            </div>
                                        )}
                                        {/* Fondo del input */}
                                        <div className={`absolute inset-0 mt-1 rounded-md -z-10 ${
                                            isDarkMode ? 'bg-gray-700' : 'bg-white'
                                        }`}></div>
                                    </div>

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
                        className="px-4 py-2 bg-[#184f96] text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        Guardar Filtro
                    </button>
                </div>
            </form>
        </div>
    );
}
