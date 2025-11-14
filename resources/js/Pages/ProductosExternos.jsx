import { Head, router } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../storage/ThemeContext";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import Footer from "../Components/home/Footer";
import ProductCard from "../Components/productosExternos/ProductCard";

export default function ProductosExternos({ productosExternos, filters }) {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || 20);
    const [isNavigating, setIsNavigating] = useState(false);
    const searchInputRef = useRef(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handler = (e) => {
            const target = e.target;
            const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
            if (!isTyping && e.key === '/') {
                e.preventDefault();
                if (searchInputRef.current) searchInputRef.current.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Función para manejar la búsqueda
    const handleSearch = (e) => {
        e.preventDefault();
        setIsNavigating(true);
        router.get('/productos-externos', {
            search: searchTerm,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Función para cambiar de página
    const handlePageChange = (url) => {
        if (url) {
            setIsNavigating(true);
            router.get(url, {}, {
                preserveState: true,
                preserveScroll: false,
            });
        }
    };

    // Función para cambiar items por página
    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setIsNavigating(true);
        router.get('/productos-externos', {
            search: searchTerm,
            per_page: newPerPage,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };


    return (
        <div>
            <Head title="Productos Externos" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />

            <div className={`min-w-screen min-h-screen ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-200'
            } transition-colors duration-200 font-sans text-base`}>

                {/* Header sticky con búsqueda */}
                <div className={`sticky top-0 z-30 border-b backdrop-blur-sm ${
                    isDarkMode
                        ? 'bg-gray-800/90 border-gray-700'
                        : 'bg-white/90 border-gray-300'
                }`}>
                    <div className="container mx-auto px-4 py-5">
                        <h1 className={`text-2xl font-bold tracking-tight mb-3 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Visor de Productos Externos
                        </h1>

                        {/* Barra de búsqueda */}
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-3" aria-label="Buscar productos">
                            <label htmlFor="search" className="sr-only">Buscar productos</label>
                            <input
                                id="search"
                                type="search"
                                inputMode="search"
                                autoComplete="off"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar en productos..."
                                aria-label="Buscar productos"
                                ref={searchInputRef}
                                className={`flex-1 px-4 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 ${
                                        isDarkMode
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                    aria-label="Buscar"
                                >
                                    Buscar
                                </button>
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            router.get('/productos-externos', { per_page: perPage });
                                        }}
                                        className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 ${
                                            isDarkMode
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                        }`}
                                        aria-label="Limpiar búsqueda"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Selector de items por página y stats */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <label htmlFor="per-page" className={`text-sm font-medium ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Mostrar:
                                </label>
                                <select
                                    id="per-page"
                                    value={perPage}
                                    onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors duration-200 ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className={`text-sm ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    por página
                                </span>
                            </div>

                            <div className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`} aria-live="polite">
                                Mostrando {productosExternos.from || 0} - {productosExternos.to || 0} de {productosExternos.total || 0} productos
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de productos */}
                <main className="container mx-auto px-4 py-6" aria-busy={isNavigating} id="productos-grid">
                    {isNavigating ? (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                            {Array.from({ length: Math.min(perPage || 12, 12) }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`border rounded-xl overflow-hidden break-inside-avoid mb-6 ${
                                        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} h-48 animate-pulse`} />
                                    <div className="p-6 space-y-2">
                                        <div className={`h-5 w-2/3 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                                        <div className={`h-3 w-full rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                        <div className={`h-3 w-11/12 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : productosExternos.data && productosExternos.data.length > 0 ? (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                            {productosExternos.data.map((producto) => (
                                <ProductCard key={producto.id} producto={producto} />
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-20 rounded-lg ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <p className={`text-xl ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {searchTerm
                                    ? 'No se encontraron productos que coincidan con tu búsqueda.'
                                    : 'No hay productos externos disponibles.'}
                            </p>
                        </div>
                    )}

                    {/* Paginación */}
                    {productosExternos.last_page > 1 && (
                        <div className={`mt-6 p-4 rounded-lg ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <nav className="flex flex-wrap justify-center items-center gap-2" aria-label="Paginación">
                                {/* Botón Anterior */}
                                <button
                                    onClick={() => handlePageChange(productosExternos.prev_page_url)}
                                    disabled={!productosExternos.prev_page_url}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 ${
                                        !productosExternos.prev_page_url
                                            ? (isDarkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                                            : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                                    }`}
                                    aria-disabled={!productosExternos.prev_page_url}
                                    title="Página anterior"
                                >
                                    Anterior
                                </button>

                                {/* Números de página */}
                                {productosExternos.links && productosExternos.links
                                    .filter(link => link.label !== 'pagination.previous' && link.label !== 'pagination.next' && link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
                                    .map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(link.url)}
                                            disabled={link.active || !link.url}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 ${
                                                link.active
                                                    ? (isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white')
                                                    : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700')
                                            }`}
                                            aria-current={link.active ? 'page' : undefined}
                                            aria-disabled={link.active || !link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}

                                {/* Botón Siguiente */}
                                <button
                                    onClick={() => handlePageChange(productosExternos.next_page_url)}
                                    disabled={!productosExternos.next_page_url}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 ${
                                        !productosExternos.next_page_url
                                            ? (isDarkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                                            : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                                    }`}
                                    aria-disabled={!productosExternos.next_page_url}
                                    title="Página siguiente"
                                >
                                    Siguiente
                                </button>
                            </nav>

                            {/* Información de página actual */}
                            <div className={`text-center mt-3 text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Página {productosExternos.current_page} de {productosExternos.last_page}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}
