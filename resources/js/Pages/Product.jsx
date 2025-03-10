import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ZoomImage from "../Components/store/ZoomImage";
import Footer from "../Components/home/Footer";

const ProductPage = ({ producto }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('descripcion');

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        console.log(producto);
    }, [producto]);

    const tabs = [
        { id: 'descripcion', label: 'Descripción' },
        { id: 'caracteristicas', label: 'Características' },
        { id: 'datos', label: 'Datos Técnicos' },
        { id: 'documentos', label: 'Documentos/Descargas' },
        { id: 'contenido', label: 'Contenido de Envío' },
        { id: 'soporte', label: 'Soporte Técnico' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'descripcion':
                return (
                    <div className="p-4">
                        <p>{producto.descripcion}</p>
                    </div>
                );
            case 'caracteristicas':
                return (
                    <div className="p-4">
                        <ul>
                            {Object.entries(producto.caracteristicas).map(([key, value]) => (
                                <li key={key}>{key}: {value}</li>
                            ))}
                        </ul>
                    </div>
                );
            case 'datos':
                return (
                    <div className="p-4">
                        <ul>
                            {Object.entries(producto.datos_tecnicos).map(([key, value]) => (
                                <li key={key}>{key}: {value}</li>
                            ))}
                        </ul>
                    </div>
                );
            case 'documentos':
                return (
                    <div className="p-4">
                        {producto.archivos_adicionales ? (
                            <a href={producto.archivos_adicionales} target="_blank" rel="noopener noreferrer">
                                Descargar documentos adicionales
                            </a>
                        ) : (
                            <p>No hay documentos adicionales disponibles.</p>
                        )}
                    </div>
                );
            case 'contenido':
                return (
                    <div className="p-4">
                        <p>{producto.envio}</p>
                    </div>
                );
            case 'soporte':
                return (
                    <div className="p-4">
                        <p>{producto.soporte_tecnico}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="font-sans text-gray-800 bg-gray-100 min-h-screen">
            <Head title="Producto" />
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            {/* Main Content */}
            <main className="p-6">
                {/* Product Section */}
                <section className="grid md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <ZoomImage imageSrc={producto.imagen.startsWith('http') ? producto.imagen : `/${producto.imagen}`} />

                    {/* Product Details */}
                    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                        {/* Encabezado */}
                        <div className="flex flex-col space-y-4">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {producto.nombre}
                            </h1>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex text-left space-x-4 flex-col">
                                    <div className="ml-3">
                                        <p className="text-2xl font-semibold text-green-600">
                                            S/ {producto.precio_sin_ganancia}
                                        </p>
                                        <p className="text-gray-500">
                                            (sin IGV)
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-gray-800">
                                            S/ {producto.precio_igv}
                                        </p>
                                        <p className="text-gray-500">
                                            (con IGV)
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>SKU: {producto.sku}</p>
                                  
                                    <p>Fabricante: {producto.marca.nombre}</p>
                                    <p>
                                        Plazo de entrega: 1-3 días (Salvo fin
                                        Stock)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex items-center space-x-4 mt-6">
                            <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 shadow-md">
                                Agregar al carrito
                            </button>
                            <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 shadow-md">
                                Selecciona tus accesorios
                            </button>
                            <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 shadow-md">
                                Comunícate con un asesor
                            </button>
                        </div>

                        {/* El video tiene que ser la version acortada de youtube como por ejemplo: https://youtu.be/X9IgxlivjO8?si=QaCVPCuos-VrSP4R */}
                        <div className="mt-6">
                            <iframe
                                className="w-full h-96 rounded-md shadow-lg"
                                src={producto.video.replace("youtu.be", "www.youtube.com/embed")}
                                title="Explora las Propiedades Texturales"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </section>
                <div className="w-full bg-white shadow-md rounded-md mt-10">
                    {/* Tabs */}
                    <div className="flex border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-500'
                                        : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-4">{renderContent()}</div>
                </div>
                {/* Accessories Section */}
                {/* <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Accesorios</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="border rounded-lg p-4 hover:shadow-lg transition"
                            >
                                <img
                                    src="/accessory-image.png"
                                    alt="Accesorio"
                                    className="w-full mb-4"
                                />
                                <h3 className="font-bold text-center">
                                    Sonda Esférica (Ø 18 mm)
                                </h3>
                                <p className="text-center text-gray-500 mt-2">
                                    $400.00
                                </p>
                            </div>
                        ))}
                    </div>
                </section> */}

                {/* Related Products Section */}
                {/* <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">
                        Productos relacionados
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="border rounded-lg p-4 hover:shadow-lg transition"
                            >
                                <img
                                    src="/related-product.png"
                                    alt="Producto relacionado"
                                    className="w-full mb-4"
                                />
                                <h3 className="font-bold text-center">
                                    Analizador de texturas TX-700
                                </h3>
                                <p className="text-center text-gray-500 mt-2">
                                    $14,370.83
                                </p>
                            </div>
                        ))}
                    </div>
                </section> */}
            </main>
            <Footer />
        </div>
    );
};

export default ProductPage;
