// ESTE COMPONENTE ES PRINCIPALMENTE PARA LA GESTIÓN DE CARACTERÍSTICAS Y DATOS TÉCNICOS
import React from 'react';
import { usePage } from '@inertiajs/react';

const ProductFeatures = ({ features, handleOpenModal }) => {
    const { auth } = usePage().props;
    
    return (
        <div className="p-4">
            {features && Object.keys(features).length > 0 ? (
                <div>
                    <ul className="list-disc pl-5">
                        {Object.entries(features).map(([key, value]) => (
                            <li key={key} className="mb-2">
                                <span className="font-semibold">{key}:</span> {value}
                            </li>
                        ))}
                    </ul>
                    {auth.user && (
                        <button 
                            onClick={() => handleOpenModal('caracteristicas')} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Editar características
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <p>No hay características disponibles.</p>
                    {auth.user && (
                        <button 
                            onClick={() => handleOpenModal('caracteristicas')} 
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Agregar características
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductFeatures;
