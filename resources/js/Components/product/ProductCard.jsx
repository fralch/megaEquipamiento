import React from 'react';
import { useTheme } from '../../storage/ThemeContext';
import CompareButton from '../compare/CompareButton';

const ProductCard = ({ product }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      {/* Imagen del producto */}
      <div className="relative">
        {product.imagen ? (
          <img 
            src={product.imagen} 
            alt={product.nombre}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className={`w-full h-48 flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <svg className={`w-16 h-16 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Botón de comparar en la esquina superior derecha */}
        <div className="absolute top-2 right-2">
          <CompareButton product={product} />
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4">
        {/* Nombre del producto */}
        <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {product.nombre}
        </h3>

        {/* Marca */}
        {product.marca && (
          <p className={`text-sm mb-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Marca: {product.marca.nombre}
          </p>
        )}

        {/* Descripción */}
        {product.descripcion && (
          <p className={`text-sm mb-3 line-clamp-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {product.descripcion}
          </p>
        )}

        {/* Precio y stock */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-green-600">
            S/. {product.precio}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.stock > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            product.stock > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
          </button>
          
          <button className={`py-2 px-4 rounded-lg border transition-colors ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;