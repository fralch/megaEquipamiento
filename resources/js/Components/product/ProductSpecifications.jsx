import React from 'react';
import { usePage } from '@inertiajs/react';

const ProductSpecifications = ({ 
    specifications, 
    editMode, 
    tempInputs, 
    handleInputChange, 
    handleSave, 
    toggleEditMode 
}) => {
    const { auth } = usePage().props;

    if (!specifications || (!specifications.secciones && !specifications.length)) {
        return (
            <div className="p-4">
                <p>No hay especificaciones técnicas disponibles.</p>
                {auth.user && (
                    <button 
                        onClick={toggleEditMode}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Agregar especificaciones
                    </button>
                )}
            </div>
        );
    }

    if (editMode) {
        return (
            <div className="p-4">
                <textarea
                    className="w-full p-2 border rounded"
                    value={tempInputs}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Ingrese las especificaciones técnicas"
                    rows={10}
                />
                <div className="mt-2">
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                    >
                        Guardar
                    </button>
                    <button 
                        onClick={toggleEditMode}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    // Handle legacy format (direct array)
    if (Array.isArray(specifications)) {
        return (
            <div className="p-4">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                {specifications[0]?.map((header, index) => (
                                    <th key={index} className="border border-gray-300 px-4 py-2 font-semibold text-left">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {specifications.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {auth.user && (
                    <button 
                        onClick={toggleEditMode}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Editar especificaciones
                    </button>
                )}
            </div>
        );
    }

    // Handle new format with sections
    return (
        <div className="p-4 space-y-6">
            {specifications.secciones.map((seccion, index) => (
                <div key={index} className="mb-4">
                    {seccion.tipo === 'tabla' ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        {seccion.datos[0]?.map((header, index) => (
                                            <th key={index} className="border border-gray-300 px-4 py-2 font-semibold text-left">
                                                {header?.replace?.(/\\r$/, '') || header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {seccion.datos.slice(1).map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                                    {cell?.replace?.(/\\r$/, '') || cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            {seccion.datos.map((texto, textIndex) => (
                                <p key={textIndex} className="whitespace-pre-wrap">
                                    {texto}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {auth.user && (
                <button 
                    onClick={toggleEditMode}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Editar especificaciones
                </button>
            )}
        </div>
    );
};

export default ProductSpecifications;
