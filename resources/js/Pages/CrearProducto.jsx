import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Productos from "../Components/create/productos";

const Sidebar = () => (
    <div className="w-full md:w-1/4 bg-blue-50 border-r border-blue-200 p-4">
        <div className="mb-8">
            <img src="/img/logo2.png" alt="Logo" className="mb-4 w-3/5 mx-auto" />
            <h2 className="text-xl font-bold text-blue-600 text-center">
                Elige el registro que deseas crear
            </h2>
        </div>
        <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-medium">
                Crear Producto
            </button>
            <button className="w-full bg-blue-200 text-blue-600 py-2 px-4 rounded-md font-medium">
                Crear Categoria
            </button>
            <button className="w-full bg-blue-200 text-blue-600 py-2 px-4 rounded-md font-medium">
                Crear Subcategoria
            </button>
            <button className="w-full bg-blue-200 text-blue-600 py-2 px-4 rounded-md font-medium">
                Crear Marca
            </button>
        </div>
    </div>
);

const CrearProducto = () => {
    const [productos, setProductos] = useState([]);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Formulario enviado:", form);
    };

    return (
        <div className="w-full mx-auto bg-gray-100 ">
            <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <Head title="Crear" />
                    <Sidebar />
                    <div className="w-full md:w-3/4 p-4">
                        <Productos onSubmit={handleSubmit} />
                    </div>
            </div>
        </div>
    );
};

export default CrearProducto;
