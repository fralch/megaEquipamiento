import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useTheme } from "../storage/ThemeContext";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";

const URL_API = import.meta.env.VITE_API_URL;

export default function Seccion({ seccion, productos, seoSlug }) {
    const { isDarkMode } = useTheme();
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const toggleMenu = () => setIsOpen(!isOpen);

    const toggleCategory = (nombre) => {
        setOpenCategories((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
        setActiveCategory(nombre);
    };

    useEffect(() => {
        setIsLoading(true);
        const cargarCategorias = async () => {
            try {
                const res = await fetch(`${URL_API}/categorias-con-subcategorias`);
                if (res.ok) {
                    setCategoriasArray(await res.json());
                } else {
                    setCategoriasArray([]);
                }
            } catch (e) {
                console.error("Error al cargar categorías:", e);
                setCategoriasArray([]);
            }
        };
        cargarCategorias().finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="min-h-screen">
            <Head
                title={
                    seccion
                        ? `${seccion.nombre} | Mega Equipamiento`
                        : "Sección | Mega Equipamiento"
                }
            >
                {seccion && (
                    <meta
                        name="description"
                        content={
                            seccion.descripcion ||
                            `Descubre los productos de la sección ${seccion.nombre} en Mega Equipamiento.`
                        }
                    />
                )}
                {seccion && (
                    <link
                        rel="canonical"
                        href={`${window.location.origin}/seccion/${seoSlug}`}
                    />
                )}
            </Head>
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />

            <div
                className={`w-full min-h-screen ${
                    isDarkMode
                        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                        : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
                } transition-all duration-300`}
            >
                <div className="flex w-full">
                    <div className="flex-1 p-6 lg:p-8 w-full">
                        {seccion && (
                            <div className="mb-8 flex flex-col md:flex-row gap-6 items-start">
                                {seccion.imagen && (
                                    <img
                                        src={seccion.imagen}
                                        alt={seccion.nombre}
                                        className="w-32 h-32 object-cover rounded-xl shadow-md"
                                    />
                                )}
                                <div className="flex-1">
                                    <h1
                                        className={`text-3xl lg:text-4xl font-bold mb-2 ${
                                            isDarkMode
                                                ? "text-white"
                                                : "text-gray-900"
                                        } transition-colors duration-200`}
                                    >
                                        {seccion.nombre}
                                    </h1>
                                    {seccion.descripcion && (
                                        <p
                                            className={`text-lg ${
                                                isDarkMode
                                                    ? "text-gray-300"
                                                    : "text-gray-600"
                                            } transition-colors duration-200`}
                                        >
                                            {seccion.descripcion}
                                        </p>
                                    )}
                                    <div
                                        className={`h-1 w-20 rounded-full mt-4 ${
                                            isDarkMode
                                                ? "bg-gradient-to-r from-blue-800 to-green-400"
                                                : "bg-gradient-to-r from-blue-700 to-green-500"
                                        }`}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {productos && productos.length > 0 ? (
                            <div className="animate-fadeIn">
                                <ProductGrid products={productos} />
                            </div>
                        ) : (
                            <div className="text-center py-16 lg:py-24">
                                <div className="max-w-md mx-auto">
                                    <h1
                                        className={`text-2xl lg:text-3xl font-bold mb-4 ${
                                            isDarkMode
                                                ? "text-white"
                                                : "text-gray-800"
                                        }`}
                                    >
                                        No hay productos disponibles
                                    </h1>
                                    <p
                                        className={`text-lg ${
                                            isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        Aún no hay productos asignados a esta
                                        sección.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <nav
                        className={`w-80 lg:w-96 flex-shrink-0 min-h-screen p-6 overflow-y-auto ${
                            isDarkMode
                                ? "bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 border-l border-gray-700"
                                : "bg-gradient-to-b from-white via-gray-50 to-white border-l border-gray-200"
                        } shadow-2xl transition-all duration-300`}
                    >
                        <div className="mb-8">
                            <h2
                                className={`text-xl font-bold mb-2 ${
                                    isDarkMode
                                        ? "text-white"
                                        : "text-gray-900"
                                }`}
                            >
                                Categorías
                            </h2>
                            <div
                                className={`h-0.5 w-12 rounded-full ${
                                    isDarkMode
                                        ? "bg-gradient-to-r from-blue-800 to-green-400"
                                        : "bg-gradient-to-r from-blue-700 to-green-500"
                                }`}
                            ></div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-12 rounded-xl animate-pulse ${
                                            isDarkMode
                                                ? "bg-gray-700"
                                                : "bg-gray-200"
                                        }`}
                                    ></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categoriasArray.map((categoria, index) => (
                                    <div
                                        key={categoria.id_categoria}
                                        className="animate-slideIn"
                                        style={{
                                            animationDelay: `${index * 0.08}s`,
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                toggleCategory(categoria.nombre)
                                            }
                                            className={`group w-full text-left p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                                                activeCategory ===
                                                categoria.nombre
                                                    ? isDarkMode
                                                        ? "bg-gradient-to-r from-blue-800 to-green-500 text-white shadow-md shadow-blue-500/20"
                                                        : "bg-gradient-to-r from-blue-700 to-green-500 text-white shadow-md shadow-blue-500/20"
                                                    : isDarkMode
                                                    ? "bg-gray-700/40 hover:bg-gray-700/60 text-gray-100 border border-gray-600/40 hover:border-gray-500/60"
                                                    : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm">
                                                    {categoria.nombre}
                                                </span>
                                                <div
                                                    className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                                                        activeCategory ===
                                                        categoria.nombre
                                                            ? "bg-white/20 rotate-45"
                                                            : isDarkMode
                                                            ? "bg-gray-600 group-hover:bg-gray-500"
                                                            : "bg-gray-100 group-hover:bg-gray-200"
                                                    }`}
                                                >
                                                    <span
                                                        className={`text-xs font-bold transition-all duration-200 ${
                                                            activeCategory ===
                                                            categoria.nombre
                                                                ? "text-white"
                                                                : isDarkMode
                                                                ? "text-gray-300"
                                                                : "text-gray-600"
                                                        }`}
                                                    >
                                                        {openCategories[
                                                            categoria.nombre
                                                        ]
                                                            ? "−"
                                                            : "+"}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </nav>
                </div>
            </div>
            <Footer />
        </div>
    );
}
