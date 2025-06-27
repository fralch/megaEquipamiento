import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { useTheme } from "../../storage/ThemeContext";

const URL_API = import.meta.env.VITE_API_URL;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const IMAGE_ROTATION_INTERVAL = 3000; // 3 segundos  

// Componente memoizado para subcategorías
const SubcategoryLink = React.memo(({ item, isDarkMode }) => (
  <Link
    href={`/subcategoria/${item.id_subcategoria}`}
    className={`block ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-700'} p-2 rounded-md cursor-pointer transition-colors duration-200`}
  >
    {item.nombre}
  </Link>
));

SubcategoryLink.displayName = 'SubcategoryLink';

const CategoryCard = React.memo(({ title, items, categoryId }) => {
  const { isDarkMode } = useTheme();
  const [imagePaths, setImagePaths] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const intervalRef = useRef(null);
  
  // Función memoizada para cargar imágenes
  const loadImages = useCallback(async () => {
    try {
      const folderName = title.toLowerCase().replace(/\s+/g, '-');
      const imageModule = await import.meta.glob('/public/img/categorias/**/*.{jpg,png,webp,webm}', { eager: false });
      
      // Filtrar y procesar las rutas
      const paths = Object.keys(imageModule)
        .filter(path => path.includes(`/img/categorias/${folderName}/`))
        .map(path => path.replace('/public', ''));
      
      setImagePaths(paths);
    } catch (error) {
      console.error('Error loading images:', error);
      setImagePaths([]);
    }
  }, [title]);

  // Cargar rutas de imágenes de forma dinámica solo cuando se necesitan
  useEffect(() => {
    if (isVisible) {
      loadImages();
    }
  }, [isVisible, loadImages]);

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
      observer.disconnect();
    };
  }, []);

  // Cambiar imagen activa con cleanup mejorado
  useEffect(() => {
    if (imagePaths.length > 0 && isVisible) {
      intervalRef.current = setInterval(() => {
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
      }, IMAGE_ROTATION_INTERVAL);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [imagePaths.length, isVisible]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Memoizar valores calculados
  const placeholderImage = useMemo(() => 'https://aringenieriaa.com/storage/servicio/125456545.jpg', []);
  
  const currentImage = useMemo(() => {
    return imagePaths.length > 0 ? imagePaths[activeImageIndex] : placeholderImage;
  }, [imagePaths, activeImageIndex, placeholderImage]);

  // Memoizar handlers
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  return (
    <div 
      ref={cardRef} 
      className={`relative group w-full h-96 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
    >
      {/* Placeholder mientras carga */}
      <div 
        className={`absolute inset-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="h-full w-full flex justify-center items-center">
          <div className={`animate-pulse h-8 w-8 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'} rounded-full`}></div>
        </div>
      </div>
      
      {/* Imagen de fondo que rota - solo carga cuando es visible */}
      {isVisible && (
        <>
          <img 
            src={currentImage}
            alt={`${title} background`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 transform group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          
          {/* Título visible por defecto pero desaparece con hover */}
          <div className={`absolute top-4 left-4 ${isDarkMode ? 'bg-gray-800 bg-opacity-90' : 'bg-gray-900 bg-opacity-70'} text-white text-xl font-bold py-2 px-4 rounded-md z-10 transition-opacity duration-300 group-hover:opacity-0`}>
            {title}
          </div>

          {/* Contenido oculto que aparece con hover */}
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900 bg-opacity-95' : 'bg-gray-800 bg-opacity-90'} text-white flex flex-col justify-center items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100`}>
            <Link 
              href={`/categorias/${categoryId}`} 
              className="cursor-pointer hover:text-blue-400 transition-colors duration-200"
            >
              <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>
            </Link>

            {/* Lista desplazable memoizada */}
            <div className={`space-y-2 h-40 overflow-y-auto scrollbar-thin ${isDarkMode ? 'scrollbar-thumb-gray-500 scrollbar-track-gray-700' : 'scrollbar-thumb-gray-600 scrollbar-track-gray-300'}`}>
              {items.map((item) => (
                <SubcategoryLink
                  key={item.id_subcategoria}
                  item={item}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>

            {/* Botón que también lleva a los productos de la categoría */}
            <Link 
              href={`/categorias/${categoryId}`}
              className={`${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded-md mt-4 transition-colors duration-200`}
            >
              {title}
            </Link>
          </div>
        </>
      )}
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

const Categories = () => {
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función memoizada para obtener datos del localStorage
  const getStoredCategories = useCallback(() => {
    try {
      const storedData = localStorage.getItem('categoriasCompleta');
      const storedTimestamp = localStorage.getItem('categoriasCompletaTimestamp');
      const currentTime = Date.now();
      
      if (storedData && storedTimestamp && (currentTime - parseInt(storedTimestamp)) < CACHE_DURATION) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          return parsedData;
        }
      }
      // Limpiar datos obsoletos
      localStorage.removeItem('categoriasCompleta');
      localStorage.removeItem('categoriasCompletaTimestamp');
      return null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      localStorage.removeItem('categoriasCompleta');
      localStorage.removeItem('categoriasCompletaTimestamp');
      return null;
    }
  }, []);

  // Función memoizada para guardar en localStorage
  const saveCategoriesToStorage = useCallback((data) => {
    try {
      localStorage.setItem('categoriasCompleta', JSON.stringify(data));
      localStorage.setItem('categoriasCompletaTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Función memoizada para fetch de categorías
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${URL_API}/categorias-completa`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response format');
      }
      
      setCategories(data);
      saveCategoriesToStorage(data);
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      
      // Fallback a localStorage si hay error
      const storedCategories = getStoredCategories();
      if (storedCategories) {
        setCategories(storedCategories);
      }
    } finally {
      setLoading(false);
    }
  }, [saveCategoriesToStorage, getStoredCategories]);

  useEffect(() => {
    const initializeCategories = async () => {
      // Intentar cargar desde localStorage primero
      const storedCategories = getStoredCategories();
      if (storedCategories) {
        setCategories(storedCategories);
        setLoading(false);
      } else {
        // Si no hay datos en localStorage, hacer fetch
        await fetchCategories();
      }
    };

    initializeCategories();
  }, [getStoredCategories, fetchCategories]);

  // Componentes memoizados para loading y error
  const LoadingComponent = useMemo(() => {
    if (loading && categories.length === 0) {
      return (
        <div className={`flex justify-center items-center min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}></div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando categorías...</p>
          </div>
        </div>
      );
    }
    return null;
  }, [loading, categories.length, isDarkMode]);

  const ErrorComponent = useMemo(() => {
    if (error && categories.length === 0) {
      return (
        <div className={`flex justify-center items-center min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center max-w-md mx-auto p-6">
            <div className={`text-6xl mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>⚠️</div>
            <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Error al cargar categorías</h2>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
            <button 
              onClick={fetchCategories}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return null;
  }, [error, categories.length, isDarkMode, fetchCategories]);

  if (LoadingComponent) return LoadingComponent;
  if (ErrorComponent) return ErrorComponent;

  return (
    <div className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-[95%] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {categories.map((category) => (
            <CategoryCard 
              key={`category-${category.id_categoria}`}
              title={category.nombre} 
              items={category.subcategorias || []} 
              categoryId={category.id_categoria}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

Categories.displayName = 'Categories';

export default Categories;