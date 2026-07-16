import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Search,
    X,
    Package,
    Grid3x3,
    Sparkles,
    ArrowRight,
    SlidersHorizontal,
} from "lucide-react";
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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const toggleMenu = () => setIsOpen(!isOpen);

    const toggleCategory = (id) => {
        setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
        setActiveCategory(id);
    };

    useEffect(() => {
        setIsLoading(true);
        const cargarCategorias = async () => {
            try {
                const storedData = localStorage.getItem("categoriasCompleta");
                if (storedData) {
                    setCategoriasArray(JSON.parse(storedData));
                } else {
                    const res = await fetch(`${URL_API}/categorias-con-subcategorias`);
                    if (res.ok) {
                        const data = await res.json();
                        setCategoriasArray(data);
                        localStorage.setItem(
                            "categoriasCompleta",
                            JSON.stringify(data)
                        );
                    } else {
                        setCategoriasArray([]);
                    }
                }
            } catch (e) {
                console.error("Error al cargar categorías:", e);
                setCategoriasArray([]);
            }
        };
        cargarCategorias().finally(() => setIsLoading(false));
    }, []);

    const categoriasFiltradas = useMemo(() => {
        if (!searchTerm.trim()) return categoriasArray;
        const term = searchTerm.toLowerCase();
        return categoriasArray
            .map((cat) => {
                const coincideCategoria = cat.nombre
                    ?.toLowerCase()
                    .includes(term);
                const subFiltradas = (cat.subcategorias || []).filter((sub) =>
                    sub.nombre?.toLowerCase().includes(term)
                );
                if (coincideCategoria || subFiltradas.length > 0) {
                    return {
                        ...cat,
                        subcategorias: coincideCategoria
                            ? cat.subcategorias || []
                            : subFiltradas,
                    };
                }
                return null;
            })
            .filter(Boolean);
    }, [categoriasArray, searchTerm]);

    const totalProductos = productos?.length || 0;

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
                        : "bg-gradient-to-br from-slate-50 via-white to-blue-50"
                } transition-all duration-300`}
            >
                {/* HERO SECTION */}
                {seccion && (
                    <section className="relative overflow-hidden">
                        <div
                            className={`absolute inset-0 opacity-50 pointer-events-none ${
                                isDarkMode
                                    ? "bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]"
                                    : "bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.06),transparent_50%)]"
                            }`}
                        />

                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-12 lg:pb-14">
                            {/* Breadcrumb */}
                            <motion.nav
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className={`flex items-center gap-2 text-sm mb-6 ${
                                    isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                                <Link
                                    href="/"
                                    className={`hover:underline transition-colors ${
                                        isDarkMode
                                            ? "hover:text-blue-400"
                                            : "hover:text-blue-600"
                                    }`}
                                >
                                    Inicio
                                </Link>
                                <ChevronDown className="w-3 h-3 -rotate-90" />
                                <span
                                    className={`font-medium ${
                                        isDarkMode ? "text-white" : "text-gray-900"
                                    }`}
                                >
                                    {seccion.nombre}
                                </span>
                            </motion.nav>

                            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                {/* Imagen con diseño moderno */}
                                {seccion.imagen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.1,
                                        }}
                                        className="relative group"
                                    >
                                        <div
                                            className={`absolute -inset-1 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500 ${
                                                isDarkMode
                                                    ? "bg-gradient-to-br from-blue-600 to-emerald-500"
                                                    : "bg-gradient-to-br from-blue-500 to-emerald-400"
                                            }`}
                                        />
                                        <div
                                            className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden ring-2 ${
                                                isDarkMode
                                                    ? "ring-gray-700/50"
                                                    : "ring-white"
                                            } shadow-2xl`}
                                        >
                                            <img
                                                src={seccion.imagen}
                                                alt={seccion.nombre}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.2,
                                        }}
                                    >
                                        {/* Badge */}
                                        <div
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                                                isDarkMode
                                                    ? "bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20"
                                                    : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                            }`}
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            Sección
                                        </div>

                                        <h1
                                            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 ${
                                                isDarkMode
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {seccion.nombre}
                                        </h1>

                                        {seccion.descripcion && (
                                            <p
                                                className={`text-base lg:text-lg max-w-2xl leading-relaxed ${
                                                    isDarkMode
                                                        ? "text-gray-300"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {seccion.descripcion}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        <div className="mt-5 flex flex-wrap items-center gap-3">
                                            <div
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                                                    isDarkMode
                                                        ? "bg-gray-800/80 ring-1 ring-gray-700 text-gray-200"
                                                        : "bg-white/80 backdrop-blur ring-1 ring-gray-200 text-gray-700 shadow-sm"
                                                }`}
                                            >
                                                <Package className="w-4 h-4 text-emerald-500" />
                                                <span>
                                                    {totalProductos} producto
                                                    {totalProductos !== 1
                                                        ? "s"
                                                        : ""}{" "}
                                                    disponible
                                                    {totalProductos !== 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            </div>
                                            {productos && productos.length > 0 && (
                                                <div
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                                                        isDarkMode
                                                            ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-300"
                                                            : "bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700"
                                                    }`}
                                                >
                                                    <Grid3x3 className="w-4 h-4" />
                                                    Explora el catálogo
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`absolute bottom-0 left-0 right-0 h-px ${
                                isDarkMode
                                    ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent"
                                    : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
                            }`}
                        />
                    </section>
                )}

                {/* MAIN CONTENT + SIDEBAR */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* CONTENIDO PRINCIPAL */}
                        <main className="flex-1 min-w-0 order-2 lg:order-1">
                            {productos && productos.length > 0 ? (
                                <ProductGrid products={productos} />
                            ) : (
                                <EmptyState isDarkMode={isDarkMode} />
                            )}
                        </main>

                        {/* SIDEBAR DE CATEGORÍAS */}
                        <aside className="order-1 lg:order-2 lg:w-80 xl:w-96 lg:flex-shrink-0">
                            {/* Sidebar móvil */}
                            <AnimatePresence>
                                {isMobileSidebarOpen && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() =>
                                                setIsMobileSidebarOpen(false)
                                            }
                                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                                        />
                                        <motion.div
                                            initial={{
                                                x: "100%",
                                                opacity: 0,
                                            }}
                                            animate={{
                                                x: 0,
                                                opacity: 1,
                                            }}
                                            exit={{ x: "100%", opacity: 0 }}
                                            transition={{
                                                type: "spring",
                                                damping: 25,
                                                stiffness: 200,
                                            }}
                                            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 lg:hidden shadow-2xl ${
                                                isDarkMode
                                                    ? "bg-gray-900"
                                                    : "bg-white"
                                            }`}
                                        >
                                            <SidebarContent
                                                isDarkMode={isDarkMode}
                                                isLoading={isLoading}
                                                categoriasArray={
                                                    categoriasFiltradas
                                                }
                                                openCategories={
                                                    openCategories
                                                }
                                                activeCategory={
                                                    activeCategory
                                                }
                                                toggleCategory={
                                                    toggleCategory
                                                }
                                                searchTerm={searchTerm}
                                                setSearchTerm={setSearchTerm}
                                                onClose={() =>
                                                    setIsMobileSidebarOpen(
                                                        false
                                                    )
                                                }
                                            />
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>

                            {/* Sidebar desktop */}
                            <div className="hidden lg:block lg:sticky lg:top-6">
                                <SidebarContent
                                    isDarkMode={isDarkMode}
                                    isLoading={isLoading}
                                    categoriasArray={categoriasFiltradas}
                                    openCategories={openCategories}
                                    activeCategory={activeCategory}
                                    toggleCategory={toggleCategory}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                />
                            </div>
                        </aside>
                    </div>
                </div>

                {/* FAB para móvil */}
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className={`lg:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3 rounded-full font-medium shadow-2xl ${
                        isDarkMode
                            ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white"
                            : "bg-gradient-to-r from-blue-600 to-emerald-500 text-white"
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Categorías</span>
                </motion.button>
            </div>

            <Footer />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: ${
                        isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)"
                    };
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: ${
                        isDarkMode
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.2)"
                    };
                }
            `}</style>
        </div>
    );
}

/* ============================================================== */
/* COMPONENTES INTERNOS                                            */
/* ============================================================== */

function SidebarContent({
    isDarkMode,
    isLoading,
    categoriasArray,
    openCategories,
    activeCategory,
    toggleCategory,
    searchTerm,
    setSearchTerm,
    onClose,
}) {
    return (
        <div
            className={`h-full flex flex-col overflow-hidden rounded-2xl ${
                isDarkMode
                    ? "bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-700/50"
                    : "bg-white/80 backdrop-blur-xl ring-1 ring-gray-200/80 shadow-xl"
            }`}
        >
            {/* Header del sidebar */}
            <div
                className={`p-5 border-b ${
                    isDarkMode ? "border-gray-700/50" : "border-gray-200"
                }`}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`p-2 rounded-lg ${
                                isDarkMode
                                    ? "bg-gradient-to-br from-blue-500/20 to-emerald-500/20 ring-1 ring-blue-400/30"
                                    : "bg-gradient-to-br from-blue-100 to-emerald-100 ring-1 ring-blue-200"
                            }`}
                        >
                            <Grid3x3
                                className={`w-4 h-4 ${
                                    isDarkMode
                                        ? "text-blue-300"
                                        : "text-blue-600"
                                }`}
                            />
                        </div>
                        <div>
                            <h2
                                className={`text-base font-bold ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                            >
                                Categorías
                            </h2>
                            <p
                                className={`text-xs ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }`}
                            >
                                {categoriasArray.length}{" "}
                                {categoriasArray.length === 1
                                    ? "categoría"
                                    : "categorías"}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`p-1.5 rounded-lg transition-colors ${
                                isDarkMode
                                    ? "hover:bg-gray-700 text-gray-400"
                                    : "hover:bg-gray-100 text-gray-500"
                            }`}
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Search
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar categoría..."
                        className={`w-full pl-9 pr-9 py-2.5 text-sm rounded-xl transition-all outline-none ${
                            isDarkMode
                                ? "bg-gray-900/60 ring-1 ring-gray-700 focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500"
                                : "bg-gray-50 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500/50 text-gray-900 placeholder-gray-400"
                        }`}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                                isDarkMode
                                    ? "hover:bg-gray-700 text-gray-400"
                                    : "hover:bg-gray-200 text-gray-500"
                            }`}
                            aria-label="Limpiar búsqueda"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de categorías */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin p-3">
                {isLoading ? (
                    <SkeletonCategorias isDarkMode={isDarkMode} />
                ) : categoriasArray.length === 0 ? (
                    <SinCategorias
                        isDarkMode={isDarkMode}
                        searchTerm={searchTerm}
                    />
                ) : (
                    <div className="space-y-1.5">
                        {categoriasArray.map((categoria, index) => (
                            <CategoryItem
                                key={categoria.id_categoria}
                                categoria={categoria}
                                index={index}
                                isDarkMode={isDarkMode}
                                isOpen={
                                    openCategories[categoria.id_categoria]
                                }
                                isActive={
                                    activeCategory === categoria.id_categoria
                                }
                                onToggle={() =>
                                    toggleCategory(categoria.id_categoria)
                                }
                            />
                        ))}
                    </div>
                )}
            </nav>

            {/* Footer del sidebar */}
            <div
                className={`p-4 border-t ${
                    isDarkMode ? "border-gray-700/50" : "border-gray-200"
                }`}
            >
                <div
                    className={`flex items-center gap-2 text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Catálogo actualizado</span>
                </div>
            </div>
        </div>
    );
}

function CategoryItem({
    categoria,
    index,
    isDarkMode,
    isOpen,
    isActive,
    onToggle,
}) {
    const hasSubcategorias =
        categoria.subcategorias && categoria.subcategorias.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
        >
            <button
                onClick={onToggle}
                className={`group w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    isActive || isOpen
                        ? isDarkMode
                            ? "bg-gradient-to-r from-blue-600/20 to-emerald-600/10 ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/5"
                            : "bg-gradient-to-r from-blue-50 to-emerald-50 ring-1 ring-blue-200 shadow-sm"
                        : isDarkMode
                        ? "hover:bg-gray-700/50 ring-1 ring-transparent hover:ring-gray-600/50"
                        : "hover:bg-gray-50 ring-1 ring-transparent hover:ring-gray-200"
                }`}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isActive || isOpen
                                    ? isDarkMode
                                        ? "bg-gradient-to-br from-blue-500 to-emerald-500 text-white"
                                        : "bg-gradient-to-br from-blue-600 to-emerald-500 text-white"
                                    : isDarkMode
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {categoria.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span
                                className={`block text-sm font-semibold truncate ${
                                    isActive || isOpen
                                        ? isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                        : isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                }`}
                            >
                                {categoria.nombre}
                            </span>
                            {hasSubcategorias && (
                                <span
                                    className={`text-xs ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {categoria.subcategorias.length}{" "}
                                    {categoria.subcategorias.length === 1
                                        ? "subcategoría"
                                        : "subcategorías"}
                                </span>
                            )}
                        </div>
                    </div>
                    {hasSubcategorias ? (
                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${
                                isActive || isOpen
                                    ? isDarkMode
                                        ? "bg-blue-500/20 text-blue-300"
                                        : "bg-blue-100 text-blue-600"
                                    : isDarkMode
                                    ? "bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50"
                                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}
                        >
                            <ChevronDown className="w-3.5 h-3.5" />
                        </motion.div>
                    ) : (
                        <Link
                            href={`/categorias/${categoria.id_categoria}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                                isDarkMode
                                    ? "text-gray-400 hover:bg-gray-700 hover:text-blue-300"
                                    : "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                            aria-label="Ver categoría"
                        >
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && hasSubcategorias && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pl-3 pt-1.5 pb-1 space-y-1">
                            {categoria.subcategorias.map((sub, subIdx) => (
                                <motion.div
                                    key={sub.id_subcategoria}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: subIdx * 0.03,
                                    }}
                                >
                                    <Link
                                        href={`/subcategoria/${sub.id_subcategoria}`}
                                        className={`group/sub flex items-center gap-2.5 p-2 pl-3 rounded-lg text-sm transition-all ${
                                            isDarkMode
                                                ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                                                : "text-gray-700 hover:bg-blue-50/70 hover:text-blue-700"
                                        }`}
                                    >
                                        <div
                                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                                                isDarkMode
                                                    ? "bg-emerald-400 group-hover/sub:bg-emerald-300"
                                                    : "bg-emerald-500 group-hover/sub:bg-emerald-600"
                                            }`}
                                        />
                                        <span className="truncate flex-1 font-medium">
                                            {sub.nombre}
                                        </span>
                                        <ArrowRight
                                            className={`w-3 h-3 opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all ${
                                                isDarkMode
                                                    ? "text-blue-400"
                                                    : "text-blue-600"
                                            }`}
                                        />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SkeletonCategorias({ isDarkMode }) {
    return (
        <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className={`h-14 rounded-xl animate-pulse ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-100"
                    }`}
                />
            ))}
        </div>
    );
}

function SinCategorias({ isDarkMode, searchTerm }) {
    return (
        <div className="text-center py-10 px-4">
            <div
                className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-100"
                }`}
            >
                <Search
                    className={`w-5 h-5 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                />
            </div>
            <p
                className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
            >
                {searchTerm
                    ? "Sin resultados"
                    : "No hay categorías disponibles"}
            </p>
            {searchTerm && (
                <p
                    className={`text-xs mt-1 ${
                        isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                >
                    Prueba con otro término
                </p>
            )}
        </div>
    );
}

function EmptyState({ isDarkMode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 lg:py-24 px-4"
        >
            <div
                className={`max-w-md mx-auto p-8 rounded-2xl ${
                    isDarkMode
                        ? "bg-gray-800/60 ring-1 ring-gray-700"
                        : "bg-white ring-1 ring-gray-200 shadow-xl"
                }`}
            >
                <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                        isDarkMode
                            ? "bg-gradient-to-br from-blue-500/20 to-emerald-500/20 ring-1 ring-blue-400/30"
                            : "bg-gradient-to-br from-blue-100 to-emerald-100 ring-1 ring-blue-200"
                    }`}
                >
                    <Package
                        className={`w-10 h-10 ${
                            isDarkMode ? "text-blue-300" : "text-blue-600"
                        }`}
                    />
                </div>
                <h2
                    className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                >
                    No hay productos disponibles
                </h2>
                <p
                    className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                    Aún no hay productos asignados a esta sección. Vuelve
                    pronto, estamos actualizando nuestro catálogo.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2">
                    <div
                        className={`w-1.5 h-1.5 rounded-full ${
                            isDarkMode ? "bg-blue-400" : "bg-blue-500"
                        }`}
                    />
                    <div
                        className={`w-1.5 h-1.5 rounded-full ${
                            isDarkMode ? "bg-emerald-400" : "bg-emerald-500"
                        }`}
                    />
                    <div
                        className={`w-1.5 h-1.5 rounded-full ${
                            isDarkMode ? "bg-blue-400" : "bg-blue-500"
                        }`}
                    />
                </div>
            </div>
        </motion.div>
    );
}
