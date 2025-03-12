import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ZoomImage from "../Components/store/ZoomImage";
import Footer from "../Components/home/Footer";
import Modal_Features from "./assets/modal_features";
import { Link } from "@inertiajs/react";

const ProductPage = ({ producto }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('descripcion');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [editMode, setEditMode] = useState({});
    const [tempInputs, setTempInputs] = useState({});
    
    // State to track updated product data
    const [productData, setProductData] = useState({
        ...producto,
        caracteristicas: producto.caracteristicas || {},
        datos_tecnicos: producto.datos_tecnicos || {},
        descripcion: producto.descripcion || '',
        documentos: producto.documentos || [],
        contenido_envio: producto.contenido_envio || '',
        soporte_tecnico: producto.soporte_tecnico || ''
    });

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType(null);
    };

    const toggleEditMode = (field) => {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
        setTempInputs(prev => ({
            ...prev,
            [field]: productData[field]
        }));
    };

    const handleInputChange = (field, value) => {
        setTempInputs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = (field) => {
        setProductData(prev => ({
            ...prev,
            [field]: tempInputs[field]
        }));
        setEditMode(prev => ({
            ...prev,
            [field]: false
        }));
        // Aquí se podría agregar la lógica para guardar en el backend
        console.log(`Guardando ${field}:`, tempInputs[field]);
    };

    const handleSaveFeatures = (jsonData) => {
        try {
            const parsedData = JSON.parse(jsonData);
            
            if (modalType === 'caracteristicas') {
                setProductData(prevData => ({
                    ...prevData,
                    caracteristicas: parsedData
                }));
            } else if (modalType === 'datos_tecnicos') {
                setProductData(prevData => ({
                    ...prevData,
                    datos_tecnicos: parsedData
                }));
            }
            
            handleCloseModal();
        } catch (error) {
            console.error("Error parsing data:", error);
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const parseEspecificacionesTecnicas = () => {
        if (!producto.especificaciones_tecnicas) return null;
        
        try {
            return JSON.parse(producto.especificaciones_tecnicas);
        } catch (error) {
            console.error("Error parsing especificaciones_tecnicas:", error);
            return null;
        }
    };

    const especificacionesArray = parseEspecificacionesTecnicas();

    const tabs = [
        { id: 'descripcion', label: 'Descripción' },
        { id: 'caracteristicas', label: 'Características' },
        { id: 'datos', label: 'Datos Técnicos' },
        { id: 'especificaciones', label: 'Especificaciones Técnicas' },
        { id: 'documentos', label: 'Documentos/Descargas' },
        { id: 'contenido', label: 'Contenido de Envío' },
        { id: 'soporte', label: 'Soporte Técnico' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'descripcion':
                return (
                    <div className="p-4">
                        {productData.descripcion ? (
                            <div>
                                {editMode.descripcion ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.descripcion}
                                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                        />
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => handleSave('descripcion')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => toggleEditMode('descripcion')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>{productData.descripcion}</p>
                                        <button 
                                            onClick={() => toggleEditMode('descripcion')}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Editar descripción
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {editMode.descripcion ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.descripcion}
                                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                            placeholder="Ingrese la descripción del producto"
                                        />
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => handleSave('descripcion')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => toggleEditMode('descripcion')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>No hay descripción disponible.</p>
                                        <button 
                                            onClick={() => toggleEditMode('descripcion')}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Agregar descripción
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'caracteristicas':
                return (
                    <div className="p-4">
                        {productData.caracteristicas && Object.keys(productData.caracteristicas).length > 0 ? (
                            <div>
                                <ul className="list-disc pl-5">
                                    {Object.entries(productData.caracteristicas).map(([key, value]) => (
                                        <li key={key} className="mb-2">
                                            <span className="font-semibold">{key}:</span> {value}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => handleOpenModal('caracteristicas')} 
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Editar características
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p>No hay características disponibles.</p>
                                <button 
                                    onClick={() => handleOpenModal('caracteristicas')} 
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Agregar características
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'datos':
                return (
                    <div className="p-4">
                        {productData.datos_tecnicos && Object.keys(productData.datos_tecnicos).length > 0 ? (
                            <div>
                                <ul className="list-disc pl-5">
                                    {Object.entries(productData.datos_tecnicos).map(([key, value]) => (
                                        <li key={key} className="mb-2">
                                            <span className="font-semibold">{key}:</span> {value}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => handleOpenModal('datos_tecnicos')} 
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Editar datos técnicos
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p>No hay datos técnicos disponibles.</p>
                                <button 
                                    onClick={() => handleOpenModal('datos_tecnicos')} 
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Agregar datos técnicos
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'especificaciones':
                return (
                    <div className="p-4">
                        {especificacionesArray && especificacionesArray.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300">
                                    <tbody>
                                        {especificacionesArray.map((row, rowIndex) => (
                                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                {row.map((cell, cellIndex) => (
                                                    <td 
                                                        key={cellIndex} 
                                                        className={`border border-gray-300 px-4 py-2 ${cellIndex === 0 ? 'font-semibold bg-gray-100' : ''}`}
                                                    >
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div>
                                <p>No hay especificaciones técnicas disponibles.</p>
                                {/* Add button for especificaciones if needed */}
                            </div>
                        )}
                    </div>
                );
            case 'documentos':
                return (
                    <div className="p-4">
                        {productData.documentos && productData.documentos.length > 0 ? (
                            <div>
                                <ul className="list-disc pl-5">
                                    {productData.documentos.map((doc, index) => (
                                        <li key={index} className="mb-2">{doc}</li>
                                    ))}
                                </ul>
                                {editMode.documentos ? (
                                    <div className="mt-4">
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.documentos}
                                            onChange={(e) => handleInputChange('documentos', e.target.value)}
                                            placeholder="Ingrese los documentos (uno por línea)"
                                        />
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => handleSave('documentos')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => toggleEditMode('documentos')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => toggleEditMode('documentos')}
                                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Editar documentos
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div>
                                {editMode.documentos ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.documentos}
                                            onChange={(e) => handleInputChange('documentos', e.target.value)}
                                            placeholder="Ingrese los documentos (uno por línea)"
                                        />
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => handleSave('documentos')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => toggleEditMode('documentos')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>No hay documentos disponibles.</p>
                                        <button 
                                            onClick={() => toggleEditMode('documentos')}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Agregar documentos
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'contenido':
                return (
                    <div className="p-4">
                        {productData.contenido_envio ? (
                            <div>
                                {editMode.contenido_envio ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.contenido_envio}
                                            onChange={(e) => handleInputChange('contenido_envio', e.target.value)}
                                        />
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => handleSave('contenido_envio')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => toggleEditMode('contenido_envio')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>{productData.contenido_envio}</p>
                                        <button 
                                            onClick={() => toggleEditMode('contenido_envio')}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Editar contenido de envío
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {editMode.contenido_envio ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.contenido_envio}
                                            onChange={(e) => handleInputChange('contenido_envio', e.target.value)}
                                            placeholder="Ingrese el contenido de envío"
                                        />
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => handleSave('contenido_envio')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => toggleEditMode('contenido_envio')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>No hay información sobre el contenido de envío.</p>
                                        <button 
                                            onClick={() => toggleEditMode('contenido_envio')}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Agregar contenido de envío
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'soporte':
                return (
                    <div className="p-4">
                        {productData.soporte_tecnico ? (
                            <div>
                                {editMode.soporte_tecnico ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.soporte_tecnico}
                                            onChange={(e) => handleInputChange('soporte_tecnico', e.target.value)}
                                        />
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => handleSave('soporte_tecnico')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => toggleEditMode('soporte_tecnico')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>{productData.soporte_tecnico}</p>
                                        <button 
                                            onClick={() => toggleEditMode('soporte_tecnico')}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Editar soporte técnico
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {editMode.soporte_tecnico ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.soporte_tecnico}
                                            onChange={(e) => handleInputChange('soporte_tecnico', e.target.value)}
                                            placeholder="Ingrese la información de soporte técnico"
                                        />
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => handleSave('soporte_tecnico')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => toggleEditMode('soporte_tecnico')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>No hay información de soporte técnico disponible.</p>
                                        <button 
                                            onClick={() => toggleEditMode('soporte_tecnico')}
                                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Agregar soporte técnico
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
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
            
            {/* Modal for Features */}
            {showModal && (
                <Modal_Features
                    product={producto}
                    type={modalType}
                    onSave={handleSaveFeatures}
                    onClose={handleCloseModal}
                    initialData={modalType === 'caracteristicas' 
                        ? productData.caracteristicas 
                        : productData.datos_tecnicos}
                />
            )}
            
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
                        {producto.video && (
                            <div className="mt-6">
                                <iframe
                                    className="w-full h-96 rounded-md shadow-lg"
                                    src={producto.video.replace("youtu.be", "www.youtube.com/embed")}
                                    title="Explora las Propiedades Texturales"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>
                </section>
                <div className="w-full bg-white shadow-md rounded-md mt-10">
                    {/* Tabs */}
                    <div className="flex overflow-x-auto border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${
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
            </main>
            <Footer />
        </div>
    );
};

export default ProductPage;