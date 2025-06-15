import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTheme } from "../storage/ThemeContext";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";

const URL_API = import.meta.env.VITE_API_URL;

export default function Marcas({ productos }) {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Cargar categorías desde localStorage o desde la API
        const storedData = localStorage.getItem('categoriasCompleta');
        if (storedData) {
            setCategoriasArray(JSON.parse(storedData));
            setIsLoading(false);
        } else {
            fetch(URL_API + "/categorias-completa")
                .then((response) => response.json())
                .then((data) => {
                    setCategoriasArray(data);
                    localStorage.setItem('categoriasCompleta', JSON.stringify(data));
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    setIsLoading(false);
                });
        }

        // Obtener el ID de la subcategoría desde la URL
        const urlParts = window.location.pathname.split('/');
        const subcategoriaId = urlParts[urlParts.length - 1];
        console.log(productos);

        // Hacer una solicitud a la API para obtener los datos de la subcategoría
        fetch(`${URL_API}/subcategoria_id/${subcategoriaId}`)
            .then((response) => response.json())
            .then((data) => {
                setSubcategoriaNombre(data.nombre);
                // Obtener el nombre de la categoría
                fetch(`${URL_API}/subcategoria_get/cat/${subcategoriaId}`)
                    .then((response) => response.json())
                    .then((data) => {
                        setCategoriaNombre(data.nombre_categoria);
                        setCategoriaId(data.id_categoria);
                    })
                    .catch((error) => console.error('Error fetching categoria data:', error));
            })
            .catch((error) => console.error('Error fetching subcategoria data:', error));
    }, []);

    const toggleCategory = (categoriaNombre) => {
        setOpenCategories((prevState) => ({
            ...prevState,
            [categoriaNombre]: !prevState[categoriaNombre],
        }));
        setActiveCategory(categoriaNombre);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="min-h-screen">
            <Head title="Marca" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            
            <div className={`w-full min-h-screen ${
                isDarkMode 
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
            } transition-all duration-300`}>
                
                {/* Main Content Container */}
                <div className="flex w-full">
                    
                    {/* Products Section */}
                    <div className="flex-1 p-6 lg:p-8 w-full">
                        <div className="w-full">
                            {productos && productos.length > 0 ? (
                                <>
                                    {(() => {
                                        let nombreMarca = productos[0]?.marca?.nombre || "Marca";
                                        nombreMarca = nombreMarca.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
                                        nombreMarca = nombreMarca.charAt(0).toUpperCase() + nombreMarca.slice(1);
                                        return (
                                            <div className="mb-8">
                                               
                                                <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                } transition-colors duration-200`}>
                                                    {nombreMarca}
                                                </h1>
                                                <p className={`text-lg ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                } mb-6 transition-colors duration-200`}>
                                                    Descubre nuestra selección de productos de alta calidad
                                                </p>
                                                <div className={`h-1 w-20 rounded-full ${
                                                    isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                                                } mb-8`}></div>
                                            </div>
                                        );
                                    })()}
                                    <div className="animate-fadeIn">
                                        <ProductGrid products={productos} />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 lg:py-24">
                                    <div className="max-w-md mx-auto">
                                        <div className="mb-8">
                                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                                                isDarkMode 
                                                    ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600' 
                                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
                                            } shadow-lg transition-all duration-200`}>
                                                <svg className={`w-10 h-10 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                } transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <h1 className={`text-2xl lg:text-3xl font-bold mb-4 ${
                                                isDarkMode ? 'text-white' : 'text-gray-800'
                                            } transition-colors duration-200`}>
                                                No hay productos disponibles
                                            </h1>
                                            <p className={`text-lg ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            } mb-8 transition-colors duration-200`}>
                                                No se encontraron productos para esta marca específica.
                                            </p>
                                            <div className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium ${
                                                isDarkMode 
                                                    ? 'bg-blue-900/20 text-blue-300 border border-blue-800/50' 
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                            } transition-all duration-200 hover:scale-105`}>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Explora otras categorías en el menú lateral
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Sidebar Navigation */}
                    <nav className={`w-80 lg:w-96 flex-shrink-0 min-h-screen p-6 overflow-y-auto ${
                        isDarkMode 
                            ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 border-l border-gray-700' 
                            : 'bg-gradient-to-b from-white via-gray-50 to-white border-l border-gray-200'
                    } shadow-2xl transition-all duration-300`} id="nav-fijo">
                        
                        <div className="mb-8">
                            <h2 className={`text-xl font-bold mb-2 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            } transition-colors duration-200`}>
                                Categorías
                            </h2>
                            <div className={`h-0.5 w-12 rounded-full ${
                                isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                            }`}></div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-12 rounded-xl animate-pulse ${
                                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {categoriasArray.map((categoria, index) => (
                                    <div key={categoria.id_categoria} 
                                         className="animate-slideIn"
                                         style={{ animationDelay: `${index * 0.1}s` }}>
                                        
                                        <button
                                            onClick={() => toggleCategory(categoria.nombre)}
                                            className={`group w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                                                activeCategory === categoria.nombre
                                                    ? isDarkMode
                                                        ? 'bg-gradient-to-r from-blue-800 to-green-500 text-white shadow-lg shadow-blue-500/25'
                                                        : 'bg-gradient-to-r from-blue-700 to-green-500 text-white shadow-lg shadow-blue-500/25'
                                                    : isDarkMode 
                                                        ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-100 border border-gray-600/50 hover:border-gray-500' 
                                                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm lg:text-base">
                                                    {categoria.nombre}
                                                </span>
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                                                    activeCategory === categoria.nombre
                                                        ? 'bg-white/20 rotate-45'
                                                        : isDarkMode
                                                            ? 'bg-gray-600 group-hover:bg-gray-500'
                                                            : 'bg-gray-100 group-hover:bg-gray-200'
                                                }`}>
                                                    <span className={`text-sm font-bold transition-all duration-300 ${
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
                                            <div className="mt-2 ml-4 space-y-2 animate-slideDown">
                                                {categoria.subcategorias.map((subcategoria, subIndex) => {
                                                    const urlParts = window.location.pathname.split('/');
                                                    const marcaId = urlParts[urlParts.length - 1];
                                                    
                                                    const href = marcaId && !isNaN(marcaId)
                                                        ? `/subcategoria/${subcategoria.id_subcategoria}/${marcaId}`
                                                        : `/subcategoria/${subcategoria.id_subcategoria}`;
                                                    
                                                    return (
                                                        <Link
                                                            key={subcategoria.id_subcategoria}
                                                            href={href}
                                                            className={`group block p-3 rounded-lg transition-all duration-300 transform hover:scale-[1.01] hover:translate-x-2 ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-600/30 hover:bg-gray-600/50 text-gray-200 border border-gray-600/50 hover:border-gray-500/70' 
                                                                    : 'bg-blue-50/50 hover:bg-blue-100/70 text-gray-800 border border-blue-100 hover:border-blue-200'
                                                            } hover:shadow-md`}
                                                            style={{ animationDelay: `${subIndex * 0.05}s` }}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className={`w-2 h-2 rounded-full mr-3 transition-all duration-300 ${
                                                                    isDarkMode 
                                                                        ? 'bg-green-400 group-hover:bg-green-300' 
                                                                        : 'bg-green-500 group-hover:bg-green-600'
                                                                } group-hover:scale-125`}></div>
                                                                <span className="text-sm font-medium group-hover:font-semibold transition-all duration-200">
                                                                    {subcategoria.nombre}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </nav>
                </div>
            </div>
            <Footer />

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.5s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}