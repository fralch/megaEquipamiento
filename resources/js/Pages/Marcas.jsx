import { Head, Link, usePage } from "@inertiajs/react";
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
    const [marcasArray, setMarcasArray] = useState([]);
    const [activeMarca, setActiveMarca] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    // Nuevo estado para controlar si mostrar todos los productos
    const [mostrarTodosLosProductos, setMostrarTodosLosProductos] = useState(false);

    useEffect(() => {
        // Cargar marcas desde la API
        fetch(URL_API + "/marca/all")
            .then((response) => response.json())
            .then((data) => {
                // Ordenar las marcas alfabéticamente por nombre
                const marcasOrdenadas = data.sort((a, b) => 
                    a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase())
                );
                setMarcasArray(marcasOrdenadas);
            })
            .catch((error) => console.error('Error fetching marcas:', error));

        console.log(productos);
    }, []);

    const handleMarcaClick = (marcaId, marcaNombre) => {
        setActiveMarca(marcaNombre);
        // Aquí puedes agregar lógica para navegar a la página de la marca específica
        window.location.href = `/marcas/${marcaId}`;
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleMostrarTodosLosProductos = () => {
        setMostrarTodosLosProductos(true);
    };

    const handleVolverAMarca = () => {
        setMostrarTodosLosProductos(false);
    };

    return (
        <div>
            <Head title="Marca" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            <div className={`min-w-screen min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} flex transition-colors duration-200`}>
                <nav className={`w-1/6 p-4 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`} id="nav-fijo">
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                        Marcas
                    </h3>
                    {marcasArray.map((marca) => (
                        <div key={marca.id_marca} className="mb-2">
                            <button
                                onClick={() => handleMarcaClick(marca.id_marca, marca.nombre)}
                                className={`block w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                    activeMarca === marca.nombre
                                        ? 'bg-[#184f96] text-white shadow-md'
                                        : isDarkMode 
                                            ? 'bg-gray-700 text-white hover:bg-gray-600 hover:shadow-sm'
                                            : 'bg-gray-100 text-gray-900 hover:bg-white hover:shadow-sm'
                                } transform hover:scale-105`}
                            >
                                <div>
                                    <div className="font-medium">
                                        {marca.nombre.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()}
                                    </div>
                                    {marca.descripcion && (
                                        <div className={`text-xs mt-1 ${
                                            activeMarca === marca.nombre
                                                ? 'text-blue-100'
                                                : isDarkMode 
                                                    ? 'text-gray-400'
                                                    : 'text-gray-600'
                                        }`}>
                                            {marca.descripcion.length > 30 
                                                ? marca.descripcion.substring(0, 30) + '...'
                                                : marca.descripcion
                                            }
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    ))}
                </nav>
                <div className="flex-1 p-4">
                    
                    {productos && productos.length > 0 ? (
                        // Hay productos de la marca específica
                        <>
                          {(() => {
                            let nombreMarca = productos[0]?.marca?.nombre || "Marca";
                            nombreMarca = nombreMarca.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
                            nombreMarca = nombreMarca.charAt(0).toUpperCase() + nombreMarca.slice(1);
                            return (
                              <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{"Productos de: " + nombreMarca}</h1>
                            );
                          })()}
                          <ProductGrid products={productos} />
                        </>
                    ) : mostrarTodosLosProductos ? (
                        // Mostrar todos los productos después de hacer clic en el botón
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Mostrando todos los productos</h1>
                                <button
                                    onClick={handleVolverAMarca}
                                    className={`${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white px-4 py-2 rounded transition-colors duration-200`}
                                >
                                    Volver
                                </button>
                            </div>
                            <ProductGrid />
                        </>
                    ) : (
                        // No hay productos de la marca, mostrar mensaje y botón
                        <div className="text-center py-12">
                            <div className="max-w-md mx-auto">
                                <div className="mb-6">
                                    <svg className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-4 transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-200`}>No hay productos disponibles</h1>
                                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 transition-colors duration-200`}>No se encontraron productos para esta marca específica.</p>
                                </div>
                                
                                <button
                                    onClick={handleMostrarTodosLosProductos}
                                    className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#184f96] hover:bg-blue-800'} text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105`}
                                >
                                    Ver todos los productos
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-center">
                        <Link href="/crear" className={`fixed bottom-8 right-8 w-14 h-14 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#184f96] hover:bg-blue-800'} text-white rounded-full flex items-center justify-center shadow-lg text-2xl transition-all duration-200 hover:scale-110`} >
                            +
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}