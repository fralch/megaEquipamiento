import { Head } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ZoomImage from "../Components/store/ZoomImage";
import Footer from "../Components/home/Footer";
import Modal_Features from "./assets/modal_features";
import { Link } from "@inertiajs/react";

// Importar componentes modulares
import ProductDescription from "../Components/product/ProductDescription";
import ProductFeatures from "../Components/product/ProductFeatures";
import ProductTechnicalData from "../Components/product/ProductTechnicalData";
import ProductSpecifications from "../Components/product/ProductSpecifications";
import ProductDocuments from "../Components/product/ProductDocuments";
import ProductTabs from "../Components/product/ProductTabs";
import EspecificacionesTecnicas from "../Components/create/assets/especificacionesTecnicas";

const ProductPage = ({ producto }) => {
    const [isOpen, setIsOpen] = useState(false); // Estado para controlar si el menú está abierto vertical
    const [activeTab, setActiveTab] = useState('descripcion'); // Estado para controlar la pestaña activa de los tabs
    const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal para las características y datos técnicos en formato JSON
    const [modalType, setModalType] = useState(null); // Estado para almacenar el tipo de modal (caracteristicas o datos_tecnicos) 
    const [editMode, setEditMode] = useState({}); // Estado para controlar el modo de edición de campos (descripcion, caracteristicas, datos_tecnicos, etc.)
    const [tempInputs, setTempInputs] = useState({}); // Estado para almacenar temporalmente los inputs
    const especificacionesRef = useRef(); // Referencia para el componente de especificaciones técnicas

    // console.log(producto); // Imprimir el producto en la consola para depuración

    // Estado para rastrear los datos actualizados del producto
    const [productData, setProductData] = useState({
        ...producto,
        caracteristicas: producto.caracteristicas || {},
        datos_tecnicos: producto.datos_tecnicos || {},
        descripcion: producto.descripcion || '',
        documentos: producto.documentos || [], // Asegurarse que sea un array
        contenido_envio: producto.contenido_envio || '',
        soporte_tecnico: producto.soporte_tecnico || '',
        especificaciones_tecnicas: producto.especificaciones_tecnicas || ''
    });

    const toggleMenu = () => {
        setIsOpen(!isOpen); // Alternar el estado del menú
    };

    const handleOpenModal = (type) => {
        setModalType(type); // Establecer el tipo de modal
        setShowModal(true); // Mostrar el modal
    };

    const handleCloseModal = () => {
        setShowModal(false); // Ocultar el modal
        setModalType(null); // Restablecer el tipo de modal
    };

    const toggleEditMode = (field) => {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
        
        if (field === 'documentos') {
            // Para documentos, si es array convertirlo a string para edición
            if (Array.isArray(productData[field])) {
                setTempInputs(prev => ({
                    ...prev,
                    [field]: productData[field].join('\n')
                }));
            } else {
                setTempInputs(prev => ({
                    ...prev,
                    [field]: ''
                }));
            }
        } else {
            setTempInputs(prev => ({
                ...prev,
                [field]: productData[field]
            }));
        }
    };

    const handleInputChange = (field, value) => {
        setTempInputs(prev => ({
            ...prev,
            [field]: value // Actualizar el valor temporal del campo
        }));
    };

    const handleSave = (field) => {
        if (field === 'documentos') {
            // Convertir el texto de documentos a array
            const docsArray = tempInputs[field].split('\n')
                .map(line => line.trim())
                .filter(line => line !== '');
                
            setProductData(prev => ({
                ...prev,
                [field]: docsArray
            }));
        } else {
            setProductData(prev => ({
                ...prev,
                [field]: tempInputs[field]
            }));
        }
        
        setEditMode(prev => ({
            ...prev,
            [field]: false
        }));

        if (field === 'especificaciones_tecnicas') {
            // agregar la logica para guardar las especificaciones técnicas
        }
    };
    
    useEffect(() => {
        console.log("productData actualizado:", productData);
    }, [productData]);

    const handleSaveFeatures = (jsonData) => {
        try {
            const parsedData = JSON.parse(jsonData); // Analizar los datos JSON

            if (modalType === 'caracteristicas') {
                setProductData(prevData => ({
                    ...prevData,
                    caracteristicas: parsedData // Actualizar las características del producto
                }));
            } else if (modalType === 'datos_tecnicos') {
                setProductData(prevData => ({
                    ...prevData,
                    datos_tecnicos: parsedData // Actualizar los datos técnicos del producto
                }));
            }

            handleCloseModal(); // Cerrar el modal después de guardar
        } catch (error) {
            console.error("Error parsing data:", error); // Manejar errores de análisis
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId); // Cambiar la pestaña activa
    };

    const parseEspecificacionesTecnicas = (data) => {
        if (!data) return null; // Si no hay datos, retornar null

        try {
            // Manejar el caso en que los datos ya sean un objeto
            if (typeof data === 'object') return data;

            // Analizar la cadena JSON
            const parsed = JSON.parse(data);
            return parsed;
        } catch (error) {
            console.error("Error parsing especificaciones_tecnicas:", error); // Manejar errores de análisis
            return null;
        }
    };

    const especificacionesData = parseEspecificacionesTecnicas(productData.especificaciones_tecnicas);
    console.log("Especificaciones Data:", especificacionesData); // Imprimir las especificaciones técnicas en la consola

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
                    <ProductDescription
                        description={productData.descripcion}
                        editMode={editMode.descripcion}
                        tempInputs={tempInputs.descripcion}
                        handleInputChange={(value) => handleInputChange('descripcion', value)}
                        handleSave={() => handleSave('descripcion')}
                        toggleEditMode={() => toggleEditMode('descripcion')}
                    />
                );
            case 'caracteristicas':
                return (
                    <ProductFeatures
                        features={productData.caracteristicas}
                        handleOpenModal={handleOpenModal}
                    />
                );
            case 'datos':
                return (
                    <ProductTechnicalData
                        technicalData={productData.datos_tecnicos}
                        handleOpenModal={handleOpenModal}
                    />
                );
            case 'especificaciones':
                return (
                    <div className="p-4">
                        {editMode.especificaciones_tecnicas ? (
                            <div>
                                <EspecificacionesTecnicas
                                    ref={especificacionesRef}
                                    form={{
                                        especificaciones_tecnicas: productData.especificaciones_tecnicas
                                    }}
                                    setForm={(newForm) => {
                                        setTempInputs(prev => ({
                                            ...prev,
                                            especificaciones_tecnicas: newForm.especificaciones_tecnicas
                                        }));
                                    }}
                                    tableStyles={{
                                        container: { width: '100%' },
                                        header: { padding: '8px', backgroundColor: '#f3f4f6' },
                                        cell: { padding: '8px' },
                                        text: { marginBottom: '1rem' },
                                        seccion: { marginBottom: '1rem' }
                                    }}
                                />
                                <div className="mt-4 flex space-x-2">
                                    <button
                                        onClick={() => {
                                            especificacionesRef.current?.saveText();
                                            handleSave('especificaciones_tecnicas');
                                        }}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => toggleEditMode('especificaciones_tecnicas')}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <ProductSpecifications
                                    specifications={especificacionesData}
                                />
                                <button
                                    onClick={() => toggleEditMode('especificaciones_tecnicas')}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    {productData.especificaciones_tecnicas ? 'Editar' : 'Agregar'} especificaciones técnicas
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'documentos':
                return (
                    <ProductDocuments
                        documents={productData.documentos}
                        editMode={editMode.documentos}
                        tempInputs={tempInputs.documentos}
                        handleInputChange={(value) => handleInputChange('documentos', value)}
                        handleSave={() => handleSave('documentos')}
                        toggleEditMode={() => toggleEditMode('documentos')}
                    />
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

            {/* Modal para características */}
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

            {/* Contenido principal */}
            <main className="p-6">
                {/* Sección del producto */}
                <section className="grid md:grid-cols-2 gap-8">
                    {/* Imagen del producto */}
                    <ZoomImage imageSrc={producto.imagen.startsWith('http') ? producto.imagen : `/${producto.imagen}`} />

                    {/* Detalles del producto */}
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

                        {/* Video del producto */}
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
                    <ProductTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                    />

                    {/* Contenido */}
                    <div className="p-4">{renderContent()}</div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductPage;
