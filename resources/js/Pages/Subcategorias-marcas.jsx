import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTheme } from "../storage/ThemeContext";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";

const URL_API = import.meta.env.VITE_API_URL;

export default function Subcategoria({ productos: productosIniciales, marcaId }) {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");

    const [productos, setProductos] = useState(productosIniciales || []);



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



        console.log("productos");
        console.log(productos);

        // Hacer una solicitud a la API para obtener los datos de la subcategoría
        fetch(`${URL_API}/subcategoria_id/${subcategoriaId}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
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
            <Head title="Subcategoria" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            <div className={`min-w-screen min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} flex transition-colors duration-200`}>
                <nav className="w-1/6 p-4 overflow-y-auto bg-white" id="nav-fijo">
                    {categoriasArray.map((categoria) => (
                        <div key={categoria.id_categoria}>
                            <button
                                onClick={() => toggleCategory(categoria.nombre)}
                                className={`block w-full text-left p-2 rounded ${
                                    activeCategory === categoria.nombre
                                        ? 'bg-[#184f96] text-blue-200'
                                        : 'bg-gray-200 hover:bg-white'
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
                                    // Usar el ID de marca enviado por el controlador
                                    const href = marcaId
                                        ? `/subcategoria/${subcategoria.id_subcategoria}/${marcaId}`
                                        : `/subcategoria/${subcategoria.id_subcategoria}`;
                                    
                                    return (
                                        <Link
                                            key={subcategoria.id_subcategoria}
                                            href={href}
                                            className="block p-2 pl-6 hover:bg-blue-100 bg-blue-50 rounded"
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
                        <>
                            <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                                <Link href={`/categorias/${categoriaId}`}>
                                    <span className={`text-xl font-bold Link ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>{categoriaNombre} /</span>
                                </Link> {subcategoriaNombre}
                            </h1>
                            <ProductGrid products={productos} />
                        </>
                    ) : (
                        <>
                            <h1 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                                <Link href={`/categorias/${categoriaId}`}>
                                    <span className={`text-xl font-bold Link ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>{categoriaNombre} /</span>
                                </Link> {subcategoriaNombre}
                            </h1>
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <div className="mb-6">
                                        <svg className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-4 transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-200`}>No hay productos disponibles</h2>
                                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>
                                            {marcaId ? 'No se encontraron productos para esta marca específica.' : 'No hay productos relacionados a esta subcategoría.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>

            <Footer />
        </div>
    );
}