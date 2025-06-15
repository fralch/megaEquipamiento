import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { useTheme } from '../../storage/ThemeContext';
const URL_API = import.meta.env.VITE_API_URL;

const NavVertical = ({ isOpen, onClose }) => {
  const [categoriasArray, setCategoriasArray] = useState([]);
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Verifica si los datos ya están en el localStorage
    const storedData = localStorage.getItem('categoriasCompleta');

    if (storedData) {
      // Si los datos están en el localStorage, úsalos
      setCategoriasArray(JSON.parse(storedData));
      setIsLoading(false);
    } else {
      // Si no están en el localStorage, haz la solicitud a la API
      fetch(URL_API + '/categorias-completa')
        .then((response) => response.json())
        .then((data) => {
          setCategoriasArray(data);
          console.log('Categorias completas:');
          console.log(data);
          localStorage.setItem('categoriasCompleta', JSON.stringify(data)); // Guarda en localStorage
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setIsLoading(false);
        });
    }
  }, []);

  const [openCategories, setOpenCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleCategory = (categoriaNombre) => {
    setOpenCategories((prevState) => ({
      ...prevState,
      [categoriaNombre]: !prevState[categoriaNombre],
    }));
    setActiveCategory(categoriaNombre);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <div
        className={`fixed inset-y-0 left-0 w-80 lg:w-96 shadow-2xl z-50 transform transition-all duration-250 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode 
            ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800' 
            : 'bg-gradient-to-b from-white via-gray-50 to-white'
        }`}
        style={{ height: '100vh' }}
      >
        <div className="flex flex-col h-full">
          
          <div className="flex items-center justify-between p-4">
            <img
              className="w-1/2 object-contain"
              src="/img/logo2.jpg"
              alt="EquinLab Logo"
            />
            <button
              onClick={onClose}
              className={`p-1 rounded-lg focus:outline-none focus:ring transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-800 focus:ring-gray-600' 
                  : 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300'
              }`}
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-10 rounded-lg animate-pulse ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {categoriasArray.map((categoria, index) => (
                  <div key={categoria.id_categoria} 
                       className="animate-slideIn"
                       style={{ animationDelay: `${index * 0.05}s` }}>
                    
                    <button
                      onClick={() => toggleCategory(categoria.nombre)}
                      className={`group w-full text-left p-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                        activeCategory === categoria.nombre
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-blue-800 to-green-500 text-white shadow-md'
                            : 'bg-gradient-to-r from-blue-700 to-green-500 text-white shadow-md'
                          : isDarkMode 
                            ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-100 border border-gray-600/50 hover:border-gray-500' 
                            : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {categoria.nombre}
                        </span>
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-150 ${
                          activeCategory === categoria.nombre
                            ? 'bg-white/20'
                            : isDarkMode
                              ? 'bg-gray-600 group-hover:bg-gray-500'
                              : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <span className={`text-xs font-bold transition-all duration-150 ${
                            activeCategory === categoria.nombre
                              ? 'text-white'
                              : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {openCategories[categoria.nombre] ? '−' : '+'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {openCategories[categoria.nombre] && categoria.subcategorias && (
                      <div className="mt-1 ml-3 space-y-1 animate-slideDown">
                        {categoria.subcategorias.map((subcategoria, subIndex) => (
                          <Link
                            key={subcategoria.id_subcategoria}
                            href={`/subcategoria/${subcategoria.id_subcategoria}`}
                            className={`group block p-2 pl-4 rounded-md transition-all duration-150 transform hover:scale-[1.02] hover:translate-x-1 ${
                              isDarkMode 
                                ? 'bg-gray-600/30 hover:bg-gray-600/50 text-gray-200 border border-gray-600/50 hover:border-gray-500/70' 
                                : 'bg-blue-50/50 hover:bg-blue-100/70 text-gray-800 border border-blue-100 hover:border-blue-200'
                            } hover:shadow-sm`}
                            style={{ animationDelay: `${subIndex * 0.03}s` }}
                          >
                            <div className="flex items-center">
                              <div className={`w-1.5 h-1.5 rounded-full mr-2 transition-all duration-100 ${
                                isDarkMode 
                                  ? 'bg-green-400 group-hover:bg-green-300' 
                                  : 'bg-green-500 group-hover:bg-green-600'
                              }`}></div>
                              <span className="text-sm font-medium group-hover:font-semibold transition-all duration-100">
                                {subcategoria.nombre}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </nav>

          <div className="p-4"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default NavVertical;