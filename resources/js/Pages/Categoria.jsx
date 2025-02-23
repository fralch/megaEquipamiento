import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";
const URL_API = import.meta.env.VITE_API_URL;

export default function Categoria({ productos, categoria, subcategorias }) {
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);

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
                .catch((error) => console.error('Error fetching data:', error));
        }

        // Obtener el ID de la categoría desde la URL
        const urlParts = window.location.pathname.split('/');
        const categoriaId = urlParts[urlParts.length - 1];
        console.log(categoriaId);
        console.log(productos);
        console.log(subcategorias);
        console.log(categoria);

        // Hacer una solicitud a la API para obtener los datos de la categoría
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
            <Head title="Categorias" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            <div className="min-w-screen min-h-screen bg-gray-200 flex">
                <nav className="w-1/6 p-4 overflow-y-auto bg-white" id="nav-fijo">
                    {categoriasArray.map((categoria) => (
                        <div key={categoria.id_categoria}>
                            <button
                                onClick={() => toggleCategory(categoria.nombre)}
                                className={`block w-full text-left p-2 rounded ${
                                    activeCategory === categoria.nombre
                                        ? 'bg-[#0c2249] text-blue-200'
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
                                categoria.subcategorias.map((subcategoria) => (
                                    <Link
                                        key={subcategoria.id_subcategoria}
                                        href={`/subcategoria/${subcategoria.id_subcategoria}`}
                                        className="block p-2 pl-6 hover:bg-blue-100 bg-blue-50 rounded"
                                    >
                                        {subcategoria.nombre}
                                    </Link>
                                ))}
                        </div>
                    ))}
                </nav>
                <div className="flex-1 p-4">
                    {productos && productos.length > 0 ? (
                        <>
                          <h1 className="text-2xl font-bold mb-4">Categoría: {categoria.nombre}</h1>
                          <ProductGrid products={productos} />
                        </>
                    ) : (
                        <>
                        <h1 className="text-2xl font-bold mb-4">Mostrando todos los productos</h1>
                        <ProductGrid />
                        </>
                    )}
                     <div className="flex justify-center">
                        <Link href="/crear"className="fixed bottom-8 right-8 w-14 h-14 bg-[#0c2249] hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-lg text-2xl transition-all duration-200 hover:scale-110" >
                            +
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
