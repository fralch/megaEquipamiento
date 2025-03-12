import React from 'react';

const ProductSpecifications = ({ specifications }) => {
    return (
        <div className="p-4">
            {specifications && specifications.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <tbody>
                            {specifications.map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    {row.map((cell, cellIndex) => (
                                        <td 
                                            key={cellIndex} 
                                            className={`border border-gray-300 px-4 py-2 ${cellIndex === 0 ? 'font-semibold bg-gray-100' : ''}`}
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>
                    <p>No hay especificaciones técnicas disponibles.</p>
                </div>
            )}
        </div>
    );
};

export default ProductSpecifications;
