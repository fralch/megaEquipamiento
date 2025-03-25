import React from 'react';
import { usePage } from '@inertiajs/react';

const ProductTechnicalData = ({ technicalData, handleOpenModal }) => {
    const { auth } = usePage().props;

    return (
        <div className="p-4">
            {technicalData && Object.keys(technicalData).length > 0 ? (
                <div>
                    <ul className="list-disc pl-5">
                        {Object.entries(technicalData).map(([key, value]) => (
                            <li key={key} className="mb-2">
                                <span className="font-semibold">{key}:</span> {value}
                            </li>
                        ))}
                    </ul>
                    {auth.user && (
                        <button 
                            onClick={() => handleOpenModal('datos_tecnicos')} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Editar datos técnicos
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <p>No hay datos técnicos disponibles.</p>
                    {auth.user && (
                        <button 
                            onClick={() => handleOpenModal('datos_tecnicos')} 
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Agregar datos técnicos
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductTechnicalData;
