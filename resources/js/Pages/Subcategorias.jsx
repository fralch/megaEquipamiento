import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
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
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [mostrarProductos, setMostrarProductos] = useState(false);
    const [productos, setProductos] = useState(productosIniciales || []);
    const [filtros, setFiltros] = useState([]);
    const [filtrosSeleccionados, setFiltrosSeleccionados] = useState({});
    const [mostrarFormularioFiltro, setMostrarFormularioFiltro] = useState(false);
    const [filtroEnEdicion, setFiltroEnEdicion] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [filtroAEliminar, setFiltroAEliminar] = useState(null);
    const [nuevoFiltro, setNuevoFiltro] = useState({
        nombre: '',
        tipo_input: 'select',
        unidad: '',
        descripcion: '',
        orden: 0,
        obligatorio: false,
        opciones: []
    });

    const handleCrearFiltro = async () => {
        const urlParts = window.location.pathname.split('/');
        const subcategoriaId = urlParts[urlParts.length - 1];
    
        // Filtrar opciones válidas antes de enviar
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
    
            if (response.ok) {
                const nuevoFiltroCreado = await response.json();
                setFiltros([...filtros, nuevoFiltroCreado]);
                setMostrarFormularioFiltro(false);
                resetFormulario();
            } else {
                const errorData = await response.json();
                console.error('Error al crear el filtro:', errorData);
                alert('Error al crear el filtro: ' + (errorData.message || 'Error desconocido'));
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
            obligatorio: filtro.obligatorio,
            opciones: filtro.opciones && filtro.opciones.length > 0 ? filtro.opciones : []
        });
        setMostrarFormularioFiltro(true);
    };

    const handleActualizarFiltro = async () => {
        if (!filtroEnEdicion) return;
    
        // Filtrar opciones válidas antes de enviar
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
            obligatorio: false,
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
            })
            .catch((error) => console.error('Error cargando filtros:', error));

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
        // Obtener el ID de la subcategoría desde la URL
        const urlParts = window.location.pathname.split('/');
        const subcategoriaId = urlParts[urlParts.length - 1];
        
        try {
            // Solo realizar la búsqueda si hay filtros seleccionados
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
                    // Actualizar el estado de productos con los productos filtrados
                    setMostrarProductos(true);
                    // Usar la función de actualización de estado para asegurar que tenemos el valor más reciente
                    setProductos(productosFiltrados);
                } else {
                    console.error('Error al filtrar productos');
                }
            } else {
                // Si no hay filtros seleccionados, obtener todos los productos de la subcategoría
                const response = await fetch(`${URL_API}/product/subcategoria/${subcategoriaId}`);
                if (response.ok) {
                    const todosProductos = await response.json();
                    setMostrarProductos(true);
                    setProductos(todosProductos);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <Head title="Subcategoria" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            <div className="min-w-screen min-h-screen bg-gray-200 flex">
                <div className="w-1/6 sticky top-0 h-screen overflow-y-auto p-4 bg-white shadow-md z-10" id="filtros-container">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Filtros</h2>
                        {auth.user && !mostrarFormularioFiltro && (
                            <button
                                onClick={() => setMostrarFormularioFiltro(true)}
                                className="py-1 px-2 bg-[#184f96] text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm"
                            >
                                + Filtro
                            </button>
                        )}
                    </div>
                    <div className="price-filter-container p-4 bg-white rounded-lg shadow mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Rango de Precios</h3>
                        <div className="flex justify-between mb-2">
                            <div className="w-5/12">
                                <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="min-price"
                                        id="min-price"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="w-5/12">
                                <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">Máximo</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="max-price"
                                        id="max-price"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="100000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium">
                                Aplicar Filtro
                            </button>
                        </div>
                    </div>
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
                            {filtros.length > 0 ? (
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
                                            className="w-full py-2 px-4 bg-[#184f96] text-white rounded hover:bg-blue-700 transition-colors duration-200 mt-4"
                                        >
                                            Buscar productos
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-500 mb-4">No hay filtros disponibles para esta subcategoría.</p>
                            )}
                        </>
                    )}
                </div>
                <div className="flex-1 p-4">
                    {productos && productos.length > 0 ? (
                        <>
                            <h1 className="text-2xl font-bold mb-4">
                                <Link href={`/categorias/${categoriaId}`}>
                                    <span className="text-xl font-bold Link text-gray-600">{categoriaNombre} /</span>
                                </Link> {subcategoriaNombre}
                            </h1>
                            <ProductGrid products={productos} />
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mb-4">
                                <Link href={`/categorias/${categoriaId}`}>
                                    <span className="text-xl font-bold Link text-gray-600">{categoriaNombre} /</span>
                                </Link> {subcategoriaNombre}
                            </h1>
                            <p className="text-lg text-gray-600 mb-4">No hay productos relacionados a esta subcategoría.</p>
                            <div className="flex justify-center">
                                <button onClick={handleMostrarProductos} className="bg-[#184f96] hover:bg-blue-800 text-white py-2 px-4 rounded transition-all duration-200 mb-4">Mostrar productos</button>
                            </div>
                            {mostrarProductos && <ProductGrid />}
                        </>
                    )}
                    {auth.user && (
                        <div className="flex justify-center">
                            <Link href="/crear" className="fixed bottom-8 right-8 w-14 h-14 bg-[#184f96] hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-lg text-2xl transition-all duration-200 hover:scale-110">
                                +
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <FiltroConfirmDialog
                open={mostrarConfirmacion}
                onCancel={() => setMostrarConfirmacion(false)}
                onConfirm={handleEliminarFiltro}
                filtro={filtroAEliminar}
            />
            <Footer />
        </div>
    );
}