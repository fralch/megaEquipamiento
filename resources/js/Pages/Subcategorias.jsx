import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";

export default function Subcategoria({ productos }) {
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");

    console.log("Productos recibidos:", productos); // Verifica los productos recibidos

    useEffect(() => {
        // Cargar categorías desde localStorage o desde la API
        const storedData = localStorage.getItem('categoriasCompleta');
        if (storedData) {
            setCategoriasArray(JSON.parse(storedData));
        } else {
            fetch('http://equipamientoindustriales.hpservidor.com/categorias-completa')
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

        // Hacer una solicitud a la API para obtener los datos de la subcategoría
        fetch(`http://equipamientoindustriales.hpservidor.com/subcategoria_id/${subcategoriaId}`)
            .then((response) => response.json())
            .then((data) => {
                setSubcategoriaNombre(data.nombre);
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
                    <h1 className="text-2xl font-bold mb-4">{subcategoriaNombre}</h1>
                    <ProductGrid products={productos} />
                </div>
            </div>
            <Footer />
        </div>
    );
}
