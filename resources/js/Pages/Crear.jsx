import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Productos from "../Components/create/productos";
import Categorias from "../Components/create/categoria";
import Subcategorias from "../Components/create/subcategoria";
import Marcas from "../Components/create/marca";

const CrearProducto = () => {
    const [crearProducto, setCrearProducto] = useState(true);
    const [crearCategoria, setCrearCategoria] = useState(false);
    const [crearSubcategoria, setCrearSubcategoria] = useState(false);
    const [crearMarca, setCrearMarca] = useState(false);


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
    };

    const handleCrearCategoriaClick = () => {
        setCrearProducto(false);
        setCrearCategoria(true);
    };

    const handleCrearSubcategoriaClick = () => {
        setCrearProducto(false);
        setCrearCategoria(false);
        setCrearSubcategoria(true);
    };

    const handleCrearMarcaClick = () => {
        setCrearProducto(false);
        setCrearCategoria(false);
        setCrearSubcategoria(false);
        setCrearMarca(true);
    };

    return (
        <div className="w-full">
            <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
                <Head title="Crear" />
                <div className="w-full md:w-1/4 bg-blue-50 border-r border-blue-200 p-4">
                    <div className="mb-8">
                        <img
                            src="/img/logo2.png"
                            alt="Logo"
                            className="mb-4 w-3/5 mx-auto"
                        />
                        <h2 className="text-xl font-bold text-blue-600 text-center">
                            Elige el registro que deseas crear
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <button
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-medium"
                            onClick={handleCrearProductoClick}
                        >
                            Crear Producto
                        </button>
                        <button
                            className="w-full bg-blue-200 text-blue-600 py-2 px-4 rounded-md font-medium"
                            onClick={handleCrearCategoriaClick}
                        >
                            Crear Categoria
                        </button>
                        <button className="w-full bg-blue-200 text-blue-600 py-2 px-4 rounded-md font-medium"
                            onClick={handleCrearSubcategoriaClick}
                        >
                            Crear Subcategoria
                        </button>
                        <button className="w-full bg-blue-200 text-blue-600 py-2 px-4 rounded-md font-medium"
                            onClick={handleCrearMarcaClick}
                        >
                            Crear Marca
                        </button>
                    </div>
                </div>
                <div className="w-full md:w-3/4 p-4">
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
