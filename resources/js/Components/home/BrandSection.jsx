// BrandSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import axios from 'axios';

const BrandCard = ({ brand }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
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

  const searchMarca = async (nombre) => {
    setIsSearching(true);
    console.log('Buscando marca:', nombre);
    try {
      const response = await axios.post('/marca/buscar', {
        nombre: nombre
      });
      console.log(response.data);
      /*
      {
          "id_marca": 6,
          "nombre": "and _discover-precision",
          "descripcion": "Descripción de and _discover-precision",
          "imagen": "/img/marcas/and _discover-precision.jpg"
      }
       */
      setSearchResults(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching marca:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col items-center text-center p-4 group"
    >
      <div className="w-36 h-36 flex items-center justify-center rounded-full border-2 border-blue-500 overflow-hidden">
      
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
      <Link 
        href="#" 
        className={`mt-2 ${isSearching ? 'bg-gray-400 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded flex items-center justify-center`}
        onClick={(e) => {
          if (isSearching) return; // Evitar múltiples clics mientras busca
          
          e.preventDefault(); // Prevenir la navegación inmediata
          searchMarca(brand.name)
            .then((data) => {
              // Después de completar la búsqueda, navegar a la página de productos
              console.log(data);
              if (data && data.id_marca) {
                window.location.href = `/marcas/${data.id_marca}`;
              } else {
                console.error('No se encontró ID de marca');
              }
            })
            .catch((error) => {
              console.error('Error en la búsqueda de marca:', error);
            });
        }}
      >
        {isSearching ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Buscando...
          </>
        ) : (
          'Ver Productos'
        )}
      </Link>

    
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
            name          
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