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


    


    useEffect(() => {
        // Cargar categorías desde localStorage o desde la API
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
                .catch((error) => console.error('Error fetching data:', error));
        }

        // Obtener el ID de la subcategoría desde la URL
        const urlParts = window.location.pathname.split('/');
        const subcategoriaId = urlParts[urlParts.length - 1];
        // console.log("productos");
        console.log(productos);

        // Hacer una solicitud a la API para obtener los datos de la subcategoría
        fetch(`${URL_API}/subcategoria_id/${subcategoriaId}`)
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
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
        <div>
            <Head title="Marca" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            <div className={`min-w-screen min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} flex transition-colors duration-200`}>
                <nav className={`w-1/6 p-4 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-colors duration-200`} id="nav-fijo">
                    {categoriasArray.map((categoria) => (
                        <div key={categoria.id_categoria}>
                            <button
                                onClick={() => toggleCategory(categoria.nombre)}
                                className={`block w-full text-left p-2 rounded transition-colors duration-200 ${
                                    activeCategory === categoria.nombre
                                        ? 'bg-[#184f96] text-blue-200'
                                        : isDarkMode 
                                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                            : 'bg-gray-200 hover:bg-white text-gray-900'
                                }`}
                            >
                                {categoria.nombre}
                                <span className="float-right">
                                    {openCategories[categoria.nombre] ? '-' : '+'}
                                </span>
                            </button>
                            {openCategories[categoria.nombre] &&
                                categoria.subcategorias &&
                                categoria.subcategorias.map((subcategoria) => {
                                    // Obtener el ID de la marca desde la URL actual
                                    const urlParts = window.location.pathname.split('/');
                                    const marcaId = urlParts[urlParts.length - 1]; // Último número de la URL /marcas/24
                                    
                                    const href = marcaId && !isNaN(marcaId)
                                        ? `/subcategoria/${subcategoria.id_subcategoria}/${marcaId}`
                                        : `/subcategoria/${subcategoria.id_subcategoria}`;
                                    
                                    return (
                                        <Link
                                            key={subcategoria.id_subcategoria}
                                            href={href}
                                            className={`block p-2 pl-6 rounded transition-colors duration-200 ${
                                                isDarkMode 
                                                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                                                    : 'bg-blue-50 hover:bg-blue-100 text-gray-900'
                                            }`}
                                        >
                                            {subcategoria.nombre}
                                        </Link>
                                    );
                                })}
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
                    ) : (
                        // No hay productos de la marca, mostrar solo mensaje
                        <div className="text-center py-12">
                            <div className="max-w-md mx-auto">
                                <div className="mb-6">
                                    <svg className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-4 transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-200`}>No hay productos disponibles</h1>
                                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>No se encontraron productos para esta marca específica.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    

                </div>
            </div>
            <Footer />
        </div>
    );
}