import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";


export default function Tienda() {
    const [isOpen, setIsOpen] = useState(false);

    // Categorias Vertical----
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [subcategoriasArray, setSubcategoriasArray] = useState({});
     const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null); // Estado para la categoría activa

    useEffect(() => {
        // Verifica si los datos ya están en el localStorage
        const storedCategorias = localStorage.getItem('categorias');
        const storedSubcategorias = localStorage.getItem('subcategorias');

        if (storedCategorias && storedSubcategorias) {
            // Si los datos están en el localStorage, úsalos
            console.log("están en el localStorage");
            setCategoriasArray(JSON.parse(storedCategorias));
            setSubcategoriasArray(JSON.parse(storedSubcategorias));
        } else {
            // Si no están en el localStorage, haz las solicitudes a la API
            console.log("no están en el localStorage");
            fetch('http://127.0.0.1:8000/categorias-all')
            .then((response) => response.json())
            .then((data) => {
                setCategoriasArray(data);
                localStorage.setItem('categorias', JSON.stringify(data)); // Guarda en localStorage
                fetch('http://127.0.0.1:8000/categorias-con-subcategorias')
                    .then((response) => response.json())
                    .then((data) => {
                        setSubcategoriasArray(data);
                        localStorage.setItem('subcategorias', JSON.stringify(data)); // Guarda en localStorage
                    });
            });
        }
    }, []);

    const toggleCategory = (categoria) => {
        setOpenCategories((prevState) => ({
            ...prevState,
            [categoria]: !prevState[categoria],
        }));
        setActiveCategory(categoria); // Establece la categoría activa
    };
    //-------------
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    return (
    <div>
        <Head title="Tienda" />
        <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10"/>
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
        <div className="min-w-screen min-h-screen bg-gray-200 flex">
            <nav className="w-1/6 p-4 overflow-y-auto bg-white" id="nav-fijo">
                {categoriasArray.map((categoria, index) => (
                    <div key={index}>
                        <button
                            onClick={() => toggleCategory(categoria)}
                            className={`block w-full text-left p-2 rounded ${
                                activeCategory === categoria
                                    ? 'bg-[#0c2249] text-blue-200' // Estilos de la categoría activa invertidos
                                    : 'bg-gray-200 hover:bg-white'
                            }`}
                        >
                            {categoria}
                            <span className="float-right">
                                {openCategories[categoria] ? '-' : '+'}
                            </span>
                        </button>
                        {openCategories[categoria] &&
                            subcategoriasArray[categoria] &&
                            subcategoriasArray[categoria].map((subcategoria, subIndex) => (
                                <a
                                    key={subIndex}
                                    href="#"
                                    className="block p-2 pl-6 hover:bg-blue-100 bg-blue-50 rounded"
                                >
                                    {subcategoria}
                                </a>
                            ))}
                    </div>
                ))}
            </nav>
            <div className="flex-1 p-4">
                {/* Contenido principal aquí */}
                <ProductGrid />
            </div>
        </div>
            <Footer /> 
    </div>
);

}