import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTheme } from "../storage/ThemeContext";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";

const URL_API = import.meta.env.VITE_API_URL;

// Función para convertir URLs de video al formato embed
const getEmbedUrl = (url) => {
    if (!url) {
        console.log('getEmbedUrl: URL vacía o null');
        return null;
    }
    
    console.log('getEmbedUrl: Procesando URL:', url);
    
    try {
        // Si ya es una URL embed, devolverla tal como está
        if (url.includes('/embed/') || url.includes('player.vimeo.com') || url.includes('player.')) {
            console.log('getEmbedUrl: URL ya en formato embed, devolviendo tal como está');
            return url;
        }
        
        // YouTube URLs normales
        if (url.includes('youtube.com/watch')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            console.log('getEmbedUrl: Convertido YouTube watch a embed:', embedUrl);
            return embedUrl;
        }
        
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            console.log('getEmbedUrl: Convertido YouTube short a embed:', embedUrl);
            return embedUrl;
        }
        
        // Vimeo URLs normales
        if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            const embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : null;
            console.log('getEmbedUrl: Convertido Vimeo a embed:', embedUrl);
            return embedUrl;
        }
        
        // Para otras URLs válidas, intentar usarlas directamente
        if (url.startsWith('http://') || url.startsWith('https://')) {
            console.log('getEmbedUrl: URL HTTP válida, devolviendo tal como está');
            return url;
        }
        
        console.log('getEmbedUrl: URL no reconocida:', url);
        return null;
    } catch (error) {
        console.error('getEmbedUrl: Error procesando URL de video:', error, 'URL:', url);
        return null;
    }
};

export default function Marcas({ marca, productos }) {
    const { isDarkMode } = useTheme();
    const { auth } = usePage().props;
    const [isEditingVideo, setIsEditingVideo] = useState(false);
    const [editVideoForm, setEditVideoForm] = useState({ video_url: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
    const [videoPreview, setVideoPreview] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        
        // Obtener el ID de la marca de múltiples fuentes
        const urlParts = window.location.pathname.split('/');
        const marcaIdFromUrl = urlParts[urlParts.length - 1];
        
        // Intentar obtener marca_id de los productos si está disponible
        const marcaIdFromProducts = productos && productos.length > 0 
            ? productos[0]?.marca?.marca_id || productos[0]?.marca_id
            : null;
        
        // Usar la marca de los productos como prioridad, fallback a URL
        const marcaId = marcaIdFromProducts || (marcaIdFromUrl && !isNaN(marcaIdFromUrl) ? marcaIdFromUrl : null);
        
        console.log('Marca ID from URL:', marcaIdFromUrl);
        console.log('Marca ID from Products:', marcaIdFromProducts);
        console.log('Marca ID final:', marcaId);
        console.log('Productos:', productos);
    
        // Función para cargar las categorías optimizadas por marca
        const cargarCategoriasOptimizadas = async () => {
            try {
                // Construir URL usando tu ruta específica
                const url = marcaId 
                    ? `${URL_API}/catsub_optimizadas/${marcaId}`
                    : `${URL_API}/catsub_optimizadas`;
                
                console.log('Llamando a:', url);
                
                const categoriasResponse = await fetch(url);
                
                if (categoriasResponse.ok) {
                    const categoriasData = await categoriasResponse.json();
                    setCategoriasArray(categoriasData);
                    console.log('Categorías cargadas:', categoriasData);
                } else {
                    console.error('Error al cargar categorías optimizadas:', categoriasResponse.status);
                    // Fallback: cargar todas las categorías si falla la específica
                    const fallbackResponse = await fetch(`${URL_API}/catsub_optimizadas`);
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json();
                        setCategoriasArray(fallbackData);
                        console.log('Categorías fallback cargadas:', fallbackData);
                    } else {
                        setCategoriasArray([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching categorías optimizadas:', error);
                setCategoriasArray([]);
            }
        };
    
        // Función para cargar información de subcategoría (código existente)
        const cargarInfoSubcategoria = async () => {
            try {
                // Buscar ID de subcategoría en la URL (diferentes patrones posibles)
                let subcategoriaId = null;
                
                // Patron: /subcategoria/123 o /subcategoria/123/456
                if (urlParts.includes('subcategoria')) {
                    const subcategoriaIndex = urlParts.indexOf('subcategoria');
                    if (subcategoriaIndex + 1 < urlParts.length) {
                        subcategoriaId = urlParts[subcategoriaIndex + 1];
                    }
                }
                // Patron: otro patrón que puedas estar usando
                else {
                    subcategoriaId = urlParts.find(part => 
                        part.match(/^\d+$/) && part !== marcaId?.toString()
                    );
                }
                
                if (subcategoriaId && !isNaN(subcategoriaId)) {
                    console.log('Cargando info de subcategoría:', subcategoriaId);
                    
                    const subcategoriaResponse = await fetch(`${URL_API}/subcategoria_id/${subcategoriaId}`);
                    if (subcategoriaResponse.ok) {
                        const subcategoriaData = await subcategoriaResponse.json();
                        setSubcategoriaNombre(subcategoriaData.nombre);
                        
                        // Obtener el nombre de la categoría
                        const categoriaResponse = await fetch(`${URL_API}/subcategoria_get/cat/${subcategoriaId}`);
                        if (categoriaResponse.ok) {
                            const categoriaData = await categoriaResponse.json();
                            setCategoriaNombre(categoriaData.nombre_categoria);
                            setCategoriaId(categoriaData.id_categoria);
                        }
                    } else {
                        console.error('Error al cargar subcategoría:', subcategoriaResponse.status);
                    }
                }
            } catch (error) {
                console.error('Error fetching subcategoria info:', error);
            }
        };
    
        // Ejecutar ambas funciones en paralelo
        Promise.all([
            cargarCategoriasOptimizadas(),
            cargarInfoSubcategoria()
        ]).finally(() => {
            setIsLoading(false);
        });
    
    }, [productos]); // Mantener productos como dependencia

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

    // Initialize edit form when marca changes
    useEffect(() => {
        if (marca && marca.video_url) {
            setEditVideoForm({ video_url: marca.video_url });
            setVideoPreview(getEmbedUrl(marca.video_url));
        }
    }, [marca]);

    // Handle edit video form changes
    const handleEditVideoChange = (e) => {
        const value = e.target.value;
        setEditVideoForm({ video_url: value });
        setVideoPreview(getEmbedUrl(value));
    };

    // Handle video update submission
    const handleUpdateVideo = async (e) => {
        e.preventDefault();
        if (!marca || !marca.id_marca) return;

        setIsUpdating(true);
        setUpdateMessage({ type: '', text: '' });

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const formData = new FormData();
            formData.append('nombre', marca.nombre);
            formData.append('descripcion', marca.descripcion || '');
            formData.append('video_url', editVideoForm.video_url);

            const response = await fetch(`/marca/update/${marca.id_marca}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (response.ok) {
                // Update local marca object
                marca.video_url = editVideoForm.video_url;
                setUpdateMessage({ type: 'success', text: 'Video actualizado correctamente!' });
                setIsEditingVideo(false);
                // Refresh the page after a short delay to show updated content
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el video');
            }
        } catch (error) {
            console.error('Error updating video:', error);
            setUpdateMessage({ type: 'error', text: error.message || 'Error al actualizar el video' });
        } finally {
            setIsUpdating(false);
        }
    };

    // Auto-clear messages
    useEffect(() => {
        if (updateMessage.text) {
            const timer = setTimeout(() => {
                setUpdateMessage({ type: '', text: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [updateMessage]);

    return (
        <div className="min-h-screen">
            <Head title="Marca" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            
            <div className={`w-full min-h-screen ${
                isDarkMode 
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
            } transition-all duration-300`}>
                
                {/* Main Content Container */}
                <div className="flex w-full">
                    
                    {/* Products Section */}
                    <div className="flex-1 p-6 lg:p-8 w-full">
                        <div className="w-full">
                            {productos && productos.length > 0 ? (
                                <>
                                    {(() => {
                                        let nombreMarca = productos[0]?.marca?.nombre || "Marca";
                                        nombreMarca = nombreMarca.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
                                        nombreMarca = nombreMarca.charAt(0).toUpperCase() + nombreMarca.slice(1);
                                        return (
                                            <div className="mb-8">
                                               
                                                <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                } transition-colors duration-200`}>
                                                    {nombreMarca}
                                                </h1>
                                                <p className={`text-lg ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                } mb-6 transition-colors duration-200`}>
                                                    Descubre nuestra selección de productos de alta calidad
                                                </p>
                                                <div className={`h-1 w-20 rounded-full ${
                                                    isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                                                } mb-8`}></div>
                                            </div>
                                        );
                                    })()}
                                    
                                    {/* Video de la marca */}
                                    {marca && (marca.video_url || auth?.user) && (() => {
                                        const embedUrl = marca.video_url ? getEmbedUrl(marca.video_url) : null;
                                        
                                        return (
                                            <div className="mb-8">
                                                <div className={`rounded-2xl overflow-hidden shadow-2xl ${
                                                    isDarkMode 
                                                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                                                        : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
                                                } transition-all duration-300`}>
                                                    
                                                    {/* Video Header with Edit Button */}
                                                    {auth?.user && (
                                                        <div className={`p-4 border-b ${
                                                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                        } flex justify-between items-center`}>
                                                            <h3 className={`text-lg font-semibold ${
                                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                                            }`}>
                                                                Video de la Marca
                                                            </h3>
                                                            <button
                                                                onClick={() => setIsEditingVideo(true)}
                                                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                                    isDarkMode
                                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                                }`}
                                                            >
                                                                {marca.video_url ? 'Editar Video' : 'Agregar Video'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Video Content */}
                                                    {embedUrl ? (
                                                        <div className="aspect-video w-full">
                                                            <iframe
                                                                src={embedUrl}
                                                                className="w-full h-full"
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                allowFullScreen
                                                                title={`Video de ${marca.nombre}`}
                                                            ></iframe>
                                                        </div>
                                                    ) : (
                                                        <div className={`p-8 text-center ${
                                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                            {auth?.user ? (
                                                                <div>
                                                                    <svg className={`mx-auto h-12 w-12 mb-4 ${
                                                                        isDarkMode ? 'text-gray-400' : 'text-gray-300'
                                                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <p className="text-lg font-medium mb-2">No hay video configurado</p>
                                                                    <p className="text-sm">Haz clic en "Agregar Video" para añadir un video a esta marca</p>
                                                                </div>
                                                            ) : marca.video_url ? (
                                                                <p>Video no disponible o URL inválida</p>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    
                                    <div className="animate-fadeIn">
                                        <ProductGrid products={productos} />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 lg:py-24">
                                    <div className="max-w-md mx-auto">
                                        <div className="mb-8">
                                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                                                isDarkMode 
                                                    ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600' 
                                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
                                            } shadow-lg transition-all duration-200`}>
                                                <svg className={`w-10 h-10 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                } transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <h1 className={`text-2xl lg:text-3xl font-bold mb-4 ${
                                                isDarkMode ? 'text-white' : 'text-gray-800'
                                            } transition-colors duration-200`}>
                                                No hay productos disponibles
                                            </h1>
                                            <p className={`text-lg ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            } mb-8 transition-colors duration-200`}>
                                                No se encontraron productos para esta marca específica.
                                            </p>
                                            <div className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium ${
                                                isDarkMode 
                                                    ? 'bg-blue-900/20 text-blue-300 border border-blue-800/50' 
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                            } transition-all duration-200 hover:scale-105`}>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Explora otras categorías en el menú lateral
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Sidebar Navigation */}
                    <nav className={`w-80 lg:w-96 flex-shrink-0 min-h-screen p-6 overflow-y-auto ${
                        isDarkMode 
                            ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 border-l border-gray-700' 
                            : 'bg-gradient-to-b from-white via-gray-50 to-white border-l border-gray-200'
                    } shadow-2xl transition-all duration-300`} id="nav-fijo">
                        
                        <div className="mb-8">
                            <h2 className={`text-xl font-bold mb-2 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            } transition-colors duration-200`}>
                                Categorías
                            </h2>
                            <div className={`h-0.5 w-12 rounded-full ${
                                isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                            }`}></div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-12 rounded-xl animate-pulse ${
                                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categoriasArray.map((categoria, index) => (
                                    <div key={categoria.id_categoria} 
                                         className="animate-slideIn"
                                         style={{ animationDelay: `${index * 0.08}s` }}>
                                        
                                        <button
                                            onClick={() => toggleCategory(categoria.nombre)}
                                            className={`group w-full text-left p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                                                activeCategory === categoria.nombre
                                                    ? isDarkMode
                                                        ? 'bg-gradient-to-r from-blue-800 to-green-500 text-white shadow-md shadow-blue-500/20'
                                                        : 'bg-gradient-to-r from-blue-700 to-green-500 text-white shadow-md shadow-blue-500/20'
                                                    : isDarkMode 
                                                        ? 'bg-gray-700/40 hover:bg-gray-700/60 text-gray-100 border border-gray-600/40 hover:border-gray-500/60' 
                                                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm">
                                                    {categoria.nombre}
                                                </span>
                                                <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                                                    activeCategory === categoria.nombre
                                                        ? 'bg-white/20 rotate-45'
                                                        : isDarkMode
                                                            ? 'bg-gray-600 group-hover:bg-gray-500'
                                                            : 'bg-gray-100 group-hover:bg-gray-200'
                                                }`}>
                                                    <span className={`text-xs font-bold transition-all duration-200 ${
                                                        activeCategory === categoria.nombre
                                                            ? 'text-white'
                                                            : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                        {openCategories[categoria.nombre] ? '−' : '+'}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>

                                        {openCategories[categoria.nombre] && categoria.subcategorias && (
                                            <div className="mt-2 ml-4 space-y-2 animate-slideDown">
                                                {categoria.subcategorias.map((subcategoria, subIndex) => {
                                                    const urlParts = window.location.pathname.split('/');
                                                    const marcaId = urlParts[urlParts.length - 1];
                                                    
                                                    const href = marcaId && !isNaN(marcaId)
                                                        ? `/subcategoria/${subcategoria.id_subcategoria}/${marcaId}`
                                                        : `/subcategoria/${subcategoria.id_subcategoria}`;
                                                    
                                                    return (
                                                        <Link
                                                            key={subcategoria.id_subcategoria}
                                                            href={href}
                                                            className={`group block p-3 rounded-lg transition-all duration-300 transform hover:scale-[1.01] hover:translate-x-2 ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-600/30 hover:bg-gray-600/50 text-gray-200 border border-gray-600/50 hover:border-gray-500/70' 
                                                                    : 'bg-blue-50/50 hover:bg-blue-100/70 text-gray-800 border border-blue-100 hover:border-blue-200'
                                                            } hover:shadow-md`}
                                                            style={{ animationDelay: `${subIndex * 0.05}s` }}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className={`w-2 h-2 rounded-full mr-3 transition-all duration-300 ${
                                                                    isDarkMode 
                                                                        ? 'bg-green-400 group-hover:bg-green-300' 
                                                                        : 'bg-green-500 group-hover:bg-green-600'
                                                                } group-hover:scale-125`}></div>
                                                                <span className="text-sm font-medium group-hover:font-semibold transition-all duration-200">
                                                                    {subcategoria.nombre}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </nav>
                </div>
            </div>
            
            {/* Edit Video Modal */}
            {isEditingVideo && auth?.user && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } transition-colors duration-200`}>
                        <div className={`p-6 border-b ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                            <div className="flex justify-between items-center">
                                <h2 className={`text-xl font-bold ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {marca.video_url ? 'Editar Video' : 'Agregar Video'} - {marca.nombre}
                                </h2>
                                <button
                                    onClick={() => {
                                        setIsEditingVideo(false);
                                        setEditVideoForm({ video_url: marca.video_url || '' });
                                        setVideoPreview(marca.video_url ? getEmbedUrl(marca.video_url) : null);
                                        setUpdateMessage({ type: '', text: '' });
                                    }}
                                    className={`p-2 rounded-md transition-colors duration-200 ${
                                        isDarkMode 
                                            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateVideo} className="p-6">
                            {/* Update Messages */}
                            {updateMessage.text && (
                                <div className={`p-3 mb-4 rounded transition-colors duration-200 ${
                                    updateMessage.type === 'success' 
                                        ? (isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700')
                                        : (isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-700')
                                }`}>
                                    {updateMessage.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        URL del Video
                                    </label>
                                    <input
                                        type="url"
                                        value={editVideoForm.video_url}
                                        onChange={handleEditVideoChange}
                                        placeholder="https://www.youtube.com/watch?v=example o https://vimeo.com/123456789"
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400' 
                                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        disabled={isUpdating}
                                    />
                                    <p className={`mt-1 text-xs ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        Soporta URLs de YouTube y Vimeo. Deja vacío para eliminar el video.
                                    </p>
                                </div>

                                {/* Video Preview */}
                                {videoPreview && (
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Vista Previa
                                        </label>
                                        <div className="aspect-video w-full max-w-2xl">
                                            <iframe
                                                src={videoPreview}
                                                className="w-full h-full rounded-md"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                                title="Video Preview"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={`flex justify-end space-x-3 mt-6 pt-4 border-t ${
                                isDarkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditingVideo(false);
                                        setEditVideoForm({ video_url: marca.video_url || '' });
                                        setVideoPreview(marca.video_url ? getEmbedUrl(marca.video_url) : null);
                                        setUpdateMessage({ type: '', text: '' });
                                    }}
                                    disabled={isUpdating}
                                    className={`px-4 py-2 border rounded-md font-medium transition-colors duration-200 ${
                                        isDarkMode 
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    } disabled:opacity-50`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className={`px-4 py-2 rounded-md font-medium text-white transition-colors duration-200 ${
                                        isDarkMode
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                    } disabled:opacity-50 flex items-center`}
                                >
                                    {isUpdating ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Actualizando...
                                        </>
                                    ) : (
                                        'Guardar Video'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <Footer />

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.5s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}