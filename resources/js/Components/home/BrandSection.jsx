// BrandSection.jsx
import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import axios from 'axios';
import { useTheme } from '../../storage/ThemeContext';

// Función helper para ordenar marcas alfabéticamente
const sortBrands = (brandsData) => {
  if (!Array.isArray(brandsData)) return brandsData;

  return brandsData.sort((a, b) => {
    const nameA = a.nombre?.toLowerCase() || '';
    const nameB = b.nombre?.toLowerCase() || '';
    return nameA.localeCompare(nameB);
  });
};

const BrandCard = memo(({ brand }) => {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const cardRef = useRef(null);

  // Configurar Intersection Observer para detectar cuando la tarjeta es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  const handleBrandClick = useCallback((e) => {
    e.preventDefault();
    if (isSearching) return;

    setIsSearching(true);
    setTimeout(() => {
      window.location.href = `/marcas/${brand.id_marca}`;
      setIsSearching(false);
    }, 300);
  }, [isSearching, brand.id_marca]);

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center text-center p-4 group transition-all duration-300 rounded-lg hover:bg-gray-100/50 ${
        isDarkMode ? 'text-white hover:bg-gray-700/30' : 'text-gray-900'
      }`}
    >
      <div className={`w-36 h-36 flex items-center justify-center rounded-full border-2 overflow-hidden transition-colors duration-300 bg-white ${
          isDarkMode ? 'border-blue-400' : 'border-blue-500'
        }`}>
      
        {/* Imagen que solo carga cuando es visible */}
        {isVisible && (
          <img
            src={brand.imagen}
            alt={brand.nombre}
            className={`object-contain w-32 h-32 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        
        {!imageLoaded && isVisible && (
          <div className={`w-32 h-32 flex items-center justify-center text-4xl font-bold ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {brand.nombre ? brand.nombre.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className={`mt-4 text-lg font-semibold transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {brand.nombre.toUpperCase()}
      </h3>

      {/* Description */}
      {brand.descripcion && (
        <p className={`mt-1 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {brand.descripcion}
        </p>
      )}

      {/* Video Link */}
      {brand.video_url && (
        <a
          href={brand.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 text-sm underline transition-colors duration-300 ${
            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          Ver Video
        </a>
      )}

      {/* Button */}
      <button 
        className={`mt-3 transition-all duration-300 text-white px-4 py-2 rounded flex items-center justify-center transform hover:scale-105 ${
          isSearching 
            ? (isDarkMode ? 'bg-gray-600 cursor-wait' : 'bg-gray-400 cursor-wait')
            : (isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600')
        }`}
        onClick={handleBrandClick}
        disabled={isSearching}
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
      </button>
    </div>
  );
});

const BrandSection = () => {
  const { isDarkMode } = useTheme();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  // Cargar información de marcas desde la API
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await axios.get('/marca/all');
        const brandsData = response.data;

        // Ordenar marcas alfabéticamente de A a Z usando la función helper
        const sortedBrands = sortBrands(brandsData);

        // Guardar en localStorage con timestamp para caché
        localStorage.setItem('brandsData', JSON.stringify(sortedBrands));
        localStorage.setItem('brandsDataTimestamp', Date.now().toString());

        setBrands(sortedBrands);
        setLoading(false);
      } catch (error) {
        console.error('Error loading brands from API:', error);
        setLoading(false);
      }
    };

    // Verificar si hay datos en caché
    const cachedBrands = localStorage.getItem('brandsData');
    const cachedTimestamp = localStorage.getItem('brandsDataTimestamp');
    const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos

    if (cachedBrands && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) < oneHour) {
      // Usar datos en caché si son recientes (1 hora)
      const cachedBrandsData = JSON.parse(cachedBrands);

      // Ordenar marcas del caché alfabéticamente de A a Z usando la función helper
      const sortedCachedBrands = sortBrands(cachedBrandsData);

      setBrands(sortedCachedBrands);
      setLoading(false);
    } else {
      // Configurar observer para cargar marcas solo cuando la sección es visible
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadBrands();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      
      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
      
      return () => {
        if (sectionRef.current) {
          observer.disconnect();
        }
      };
    }
  }, []);

  return (
    <div className={`p-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`} id="marcas" ref={sectionRef}>
      <h2 className={`text-2xl font-bold mb-8 text-center transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>Marcas</h2>
      
      {loading ? (
        // Indicador de carga
        <div className="flex justify-center items-center py-12">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 transition-colors duration-300 ${
            isDarkMode ? 'border-blue-400' : 'border-blue-500'
          }`}></div>
        </div>
      ) : brands && brands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.isArray(brands) ? brands.map((brand) => (
            <BrandCard 
              key={brand.id_marca} 
              brand={brand} 
            />
          )) : (
            <BrandCard 
              key={brands.id_marca} 
              brand={brands} 
            />
          )}
        </div>
      ) : (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p>No se encontraron marcas disponibles.</p>
        </div>
      )}
    </div>
  );
};

export default BrandSection;