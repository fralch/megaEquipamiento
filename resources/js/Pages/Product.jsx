import { Head, usePage, router, Link } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ZoomImage from "../Components/store/ZoomImage";
import Footer from "../Components/home/Footer";
import Modal_Features from "./assets/modal_features";
import axios from "axios";

// Importar componentes modulares
import ProductDescription from "../Components/product/ProductDescription";
import ProductFeatures from "../Components/product/ProductFeatures";
import ProductTechnicalData from "../Components/product/ProductTechnicalData";
import ProductSpecifications from "../Components/product/ProductSpecifications";
import ProductDocuments from "../Components/product/ProductDocuments";
import ProductTabs from "../Components/product/ProductTabs";
import ModalRelatedProducts from "../Components/product/ModalRelatedProducts";
import RelatedProducts from "../Components/product/RelatedProducts";
import ProductCategoryEdit from "../Components/product/ProductCategoryEdit";

const ProductPage = ({ producto }) => {
    console.log("producto", producto);
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('descripcion');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [editMode, setEditMode] = useState({});
    const [tempInputs, setTempInputs] = useState({});
    const [contenidoTabla, setContenidoTabla] = useState({
        secciones: [],
        textoActual: ""
    });
    const [showRelatedModal, setShowRelatedModal] = useState(false); // Estado para el modal de productos relacionados
    const [videoUrl, setVideoUrl] = useState(''); // Nuevo estado para la URL del video
    const [showVideoInput, setShowVideoInput] = useState(false); // Estado para mostrar/ocultar el input de video
    const [videoPreview, setVideoPreview] = useState(''); // Estado para la previsualización del video

    const [productData, setProductData] = useState({
        ...producto,
        caracteristicas: typeof producto.caracteristicas === 'string' ? JSON.parse(producto.caracteristicas) : producto.caracteristicas || {},
        datos_tecnicos: typeof producto.datos_tecnicos === 'string' ? JSON.parse(producto.datos_tecnicos) : producto.datos_tecnicos || {},
        descripcion: producto.descripcion || '',
        archivos_adicionales: producto.archivos_adicionales || '',
        envio: producto.envio || '',
        soporte_tecnico: producto.soporte_tecnico || '',
        especificaciones_tecnicas: producto.especificaciones_tecnicas || '',
        relatedProducts: producto.relatedProducts || [] // Se asume que vienen desde el servidor o se inicializa con un array vacío
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
        if (!auth.user) {
            alert('Debes iniciar sesión para editar este contenido.');
            return;
        }

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

    const handleSave = async (field) => {
        try {
            setProductData(prev => ({
                ...prev,
                [field]: tempInputs[field]
            }));

            setEditMode(prev => ({
                ...prev,
                [field]: false
            }));

            setTempInputs({});

            const response = await axios.post('/product/update', {
                id_producto: producto.id_producto,
                [field]: tempInputs[field]
            }, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.data) {
                console.log("Product updated successfully:", response.data);
                setProductData(response.data);
            }
        } catch (error) {
            console.error("Error updating product:", error);

            setProductData(prev => ({
                ...prev,
                [field]: producto[field]
            }));
            setEditMode(prev => ({
                ...prev,
                [field]: false
            }));
        }
    };

    const handleSaveFeatures = async (jsonData) => {
        try {
            const parsedData = JSON.parse(jsonData);

            if (modalType === 'caracteristicas') {
                setProductData(prevData => ({
                    ...prevData,
                    caracteristicas: parsedData
                }));
                console.log("caracteristicas", parsedData);
            } else if (modalType === 'datos_tecnicos') {
                setProductData(prevData => ({
                    ...prevData,
                    datos_tecnicos: parsedData
                }));
                console.log("datos_tecnicos", parsedData);
            }

            try {
                const response = await axios.post('/product/update', {
                    id_producto: producto.id_producto,
                    [modalType]: parsedData
                }, {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                console.log("Product updated successfully:", response.data);
                setProductData(response.data);
            } catch (error) {
                console.error("Error updating product:", error);
            }

            handleCloseModal();
        } catch (error) {
            console.error("Error parsing data:", error);
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const parseEspecificacionesTecnicas = (data) => {
        if (!data) return null;

        try {
            if (typeof data === 'object') return data;

            const parsed = JSON.parse(data);
            return parsed;
        } catch (error) {
            console.error("Error parsing especificaciones_tecnicas:", error);
            return null;
        }
    };

    const especificacionesData = parseEspecificacionesTecnicas(productData.especificaciones_tecnicas);
    // console.log("Especificaciones Data:", especificacionesData);

    const tabs = [
        { id: 'descripcion', label: 'Descripción' },
        { id: 'caracteristicas', label: 'Características' },
        { id: 'datos', label: 'Datos Técnicos' },
        { id: 'especificaciones', label: 'Especificaciones Técnicas' },
        { id: 'archivos_adicionales', label: 'Documentos/Descargas' },
        { id: 'envio', label: 'Contenido de Envío' },
        { id: 'soporte', label: 'Soporte Técnico' },
        { id: 'categoria', label: 'Categorización' },
    ];

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (contenidoTabla.textoActual?.trim()) {
                saveText();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [contenidoTabla.textoActual]);

    useEffect(() => {
        if (!productData.especificaciones_tecnicas) return;

        try {
            const parsedValue = JSON.parse(productData.especificaciones_tecnicas);

            if (parsedValue?.secciones && Array.isArray(parsedValue.secciones)) {
                setContenidoTabla(parsedValue);
            } else if (Array.isArray(parsedValue) && parsedValue.length > 0) {
                setContenidoTabla({
                    secciones: [{ tipo: 'tabla', datos: parsedValue }],
                    textoActual: ""
                });
            } else {
                setContenidoTabla({
                    secciones: [{ tipo: 'texto', datos: [productData.especificaciones_tecnicas] }],
                    textoActual: ""
                });
            }
        } catch (e) {
            setContenidoTabla({
                secciones: [{ tipo: 'texto', datos: [productData.especificaciones_tecnicas] }],
                textoActual: ""
            });
        }
    }, [productData.especificaciones_tecnicas]);

    const handleTablaPaste = (event) => {
        event.preventDefault();
        const textoPegado = event.clipboardData.getData('text');
        processTableContent(textoPegado);
    };

    const handleTablaTextChange = (e) => {
        setContenidoTabla(prev => ({
            ...prev,
            textoActual: e.target.value
        }));
    };

    const processTableContent = (texto) => {
        if (!texto.trim()) return;

        const tieneTab = texto.includes('\t');
        const tieneMultilineas = texto.trim().split('\n').length > 1;
        const tipo = tieneTab && tieneMultilineas ? 'tabla' : 'texto';

        let nuevaSeccion;
        if (tipo === 'tabla') {
            const filas = texto.trim().split('\n');
            const datosTabla = filas
                .filter(fila => fila.trim() !== '')
                .map(fila => fila.split('\t'));

            nuevaSeccion = { tipo: 'tabla', datos: datosTabla };
        } else {
            nuevaSeccion = { tipo: 'texto', datos: [texto] };
        }

        updateContent([...contenidoTabla.secciones, nuevaSeccion], "");
    };

    const saveText = () => {
        if (!contenidoTabla.textoActual?.trim()) return;

        const nuevaSeccion = {
            tipo: 'texto',
            datos: [contenidoTabla.textoActual.trim()]
        };

        updateContent([...contenidoTabla.secciones, nuevaSeccion], "");
        handleSave('especificaciones_tecnicas');
    };

    const updateContent = async (secciones, textoActual) => {
        const nuevoContenido = { secciones, textoActual };
        console.log("nuevoContenido", JSON.stringify(nuevoContenido));

        setContenidoTabla(nuevoContenido);
        setProductData(prev => ({
            ...prev,
            especificaciones_tecnicas: JSON.stringify(nuevoContenido)
        }));
    };

    const sendTableToServer = async () => {
        try {
            const response = await axios.post('/product/update', {
                id_producto: producto.id_producto,
                especificaciones_tecnicas: JSON.stringify(contenidoTabla)
            }, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log("Especificaciones de tecnicas enviadas a servidor:", response.data);
            setProductData(response.data);
            setEditMode(prev => ({
                ...prev,
                especificaciones_tecnicas: false
            }));
        } catch (error) {
            console.error("Error enviando especificaciones de tecnicas al servidor:", error);
        }
    };

    const limpiarTabla = () => {
        updateContent([], "");
    };

    const eliminarSeccion = (index) => {
        const nuevasSecciones = contenidoTabla.secciones.filter((_, i) => i !== index);
        updateContent(nuevasSecciones, contenidoTabla.textoActual);
    };

    const renderTabla = (seccion) => (
        <table style={{ width: '100%' }} className="border-collapse border border-gray-300">
            <thead>
                <tr>
                    {seccion.datos[0].map((celda, idx) => (
                        <th key={idx} style={{ padding: '8px', backgroundColor: '#f3f4f6' }} className="bg-gray-100">
                            {celda}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {seccion.datos.slice(1).map((fila, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {fila.map((celda, cellIdx) => (
                            <td key={cellIdx} style={{ padding: '8px' }} className="border border-gray-300">
                                {celda}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTexto = (seccion) => (
        <div style={{ marginBottom: '1rem' }} className="p-3 bg-gray-50 rounded text-sm">
            <div className="whitespace-pre-wrap">
                {seccion.datos[0]}
            </div>
        </div>
    );

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
            case 'categoria':
                return (
                    <ProductCategoryEdit
                        id_producto={productData.id_producto}
                        id_subcategoria={productData.id_subcategoria}
                        marcas={producto.marcas}
                        countryCurrent={producto.countryOptions}
                        productData={productData}
                        editMode={editMode}
                        tempInputs={tempInputs}
                        handleInputChange={handleInputChange}
                        handleSave={handleSave}
                        toggleEditMode={toggleEditMode}
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
                                <label className="block text-sm font-medium text-gray-700">
                                    Especificaciones Técnicas
                                </label>
                                <div className="mt-1 w-full">
                                    <div className="mb-2 text-sm text-gray-500">
                                        Pega una tabla desde Excel, PDF, o de cualquier página web.
                                        También puedes ingresar texto simple y combinar múltiples tablas y textos.
                                    </div>

                                    <div className="mb-2">
                                        <textarea
                                            onPaste={handleTablaPaste}
                                            onChange={handleTablaTextChange}
                                            value={contenidoTabla.textoActual}
                                            placeholder="Pega el contenido aquí (tabla o texto)"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            style={{ minHeight: '100px' }}
                                        />

                                        <div className="flex justify-between mt-2">
                                            <button
                                                type="button"
                                                onClick={saveText}
                                                disabled={!contenidoTabla.textoActual?.trim()}
                                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Agregar como texto
                                            </button>

                                            {contenidoTabla.secciones.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={limpiarTabla}
                                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                                                >
                                                    Limpiar todo
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {contenidoTabla.secciones.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">Contenido actual:</h3>

                                            {contenidoTabla.secciones.map((seccion, index) => (
                                                <div key={index} style={{ marginBottom: '1rem' }} className="mb-6 border-b pb-4 pt-2">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-sm font-medium text-gray-700">
                                                            Sección {index + 1}: {seccion.tipo === 'tabla' ? 'Tabla' : 'Texto'}
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarSeccion(index)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>

                                                    {seccion.tipo === 'tabla'
                                                        ? renderTabla(seccion)
                                                        : renderTexto(seccion)
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex space-x-2">
                                    <button
                                        onClick={() => sendTableToServer('especificaciones_tecnicas')}
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
                                {auth.user && (
                                    <button
                                        onClick={() => toggleEditMode('especificaciones_tecnicas')}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        {productData.especificaciones_tecnicas ? 'Editar' : 'Agregar'} especificaciones técnicas
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'archivos_adicionales':
                return (
                    <ProductDocuments
                        documents={productData.archivos_adicionales}
                        editMode={editMode.archivos_adicionales}
                        tempInputs={tempInputs.archivos_adicionales}
                        handleInputChange={(value) => handleInputChange('archivos_adicionales', value)}
                        handleSave={() => handleSave('archivos_adicionales')}
                        toggleEditMode={() => toggleEditMode('archivos_adicionales')}
                    />
                );
            case 'envio':
                return (
                    <div className="p-4">
                        {productData.envio ? (
                            <div>
                                {editMode.envio ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.envio}
                                            onChange={(e) => handleInputChange('envio', e.target.value)}
                                           
                                        />
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleSave('envio')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => toggleEditMode('envio')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: productData.envio.replace(/•/g, '<li style="list-style-type: none;">').replace(/\n•/g, '</li>\n<li style="list-style-type: none;">').replace(/^•/, '<ul style="padding-left: 0;"><li style="list-style-type: none;">') + (productData.envio.includes('•') ? '</li></ul>' : '') }} />
                                        {auth.user && (
                                            <button
                                                onClick={() => toggleEditMode('envio')}
                                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Editar contenido de envío
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {editMode.envio ? (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            value={tempInputs.envio}
                                            onChange={(e) => handleInputChange('envio', e.target.value)}
                                            placeholder="Ingrese el contenido de envío"
                                          
                                        />
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleSave('envio')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => toggleEditMode('envio')}
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
                                            onClick={() => toggleEditMode('envio')}
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
                                        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: productData.soporte_tecnico.replace(/•/g, '<li style="list-style-type: none;">').replace(/\n•/g, '</li>\n<li style="list-style-type: none;">').replace(/^•/, '<ul style="padding-left: 0;"><li style="list-style-type: none;">') + (productData.soporte_tecnico.includes('•') ? '</li></ul>' : '') }} />
                                        {auth.user && (
                                            <button
                                                onClick={() => toggleEditMode('soporte_tecnico')}
                                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Editar soporte técnico
                                            </button>
                                        )}
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
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const cursorPosition = e.target.selectionStart;
                                                    const textBeforeCursor = tempInputs.soporte_tecnico.substring(0, cursorPosition);
                                                    const textAfterCursor = tempInputs.soporte_tecnico.substring(cursorPosition);
                                                    const newText = textBeforeCursor + '\n• ' + textAfterCursor;
                                                    handleInputChange('soporte_tecnico', newText);
                                                    // Establecer el cursor después del punto de la lista
                                                    setTimeout(() => {
                                                        e.target.selectionStart = cursorPosition + 3;
                                                        e.target.selectionEnd = cursorPosition + 3;
                                                    }, 0);
                                                }
                                            }}
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

            {/* Modal para productos relacionados */}
            {showRelatedModal && (
                <ModalRelatedProducts
                    productId = {productData.id_producto}
                    initialRelated={productData.relatedProducts}
                    onSave={(related) => {
                        setProductData(prev => ({ ...prev, relatedProducts: related }));
                        setShowRelatedModal(false);
                    }}
                    onClose={() => setShowRelatedModal(false)}
                />
            )}

            <main className="p-6">
                <section className="grid md:grid-cols-2 gap-8">
                    <ZoomImage imageSrc={producto.imagen.startsWith('http') ? producto.imagen : `/${producto.imagen}`} productId={producto.id_producto} />

                    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                        <div className="flex flex-col space-y-4">
                            <div>
                                {editMode.nombre ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            className="text-3xl font-bold text-gray-900 border rounded px-2 py-1 w-full"
                                            value={tempInputs.nombre || producto.nombre}
                                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSave('nombre')}
                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => toggleEditMode('nombre')}
                                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <h1
                                        className="text-3xl font-bold text-gray-900 cursor-pointer"
                                        onDoubleClick={() => toggleEditMode('nombre')}
                                    >
                                        {productData.nombre}
                                    </h1>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex text-left space-x-4 flex-col">
                                    <div className="ml-3">
                                        {editMode.precio_sin_ganancia ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="text-2xl font-semibold text-green-600 border rounded px-2 py-1"
                                                    value={tempInputs.precio_sin_ganancia || producto.precio_sin_ganancia}
                                                    onChange={(e) => handleInputChange('precio_sin_ganancia', e.target.value)}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSave('precio_sin_ganancia')}
                                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => toggleEditMode('precio_sin_ganancia')}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <p
                                                className="text-2xl font-semibold text-green-600 cursor-pointer"
                                                onDoubleClick={() => toggleEditMode('precio_sin_ganancia')}
                                            >
                                                S/ {productData.precio_sin_ganancia}
                                            </p>
                                        )}
                                        <p className="text-gray-500">
                                            (sin IGV)
                                        </p>
                                    </div>
                                    <div>
                                        {editMode.precio_igv ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="text-2xl font-semibold text-gray-800 border rounded px-2 py-1"
                                                    value={tempInputs.precio_igv || producto.precio_igv}
                                                    onChange={(e) => handleInputChange('precio_igv', e.target.value)}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSave('precio_igv')}
                                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => toggleEditMode('precio_igv')}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <p
                                                className="text-2xl font-semibold text-gray-800 cursor-pointer"
                                                onDoubleClick={() => toggleEditMode('precio_igv')}
                                            >
                                                S/ {productData.precio_igv}
                                            </p>
                                        )}
                                        <p className="text-gray-500">
                                            (con IGV)
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <div>
                                        {editMode.sku ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    className="text-sm text-gray-600 border rounded px-2 py-1"
                                                    value={tempInputs.sku || producto.sku}
                                                    onChange={(e) => handleInputChange('sku', e.target.value)}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSave('sku')}
                                                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => toggleEditMode('sku')}
                                                    className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <p
                                                className="text-sm text-gray-600 cursor-pointer"
                                                onDoubleClick={() => toggleEditMode('sku')}
                                            >
                                                SKU: {productData.sku}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Fabricante: {productData.marca?.nombre}
                                        </p>
                                    </div>
                                    <p>
                                        Plazo de entrega: 1-3 días (Salvo fin
                                        Stock)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="">
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
                            {auth.user && (
                                <button 
                                    onClick={() => {
                                        if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                                            // Usar el método delete con una URL y configuración correcta
                                            router.delete(`/product/delete/${producto.id_producto}`, {
                                                onBefore: () => confirm('¿Estás seguro de que deseas eliminar este producto?'),
                                                onSuccess: () => {
                                                    // Navegar a la página anterior o a una ruta específica
                                                    window.location.href = '/'; // URL específica como fallback
                                                },
                                                // Manejar errores
                                                onError: (errors) => {
                                                    console.error('Error al eliminar:', errors);
                                                    alert('Hubo un error al eliminar el producto');
                                                },
                                                // Permitir respuestas no-Inertia
                                                preserveScroll: true,
                                                preserveState: true
                                            });
                                        }
                                    }} 
                                    className="w-full mt-4 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 shadow-md transition-colors duration-200"
                                >
                                    Eliminar Producto
                                </button>
                            )}
                        </div>

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
                        
                        {!producto.video && auth.user && (
                            <div className="mt-6">
                                {!showVideoInput ? (
                                    <button 
                                        onClick={() => setShowVideoInput(true)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Agregar video
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex space-x-2">
                                            <input 
                                                type="text" 
                                                value={videoUrl} 
                                                onChange={(e) => setVideoUrl(e.target.value)}
                                                placeholder="Ingresa la URL del video de YouTube (ej: https://youtu.be/XXXX o https://www.youtube.com/watch?v=XXXX)" 
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button 
                                                onClick={() => {
                                                    // Convertir URL de YouTube a formato de embed
                                                    let embedUrl = videoUrl;
                                                    if (videoUrl.includes('youtu.be/')) {
                                                        embedUrl = videoUrl.replace("youtu.be/", "www.youtube.com/embed/");
                                                    } else if (videoUrl.includes('youtube.com/watch?v=')) {
                                                        embedUrl = videoUrl.replace("youtube.com/watch?v=", "youtube.com/embed/");
                                                    }
                                                    setVideoPreview(embedUrl);
                                                }}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                            >
                                                Previsualizar
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const response = await axios.post('/product/update', {
                                                            id_producto: producto.id_producto,
                                                            video: videoUrl
                                                        }, {
                                                            headers: {
                                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                                                                'Content-Type': 'application/json',
                                                                'Accept': 'application/json'
                                                            }
                                                        });
                                                        
                                                        if (response.data) {
                                                            console.log("Video URL updated successfully:", response.data);
                                                            setProductData(prev => ({
                                                                ...prev,
                                                                video: videoUrl
                                                            }));
                                                            // Actualizar el producto directamente para reflejar el cambio sin recargar
                                                            producto.video = videoUrl;
                                                            setShowVideoInput(false);
                                                            setVideoUrl('');
                                                            setVideoPreview('');
                                                        }
                                                    } catch (error) {
                                                        console.error("Error updating video URL:", error);
                                                        alert("Error al guardar la URL del video. Por favor, inténtalo de nuevo.");
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                disabled={!videoUrl}
                                            >
                                                Guardar
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setShowVideoInput(false);
                                                    setVideoUrl('');
                                                    setVideoPreview('');
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                        
                                        {videoPreview && (
                                            <div className="mt-4">
                                                <h3 className="text-lg font-medium mb-2">Previsualización:</h3>
                                                <iframe
                                                    className="w-full h-96 rounded-md shadow-lg"
                                                    src={videoPreview}
                                                    title="Previsualización del video"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        )}
                                    </div>
                                )}
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

                    <div className="p-4">{renderContent()}</div>
                </div>
               
               
                 <div className="w-full bg-white shadow-md rounded-md mt-5 p-6">
                 <RelatedProducts productId={producto.id_producto} />
                    <div className="flex justify-center items-center">
                        {auth.user && (
                            <button
                                onClick={() => setShowRelatedModal(true)}
                                className="bg-blue-500 text-white w-12 h-12 rounded-full hover:bg-blue-700 shadow-md flex items-center justify-center"
                            >
                                <span>+</span>
                            </button>
                        )}
                    </div>
                    
                </div>
               
            </main>
            <Footer />
        </div>
    );
};

export default ProductPage;
