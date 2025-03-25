import React from 'react';
import { Head, usePage, router, Link } from "@inertiajs/react";

const ProductDescription = ({ description, editMode, tempInputs, handleInputChange, handleSave, toggleEditMode }) => {
    const { auth } = usePage().props;
    return (
        <div className="p-4">
            {description ? (
                <div>
                    {editMode ? (
                        <div>
                            <textarea
                                className="w-full p-2 border rounded"
                                value={tempInputs}
                                onChange={(e) => handleInputChange(e.target.value)}
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
                            <p>{description}</p>
                            {auth.user && (
                                <button 
                                    onClick={toggleEditMode}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Editar descripción
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
                                className="w-full p-2 border rounded"
                                value={tempInputs}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Ingrese la descripción del producto"
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
                            <p>No hay descripción disponible.</p>
                            {auth.user && (
                                <button 
                                    onClick={toggleEditMode}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Agregar descripción
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDescription;
