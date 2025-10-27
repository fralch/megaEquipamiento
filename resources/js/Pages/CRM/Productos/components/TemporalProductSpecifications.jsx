import React from 'react';
import { useTheme } from '../../../../storage/ThemeContext';

const TemporalProductSpecifications = ({
    specifications,
    editMode = true,
    value,
    onChange,
    readOnly = false
}) => {
    const { isDarkMode } = useTheme();

    const renderCellContent = (cell) => {
        if (cell === null || cell === undefined) {
            return '';
        }

        if (typeof cell === 'object') {
            try {
                if (Array.isArray(cell)) {
                    return cell.join(', ');
                }
                return JSON.stringify(cell);
            } catch (error) {
                console.error('Error rendering cell content:', error);
                return '[Error rendering content]';
            }
        }

        if (typeof cell === 'string') {
            return cell.replace(/\\r$/, '') || cell;
        }

        return String(cell);
    };

    // Función para convertir objeto de especificaciones a texto de tabla
    const specificationsToText = (specs) => {
        if (!specs || typeof specs !== 'object') return '';

        const entries = Object.entries(specs);
        if (entries.length === 0) return '';

        // Crear formato de tabla con headers
        let text = 'Especificación\tValor\n';
        entries.forEach(([key, value]) => {
            text += `${key}\t${value}\n`;
        });

        return text;
    };

    // Función para parsear texto a estructura de tabla
    const parseTextToTable = (text) => {
        if (!text || !text.trim()) return null;

        const lines = text.trim().split('\n').filter(line => line.trim());
        if (lines.length === 0) return null;

        // Detectar si es formato tabla (usando tabs o múltiples espacios)
        const hasTableFormat = lines.some(line => line.includes('\t') || /\s{2,}/.test(line));

        if (hasTableFormat) {
            // Procesar como tabla
            const rows = lines.map(line => {
                // Split por tab o múltiples espacios
                return line.split(/\t|\s{2,}/).map(cell => cell.trim()).filter(cell => cell);
            });

            return {
                tipo: 'tabla',
                datos: rows
            };
        }

        // Si no es tabla, devolver como texto simple
        return {
            tipo: 'texto',
            datos: lines
        };
    };

    // Modo edición (para crear/editar)
    if (editMode && !readOnly) {
        return (
            <div>
                <div className="mb-2">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Especificaciones Técnicas
                    </label>
                    <p className={`text-xs mt-1 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Formato: Ingrese las especificaciones como tabla (usando Tab para separar columnas) o como texto libre.
                    </p>
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Ejemplo de tabla:<br />
                        <code className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Especificación    Valor<br />
                            Voltaje    220V<br />
                            Potencia    100W
                        </code>
                    </p>
                </div>
                <textarea
                    className={`w-full p-3 border rounded-lg font-mono text-sm ${
                        isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={value || specificationsToText(specifications)}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Ingrese las especificaciones técnicas. Use Tab para crear columnas o escriba texto libre."
                    rows={8}
                />
            </div>
        );
    }

    // Modo vista (solo lectura)
    const parsedSpecs = typeof value === 'string' ? parseTextToTable(value) : null;
    const specsToDisplay = parsedSpecs || specifications;

    if (!specsToDisplay) {
        return (
            <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>No hay especificaciones técnicas disponibles.</p>
            </div>
        );
    }

    // Si es un objeto simple (formato antiguo de productos temporales)
    if (typeof specsToDisplay === 'object' && !specsToDisplay.tipo && !Array.isArray(specsToDisplay)) {
        const entries = Object.entries(specsToDisplay);
        if (entries.length === 0) {
            return (
                <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>No hay especificaciones técnicas disponibles.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className={`min-w-full border-collapse border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <thead>
                        <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                            <th className={`border px-4 py-2 font-semibold text-left ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-900'}`}>
                                Especificación
                            </th>
                            <th className={`border px-4 py-2 font-semibold text-left ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-900'}`}>
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(([key, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-50') : (isDarkMode ? 'bg-gray-900' : 'bg-white')}>
                                <td className={`border px-4 py-2 ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-900'}`}>
                                    {key}
                                </td>
                                <td className={`border px-4 py-2 ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-900'}`}>
                                    {value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Si tiene formato de sección con tipo
    if (specsToDisplay.tipo === 'tabla') {
        if (!specsToDisplay.datos || specsToDisplay.datos.length === 0) {
            return (
                <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>No hay especificaciones técnicas disponibles.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className={`min-w-full border-collapse border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <thead>
                        <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                            {specsToDisplay.datos[0]?.map((header, index) => (
                                <th key={index} className={`border px-4 py-2 font-semibold text-left ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-900'}`}>
                                    {renderCellContent(header)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {specsToDisplay.datos.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-50') : (isDarkMode ? 'bg-gray-900' : 'bg-white')}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className={`border px-4 py-2 ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-900'}`}>
                                        {renderCellContent(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Si es formato texto
    if (specsToDisplay.tipo === 'texto') {
        return (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                {specsToDisplay.datos.map((texto, textIndex) => (
                    <p key={textIndex} className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {texto}
                    </p>
                ))}
            </div>
        );
    }

    // Formato legacy: array directo
    if (Array.isArray(specsToDisplay)) {
        if (specsToDisplay.length === 0) {
            return (
                <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>No hay especificaciones técnicas disponibles.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className={`min-w-full border-collapse border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <thead>
                        <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                            {specsToDisplay[0]?.map((header, index) => (
                                <th key={index} className={`border px-4 py-2 font-semibold text-left ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-300 text-gray-900'}`}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {specsToDisplay.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-50') : (isDarkMode ? 'bg-gray-900' : 'bg-white')}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className={`border px-4 py-2 ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-900'}`}>
                                        {renderCellContent(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Formato de especificaciones no reconocido.</p>
        </div>
    );
};

export default TemporalProductSpecifications;
