import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTheme } from "../storage/ThemeContext";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";

const URL_API = import.meta.env.VITE_API_URL;

export default function SubcategoriaMarcas({ productos: productosIniciales, marcaId }) {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [productos, setProductos] = useState(productosIniciales || []);

    useEffect(() => {
        setIsLoading(true);
        
        // Obtener el ID de la subcategoría desde la URL de forma robusta.
        // Soporta rutas: /subcategoria/:subcategoriaId y /subcategoria/:subcategoriaId/:marcaId
        const urlParts = window.location.pathname.split('/').filter(Boolean);
        let subcategoriaId = null;
        const subIndex = urlParts.indexOf('subcategoria');
        if (subIndex !== -1 && urlParts[subIndex + 1]) {
            subcategoriaId = urlParts[subIndex + 1];
        } else {
            // Fallback: primer número en la ruta que no sea el último si hay dos
            const numericParts = urlParts.filter(p => /^\d+$/.test(p));
            if (numericParts.length > 1) {
                subcategoriaId = numericParts[0];
            } else if (numericParts.length === 1) {
                subcategoriaId = numericParts[0];
            }
        }

        console.log("Productos:", productos);
        console.log("Marca ID:", marcaId);
        console.log("Subcategoría ID:", subcategoriaId);

        // Función para cargar las categorías optimizadas por marca
        const cargarCategoriasOptimizadas = async () => {
            try {
                // Construir URL usando tu ruta específica
                const url = marcaId 
                    ? `${URL_API}/catsub_optimizadas/${marcaId}`
                    : `${URL_API}/catsub_optimizadas`;
                
                console.log('Llamando a categorías optimizadas:', url);
                
                const categoriasResponse = await fetch(url);
                
                if (categoriasResponse.ok) {
                    const categoriasData = await categoriasResponse.json();
                    setCategoriasArray(categoriasData);
                    console.log('Categorías cargadas:', categoriasData);
                } else {
                    console.error('Error al cargar categorías optimizadas:', categoriasResponse.status);
                    // Fallback: cargar todas las categorías si falla la específica
                    const fallbackResponse = await fetch(`${URL_API}/catsub_optimizadas`);
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json();
                        setCategoriasArray(fallbackData);
                        console.log('Categorías fallback cargadas:', fallbackData);
                    } else {
                        setCategoriasArray([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching categorías optimizadas:', error);
                setCategoriasArray([]);
            }
        };

        // Función para cargar información de subcategoría (código existente)
        const cargarInfoSubcategoria = async () => {
            try {
                if (subcategoriaId && !isNaN(Number(subcategoriaId))) {
                    console.log('Cargando info de subcategoría:', subcategoriaId);
                    
                    const subcategoriaResponse = await fetch(`${URL_API}/subcategoria_id/${subcategoriaId}`);
                    if (subcategoriaResponse.ok) {
                        const subcategoriaData = await subcategoriaResponse.json();
                        console.log('Datos de subcategoría:', subcategoriaData);
                        setSubcategoriaNombre(subcategoriaData.nombre);
                        
                        // Obtener el nombre de la categoría
                        const categoriaResponse = await fetch(`${URL_API}/subcategoria_get/cat/${subcategoriaId}`);
                        if (categoriaResponse.ok) {
                            const categoriaData = await categoriaResponse.json();
                            console.log('Datos de categoría:', categoriaData);
                            setCategoriaNombre(categoriaData.nombre_categoria);
                            setCategoriaId(categoriaData.id_categoria);
                        } else {
                            console.error('Error al cargar categoría:', categoriaResponse.status);
                        }
                    } else {
                        console.error('Error al cargar subcategoría:', subcategoriaResponse.status);
                    }
                }
            } catch (error) {
                console.error('Error fetching subcategoria info:', error);
            }
        };

        // Ejecutar ambas funciones en paralelo
        Promise.all([
            cargarCategoriasOptimizadas(),
            cargarInfoSubcategoria()
        ]).finally(() => {
            setIsLoading(false);
        });

    }, [marcaId, productos]); // Agregar marcaId y productos como dependencias

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
        <div>
            <Head title="Subcategoria" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            
            <div className={`w-full min-h-screen ${
                isDarkMode 
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
            } transition-all duration-300`}>
                
                <div className="flex w-full">
                    {/* Main Content */}
                    <div className="flex-1 p-6 lg:p-8 w-5/6">
                        <div className="w-full">
                            {productos && productos.length > 0 ? (
                                <>
                                    <div className="mb-8">
                                    
                                        <h1 className={`text-xl lg:text-2xl font-bold mb-2 ${ 
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        } transition-colors duration-200`}>
                                            <Link href={`/categorias/${categoriaId}`}>
                                                <span className={`text-xl lg:text-2xl font-bold hover:underline ${ 
                                                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                                                } transition-colors duration-200`}>
                                                    {categoriaNombre} /
                                                </span>
                                            </Link> {subcategoriaNombre}
                                        </h1>
                                        <p className={`text-lg ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        } mb-6 transition-colors duration-200`}>
                                            Explora nuestra selección de productos especializados
                                        </p>
                                        <div className={`h-1 w-20 rounded-full ${
                                            isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                                        } mb-8`}></div>
                                    </div>
                                    <div className="animate-fadeIn">
                                        <ProductGrid products={productos} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        } transition-colors duration-200`}>
                                            <Link href={`/categorias/${categoriaId}`}>
                                                <span className={`text-2xl lg:text-3xl font-bold hover:underline ${
                                                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                                                } transition-colors duration-200`}>
                                                    {categoriaNombre} /
                                                </span>
                                            </Link> {subcategoriaNombre}
                                        </h1>
                                        <div className={`h-1 w-20 rounded-full ${
                                            isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                                        } mb-8`}></div>
                                    </div>
                                    
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
                                                <h2 className={`text-2xl lg:text-3xl font-bold mb-4 ${
                                                    isDarkMode ? 'text-white' : 'text-gray-800'
                                                } transition-colors duration-200`}>
                                                    No hay productos disponibles
                                                </h2>
                                                <p className={`text-lg ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                } mb-8 transition-colors duration-200`}>
                                                    {marcaId ? 'No se encontraron productos para esta marca específica.' : 'No hay productos relacionados a esta subcategoría.'}
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
                                </>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Sidebar Navigation - Moved to Right */}
                    <nav className={`w-1/6 flex-shrink-0 min-h-screen p-6 overflow-y-auto ${
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
                                                {categoria.subcategorias.map((subcategoria, subIndex) => {
                                                    // Usar el ID de marca enviado por el controlador
                                                    const href = marcaId
                                                        ? `/subcategoria/${subcategoria.id_subcategoria}/${marcaId}`
                                                        : `/subcategoria/${subcategoria.id_subcategoria}`;
                                                    
                                                    return (
                                                        <Link
                                                            key={subcategoria.id_subcategoria}
                                                            href={href}
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