import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTheme } from "../storage/ThemeContext";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";
const URL_API = import.meta.env.VITE_API_URL;

export default function Categoria({ productos, categoria, subcategorias, marcas }) {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [mostrarProductos, setMostrarProductos] = useState(false);

    useEffect(() => {
        const storedData = localStorage.getItem('categoriasCompleta');
        if (storedData) {
            setCategoriasArray(JSON.parse(storedData));
        } else {
            fetch(URL_API + "/categorias-completa")
                .then((response) => response.json())
                .then((data) => {
                    setCategoriasArray(data);
                    localStorage.setItem('categoriasCompleta', JSON.stringify(data));
                })
                .catch((error) => {});
        }

        // Obtener el ID de la categoría desde la URL
        const urlParts = window.location.pathname.split('/');
        const categoriaId = urlParts[urlParts.length - 1];
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleMostrarProductos = () => {
        setMostrarProductos(true);
    };

    const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(true);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState(productos);

    // Efecto para filtrar productos por marca
    useEffect(() => {
        if (selectedBrand && selectedBrand !== 'all') {
            // Convertir ambos valores al mismo tipo para comparación
            setFilteredProducts(productos.filter(product => 
                String(product.marca_id) === String(selectedBrand)
            ));
        } else {
            setFilteredProducts(productos);
        }
    }, [selectedBrand, productos]);

    const toggleSubcategoryDropdown = () => {
        setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen);
    };

    const handleBrandChange = (event) => {
        const value = event.target.value;
        setSelectedBrand(value === 'all' ? null : value);
    };

    // Función para manejar el filtro por marca desde las tarjetas
    const handleBrandFilter = (marcaId) => {
        setSelectedBrand(String(marcaId));
        // Scroll suave hacia arriba para ver los productos filtrados
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Componente de tarjeta de marca integrado
    const CategoryBrandCard = ({ brand }) => {
        const [imageLoaded, setImageLoaded] = useState(false);
        const [isSearching, setIsSearching] = useState(false);
        const isActive = String(selectedBrand) === String(brand.id_marca);

        const handleBrandClick = (e) => {
            e.preventDefault();
            if (isSearching) return;
            
            setIsSearching(true);
            
            // Aplicar filtro por marca
            setTimeout(() => {
                handleBrandFilter(brand.id_marca);
                setIsSearching(false);
            }, 300);
        };

        return (
            <div
                className={`relative flex flex-col items-center text-center p-4 group transition-all duration-300 rounded-lg ${
                    isActive 
                        ? (isDarkMode ? 'bg-blue-900/50 border-2 border-blue-400' : 'bg-blue-100/70 border-2 border-blue-500')
                        : (isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100/50')
                } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
                <div className={`w-36 h-36 flex items-center justify-center rounded-full border-2 overflow-hidden transition-all duration-300 bg-white ${
                    isActive
                        ? (isDarkMode ? 'border-blue-300 shadow-lg' : 'border-blue-600 shadow-lg')
                        : (isDarkMode ? 'border-blue-400' : 'border-blue-500')
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
                    isActive 
                        ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                        : (isDarkMode ? 'text-white' : 'text-gray-900')
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

                {/* Indicador de filtro activo */}
                {isActive && (
                    <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    }`}>
                        Filtro Activo
                    </div>
                )}

                {/* Botón */}
                <button 
                    className={`mt-3 transition-all duration-300 text-white px-4 py-2 rounded flex items-center justify-center transform hover:scale-105 ${
                        isSearching 
                            ? (isDarkMode ? 'bg-gray-600 cursor-wait' : 'bg-gray-400 cursor-wait')
                            : isActive
                                ? (isDarkMode ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-400 cursor-not-allowed opacity-50')
                                : (isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600')
                    }`}
                    onClick={handleBrandClick}
                    disabled={isSearching || isActive}
                >
                    {isSearching ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Filtrando...
                        </>
                    ) : isActive ? (
                        'Filtro Activo'
                    ) : (
                        'Filtrar por Marca'
                    )}
                </button>
            </div>
        );
    };

    // Función para limpiar filtros
    const clearBrandFilter = () => {
        setSelectedBrand(null);
    };

    return (
        <div>
            <Head title="Categorias" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            <div className={`min-w-screen min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} flex transition-colors duration-200`}>
                {/* Sidebar con filtros y navegación */}
                <div className="w-1/6 p-4 space-y-4">
                    {/* Filtro por Marca */}
                    <div className={`p-4 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filtrar por Marca</h3>
                        <div className="space-y-2">
                            {/* Opción para mostrar todas las marcas */}
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="brandFilter" 
                                    value="all"
                                    checked={selectedBrand === null}
                                    onChange={handleBrandChange}
                                    className="form-radio text-blue-600"
                                />
                                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>Todas las marcas</span>
                            </label>
                            
                            {/* Opciones de marcas específicas */}
                            {marcas && marcas.map((marca) => (
                                <label key={marca.id_marca} className="flex items-center space-x-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="brandFilter" 
                                        value={marca.id_marca}
                                        checked={String(selectedBrand) === String(marca.id_marca)}
                                        onChange={handleBrandChange}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{marca.nombre}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Navegación de subcategorías */}
                    <nav 
                        className={`p-4 overflow-y-auto shadow-2xl transition-all duration-200 rounded-lg ${
                            isDarkMode 
                                ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800' 
                                : 'bg-gradient-to-b from-white via-gray-50 to-white'
                        }`} 
                        id="nav-fijo"
                    >
                        <div className="space-y-2">
                            <button
                                onClick={toggleSubcategoryDropdown}
                                className={`group w-full text-left p-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg font-bold ${
                                    isDarkMode
                                        ? 'bg-[#1e3a8a] text-white shadow-md'
                                        : 'bg-[#1e3a8a] text-white shadow-md'
                                } flex items-center justify-between animate-slideIn`}
                            >
                                <span className="font-medium text-sm">
                                    {categoria.nombre}
                                </span>
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                                    <svg 
                                        className={`w-4 h-4 transform transition-transform duration-300 text-white ${
                                            isSubcategoryDropdownOpen ? 'rotate-180' : ''
                                        }`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {isSubcategoryDropdownOpen && subcategorias && (
                                <div className="ml-3 space-y-1 animate-slideDown">
                                    {subcategorias.map((subcategoria, subIndex) => (
                                        <Link
                                            key={subcategoria.id_subcategoria}
                                            href={`/subcategoria/${subcategoria.id_subcategoria}`}
                                            className={`group block p-2 pl-4 rounded-md transition-all duration-150 transform hover:scale-[1.02] hover:translate-x-1 ${
                                                isDarkMode 
                                                    ? 'bg-gray-600/30 hover:bg-gray-600/50 text-gray-200 border border-gray-600/50 hover:border-gray-500/70' 
                                                    : 'bg-blue-50/50 hover:bg-blue-100/70 text-gray-800 border border-blue-100 hover:border-blue-200'
                                            } hover:shadow-sm animate-slideIn`}
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
                    </nav>
                </div>

                {/* Contenido principal */}
                <div className={`flex-1 p-4 transition-colors duration-200`}>
                    {productos && productos.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                                Categoría: {categoria.nombre}
                                {selectedBrand && (
                                    <span className="text-sm font-normal ml-2 opacity-75">
                                        - Filtrado por marca
                                    </span>
                                )}
                            </h1>
                            {selectedBrand && (
                                <button
                                    onClick={clearBrandFilter}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isDarkMode 
                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                                >
                                    Limpiar Filtros
                                </button>
                            )}
                          </div>
                          <ProductGrid products={filteredProducts} />
                        </>
                    ) : (
                        <>
                        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Categoría: {categoria.nombre}</h1>
                        <div className="text-center py-10">
                          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>No hay productos relacionados a esta categoría.</p>
                        </div>
                        <button onClick={handleMostrarProductos} className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1e3a8a] hover:bg-blue-800'} text-white py-2 px-4 rounded transition-all duration-200 mb-4 mx-auto block`}>Mostrar productos</button>
                        {mostrarProductos && <ProductGrid products={filteredProducts} />}
                        </>
                    )}

                    {/* Sección de marcas integrada */}
                    {marcas && marcas.length > 0 && (
                        <div className={`p-8 mt-8 transition-colors duration-300 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        } rounded-lg`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Marcas Disponibles en esta Categoría
                                </h2>
                                {selectedBrand && (
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                    }`}>
                                        {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {marcas.map((marca) => (
                                    <CategoryBrandCard key={marca.id_marca} brand={marca} />
                                ))}
                            </div>
                        </div>
                    )}

                     <div className="flex justify-center">
                        <Link href="/crear" className={`fixed bottom-8 right-8 w-14 h-14 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1e3a8a] hover:bg-blue-800'} text-white rounded-full flex items-center justify-center shadow-lg text-2xl transition-all duration-200 hover:scale-110`}>
                            +
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />

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
        </div>
    );
}