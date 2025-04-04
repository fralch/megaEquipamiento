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


const ProductPage = ({ producto }) => {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false); // Estado para controlar si el menú está abierto vertical
    const [activeTab, setActiveTab] = useState('descripcion'); // Estado para controlar la pestaña activa de los tabs
    const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal para las características y datos técnicos en formato JSON
    const [modalType, setModalType] = useState(null); // Estado para almacenar el tipo de modal (caracteristicas o datos_tecnicos)
    const [editMode, setEditMode] = useState({}); // Estado para controlar el modo de edición de campos (descripcion, caracteristicas, datos_tecnicos, etc.)
    const [tempInputs, setTempInputs] = useState({}); // Estado para almacenar temporalmente los inputs
    const [contenidoTabla, setContenidoTabla] = useState({
        secciones: [],
        textoActual: ""
    });

    const [productData, setProductData] = useState({
        ...producto,
        caracteristicas: typeof producto.caracteristicas === 'string' ? JSON.parse(producto.caracteristicas) : producto.caracteristicas || {},
        datos_tecnicos: typeof producto.datos_tecnicos === 'string' ? JSON.parse(producto.datos_tecnicos) : producto.datos_tecnicos || {},
        descripcion: producto.descripcion || '',
        archivos_adicionales: producto.archivos_adicionales || '', // Asegurarse que sea un array
        envio: producto.envio || '',
        soporte_tecnico: producto.soporte_tecnico || '',
        especificaciones_tecnicas: producto.especificaciones_tecnicas || ''
    });
    console.log(productData);
    const toggleMenu = () => { // ToggleMenu: Alternar el estado del menú vertical de categorías
        setIsOpen(!isOpen); // Alternar el estado del menú
    };

    const handleOpenModal = (type) => { // HandleOpenModal: Manejar el apertura del modal para características y datos técnicos
        setModalType(type); // Establecer el tipo de modal
        setShowModal(true); // Mostrar el modal
    };

    const handleCloseModal = () => { // HandleCloseModal: Manejar el cierre del modal para características y datos técnicos
        setShowModal(false); // Ocultar el modal
        setModalType(null); // Restablecer el tipo de modal
    };

    /* 
        La función toggleEditMode se utiliza para alternar el estado de edición de un campo específico en el componente. 
        Esto significa que si un campo está en modo de edición, se desactivará, y si no lo está, se activará. Además, 
        la función también prepara los valores temporales (tempInputs) para la edición.
    */
        const toggleEditMode = (field) => {
            // Check if user is authenticated
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

    /* 
        La función handleInputChange se utiliza para manejar los cambios en los campos de entrada (inputs) del formulario. 
        Cuando el usuario modifica el valor de un campo, esta función actualiza el estado temporal (tempInputs) con el nuevo valor.
    */
    const handleInputChange = (field, value) => { // HandleInputChange: Manejar el cambio de un campo
        setTempInputs(prev => ({ // SetTempInputs: Establecer el valor temporal del campo, por ejemplo: { descripcion: "Nueva descripción" }
            ...prev,
            [field]: value // Actualizar el valor temporal del campo en otra palabras sobre escribir el valor del campo de tempInputs
        }));

    };

    /* 
        La función handleSave se utiliza para guardar los cambios realizados en un campo específico. 
        Cuando el usuario completa la edición de un campo, esta función actualiza el estado 
        del producto (productData) con el nuevo valor y desactiva el modo de edición.
    */
    const handleSave = async (field) => {
        try {
            // Update product state
            setProductData(prev => ({
                ...prev,
                [field]: tempInputs[field]
            }));

            // Disable edit mode
            setEditMode(prev => ({
                ...prev,
                [field]: false
            }));

            // Clear temp inputs
            setTempInputs({});

            // Update product in database
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


            // Completely update the product data with the server response
            if (response.data) {
                console.log("Product updated successfully:", response.data);
                setProductData(response.data);
            }

            // Optionally, show a success toast or notification
            // toast.success('Campo actualizado correctamente');
        } catch (error) {
            console.error("Error updating product:", error);
            // Optionally, show an error toast
            // toast.error('No se pudo actualizar el campo');

            // Revert the local state changes if the server update fails
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

    /* 
        La función handleSaveFeatures se utiliza para guardar los cambios realizados en los campos de características y datos técnicos. 
        Cuando el usuario completa la edición de los campos, esta función actualiza el estado 
        del producto (productData) con el nuevo valor y desactiva el modo de edición.
        ESTA FUNCIÓN ES PRINCIPALMENTE PARA CARACTERÍSTICAS Y DATOS TÉCNICOS
    */
    const handleSaveFeatures = async (jsonData) => { // HandleSaveFeatures: Guardar los cambios realizados en los campos de características y datos técnicos
        try {
            const parsedData = JSON.parse(jsonData); // Analizar los datos JSON

            if (modalType === 'caracteristicas') { // Si el tipo de modal es características
                setProductData(prevData => ({
                    ...prevData,
                    caracteristicas: parsedData // Actualizar las características del producto 
                }));
                console.log("caracteristicas", parsedData);
            } else if (modalType === 'datos_tecnicos') { // Si el tipo de modal es datos técnicos
                setProductData(prevData => ({
                    ...prevData,
                    datos_tecnicos: parsedData // Actualizar los datos técnicos del producto
                }));
                console.log("datos_tecnicos", parsedData);
            }

            // Update product in database
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
                // actualizar el producto
                setProductData(response.data);
            } catch (error) {
                console.error("Error updating product:", error);
            }

            handleCloseModal(); // Cerrar el modal después de guardar
        } catch (error) {
            console.error("Error parsing data:", error); // Manejar errores de análisis
        }
    };

    /* 
        La función handleTabChange se utiliza para cambiar la pestaña activa. 
        Cuando el usuario selecciona una pestaña, esta función actualiza el estado 
        de la pestaña activa (activeTab) con el ID de la pestaña seleccionada.
    */
    const handleTabChange = (tabId) => {
        setActiveTab(tabId); // Cambiar la pestaña activa
    };

    /* 
        La función parseEspecificacionesTecnicas se utiliza para analizar y convertir 
        los datos de especificaciones técnicas en un formato JSON válido. 
        Si los datos ya son un objeto, se retorna directamente. 
        Si los datos son una cadena JSON, se analiza y se retorna el objeto resultante.
    */
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
        { id: 'archivos_adicionales', label: 'Documentos/Descargas' },
        { id: 'envio', label: 'Contenido de Envío' },
        { id: 'soporte', label: 'Soporte Técnico' },
    ];

    // Guardar texto pendiente cuando el componente se desmonta
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (contenidoTabla.textoActual?.trim()) {
                saveText();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [contenidoTabla.textoActual]);

    // Inicializar con el valor existente
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

    // Manejadores de eventos
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

    // Procesar y añadir contenido a las secciones
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
        handleSave('especificaciones_tecnicas'); // Notificar al padre que el texto ha sido guardado
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
            // actualizar el producto
            setProductData(response.data);
            // limpiar edit mode
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

    // Renderizar componentes
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

                                    {/* Input para nuevo contenido */}
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

                                    {/* Mostrar secciones existentes */}
                                    {contenidoTabla.secciones.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">Contenido actual:</h3>

                                            {contenidoTabla.secciones.map((seccion, index) => (
                                                <div key={index} style={{ marginBottom: '1rem' }} className="mb-6 border-b pb-4 pt-2">
                                                    {/* Encabezado de la sección */}
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

                                                    {/* Contenido basado en el tipo */}
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
                                        <p>{productData.envio}</p>
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
                                        <p>{productData.soporte_tecnico}</p>
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
                <div className="w-full bg-white shadow-md rounded-md mt-5 p-6">
                    <div className="flex justify-center items-center">
                        {/* agregar boton para poner los productos relacionados */}
                        <button className="bg-blue-500 text-white w-12 h-12 rounded-full hover:bg-blue-700 shadow-md flex items-center justify-center">
                            <span>+</span>
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductPage;
