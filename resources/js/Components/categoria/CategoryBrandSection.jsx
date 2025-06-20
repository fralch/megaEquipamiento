// CategoryBrandSection.jsx
import React, { useState, useRef } from "react";
import { Link } from "@inertiajs/react";
import { useTheme } from '../../storage/ThemeContext';

const CategoryBrandCard = ({ brand }) => {
  const { isDarkMode } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const cardRef = useRef(null);

  const handleBrandClick = (e) => {
    if (isSearching) return;
    
    e.preventDefault();
    setIsSearching(true);
    
    // Navegar directamente usando el id_marca
    setTimeout(() => {
      window.location.href = `/marcas/${brand.id_marca}`;
    }, 300); // Pequeño delay para mostrar el estado de carga
  };

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center text-center p-4 group transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}
    >
      <div className={`w-36 h-36 flex items-center justify-center rounded-full border-2 overflow-hidden transition-colors duration-300 bg-white ${
          isDarkMode ? 'border-blue-400' : 'border-blue-500'
        }`}>
        
        {/* Imagen de la marca */}
        <img
          src={brand.imagen}
          alt={brand.nombre}
          className={`object-contain w-32 h-32 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback en caso de error de imagen
            e.target.style.display = 'none';
          }}
        />
        
        {/* Fallback si no hay imagen */}
        {!imageLoaded && (
          <div className={`w-32 h-32 flex items-center justify-center text-4xl font-bold ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {brand.nombre.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Nombre de la marca */}
      <h3 className={`mt-4 text-lg font-semibold transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {brand.nombre}
      </h3>

      {/* Descripción */}
      {brand.descripcion && (
        <p className={`mt-1 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {brand.descripcion}
        </p>
      )}



      {/* Botón */}
      <Link 
        href="#" 
        className={`mt-3 transition-colors duration-300 text-white px-4 py-2 rounded flex items-center justify-center ${
          isSearching 
            ? (isDarkMode ? 'bg-gray-600 cursor-wait' : 'bg-gray-400 cursor-wait')
            : (isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600')
        }`}
        onClick={handleBrandClick}
      >
        {isSearching ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando...
          </>
        ) : (
          'Ver Productos'
        )}
      </Link>
    </div>
  );
};

const CategoryBrandSection = ({ marcas }) => {
  const { isDarkMode } = useTheme();

  // Si no hay marcas, no mostrar la sección
  if (!marcas || marcas.length === 0) {
    return null;
  }

  return (
    <div className={`p-8 mt-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
    } rounded-lg`}>
      <h2 className={`text-2xl font-bold mb-6 text-center transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Marcas Disponibles en esta Categoría
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {marcas.map((marca) => (
          <CategoryBrandCard key={marca.id_marca} brand={marca} />
        ))}
      </div>
    </div>
  );
};

export default CategoryBrandSection;