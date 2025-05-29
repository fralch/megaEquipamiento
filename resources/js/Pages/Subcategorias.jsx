import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ProductGrid from "../Components/store/ProductGrid";
import Footer from "../Components/home/Footer";

const URL_API = import.meta.env.VITE_API_URL;

export default function Subcategoria({ productos }) {
    const [isOpen, setIsOpen] = useState(false);
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategoriaNombre, setSubcategoriaNombre] = useState("");
    const [categoriaNombre, setCategoriaNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [mostrarProductos, setMostrarProductos] = useState(false);
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
        opciones: [{ valor: '', etiqueta: '', color: '', orden: 0 }]
    });

    const handleCrearFiltro = async () => {
        const urlParts = window.location.pathname.split('/');
        const subcategoriaId = urlParts[urlParts.length - 1];

        try {
            const response = await fetch(`${URL_API}/filtros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...nuevoFiltro,
                    subcategorias: [subcategoriaId]
                })
            });

            if (response.ok) {
                const nuevoFiltroCreado = await response.json();
                setFiltros([...filtros, nuevoFiltroCreado]);
                setMostrarFormularioFiltro(false);
                setNuevoFiltro({
                    nombre: '',
                    tipo_input: 'select',
                    unidad: '',
                    descripcion: '',
                    orden: 0,
                    obligatorio: false,
                    opciones: [{ valor: '', etiqueta: '', color: '', orden: 0 }]
                });
            } else {
                console.error('Error al crear el filtro');
            }
        } catch (error) {
            console.error('Error:', error);
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
            opciones: filtro.opciones || []
        });
        setMostrarFormularioFiltro(true);
    };

    const handleActualizarFiltro = async () => {
        if (!filtroEnEdicion) return;

        try {
            const response = await fetch(`${URL_API}/filtros/${filtroEnEdicion.id_filtro}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoFiltro)
            });

            if (response.ok) {
                const filtroActualizado = await response.json();
                setFiltros(filtros.map(f => 
                    f.id_filtro === filtroEnEdicion.id_filtro ? filtroActualizado : f
                ));
                setMostrarFormularioFiltro(false);
                setFiltroEnEdicion(null);
                setNuevoFiltro({
                    nombre: '',
                    tipo_input: 'select',
                    unidad: '',
                    descripcion: '',
                    orden: 0,
                    obligatorio: false,
                    opciones: [{ valor: '', etiqueta: '', color: '', orden: 0 }]
                });
            } else {
                console.error('Error al actualizar el filtro');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEliminarFiltro = async () => {
        if (!filtroAEliminar) return;

        try {
            const response = await fetch(`${URL_API}/filtros/${filtroAEliminar.id_filtro}`, {
                method: 'DELETE',
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

    return (
        <div>
            <Head title="Subcategoria" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            <div className="min-w-screen min-h-screen bg-gray-200 flex">
                <div className="w-1/6 p-4 bg-white mt-4" id="filtros-container">
                    <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                    {filtros.length === 0 ? (
                        <div>
                            {!mostrarFormularioFiltro ? (
                                <div className="text-center">
                                    <p className="text-gray-600 mb-4">No hay filtros definidos para esta subcategoría</p>
                                    <button
                                        onClick={() => setMostrarFormularioFiltro(true)}
                                        className="bg-[#184f96] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Crear Nuevo Filtro
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-4">Nuevo Filtro</h3>
                                    <form onSubmit={handleSubmitFiltro} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                            <input
                                                type="text"
                                                value={nuevoFiltro.nombre}
                                                onChange={(e) => setNuevoFiltro({...nuevoFiltro, nombre: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tipo de Input</label>
                                            <select
                                                value={nuevoFiltro.tipo_input}
                                                onChange={(e) => setNuevoFiltro({...nuevoFiltro, tipo_input: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                            >
                                                <option value="select">Select</option>
                                                <option value="checkbox">Checkbox</option>
                                                <option value="radio">Radio</option>
                                                <option value="range">Range</option>
                                            </select>
                                        </div>

                                        {nuevoFiltro.tipo_input === 'range' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Unidad</label>
                                                <input
                                                    type="text"
                                                    value={nuevoFiltro.unidad}
                                                    onChange={(e) => setNuevoFiltro({...nuevoFiltro, unidad: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                                    placeholder="ej: kg, cm, etc."
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                            <textarea
                                                value={nuevoFiltro.descripcion}
                                                onChange={(e) => setNuevoFiltro({...nuevoFiltro, descripcion: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                                rows="3"
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={nuevoFiltro.obligatorio}
                                                onChange={(e) => setNuevoFiltro({...nuevoFiltro, obligatorio: e.target.checked})}
                                                className="rounded border-gray-300 text-[#184f96] shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                            />
                                            <label className="ml-2 block text-sm text-gray-700">Obligatorio</label>
                                        </div>

                                        {['select', 'checkbox', 'radio'].includes(nuevoFiltro.tipo_input) && (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="block text-sm font-medium text-gray-700">Opciones</label>
                                                    <button
                                                        type="button"
                                                        onClick={agregarOpcion}
                                                        className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
                                                    >
                                                        + Agregar Opción
                                                    </button>
                                                </div>
                                                {nuevoFiltro.opciones.map((opcion, index) => (
                                                    <div key={index} className="flex gap-2 items-start">
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={opcion.valor}
                                                                onChange={(e) => actualizarOpcion(index, 'valor', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                                                placeholder="Valor"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={opcion.etiqueta}
                                                                onChange={(e) => actualizarOpcion(index, 'etiqueta', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                                                placeholder="Etiqueta"
                                                                required
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarOpcion(index)}
                                                            className="mt-1 text-red-600 hover:text-red-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setMostrarFormularioFiltro(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-[#184f96] text-white rounded-md hover:bg-blue-700"
                                            >
                                                Guardar Filtro
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {filtros.map((filtro) => (
                                <div key={filtro.id_filtro} className="mb-4">
                                    <h3 className="font-medium mb-2">{filtro.nombre}</h3>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleEditarFiltro(filtro)}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFiltroAEliminar(filtro);
                                                setMostrarConfirmacion(true);
                                            }}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                    {filtro.tipo_input === 'checkbox' && (
                                        <div className="space-y-2">
                                            {filtro.opciones.map((opcion) => (
                                                <label key={opcion.id_opcion} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox h-4 w-4 text-[#184f96]"
                                                        checked={filtrosSeleccionados[filtro.id_filtro]?.includes(opcion.id_opcion)}
                                                        onChange={(e) => {
                                                            const currentSelected = filtrosSeleccionados[filtro.id_filtro] || [];
                                                            const newSelected = e.target.checked
                                                                ? [...currentSelected, opcion.id_opcion]
                                                                : currentSelected.filter(id => id !== opcion.id_opcion);
                                                            setFiltrosSeleccionados({
                                                                ...filtrosSeleccionados,
                                                                [filtro.id_filtro]: newSelected
                                                            });
                                                        }}
                                                    />
                                                    <span>{opcion.etiqueta}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {filtro.tipo_input === 'radio' && (
                                        <div className="space-y-2">
                                            {filtro.opciones.map((opcion) => (
                                                <label key={opcion.id_opcion} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name={`filtro-${filtro.id_filtro}`}
                                                        className="form-radio h-4 w-4 text-[#184f96]"
                                                        checked={filtrosSeleccionados[filtro.id_filtro] === opcion.id_opcion}
                                                        onChange={() => {
                                                            setFiltrosSeleccionados({
                                                                ...filtrosSeleccionados,
                                                                [filtro.id_filtro]: opcion.id_opcion
                                                            });
                                                        }}
                                                    />
                                                    <span>{opcion.etiqueta}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {filtro.tipo_input === 'range' && (
                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                className="w-full"
                                                value={filtrosSeleccionados[filtro.id_filtro] || 0}
                                                onChange={(e) => {
                                                    setFiltrosSeleccionados({
                                                        ...filtrosSeleccionados,
                                                        [filtro.id_filtro]: e.target.value
                                                    });
                                                }}
                                            />
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>0 {filtro.unidad}</span>
                                                <span>100 {filtro.unidad}</span>
                                            </div>
                                        </div>
                                    )}
                                    {filtro.tipo_input === 'select' && (
                                        <select
                                            className="w-full rounded border-gray-300 focus:border-[#184f96] focus:ring focus:ring-[#184f96] focus:ring-opacity-50"
                                            value={filtrosSeleccionados[filtro.id_filtro] || ''}
                                            onChange={(e) => {
                                                setFiltrosSeleccionados({
                                                    ...filtrosSeleccionados,
                                                    [filtro.id_filtro]: e.target.value
                                                });
                                            }}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {filtro.opciones.map((opcion) => (
                                                <option key={opcion.id_opcion} value={opcion.id_opcion}>
                                                    {opcion.etiqueta}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ))}
                            {filtros.length > 0 && (
                                <button
                                    onClick={() => setFiltrosSeleccionados({})}
                                    className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </>
                    )}
                </div>
                <div className="flex-1 p-4">
                    {productos && productos.length > 0 ? (
                        <>
                          <h1 className="text-2xl font-bold mb-4"><Link href={`/categorias/${categoriaId}`}><span className="text-xl font-bold Link text-gray-600">{categoriaNombre} /</span></Link> {subcategoriaNombre}</h1>
                          <ProductGrid products={productos} />
                        </>
                    ) : (
                        <>
                        <h1 className="text-2xl font-bold mb-4"><Link href={`/categorias/${categoriaId}`}><span className="text-xl font-bold Link text-gray-600">{categoriaNombre} /</span></Link> {subcategoriaNombre}</h1>
                        <p className="text-lg text-gray-600 mb-4">No hay productos relacionados a esta subcategoría.</p>
                        <div className="flex justify-center">
                            <button onClick={handleMostrarProductos} className="bg-[#184f96] hover:bg-blue-800 text-white py-2 px-4 rounded transition-all duration-200 mb-4">Mostrar productos</button>
                        </div>
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