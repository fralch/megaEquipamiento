import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";

export default function Subcategoria({ subcategoriaId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const storedData = localStorage.getItem('categoriasCompleta');
        if (storedData) {
            setCategoriasArray(JSON.parse(storedData));
        } else {
            fetch('http://127.0.0.1:8000/categorias-completa')
                .then((response) => response.json())
                .then((data) => {
                    setCategoriasArray(data);
                    localStorage.setItem('categoriasCompleta', JSON.stringify(data));
                })
                .catch((error) => console.error('Error fetching data:', error));
        }
    }, []);

    useEffect(() => {
        if (subcategoriaId) {
            const requestOptions = {
                method: "GET",
                redirect: "follow"
            };

            fetch(`http://127.0.0.1:8000/product/subcategoria/${subcategoriaId}`, requestOptions)
                .then((response) => response.json())
                .then((data) => setProducts(data))
                .catch((error) => console.error('Error fetching products:', error));
        }
    }, [subcategoriaId]);

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
                                    <a
                                        key={subcategoria.id_subcategoria}
                                        href="#"
                                        className="block p-2 pl-6 hover:bg-blue-100 bg-blue-50 rounded"
                                    >
                                        {subcategoria.nombre}
                                    </a>
                                ))}
                        </div>
                    ))}
                </nav>
                <div className="flex-1 p-4">
                    <ProductGrid products={products} />
                </div>
            </div>
            <Footer />
        </div>
    );
}
