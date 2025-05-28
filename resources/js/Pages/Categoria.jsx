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
                .catch((error) => console.error('Error fetching data:', error));
        }

        // Obtener el ID de la categoría desde la URL
        const urlParts = window.location.pathname.split('/');
        const categoriaId = urlParts[urlParts.length - 1];
        console.log(categoriaId);
        console.log(productos);
        console.log(subcategorias);
        console.log(categoria);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleMostrarProductos = () => {
        setMostrarProductos(true);
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
                        <Link
                            key={categoria.id_categoria}
                            href={`/categorias/${categoria.id_categoria}`}
                            className="block w-full text-left p-3 mb-2 rounded-lg bg-gray-200 hover:bg-[#184f96] hover:text-white transition-colors duration-200 border border-gray-200 hover:border-blue-500"
                        >
                            {categoria.nombre}
                        </Link>
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
                        <h1 className="text-2xl font-bold mb-4">Categoría: {categoria.nombre}</h1>
                        <div className="text-center py-10">
                          <p className="text-xl text-gray-600">No hay productos relacionados a esta categoría.</p>
                        </div>
                        <button onClick={handleMostrarProductos} className="bg-[#184f96] hover:bg-blue-800 text-white py-2 px-4 rounded transition-all duration-200 mb-4 mx-auto block">Mostrar productos</button>
                        {mostrarProductos && <ProductGrid />}
                        </>
                    )}
                     <div className="flex justify-center">
                        <Link href="/crear"className="fixed bottom-8 right-8 w-14 h-14 bg-[#184f96] hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-lg text-2xl transition-all duration-200 hover:scale-110" >
                            +
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}