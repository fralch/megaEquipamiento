// ESTE COMPONENTE ES PRINCIPALMENTE PARA LA GESTIÓN DE CARACTERÍSTICAS Y DATOS TÉCNICOS
import React from 'react';
import { usePage } from '@inertiajs/react';

const ProductFeatures = ({ features, handleOpenModal }) => {
    const { auth } = usePage().props;

    const normalizedFeatures = React.useMemo(() => {
        if (!features) return {};
        if (typeof features === 'object' && !Array.isArray(features)) {
            return features;
        }
        if (Array.isArray(features)) {
            const normalized = {};
            features.forEach((item, index) => {
                if (item && typeof item === 'object') {
                    const name = item.name || item.Key || `Característica ${index + 1}`;
                    const value = item.value || item.Value || '';
                    normalized[name] = value;
                } else if (typeof item === 'string') {
                    if (item.includes(':')) {
                        const parts = item.split(':');
                        const name = parts[0].trim();
                        const value = parts.slice(1).join(':').trim();
                        normalized[name] = value;
                    } else {
                        normalized[`Característica ${index + 1}`] = item;
                    }
                }
            });
            return normalized;
        }
        return {};
    }, [features]);
    
    return (
        <div className="p-4">
            {normalizedFeatures && Object.keys(normalizedFeatures).length > 0 ? (
                <div>
                    <ul className="list-disc pl-5">
                        {Object.entries(normalizedFeatures).map(([key, value]) => (
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
