import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const ProductSpecifications = ({ 
    specifications, 
    editMode, 
    handleSave, 
    toggleEditMode 
}) => {
    const { auth } = usePage().props;

    // Estado local para edición con secciones
    const [editorContent, setEditorContent] = useState({
        secciones: [],
        textoActual: ""
    });

    // Inicializar contenido del editor a partir de specifications
    useEffect(() => {
        try {
            let spec = specifications;

            if (!spec) {
                setEditorContent({ secciones: [], textoActual: "" });
                return;
            }

            if (typeof spec === 'string') {
                try { spec = JSON.parse(spec); } catch (e) { /* dejar como string */ }
            }

            if (spec?.secciones && Array.isArray(spec.secciones)) {
                setEditorContent({ secciones: spec.secciones, textoActual: "" });
            } else if (Array.isArray(spec)) {
                setEditorContent({ secciones: [{ tipo: 'tabla', datos: spec }], textoActual: "" });
            } else if (typeof spec === 'string') {
                setEditorContent({ secciones: [{ tipo: 'texto', datos: [spec] }], textoActual: "" });
            } else {
                setEditorContent({ secciones: [], textoActual: "" });
            }
        } catch (_) {
            setEditorContent({ secciones: [], textoActual: "" });
        }
    }, [specifications, editMode]);

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

    const handleTablaPaste = (event) => {
        event.preventDefault();
        const textoPegado = event.clipboardData.getData('text');
        processTableContent(textoPegado);
    };

    const handleTablaTextChange = (e) => {
        setEditorContent(prev => ({
            ...prev,
            textoActual: e.target.value
        }));
    };

    const processTableContent = (texto) => {
        if (!texto.trim()) return;

        const tieneTab = texto.includes('\t');
        const tieneMultilineas = texto.trim().split('\n').length > 1;
        const tipo = tieneTab && tieneMultilineas ? 'tabla' : 'texto';

        let nuevaSeccion;
        if (tipo === 'tabla') {
            const filas = texto.trim().split('\n');
            const datosTabla = filas
                .filter(fila => fila.trim() !== '')
                .map(fila => fila.split('\t'));
            nuevaSeccion = { tipo: 'tabla', datos: datosTabla };
        } else {
            nuevaSeccion = { tipo: 'texto', datos: [texto] };
        }

        updateContent([...editorContent.secciones, nuevaSeccion], "");
    };

    const saveText = () => {
        if (!editorContent.textoActual?.trim()) return;
        const nuevaSeccion = { 
            tipo: 'texto', 
            datos: [editorContent.textoActual.trim()] 
        };
        updateContent([...editorContent.secciones, nuevaSeccion], "");
    };

    const updateContent = (secciones, textoActual) => {
        setEditorContent({ secciones, textoActual });
    };

    const limpiarTabla = () => {
        updateContent([], "");
    };

    const eliminarSeccion = (index) => {
        const nuevasSecciones = editorContent.secciones.filter((_, i) => i !== index);
        updateContent(nuevasSecciones, editorContent.textoActual);
    };

    const renderTabla = (seccion) => (
        <table style={{ width: '100%' }} className="border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-100">
                    {seccion.datos[0]?.map((header, index) => (
                        <th key={index} className="border border-gray-300 px-4 py-2 font-semibold text-left">
                            {renderCellContent(header)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {seccion.datos.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                {renderCellContent(cell)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTexto = (seccion) => (
        <div className="bg-gray-50 p-4 rounded-lg">
            {seccion.datos.map((texto, textIndex) => (
                <p key={textIndex} className="whitespace-pre-wrap">
                    {texto}
                </p>
            ))}
        </div>
    );

    // Sin contenido: mostrar botón para agregar cuando no está en modo edición
    const hasSpecifications = !!(specifications && (specifications.secciones || (Array.isArray(specifications) && specifications.length)));
    if (!hasSpecifications && !editMode) {
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
                <div className="mb-2 text-sm text-gray-500">
                    Pega una tabla desde Excel, PDF o una página web. También puedes escribir texto simple y combinar múltiples tablas y textos.
                </div>
                <div className="mb-2">
                    <textarea 
                        onPaste={handleTablaPaste}
                        onChange={handleTablaTextChange}
                        value={editorContent.textoActual}
                        placeholder="Pega el contenido aquí (tabla o texto)" 
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
                        style={{ minHeight: '100px' }}
                    />
                    <div className="flex justify-between mt-2">
                        <button
                            type="button"
                            onClick={saveText}
                            disabled={!editorContent.textoActual?.trim()}
                            className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Agregar como texto
                        </button>
                        {editorContent.secciones.length > 0 && (
                            <button 
                                type="button"
                                onClick={limpiarTabla}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                            >
                                Limpiar todo
                            </button>
                        )}
                    </div>
                </div>

                {editorContent.secciones.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2 text-gray-700">Contenido actual:</h3>
                        {editorContent.secciones.map((seccion, index) => (
                            <div key={index} className="mb-6 border-b pb-4 pt-2 border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium text-gray-700">Sección {index + 1}: {seccion.tipo === 'tabla' ? 'Tabla' : 'Texto'}</h4>
                                    <button 
                                        type="button"
                                        onClick={() => eliminarSeccion(index)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                                {seccion.tipo === 'tabla' 
                                    ? renderTabla(seccion) 
                                    : renderTexto(seccion)
                                }
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <button 
                        onClick={() => {
                            const finalContent = editorContent.textoActual?.trim()
                                ? { secciones: [...editorContent.secciones, { tipo: 'texto', datos: [editorContent.textoActual.trim()] }], textoActual: "" }
                                : editorContent;
                            handleSave?.(finalContent);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Guardar
                    </button>
                    <button 
                        onClick={toggleEditMode}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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
                                            {renderCellContent(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              
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
                                                    {renderCellContent(cell)}
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
          
        </div>
    );
};

export default ProductSpecifications;
