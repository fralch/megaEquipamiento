import React from 'react';
import { usePage } from '@inertiajs/react';
import { FileText, Settings, FileImage, Award, ExternalLink, File } from 'lucide-react';

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
    
    // Función para obtener el icono y el texto basado en el tipo de documento
    const getDocumentInfo = (line) => {
        const upperLine = line.toUpperCase();
        
        if (upperLine.includes('MANUAL')) {
            return {
                icon: <FileText className="w-5 h-5 text-blue-600" />,
                label: 'Manual',
                color: 'text-blue-600'
            };
        } else if (upperLine.includes('FICHA TÉCNICA') || upperLine.includes('FICHA TECNICA')) {
            return {
                icon: <Settings className="w-5 h-5 text-green-600" />,
                label: 'Ficha Técnica',
                color: 'text-green-600'
            };
        } else if (upperLine.includes('FOLLETOS')) {
            return {
                icon: <FileImage className="w-5 h-5 text-purple-600" />,
                label: 'Folletos',
                color: 'text-purple-600'
            };
        } else if (upperLine.includes('CERTIFICADOS')) {
            return {
                icon: <Award className="w-5 h-5 text-orange-600" />,
                label: 'Certificados',
                color: 'text-orange-600'
            };
        } else {
            return {
                icon: <File className="w-5 h-5 text-gray-600" />,
                label: line, // Usa el título tal como está escrito
                color: 'text-gray-600'
            };
        }
    };
    
    // Función para convertir el string en una lista si contiene saltos de línea
    const renderDocumentContent = () => {
        if (!documents) return null;
        
        // Si el string contiene saltos de línea, lo dividimos y mostramos como lista
        if (documents.includes('\n')) {
            const lines = documents.split('\n').filter(line => line.trim() !== '');
            let currentCategory = '';
            const groupedItems = [];
            
            lines.forEach((line) => {
                const trimmedLine = line.trim();
                
                // Verificar si es un enlace
                if (trimmedLine.startsWith('http') || trimmedLine.startsWith('www')) {
                    // Es un enlace, usar la categoría actual
                    const docInfo = getDocumentInfo(currentCategory || 'Documento');
                    groupedItems.push({
                        url: trimmedLine,
                        category: currentCategory,
                        ...docInfo
                    });
                } else {
                    // Es una categoría (puede ser predefinida o personalizada)
                    currentCategory = trimmedLine;
                }
            });
            
            return (
                <div className="space-y-3">
                    {groupedItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            {item.icon}
                            <div className="flex-1">
                                <p className={`font-medium ${item.color}`}>
                                    {item.label}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {item.url}
                                </p>
                            </div>
                            <a 
                                href={item.url.startsWith('http') ? item.url : `http://${item.url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center space-x-1"
                            >
                                <span>Abrir</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    ))}
                </div>
            );
        } else {
            // Si es un string simple, verificamos si es un enlace
            if (documents.startsWith('http') || documents.startsWith('www')) {
                const docInfo = getDocumentInfo('Documento');
                return (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        {docInfo.icon}
                        <div className="flex-1">
                            <p className={`font-medium ${docInfo.color}`}>
                                {docInfo.label}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                                {documents}
                            </p>
                        </div>
                        <a 
                            href={documents.startsWith('http') ? documents : `http://${documents}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center space-x-1"
                        >
                            <span>Abrir</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                );
            } else {
                // Si no es un enlace, lo mostramos como párrafo
                return <p className="text-gray-700">{documents}</p>;
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
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={tempInputs}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Ingrese los documentos (uno por línea)&#10;Ejemplo:&#10;MANUAL&#10;https://ejemplo.com/manual.pdf&#10;FICHA TÉCNICA&#10;https://ejemplo.com/ficha.pdf&#10;DESCARGAS&#10;https://ejemplo.com/descarga.zip"
                                rows="8"
                            />
                            <div className="mt-3 flex space-x-2">
                                <button 
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Guardar
                                </button>
                                <button 
                                    onClick={toggleEditMode}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {renderDocumentContent()}
                            {auth.user && (
                                <button 
                                    onClick={toggleEditMode}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Editar documentos
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {editMode ? (
                        <div>
                            <textarea
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={tempInputs}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Ingrese los documentos (uno por línea)&#10;Ejemplo:&#10;MANUAL&#10;https://ejemplo.com/manual.pdf&#10;FICHA TÉCNICA&#10;https://ejemplo.com/ficha.pdf&#10;DESCARGAS&#10;https://ejemplo.com/descarga.zip"
                                rows="8"
                            />
                            <div className="mt-3 flex space-x-2">
                                <button 
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Guardar
                                </button>
                                <button 
                                    onClick={toggleEditMode}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">No hay documentos disponibles.</p>
                            {auth.user && (
                                <button 
                                    onClick={toggleEditMode}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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