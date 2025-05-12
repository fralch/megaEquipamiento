// BrandSection.jsx
import React, { useState, useEffect, useRef } from "react";

const BrandCard = ({ brand }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col items-center text-center p-4 group"
    >
      <div className="w-36 h-36 flex items-center justify-center rounded-full border-2 border-blue-500 overflow-hidden">
        {/* Placeholder mientras la imagen carga */}
        <div 
          className={`absolute inset-0 bg-gray-100 flex items-center justify-center transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="animate-pulse h-8 w-8 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Imagen que solo carga cuando es visible */}
        {isVisible && (
          <img
            src={brand.image}
            alt={brand.name}
            className={`object-contain w-32 h-32 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>

      {/* Name */}
      <h2 className="mt-4 text-lg font-semibold">
        {brand.name}
      </h2>

      {/* Button */}
      <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Ver Productos
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 hidden group-hover:flex flex-col items-center w-40 p-2 bg-gray-700 text-white text-sm rounded-full shadow-lg z-10">
        <div className="w-full h-full flex items-center justify-center">
          {brand.description}
        </div>
      </div>
    </div>
  );
};

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  // Cargar información de marcas solo cuando la sección es visible
  useEffect(() => {
    const loadBrands = async () => {
      try {
        // Usar dynamic import para cargar las imágenes bajo demanda
        const images = import.meta.glob("/public/img/marcas/**/*.{jpg,png,webp,webm}", { eager: false });
        
        // Convertir las rutas de imágenes a objetos de marca
        const brandPromises = Object.keys(images).map(async (path) => {
          const name = path.split("/").pop().split(".").shift();
          const adjustedPath = path.replace("/public", "");
          
          return {
            image: adjustedPath,
            name,
            description: `Descripción de ${name}`,
          };
        });
        
        const brandsData = await Promise.all(brandPromises);
        
        // Guardar en localStorage con timestamp para caché
        localStorage.setItem('brandsData', JSON.stringify(brandsData));
        localStorage.setItem('brandsDataTimestamp', Date.now().toString());
        
        setBrands(brandsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading brand images:', error);
        setLoading(false);
      }
    };
    
    // Verificar si hay datos en caché
    const cachedBrands = localStorage.getItem('brandsData');
    const cachedTimestamp = localStorage.getItem('brandsDataTimestamp');
    const oneDay = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    
    if (cachedBrands && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) < oneDay) {
      // Usar datos en caché si son recientes
      setBrands(JSON.parse(cachedBrands));
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
    <div className="p-8 bg-white" id="marcas" ref={sectionRef}>
      <h2 className="text-2xl font-bold mb-8 text-center">Marcas</h2>
      
      {loading ? (
        // Indicador de carga
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {brands.map((brand, index) => (
            <BrandCard key={index} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandSection;