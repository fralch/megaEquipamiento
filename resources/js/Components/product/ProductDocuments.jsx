import React from 'react';

const ProductDocuments = ({ documents, editMode, tempInputs, handleInputChange, handleSave, toggleEditMode }) => {
    return (
        <div className="p-4">
            {documents && documents.length > 0 ? (
                <div>
                    {editMode ? (
                        <div>
                            <textarea
                                className="w-full p-2 border rounded"
                                value={tempInputs}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Ingrese los documentos (uno por línea)"
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
                    ) : (
                        <div>
                            <ul className="list-disc pl-5">
                                {documents.map((doc, index) => (
                                    <li key={index} className="mb-2">{doc}</li>
                                ))}
                            </ul>
                            <button 
                                onClick={toggleEditMode}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Editar documentos
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {editMode ? (
                        <div>
                            <textarea
                                className="w-full p-2 border rounded"
                                value={tempInputs}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Ingrese los documentos (uno por línea)"
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
                    ) : (
                        <div>
                            <p>No hay documentos disponibles.</p>
                            <button 
                                onClick={toggleEditMode}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Agregar documentos
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDocuments;