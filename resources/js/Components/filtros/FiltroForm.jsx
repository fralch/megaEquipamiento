import React from "react";

export default function FiltroForm({ nuevoFiltro, setNuevoFiltro, filtroEnEdicion, onSubmit, onCancel, agregarOpcion, eliminarOpcion, actualizarOpcion }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium mb-4">
                {filtroEnEdicion ? 'Editar Filtro' : 'Nuevo Filtro'}
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        value={nuevoFiltro.nombre}
                        onChange={(e) => setNuevoFiltro({...nuevoFiltro, nombre: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Input</label>
                    <select
                        value={nuevoFiltro.tipo_input}
                        onChange={(e) => setNuevoFiltro({...nuevoFiltro, tipo_input: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                    >
                        <option value="select">Select</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                        <option value="range">Range</option>
                    </select>
                </div>
                {nuevoFiltro.tipo_input === 'range' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unidad</label>
                        <input
                            type="text"
                            value={nuevoFiltro.unidad}
                            onChange={(e) => setNuevoFiltro({...nuevoFiltro, unidad: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                            placeholder="ej: kg, cm, etc."
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        value={nuevoFiltro.descripcion}
                        onChange={(e) => setNuevoFiltro({...nuevoFiltro, descripcion: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                        rows="3"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={nuevoFiltro.obligatorio}
                        onChange={(e) => setNuevoFiltro({...nuevoFiltro, obligatorio: e.target.checked})}
                        className="rounded border-gray-300 text-[#184f96] shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Obligatorio</label>
                </div>
                {['select', 'checkbox', 'radio'].includes(nuevoFiltro.tipo_input) && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">Opciones</label>
                            <button
                                type="button"
                                onClick={agregarOpcion}
                                className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
                            >
                                + Agregar Opción
                            </button>
                        </div>
                        {nuevoFiltro.opciones.length === 0 && (
                            <p className="text-sm text-gray-500">
                                Agrega al menos una opción para este tipo de filtro
                            </p>
                        )}
                        {nuevoFiltro.opciones.map((opcion, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={opcion.valor || ''}
                                        onChange={(e) => actualizarOpcion(index, 'valor', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                        placeholder="Valor"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={opcion.etiqueta || ''}
                                        onChange={(e) => actualizarOpcion(index, 'etiqueta', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                        placeholder="Etiqueta"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => eliminarOpcion(index)}
                                    className="mt-1 text-red-600 hover:text-red-800"
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
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#184f96] text-white rounded-md hover:bg-blue-700"
                    >
                        Guardar Filtro
                    </button>
                </div>
            </form>
        </div>
    );
}
