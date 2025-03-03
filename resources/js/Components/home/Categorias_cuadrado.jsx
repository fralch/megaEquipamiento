import React, { useState, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
const URL_API = import.meta.env.VITE_API_URL;  

const CategoryCard = ({ title, items }) => {
  const [imagePaths, setImagePaths] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Cargar rutas de imágenes de forma dinámica solo cuando se necesitan
  useEffect(() => {
    const loadImages = async () => {
      try {
        const folderName = title.toLowerCase().replace(/\s+/g, '-');
        const imageModule = await import.meta.glob('/public/img/categorias/**/*.{jpg,png}', { eager: false });
        
        // Filtrar y procesar las rutas
        const paths = Object.keys(imageModule)
          .filter(path => path.includes(`/img/categorias/${folderName}/`))
          .map(path => path.replace('/public', ''));
        
        setImagePaths(paths);
      } catch (error) {
        console.error('Error loading images:', error);
        setImagePaths([]);
      }
    };
    
    if (isVisible) {
      loadImages();
    }
  }, [title, isVisible]);

  // Observer para lazy loading
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

  // Cambiar imagen activa cada 3 segundos solo si hay imágenes y el componente es visible
  useEffect(() => {
    if (imagePaths.length > 0 && isVisible) {
      const interval = setInterval(() => {
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [imagePaths.length, isVisible]);

  // Placeholder o imagen por defecto
  const placeholderImage = 'https://aringenieriaa.com/storage/servicio/125456545.jpg';
  
  // Imagen actual a mostrar
  const currentImage = imagePaths.length > 0 ? imagePaths[activeImageIndex] : placeholderImage;

  return (
    <div ref={cardRef} className="relative group w-full h-96 rounded-lg overflow-hidden shadow-lg m-4">
      {/* Placeholder mientras carga */}
      <div 
        className={`absolute inset-0 bg-gray-200 transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="h-full w-full flex justify-center items-center">
          <div className="animate-pulse h-8 w-8 bg-gray-400 rounded-full"></div>
        </div>
      </div>
      
      {/* Imagen de fondo que rota - solo carga cuando es visible */}
      {isVisible && (
        <>
          <img 
            src={currentImage}
            alt={`${title} background`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Título visible por defecto pero desaparece con hover */}
          <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white text-xl font-bold py-2 px-4 rounded-md z-10 transition-opacity duration-300 group-hover:opacity-0">
            {title}
          </div>

          {/* Contenido oculto que aparece con hover */}
          <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white flex flex-col justify-center items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>

            {/* Lista desplazable */}
            <div className="space-y-2 h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
              {items.map((item) => (
                <Link
                  key={item.id_subcategoria}
                  href={`/subcategoria/${item.id_subcategoria}`}
                  className="block hover:bg-gray-700 p-2 rounded-md cursor-pointer"
                >
                  {item.nombre}
                </Link>
              ))}
            </div>

            {/* Botón */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-4">
              Ver más
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica si los datos ya están en el localStorage
    const storedData = localStorage.getItem('categoriasCompleta');
    const storedTimestamp = localStorage.getItem('categoriasCompletaTimestamp');
    const currentTime = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    
    // Usar datos del localStorage si existen y no son más antiguos que un día
    if (storedData && storedTimestamp && (currentTime - parseInt(storedTimestamp)) < oneDay) {
      setCategories(JSON.parse(storedData));
      setLoading(false);
    } else {
      // Si no están en el localStorage o son viejos, hacer la solicitud a la API
      fetch(URL_API + "/categorias-completa")
        .then((response) => response.json())
        .then((data) => {
          setCategories(data);
          localStorage.setItem('categoriasCompleta', JSON.stringify(data));
          localStorage.setItem('categoriasCompletaTimestamp', currentTime.toString());
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          // Si hay un error pero tenemos datos antiguos, úsalos como respaldo
          if (storedData) {
            setCategories(JSON.parse(storedData));
          }
          setLoading(false);
        });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6 bg-white min-h-screen">
      {categories.map((category) => (
        <div key={category.id_categoria} className="m-4">
          <CategoryCard title={category.nombre} items={category.subcategorias} />
        </div>
      ))}
    </div>
  );
};

export default Categories;