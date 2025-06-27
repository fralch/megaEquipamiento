import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "../storage/ThemeContext";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";
import FiltroForm from "../Components/filtros/FiltroForm";
import FiltroList from "../Components/filtros/FiltroList";
import FiltroConfirmDialog from "../Components/filtros/FiltroConfirmDialog";

const URL_API = import.meta.env.VITE_API_URL;

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

// Componente de tarjeta de marca optimizado
const BrandCard = ({ brand, selectedBrand, isDarkMode, onBrandClick }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    
    const isActive = useMemo(() => 
        String(selectedBrand) === String(brand.id_marca), 
        [selectedBrand, brand.id_marca]
    );

    const handleClick = useCallback((e) => {
        e.preventDefault();
        if (isSearching || isActive) return;
        
        setIsSearching(true);
        setTimeout(() => {
            onBrandClick(brand.id_marca);
            setIsSearching(false);
        }, 300);
    }, [isSearching, isActive, onBrandClick, brand.id_marca]);

    // Clases CSS memoizadas
    const cardClasses = useMemo(() => `
        relative flex flex-col items-center text-center p-4 group 
        transition-all duration-300 rounded-lg
        ${isActive 
            ? (isDarkMode ? 'bg-blue-900/50 border-2 border-blue-400' : 'bg-blue-100/70 border-2 border-blue-500')
            : (isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100/50')
        }
        ${isDarkMode ? 'text-white' : 'text-gray-900'}
    `, [isActive, isDarkMode]);

    const imageContainerClasses = useMemo(() => `
        w-36 h-36 flex items-center justify-center rounded-full border-2 
        overflow-hidden transition-all duration-300 bg-white
        ${isActive
            ? (isDarkMode ? 'border-blue-300 shadow-lg' : 'border-blue-600 shadow-lg')
            : (isDarkMode ? 'border-blue-400' : 'border-blue-500')
        }
    `, [isActive, isDarkMode]);

    const buttonClasses = useMemo(() => `
        mt-3 transition-all duration-300 text-white px-4 py-2 rounded 
        flex items-center justify-center transform hover:scale-105
        ${isSearching 
            ? (isDarkMode ? 'bg-gray-600 cursor-wait' : 'bg-gray-400 cursor-wait')
            : isActive
                ? (isDarkMode ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-400 cursor-not-allowed opacity-50')
                : (isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600')
        }
    `, [isSearching, isActive, isDarkMode]);

    return (
        <div className={cardClasses}>
            <div className={imageContainerClasses}>
                <img
                    src={brand.imagen}
                    alt={brand.nombre}
                    className={`object-contain w-32 h-32 transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => e.target.style.display = 'none'}
                />
                
                {!imageLoaded && (
                    <div className={`w-32 h-32 flex items-center justify-center text-4xl font-bold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        {brand.nombre.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <h3 className={`mt-4 text-lg font-semibold transition-colors duration-300 ${
                isActive 
                    ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                    : (isDarkMode ? 'text-white' : 'text-gray-900')
            }`}>
                {brand.nombre}
            </h3>

            {brand.descripcion && (
                <p className={`mt-1 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                    {brand.descripcion}
                </p>
            )}

            {isActive && (
                <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                    Filtro Activo
                </div>
            )}

            <button 
                className={buttonClasses}
                onClick={handleClick}
                disabled={isSearching || isActive}
            >
                {isSearching ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Filtrando...
                    </>
                ) : isActive ? (
                    'Filtro Activo'
                ) : (
                    'Filtrar por Marca'
                )}
            </button>
        </div>
    );
};

// Componente de carga
const LoadingSpinner = ({ isDarkMode }) => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-16 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
        ))}
    </div>
);

// Componente de estado vacío
const EmptyState = ({ isDarkMode, title, description, icon }) => (
    <div className={`text-center py-8 rounded-lg border ${
        isDarkMode 
            ? 'bg-gray-700/30 border-gray-600/50 text-gray-400' 
            : 'bg-gray-50 border-gray-200 text-gray-500'
    } transition-colors duration-200`}>
        {icon}
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs mt-1">{description}</p>
    </div>
);

// ============================================================================
// HOOKS PERSONALIZADOS
// ============================================================================

// Hook para manejo de peticiones HTTP
const useApiRequest = () => {
    const makeRequest = useCallback(async (url, options = {}) => {
        const defaultHeaders = {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        try {
            const response = await fetch(url, {
                headers: { ...defaultHeaders, ...options.headers },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }, []);

    return { makeRequest };
};

// Hook para manejo de filtros
const useProductFilters = (productosOriginales) => {
    const [filtrosSeleccionados, setFiltrosSeleccionados] = useState({});
    const [selectedBrand, setSelectedBrand] = useState(null);

    // Función para aplicar filtros de marca
    const applyBrandFilter = useCallback((productos, marcaId) => {
        if (!marcaId) return productos;
        return productos.filter(product => 
            String(product.marca_id) === String(marcaId)
        );
    }, []);

    // Función para aplicar filtros de precio
    const applyPriceFilter = useCallback((productos, minPrice, maxPrice) => {
        return productos.filter(producto => {
            const precio = parseFloat(producto.precio_igv);
            return precio >= (minPrice || 0) && precio <= (maxPrice || Infinity);
        });
    }, []);

    // Función principal de filtrado
    const filterProducts = useCallback((productos, filtros) => {
        let productosFiltrados = [...productos];

        // Aplicar filtros personalizados
        if (Object.keys(filtrosSeleccionados).length > 0) {
            productosFiltrados = productosFiltrados.filter(producto => {
                return Object.entries(filtrosSeleccionados).every(([filtroId, valorSeleccionado]) => {
                    const filtro = filtros.find(f => f.id_filtro === parseInt(filtroId));
                    if (!filtro) return true;

                    return applyFilterCondition(producto, filtro, valorSeleccionado);
                });
            });
        }

        // Aplicar filtro de marca
        if (selectedBrand) {
            productosFiltrados = applyBrandFilter(productosFiltrados, selectedBrand);
        }

        return productosFiltrados;
    }, [filtrosSeleccionados, selectedBrand, applyBrandFilter]);

    return {
        filtrosSeleccionados,
        setFiltrosSeleccionados,
        selectedBrand,
        setSelectedBrand,
        filterProducts,
        applyPriceFilter
    };
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

// Función para obtener ID de subcategoría de la URL
const getSubcategoriaId = () => {
    const urlParts = window.location.pathname.split('/');
    return urlParts[urlParts.length - 1];
};

// Función para aplicar condiciones de filtro
const applyFilterCondition = (producto, filtro, valorSeleccionado) => {
    switch (filtro.tipo_input) {
        case 'checkbox':
            if (Array.isArray(valorSeleccionado) && valorSeleccionado.length > 0) {
                return valorSeleccionado.some(opcionId => {
                    const opcion = filtro.opciones?.find(opt => opt.id_opcion === parseInt(opcionId));
                    return opcion && cumpleCondicionFiltro(producto, opcion, filtro);
                });
            }
            break;
            
        case 'radio':
        case 'select':
            if (valorSeleccionado) {
                const opcion = filtro.opciones?.find(opt => opt.id_opcion === parseInt(valorSeleccionado));
                return opcion ? cumpleCondicionFiltro(producto, opcion, filtro) : true;
            }
            break;
            
        case 'range':
            if (valorSeleccionado && !isNaN(valorSeleccionado)) {
                return cumpleCondicionRango(producto, valorSeleccionado, filtro);
            }
            break;
    }
    return true;
};

// Función para verificar condiciones de filtro
const cumpleCondicionFiltro = (producto, opcion, filtro) => {
    const valorOpcion = opcion.valor.toLowerCase();
    const etiquetaOpcion = opcion.etiqueta.toLowerCase();
    
    const camposABuscar = [
        producto.caracteristicas,
        producto.especificaciones_tecnicas,
        producto.datos_tecnicos,
        producto.nombre,
        producto.descripcion
    ];

    return camposABuscar.some(campo => {
        if (!campo) return false;
        
        let textoABuscar = '';
        if (typeof campo === 'object') {
            try {
                textoABuscar = JSON.stringify(campo).toLowerCase();
            } catch (e) {
                textoABuscar = String(campo).toLowerCase();
            }
        } else {
            textoABuscar = String(campo).toLowerCase();
        }
        
        return textoABuscar.includes(valorOpcion) || textoABuscar.includes(etiquetaOpcion);
    });
};

// Función para verificar condiciones de rango
const cumpleCondicionRango = (producto, valorSeleccionado, filtro) => {
    const valor = parseFloat(valorSeleccionado);
    const nombreFiltro = filtro.nombre.toLowerCase();
    let valorProducto = null;
    
    // Mapeo de campos según el nombre del filtro
    const fieldMapping = {
        precio: () => parseFloat(producto.precio_igv),
        temperatura: () => extractNumericValue(producto.caracteristicas?.Temperatura),
        velocidad: () => extractNumericValue(producto.caracteristicas?.Velocidad),
        capacidad: () => extractNumericValue(producto.caracteristicas?.Capacidad),
        potencia: () => extractNumericValue(producto.caracteristicas?.Potencia)
    };

    // Buscar en campos conocidos
    for (const [key, extractor] of Object.entries(fieldMapping)) {
        if (nombreFiltro.includes(key)) {
            valorProducto = extractor();
            break;
        }
    }

    // Si no se encontró, buscar en especificaciones técnicas
    if (valorProducto === null && producto.especificaciones_tecnicas) {
        valorProducto = extractFromSpecs(producto.especificaciones_tecnicas, nombreFiltro);
    }
    
    return valorProducto !== null ? valorProducto <= valor : false;
};

// Función auxiliar para extraer valores numéricos
const extractNumericValue = (text) => {
    if (!text) return null;
    const match = String(text).match(/-?\d+/);
    return match ? parseFloat(match[0]) : null;
};

// Función auxiliar para extraer de especificaciones técnicas
const extractFromSpecs = (specs, nombreFiltro) => {
    try {
        const parsedSpecs = JSON.parse(specs);
        if (parsedSpecs.secciones) {
            for (const seccion of parsedSpecs.secciones) {
                if (seccion.datos) {
                    for (const fila of seccion.datos) {
                        if (Array.isArray(fila) && fila.length >= 2) {
                            const especificacion = fila[0].toLowerCase();
                            if (especificacion.includes(nombreFiltro)) {
                                return extractNumericValue(fila[1]);
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Error parsing especificaciones_tecnicas:', e);
    }
    return null;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Subcategoria({ productos: productosIniciales, marcas }) {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();
    const { makeRequest } = useApiRequest();
    
    // Estados principales
    const [isOpen, setIsOpen] = useState(false);
    const [mostrarProductos, setMostrarProductos] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados de datos
    const [productos, setProductos] = useState(productosIniciales || []);
    const [productosOriginales, setProductosOriginales] = useState(productosIniciales || []);
    const [filtros, setFiltros] = useState([]);
    const [categoriasArray, setCategoriasArray] = useState([]);
    
    // Estados de UI
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [mostrarFormularioFiltro, setMostrarFormularioFiltro] = useState(false);
    const [filtroEnEdicion, setFiltroEnEdicion] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [filtroAEliminar, setFiltroAEliminar] = useState(null);
    
    // Estado del nuevo filtro
    const [nuevoFiltro, setNuevoFiltro] = useState({
        nombre: '',
        tipo_input: 'select',
        unidad: '',
        descripcion: '',
        orden: 0,
        obligatorio: true,
        opciones: []
    });

    // Hook de filtros
    const {
        filtrosSeleccionados,
        setFiltrosSeleccionados,
        selectedBrand,
        setSelectedBrand,
        filterProducts,
        applyPriceFilter
    } = useProductFilters(productosOriginales);

    // ============================================================================
    // HANDLERS
    // ============================================================================

    // Handlers de filtros
    const handleBrandFilter = useCallback((marcaId) => {
        setSelectedBrand(String(marcaId));
        const productosFiltrados = productosOriginales.filter(product => 
            String(product.marca_id) === String(marcaId)
        );
        setProductos(productosFiltrados);
        setMostrarProductos(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [productosOriginales]);

    const clearBrandFilter = useCallback(() => {
        setSelectedBrand(null);
        setProductos(productosOriginales);
    }, [productosOriginales]);

    const filtrarPorPrecio = useCallback(() => {
        const precioMin = parseFloat(document.getElementById('min-price').value) || 0;
        const precioMax = parseFloat(document.getElementById('max-price').value) || Infinity;
        
        let productosFiltrados = applyPriceFilter(productosOriginales, precioMin, precioMax);
        
        if (selectedBrand) {
            productosFiltrados = productosFiltrados.filter(product => 
                String(product.marca_id) === String(selectedBrand)
            );
        }
        
        setProductos(productosFiltrados);
        setMostrarProductos(true);
    }, [productosOriginales, selectedBrand, applyPriceFilter]);

    const limpiarFiltrosPrecio = useCallback(() => {
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        
        if (selectedBrand) {
            const productosFiltradosPorMarca = productosOriginales.filter(product => 
                String(product.marca_id) === String(selectedBrand)
            );
            setProductos(productosFiltradosPorMarca);
        } else {
            setProductos(productosOriginales);
        }
    }, [productosOriginales, selectedBrand]);

    const buscarProductosFiltrados = useCallback(() => {
        try {
            const productosFiltrados = filterProducts(productosOriginales, filtros);
            setProductos(productosFiltrados);
            setMostrarProductos(true);
        } catch (error) {
            console.error('Error al filtrar productos:', error);
            setProductos(productosOriginales);
            setMostrarProductos(true);
        }
    }, [filterProducts, productosOriginales, filtros]);

    const limpiarTodosFiltros = useCallback(() => {
        setFiltrosSeleccionados({});
        if (selectedBrand) {
            const productosFiltradosPorMarca = productosOriginales.filter(product => 
                String(product.marca_id) === String(selectedBrand)
            );
            setProductos(productosFiltradosPorMarca);
        } else {
            setProductos(productosOriginales);
        }
        setMostrarProductos(true);
    }, [productosOriginales, selectedBrand]);

    // Handlers de CRUD de filtros
    const handleCrearFiltro = useCallback(async () => {
        const subcategoriaId = getSubcategoriaId();
        const opcionesValidas = nuevoFiltro.opciones.filter(opcion => 
            opcion.valor.trim() !== '' && opcion.etiqueta.trim() !== ''
        );

        const filtroData = {
            ...nuevoFiltro,
            subcategorias: [parseInt(subcategoriaId)],
            opciones: ['select', 'checkbox', 'radio'].includes(nuevoFiltro.tipo_input) ? opcionesValidas : []
        };

        try {
            const responseData = await makeRequest(`${URL_API}/filtros`, {
                method: 'POST',
                body: JSON.stringify(filtroData)
            });

            setFiltros(prev => [...prev, responseData]);
            setMostrarFormularioFiltro(false);
            resetFormulario();
        } catch (error) {
            alert('Error al crear el filtro: ' + error.message);
        }
    }, [nuevoFiltro, makeRequest]);

    const handleEditarFiltro = useCallback((filtro) => {
        setFiltroEnEdicion(filtro);
        setNuevoFiltro({
            nombre: filtro.nombre,
            tipo_input: filtro.tipo_input,
            unidad: filtro.unidad || '',
            descripcion: filtro.descripcion || '',
            orden: filtro.orden,
            obligatorio: true,
            opciones: filtro.opciones && filtro.opciones.length > 0 ? filtro.opciones : []
        });
        setMostrarFormularioFiltro(true);
    }, []);

    const handleActualizarFiltro = useCallback(async () => {
        if (!filtroEnEdicion) return;

        const opcionesValidas = nuevoFiltro.opciones.filter(opcion => 
            opcion.valor.trim() !== '' && opcion.etiqueta.trim() !== ''
        );

        const filtroData = {
            ...nuevoFiltro,
            opciones: ['select', 'checkbox', 'radio'].includes(nuevoFiltro.tipo_input) ? opcionesValidas : []
        };

        try {
            const filtroActualizado = await makeRequest(`${URL_API}/filtros/${filtroEnEdicion.id_filtro}`, {
                method: 'PUT',
                body: JSON.stringify(filtroData)
            });

            setFiltros(prev => prev.map(f => 
                f.id_filtro === filtroEnEdicion.id_filtro ? filtroActualizado : f
            ));
            setMostrarFormularioFiltro(false);
            setFiltroEnEdicion(null);
            resetFormulario();
        } catch (error) {
            alert('Error al actualizar el filtro: ' + error.message);
        }
    }, [filtroEnEdicion, nuevoFiltro, makeRequest]);

    const handleEliminarFiltro = useCallback(async () => {
        if (!filtroAEliminar) return;

        try {
            await makeRequest(`${URL_API}/filtros/${filtroAEliminar.id_filtro}`, {
                method: 'DELETE'
            });

            setFiltros(prev => prev.filter(f => f.id_filtro !== filtroAEliminar.id_filtro));
            setMostrarConfirmacion(false);
            setFiltroAEliminar(null);
        } catch (error) {
            console.error('Error al eliminar el filtro:', error);
        }
    }, [filtroAEliminar, makeRequest]);

    const handleSubmitFiltro = useCallback(async (e) => {
        e.preventDefault();
        if (filtroEnEdicion) {
            await handleActualizarFiltro();
        } else {
            await handleCrearFiltro();
        }
    }, [filtroEnEdicion, handleActualizarFiltro, handleCrearFiltro]);

    const resetFormulario = useCallback(() => {
        setNuevoFiltro({
            nombre: '',
            tipo_input: 'select',
            unidad: '',
            descripcion: '',
            orden: 0,
            obligatorio: true,
            opciones: []
        });
    }, []);

    // Handlers de opciones
    const agregarOpcion = useCallback(() => {
        setNuevoFiltro(prev => ({
            ...prev,
            opciones: [
                ...prev.opciones,
                { valor: '', etiqueta: '', color: '', orden: prev.opciones.length }
            ]
        }));
    }, []);

    const eliminarOpcion = useCallback((index) => {
        setNuevoFiltro(prev => ({
            ...prev,
            opciones: prev.opciones.filter((_, i) => i !== index)
        }));
    }, []);

    const actualizarOpcion = useCallback((index, campo, valor) => {
        setNuevoFiltro(prev => {
            const nuevasOpciones = [...prev.opciones];
            nuevasOpciones[index] = { ...nuevasOpciones[index], [campo]: valor };
            return { ...prev, opciones: nuevasOpciones };
        });
    }, []);

    // Otros handlers
    const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);

    const handleMostrarProductos = useCallback(async () => {
        const subcategoriaId = getSubcategoriaId();
        
        try {
            const productosData = await makeRequest(`${URL_API}/product/subcategoria/${subcategoriaId}`);
            setProductos(productosData);
            setProductosOriginales(productosData);
            setMostrarProductos(true);
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }, [makeRequest]);

    // ============================================================================
    // EFFECTS
    // ============================================================================

    // Effect para cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            setIsLoading(true);
            const subcategoriaId = getSubcategoriaId();

            try {
                // Cargar categorías
                const storedData = localStorage.getItem('categoriasCompleta');
                if (storedData) {
                    setCategoriasArray(JSON.parse(storedData));
                } else {
                    const data = await makeRequest(`${URL_API}/categorias-completa`);
                    setCategoriasArray(data);
                    localStorage.setItem('categoriasCompleta', JSON.stringify(data));
                }

                // Cargar filtros
                const filtrosData = await makeRequest(`${URL_API}/filtros/subcategoria/${subcategoriaId}`);
                setFiltros(filtrosData);

                // Cargar datos de subcategoría
                const [subcategoriaData, categoriaData] = await Promise.all([
                    makeRequest(`${URL_API}/subcategoria_id/${subcategoriaId}`),
                    makeRequest(`${URL_API}/subcategoria_get/cat/${subcategoriaId}`)
                ]);
                
                setSubcategoriaNombre(subcategoriaData.nombre);
                setCategoriaNombre(categoriaData.nombre_categoria);
                setCategoriaId(categoriaData.id_categoria);

                if (productosIniciales && productosIniciales.length > 0) {
                    setProductosOriginales(productosIniciales);
                }

            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setIsLoading(false);
            }
        };

        cargarDatos();
    }, [makeRequest, productosIniciales]);

    // ============================================================================
    // CLASES CSS MEMOIZADAS
    // ============================================================================

    const cssClasses = useMemo(() => ({
        bg: `w-full min-h-screen ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
        } transition-all duration-300`,
        
        sidebar: `w-1/6 flex-shrink-0 sticky top-0 h-screen overflow-y-auto p-6 ${
            isDarkMode 
                ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 border-r border-gray-700' 
                : 'bg-gradient-to-b from-white via-gray-50 to-white border-r border-gray-200'
        } shadow-2xl ${isOpen ? 'z-0' : 'z-10'} transition-all duration-300`,
        
        title: `text-2xl lg:text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
        } transition-colors duration-200`,
        
        gradientLine: `h-1 w-20 rounded-full ${
            isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
        }`
    }), [isDarkMode, isOpen]);

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div>
            <Head title="Subcategoria" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            
            <div className={cssClasses.bg}>
                <div className="flex w-full">
                    {/* Sidebar de filtros */}
                    <div className={cssClasses.sidebar} id="filtros-container">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className={`text-xl font-bold mb-2 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                } transition-colors duration-200`}>
                                    Filtros
                                </h2>
                                <div className={`h-0.5 w-12 rounded-full ${
                                    isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                                }`}></div>
                            </div>
                            {auth.user && !mostrarFormularioFiltro && (
                                <button
                                    onClick={() => setMostrarFormularioFiltro(true)}
                                    className={`py-1 px-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#184f96] hover:bg-blue-700'} text-white rounded transition-colors duration-200 text-sm`}
                                >
                                    + Filtro
                                </button>
                            )}
                        </div>

                        {/* Filtro de precio */}
                        <div className={`price-filter-container p-4 rounded-xl shadow-lg mb-6 transition-all duration-200 border ${
                            isDarkMode 
                                ? 'bg-gray-700/50 border-gray-600/50' 
                                : 'bg-white border-gray-200'
                        }`}>
                            <h3 className={`text-lg font-semibold mb-4 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            } transition-colors duration-200`}>
                                Rango de Precios
                            </h3>
                            <div className="flex justify-between mb-4 space-x-2">
                                {['min-price', 'max-price'].map((id, index) => (
                                    <div key={id} className="w-5/12">
                                        <label htmlFor={id} className={`block text-sm font-medium mb-2 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        } transition-colors duration-200`}>
                                            {index === 0 ? 'Mínimo' : 'Máximo'}
                                        </label>
                                        <div className="relative rounded-lg shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className={`${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                } text-sm transition-colors duration-200`}>$</span>
                                            </div>
                                            <input
                                                type="number"
                                                id={id}
                                                className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                }`}
                                                placeholder={index === 0 ? "0" : "100000"}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-4 space-x-2">
                                <button 
                                    className={`${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200`} 
                                    onClick={limpiarFiltrosPrecio}
                                >
                                    Resetear
                                </button>
                                <button 
                                    className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#184f96] hover:bg-[#184f96]/80'} text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200`} 
                                    onClick={filtrarPorPrecio}
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>

                        {/* Contenido de filtros */}
                        {mostrarFormularioFiltro ? (
                            <FiltroForm
                                nuevoFiltro={nuevoFiltro}
                                setNuevoFiltro={setNuevoFiltro}
                                filtroEnEdicion={filtroEnEdicion}
                                onSubmit={handleSubmitFiltro}
                                onCancel={() => { setMostrarFormularioFiltro(false); setFiltroEnEdicion(null); }}
                                agregarOpcion={agregarOpcion}
                                eliminarOpcion={eliminarOpcion}
                                actualizarOpcion={actualizarOpcion}
                            />
                        ) : (
                            <>
                                {isLoading ? (
                                    <LoadingSpinner isDarkMode={isDarkMode} />
                                ) : filtros.length > 0 ? (
                                    <>
                                        <FiltroList
                                            filtros={filtros}
                                            auth={auth}
                                            onEditar={handleEditarFiltro}
                                            onEliminar={(filtro) => { setFiltroAEliminar(filtro); setMostrarConfirmacion(true); }}
                                            filtrosSeleccionados={filtrosSeleccionados}
                                            setFiltrosSeleccionados={setFiltrosSeleccionados}
                                        />
                                        {Object.keys(filtrosSeleccionados).length > 0 && (
                                            <button
                                                onClick={buscarProductosFiltrados}
                                                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 mt-6 ${
                                                    isDarkMode 
                                                        ? 'bg-[#184f96] hover:bg-blue-700 text-white shadow-lg' 
                                                        : 'bg-[#184f96] hover:bg-blue-600 text-white shadow-md'
                                                }`}
                                            >
                                                Buscar productos
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <EmptyState
                                        isDarkMode={isDarkMode}
                                        title="No hay filtros disponibles"
                                        description="para esta subcategoría"
                                        icon={
                                            <svg className={`mx-auto h-12 w-12 mb-4 ${
                                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                        }
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 p-6 lg:p-8 w-full space-y-2">
                        <div className="w-full">
                            {productos && productos.length > 0 ? (
                                <>
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h1 className={cssClasses.title}>
                                                <Link href={`/categorias/${categoriaId}`}>
                                                    <span className={`text-xl lg:text-2xl font-bold hover:underline ${
                                                        isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                                                    } transition-colors duration-200`}>
                                                        {categoriaNombre} /
                                                    </span>
                                                </Link> {subcategoriaNombre}
                                                {selectedBrand && (
                                                    <span className="text-sm font-normal ml-2 opacity-75">
                                                        - Filtrado por marca
                                                    </span>
                                                )}
                                            </h1>
                                            {selectedBrand && (
                                                <button
                                                    onClick={clearBrandFilter}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        isDarkMode 
                                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }`}
                                                >
                                                    Limpiar Filtro de Marca
                                                </button>
                                            )}
                                        </div>
                                        <p className={`text-lg ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        } mb-6 transition-colors duration-200`}>
                                            Explora nuestra selección de productos especializados
                                        </p>
                                        <div className={`${cssClasses.gradientLine} mb-8`}></div>
                                    </div>
                                    <div className="animate-fadeIn">
                                        <ProductGrid products={productos} />
                                    </div>
                                </>
                            ) : mostrarProductos ? (
                                <>
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h1 className={`text-2xl lg:text-2xl font-bold mb-2 ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            } transition-colors duration-200`}>
                                                <Link href={`/categorias/${categoriaId}`}>
                                                    <span className={`text-lg lg:text-xl font-bold hover:underline ${
                                                        isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                                                    } transition-colors duration-200`}>
                                                        {categoriaNombre} /
                                                    </span>
                                                </Link> {subcategoriaNombre}
                                                {selectedBrand && (
                                                    <span className="text-sm font-normal ml-2 opacity-75">
                                                        - Filtrado por marca
                                                    </span>
                                                )}
                                            </h1>
                                            {selectedBrand && (
                                                <button
                                                    onClick={clearBrandFilter}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        isDarkMode 
                                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }`}
                                                >
                                                    Limpiar Filtro de Marca
                                                </button>
                                            )}
                                        </div>
                                        <p className={`text-lg ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        } mb-6 transition-colors duration-200`}>
                                            Explora nuestra selección de productos especializados
                                        </p>
                                        <div className={`${cssClasses.gradientLine} mb-8`}></div>
                                    </div>
                                    <div className="animate-fadeIn">
                                        <ProductGrid products={productos} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h1 className={`text-2xl lg:text-2xl font-bold mb-2 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        } transition-colors duration-200`}>
                                            <Link href={`/categorias/${categoriaId}`}>
                                                <span className={`text-lg lg:text-xl font-bold hover:underline ${
                                                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                                                } transition-colors duration-200`}>
                                                    {categoriaNombre} /
                                                </span>
                                            </Link> {subcategoriaNombre}
                                        </h1>
                                        <div className={`${cssClasses.gradientLine} mb-8`}></div>
                                    </div>
                                    
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
                                                <h2 className={`text-xl lg:text-2xl font-bold mb-4 ${ 
                                                    isDarkMode ? 'text-white' : 'text-gray-800'
                                                } transition-colors duration-200`}>
                                                    No hay productos disponibles
                                                </h2>
                                                <p className={`text-base mb-8 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                } transition-colors duration-200`}>
                                                    No hay productos relacionados a esta subcategoría.
                                                </p>
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={handleMostrarProductos} 
                                                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                                                            isDarkMode 
                                                                ? 'bg-gradient-to-r from-blue-800 to-green-500 hover:from-blue-700 hover:to-green-400 text-white shadow-lg' 
                                                                : 'bg-gradient-to-r from-blue-700 to-green-500 hover:from-blue-600 hover:to-green-400 text-white shadow-md'
                                                        }`}
                                                    >
                                                        Mostrar productos
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Sección de marcas */}
                            {marcas && (Array.isArray(marcas) ? marcas.length > 0 : true) && (productos.length > 0 || mostrarProductos) && (
                                <div className={`p-8 mt-8 transition-colors duration-300 ${
                                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                } rounded-lg`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Marcas Disponibles en esta Subcategoría
                                        </h2>
                                        {selectedBrand && (
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                            }`}>
                                                {productos.length} producto{productos.length !== 1 ? 's' : ''} encontrado{productos.length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {Array.isArray(marcas) ? marcas.map((marca) => (
                                            <BrandCard 
                                                key={marca.id_marca} 
                                                brand={marca} 
                                                selectedBrand={selectedBrand}
                                                isDarkMode={isDarkMode}
                                                onBrandClick={handleBrandFilter}
                                            />
                                        )) : (
                                            <BrandCard 
                                                key={marcas.id_marca} 
                                                brand={marcas} 
                                                selectedBrand={selectedBrand}
                                                isDarkMode={isDarkMode}
                                                onBrandClick={handleBrandFilter}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <FiltroConfirmDialog
                open={mostrarConfirmacion}
                onCancel={() => setMostrarConfirmacion(false)}
                onConfirm={handleEliminarFiltro}
                filtro={filtroAEliminar}
            />
            <Footer />

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
            `}</style>
        </div>
    );
}