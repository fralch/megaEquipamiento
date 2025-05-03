import React from 'react';
import { usePage } from '@inertiajs/react';

const ProductDocuments = ({ 
    documents, 
    editMode, 
    tempInputs, 
    handleInputChange, 
    handleSave, 
    toggleEditMode 
}) => {
    const { auth } = usePage().props;
    console.log("Documents");
    console.log(documents);
    
    // Función para convertir el string en una lista si contiene saltos de línea
    const renderDocumentContent = () => {
        if (!documents) return null;
        
        // Si el string contiene saltos de línea, lo dividimos y mostramos como lista
        if (documents.includes('\n')) {
            const lines = documents.split('\n').filter(line => line.trim() !== '');
            return (
                <ul className="list-disc pl-5">
                    {lines.map((line, index) => (
                        <li key={index} className="mb-2">
                            {line.startsWith('http') || line.startsWith('www') ? (
                                <a href={line.startsWith('http') ? line : `http://${line}`} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-blue-600 hover:underline">
                                    {line.toLowerCase().endsWith('.pdf') ? 'Manual' : 
                                     (line.toLowerCase().endsWith('.exe') || 
                                      line.toLowerCase().endsWith('.msi') || 
                                      line.toLowerCase().endsWith('.zip')) ? 'Software' : line}
                                </a>
                            ) : (
                                line
                            )}
                        </li>
                    ))}
                </ul>
            );
        } else {
            // Si es un string simple, verificamos si es un enlace
            if (documents.startsWith('http') || documents.startsWith('www')) {
                return (
                    <a href={documents.startsWith('http') ? documents : `http://${documents}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-600 hover:underline">
                        {documents.toLowerCase().endsWith('.pdf') ? 'Manual' : 
                         (documents.toLowerCase().endsWith('.exe') || 
                          documents.toLowerCase().endsWith('.msi') || 
                          documents.toLowerCase().endsWith('.zip')) ? 'Software' : documents}
                    </a>
                );
            } else {
                // Si no es un enlace, lo mostramos como párrafo
                return <p>{documents}</p>;
            }
        }
    };
    
    return (
        <div className="p-4">
            {documents ? (
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
                            {renderDocumentContent()}
                            {auth.user && (
                                <>  
                                    <br />
                                    <button 
                                        onClick={toggleEditMode}
                                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Editar documentos
                                    </button>
                                </>
                                
                            )}
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
                            {auth.user && (
                                <button 
                                    onClick={toggleEditMode}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Agregar documentos
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDocuments;