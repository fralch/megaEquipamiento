import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
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

export default function Subcategoria({ productos: productosIniciales }) {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [mostrarProductos, setMostrarProductos] = useState(false);
    const [productos, setProductos] = useState(productosIniciales || []);
    const [productosOriginales, setProductosOriginales] = useState(productosIniciales || []);
    const [filtros, setFiltros] = useState([]);
    const [filtrosSeleccionados, setFiltrosSeleccionados] = useState({});
    const [mostrarFormularioFiltro, setMostrarFormularioFiltro] = useState(false);
    const [filtroEnEdicion, setFiltroEnEdicion] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [filtroAEliminar, setFiltroAEliminar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [nuevoFiltro, setNuevoFiltro] = useState({
        nombre: '',
        tipo_input: 'select',
        unidad: '',
        descripcion: '',
        orden: 0,
        obligatorio: true,
        opciones: []
    });

    const handleCrearFiltro = async () => {
        const urlParts = window.location.pathname.split('/');
        const subcategoriaId = urlParts[urlParts.length - 1];
    
        const opcionesValidas = nuevoFiltro.opciones.filter(opcion => 
            opcion.valor.trim() !== '' && opcion.etiqueta.trim() !== ''
        );
    
        const filtroData = {
            ...nuevoFiltro,
            subcategorias: [parseInt(subcategoriaId)],
            opciones: ['select', 'checkbox', 'radio'].includes(nuevoFiltro.tipo_input) ? opcionesValidas : []
        };
    
        try {
            const response = await fetch(`${URL_API}/filtros`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(filtroData)
            });
    
            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);
    
            if (response.ok) {
                setFiltros([...filtros, responseData]);
                setMostrarFormularioFiltro(false);
                resetFormulario();
            } else {
                console.error('Error al crear el filtro:', responseData);
                alert('Error al crear el filtro: ' + (responseData.message || responseData.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al crear el filtro');
        }
    };

    const handleEditarFiltro = (filtro) => {
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
    };

    const handleActualizarFiltro = async () => {
        if (!filtroEnEdicion) return;
    
        const opcionesValidas = nuevoFiltro.opciones.filter(opcion => 
            opcion.valor.trim() !== '' && opcion.etiqueta.trim() !== ''
        );
    
        const filtroData = {
            ...nuevoFiltro,
            opciones: ['select', 'checkbox', 'radio'].includes(nuevoFiltro.tipo_input) ? opcionesValidas : []
        };
    
        try {
            const response = await fetch(`${URL_API}/filtros/${filtroEnEdicion.id_filtro}`, {
                method: 'PUT',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(filtroData)
            });
    
            if (response.ok) {
                const filtroActualizado = await response.json();
                setFiltros(filtros.map(f => 
                    f.id_filtro === filtroEnEdicion.id_filtro ? filtroActualizado : f
                ));
                setMostrarFormularioFiltro(false);
                setFiltroEnEdicion(null);
                resetFormulario();
            } else {
                const errorData = await response.json();
                console.error('Error al actualizar el filtro:', errorData);
                alert('Error al actualizar el filtro: ' + (errorData.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al actualizar el filtro');
        }
    };

    const resetFormulario = () => {
        setNuevoFiltro({
            nombre: '',
            tipo_input: 'select',
            unidad: '',
            descripcion: '',
            orden: 0,
            obligatorio: true,
            opciones: []
        });
    };

    const handleEliminarFiltro = async () => {
        if (!filtroAEliminar) return;

        try {
            const response = await fetch(`${URL_API}/filtros/${filtroAEliminar.id_filtro}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setFiltros(filtros.filter(f => f.id_filtro !== filtroAEliminar.id_filtro));
                setMostrarConfirmacion(false);
                setFiltroAEliminar(null);
            } else {
                console.error('Error al eliminar el filtro');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmitFiltro = async (e) => {
        e.preventDefault();
        if (filtroEnEdicion) {
            await handleActualizarFiltro();
        } else {
            await handleCrearFiltro();
        }
    };

    const agregarOpcion = () => {
        setNuevoFiltro({
            ...nuevoFiltro,
            opciones: [
                ...nuevoFiltro.opciones,
                { valor: '', etiqueta: '', color: '', orden: nuevoFiltro.opciones.length }
            ]
        });
    };

    const eliminarOpcion = (index) => {
        setNuevoFiltro({
            ...nuevoFiltro,
            opciones: nuevoFiltro.opciones.filter((_, i) => i !== index)
        });
    };

    const actualizarOpcion = (index, campo, valor) => {
        const nuevasOpciones = [...nuevoFiltro.opciones];
        nuevasOpciones[index] = {
            ...nuevasOpciones[index],
            [campo]: valor
        };
        setNuevoFiltro({
            ...nuevoFiltro,
            opciones: nuevasOpciones
        });
    };

    useEffect(() => {
        setIsLoading(true);
        // Cargar categorías desde localStorage o desde la API
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

        // Obtener el ID de la subcategoría desde la URL
        const urlParts = window.location.pathname.split('/');
        const subcategoriaId = urlParts[urlParts.length - 1];

        // Cargar los filtros de la subcategoría
        fetch(`${URL_API}/filtros/subcategoria/${subcategoriaId}`)
            .then((response) => response.json())
            .then((data) => {
                setFiltros(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error cargando filtros:', error);
                setIsLoading(false);
            });

        console.log("productos");
        console.log(productos);

        // Hacer una solicitud a la API para obtener los datos de la subcategoría
        fetch(`${URL_API}/subcategoria_id/${subcategoriaId}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setSubcategoriaNombre(data.nombre);
                // Obtener el nombre de la categoría
                fetch(`${URL_API}/subcategoria_get/cat/${subcategoriaId}`)
                    .then((response) => response.json())
                    .then((data) => {
                        setCategoriaNombre(data.nombre_categoria);
                        setCategoriaId(data.id_categoria);
                    })
                    .catch((error) => console.error('Error fetching categoria data:', error));
            })
            .catch((error) => console.error('Error fetching subcategoria data:', error));

            if (productosIniciales && productosIniciales.length > 0) {
                setProductosOriginales(productosIniciales);
            }
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

    const handleMostrarProductos = () => {
        setMostrarProductos(true);
    };

    const buscarProductosFiltrados = async () => {
        const urlParts = window.location.pathname.split('/');
        const subcategoriaId = urlParts[urlParts.length - 1];
        
        try {
            if (Object.keys(filtrosSeleccionados).length > 0) {
                const response = await fetch(`${URL_API}/filtros/filtrar-productos`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        subcategoria_id: subcategoriaId,
                        filtros: filtrosSeleccionados
                    })
                });
    
                if (response.ok) {
                    const productosFiltrados = await response.json();
                    setMostrarProductos(true);
                    setProductos(productosFiltrados);
                    setProductosOriginales(productosFiltrados);
                } else {
                    console.error('Error al filtrar productos');
                }
            } else {
                const response = await fetch(`${URL_API}/product/subcategoria/${subcategoriaId}`);
                if (response.ok) {
                    const todosProductos = await response.json();
                    setMostrarProductos(true);
                    setProductos(todosProductos);
                    setProductosOriginales(todosProductos);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filtrarPorPrecio = () => {
        const precioMin = parseFloat(document.getElementById('min-price').value) || 0;
        const precioMax = parseFloat(document.getElementById('max-price').value) || Infinity;
        
        const productosBase = productosOriginales.length > 0 ? productosOriginales : productos;
        
        const productosFiltrados = productosBase.filter(producto => {
            const precio = parseFloat(producto.precio_igv);
            return precio >= precioMin && precio <= precioMax;
        });
        
        setProductos(productosFiltrados);
        setMostrarProductos(true);
    };

    const limpiarFiltrosPrecio = () => {
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        setProductos(productosOriginales);
    };

    return (
        <div>
            <Head title="Subcategoria" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            
            <div className={`w-full min-h-screen ${
                isDarkMode 
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
            } transition-all duration-300`}>
                
                <div className="flex w-full">
                    {/* Enhanced Filters Sidebar */}
                    <div className={`w-1/6 flex-shrink-0 sticky top-0 h-screen overflow-y-auto p-6 ${
                        isDarkMode 
                            ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 border-r border-gray-700' 
                            : 'bg-gradient-to-b from-white via-gray-50 to-white border-r border-gray-200'
                    } shadow-2xl ${isOpen ? 'z-0' : 'z-10'} transition-all duration-300`} id="filtros-container">
                        
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

                        {/* Enhanced Price Filter */}
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
                                <div className="w-5/12">
                                    <label htmlFor="min-price" className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    } transition-colors duration-200`}>
                                        Mínimo
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className={`${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            } text-sm transition-colors duration-200`}>$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="min-price"
                                            id="min-price"
                                            className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                                isDarkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            }`}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="w-5/12">
                                    <label htmlFor="max-price" className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    } transition-colors duration-200`}>
                                        Máximo
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className={`${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            } text-sm transition-colors duration-200`}>$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="max-price"
                                            id="max-price"
                                            className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                                isDarkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            }`}
                                            placeholder="100000"
                                        />
                                    </div>
                                </div>
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

                        {/* Filters Content */}
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
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={`h-16 rounded-lg animate-pulse ${
                                                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}></div>
                                        ))}
                                    </div>
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
                                    <div className={`text-center py-8 rounded-lg border ${
                                        isDarkMode 
                                            ? 'bg-gray-700/30 border-gray-600/50 text-gray-400' 
                                            : 'bg-gray-50 border-gray-200 text-gray-500'
                                    } transition-colors duration-200`}>
                                        <svg className={`mx-auto h-12 w-12 mb-4 ${
                                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        <p className="text-sm font-medium">No hay filtros disponibles</p>
                                        <p className="text-xs mt-1">para esta subcategoría</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Enhanced Main Content */}
                    <div className="flex-1 p-6 lg:p-8 w-full space-y-2">
                        <div className="w-full">
                            {productos && productos.length > 0 ? (
                                <>
                                    <div className="mb-8">
                                       
                                        <h1 className={`text-2xl lg:text-3xl font-bold mb-2 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        } transition-colors duration-200`}>
                                            <Link href={`/categorias/${categoriaId}`}>
                                                <span className={`text-xl lg:text-2xl font-bold hover:underline ${
                                                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                                                } transition-colors duration-200`}>
                                                    {categoriaNombre} /
                                                </span>
                                            </Link> {subcategoriaNombre}
                                        </h1>
                                        <p className={`text-lg ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        } mb-6 transition-colors duration-200`}>
                                            Explora nuestra selección de productos especializados
                                        </p>
                                        <div className={`h-1 w-20 rounded-full ${
                                            isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                                        } mb-8`}></div>
                                    </div>
                                    <div className="animate-fadeIn">
                                        <ProductGrid products={productos} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                        } transition-colors duration-200`}>
                                            <Link href={`/categorias/${categoriaId}`}>
                                                <span className={`text-2xl lg:text-3xl font-bold hover:underline ${
                                                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
                                                } transition-colors duration-200`}>
                                                    {categoriaNombre} /
                                                </span>
                                            </Link> {subcategoriaNombre}
                                        </h1>
                                        <div className={`h-1 w-20 rounded-full ${
                                            isDarkMode ? 'bg-gradient-to-r from-blue-800 to-green-400' : 'bg-gradient-to-r from-blue-700 to-green-500'
                                        } mb-8`}></div>
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
                                                <h2 className={`text-2xl lg:text-3xl font-bold mb-4 ${
                                                    isDarkMode ? 'text-white' : 'text-gray-800'
                                                } transition-colors duration-200`}>
                                                    No hay productos disponibles
                                                </h2>
                                                <p className={`text-lg mb-8 ${
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
                                                {mostrarProductos && (
                                                    <div className="mt-8 animate-fadeIn">
                                                        <ProductGrid />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
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