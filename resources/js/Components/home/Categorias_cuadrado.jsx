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

const CategoryCard = React.memo(({ title, items, categoryId, categoryImages }) => {
  const { isDarkMode } = useTheme();
  const [imagePaths, setImagePaths] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const intervalRef = useRef(null);

  // Configurar imágenes de la base de datos
  useEffect(() => {
    if (isVisible && categoryImages) {
      // Si categoryImages es un array, usarlo directamente
      if (Array.isArray(categoryImages) && categoryImages.length > 0) {
        // Convertir rutas relativas a rutas absolutas si es necesario
        const fullPaths = categoryImages.map(img => {
          // Si la imagen ya tiene una ruta completa, usarla tal como está
          if (img.startsWith('http') || img.startsWith('/')) {
            return img;
          }
          // Si es una ruta relativa, agregarle el prefijo /
          return `/${img}`;
        });
        setImagePaths(fullPaths);
      } else {
        // Si no hay imágenes, usar array vacío
        setImagePaths([]);
      }
    }
  }, [isVisible, categoryImages]);

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

  // Memoizar valores calculados
  const placeholderImage = useMemo(() => '/img/logo2.jpg', []);
  
  const currentImage = useMemo(() => {
    if (imagePaths.length > 0) {
      return imagePaths[activeImageIndex];
    }
    // Si no hay imágenes, usar imagen placeholder
    return placeholderImage;
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
      {/* Loading skeleton mientras carga */}
      <div 
        className={`absolute inset-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="h-full w-full flex flex-col justify-center items-center">
          {/* Spinner de carga */}
          <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mb-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-400'}`}></div>
          {/* Texto de carga */}
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando...</p>
        </div>
      </div>
      
      {/* CONTENEDOR DE IMAGEN CON FONDO BLANCO - ACTUALIZADO */}
      {isVisible && currentImage && (
        <>
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
            <img 
              src={currentImage}
              alt={`${title} background`}
              className={`w-full h-full transition-all duration-500 transform group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={handleImageLoad}
              loading="lazy"
              style={{
                objectFit: 'contain', // 🔑 CLAVE: Mantiene proporciones sin recortar
                objectPosition: 'center center', // 🔑 CLAVE: Centra la imagen
                maxWidth: '100%', // 🔑 CLAVE: No excede el ancho del contenedor
                maxHeight: '100%', // 🔑 CLAVE: No excede la altura del contenedor
                background: 'white' // 🔑 CLAVE: Fondo blanco para áreas vacías
              }}
            />
            {/* Overlay sutil para mejorar la legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
          </div>
          
          {/* Título visible por defecto pero desaparece con hover */}
          <div className="absolute bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur-sm text-white text-lg font-bold py-2 px-3 rounded-lg z-10 transition-opacity duration-300 group-hover:opacity-0 text-center shadow-lg">
            <span className="line-clamp-2">{title}</span>
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
              {[...items].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((item) => (
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
              className={`${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded-md mt-4 transition-colors duration-200 z-50`}
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
          // Ordenar las categorías alfabéticamente
          return [...parsedData].sort((a, b) => a.nombre.localeCompare(b.nombre));
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
      
      // Ordenar las categorías alfabéticamente
      const sortedData = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      setCategories(sortedData);
      saveCategoriesToStorage(sortedData);
      
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
              categoryImages={category.img}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

Categories.displayName = 'Categories';

export default Categories;