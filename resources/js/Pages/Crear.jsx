import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { useTheme } from '../storage/ThemeContext';
import Productos from "../Components/create/createProductos";
import Categorias from "../Components/create/createCategoria";
import Subcategorias from "../Components/create/createSubcategoria";
import Marcas from "../Components/create/createMarca";

const CrearProducto = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [crearProducto, setCrearProducto] = useState(true);
    const [crearCategoria, setCrearCategoria] = useState(false);
    const [crearSubcategoria, setCrearSubcategoria] = useState(false);
    const [crearMarca, setCrearMarca] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 768);

    const [form, setForm] = useState({
        sku: "",
        nombre: "",
        id_subcategoria: "",
        marca_id: "",
        pais: "",
        precio_sin_ganancia: "",
        imagen: "",
        descripcion: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Formulario enviado:", form);
    };

    const handleCrearProductoClick = () => {
        setCrearProducto(true);
        setCrearCategoria(false);
        setCrearSubcategoria(false);
        setCrearMarca(false);
    };

    const handleCrearCategoriaClick = () => {
        setCrearProducto(false);
        setCrearCategoria(true);
        setCrearSubcategoria(false);
        setCrearMarca(false);
    };

    const handleCrearSubcategoriaClick = () => {
        setCrearProducto(false);
        setCrearCategoria(false);
        setCrearSubcategoria(true);
        setCrearMarca(false);
    };

    const handleCrearMarcaClick = () => {
        setCrearProducto(false);
        setCrearCategoria(false);
        setCrearSubcategoria(false);
        setCrearMarca(true);
    };

    return (
        <div className="w-full relative">
            <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
                <Head title="Crear" />
                
                <button
                    className={`fixed top-4 left-4 z-20 text-white p-2 rounded-md shadow-md md:hidden transition-colors duration-300 ${
                        isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                >
                    ☰
                </button>

                {/* Botón de cambio de tema */}
                 <button
                     onClick={toggleDarkMode}
                     className={`fixed top-4 right-4 z-20 p-2 rounded-lg transition-colors duration-200 ${
                         isDarkMode 
                             ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                     }`}
                     title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                 >
                     {isDarkMode ? (
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                         </svg>
                     ) : (
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                             <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                         </svg>
                     )}
                 </button>
                
                <div className={`${
                    sidebarVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } transition-all duration-300 fixed md:static w-64 p-4 h-screen z-10 border-r ${
                    isDarkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-blue-50 border-blue-200'
                }`}>
                    <div className="mb-8">
                        <Link href="/"> 
                            <img
                                src="/img/logo2.png"
                                alt="Logo"
                                className="mb-4 w-3/5 mx-auto"
                            />
                        </Link>
                        <h2 className={`text-xl font-bold text-center transition-colors duration-300 ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                            Elige el registro que deseas crear
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <button
                            className={`w-full text-white py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
                                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                            onClick={handleCrearProductoClick}
                        >
                            Crear Producto
                        </button>
                        <button
                            className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                                    : 'bg-blue-200 text-blue-600 hover:bg-blue-300'
                            }`}
                            onClick={handleCrearCategoriaClick}
                        >
                            Crear Categoria
                        </button>
                        <button className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                                    : 'bg-blue-200 text-blue-600 hover:bg-blue-300'
                            }`}
                            onClick={handleCrearSubcategoriaClick}
                        >
                            Crear Subcategoria
                        </button>
                        <button className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                                    : 'bg-blue-200 text-blue-600 hover:bg-blue-300'
                            }`}
                            onClick={handleCrearMarcaClick}
                        >
                            Crear Marca
                        </button>
                    </div>
                </div>
                <div className={`w-full p-4 transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                }`}>
                    <div className={crearProducto ? "block" : "hidden"}>
                        <Productos onSubmit={handleSubmit} />
                    </div>
                    <div className={crearCategoria ? "block" : "hidden"}>
                        <Categorias onSubmit={handleSubmit} />
                    </div>
                    <div className={crearSubcategoria ? "block" : "hidden"}>
                        <Subcategorias onSubmit={handleSubmit} />
                    </div>
                    <div className={crearMarca ? "block" : "hidden"}>
                        <Marcas onSubmit={handleSubmit} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearProducto;