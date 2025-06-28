import React from 'react';
import { useCompare } from '../../hooks/useCompare';
import { useTheme } from '../../storage/ThemeContext';

const CompareButton = ({ product, className = '' }) => {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const { isDarkMode } = useTheme();
  const inCompare = isInCompare(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCompare) {
      removeFromCompare(product.id);
    } else if (canAddMore) {
      addToCompare(product);
    } else {
      alert('Máximo 4 productos para comparar. Elimina uno para agregar otro.');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canAddMore && !inCompare}
      className={`
        flex items-center justify-center p-2 rounded-lg transition-all duration-200
        ${inCompare 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
        }
        ${(!canAddMore && !inCompare) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      title={inCompare ? 'Quitar de comparación' : 'Agregar a comparación'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={inCompare ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M11 6h5a2 2 0 0 1 2 2v8" />
        <path d="M14 9l-3 -3l3 -3" />
        <path d="M13 18h-5a2 2 0 0 1 -2 -2v-8" />
        <path d="M10 15l3 3l-3 3" />
      </svg>
    </button>
  );
};

export default CompareButton;