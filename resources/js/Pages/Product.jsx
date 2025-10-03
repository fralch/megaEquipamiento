import { Head, usePage, router, Link } from "@inertiajs/react";
import React, { useState, useEffect, useContext, useCallback } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ZoomImage from "../Components/store/ZoomImage";
import ImageGallery from "../Components/store/ImageGallery";
import Footer from "../Components/home/Footer-sin-wts";
import Modal_Features from "./assets/modal_features";
import { useTheme } from '../storage/ThemeContext';
import { useCurrency } from '../storage/CurrencyContext';
import { CartContext } from '../storage/CartContext';
import { useRecentlyViewed } from '../storage/RecentlyViewedContext';
import { useCompare } from '../hooks/useCompare';
import axios from "axios";

// Importar componentes modulares
import ProductDescription from "../Components/product/ProductDescription";
import ProductFeatures from "../Components/product/ProductFeatures";

import ProductSpecifications from "../Components/product/ProductSpecifications";
import ProductDocuments from "../Components/product/ProductDocuments";
import ProductTabs from "../Components/product/ProductTabs";
import ModalRelatedProducts from "../Components/product/ModalRelatedProducts";
import RelatedProducts from "../Components/product/RelatedProducts";
import ProductCategoryEdit from "../Components/product/ProductCategoryEdit";
import BancoImagenesModal from '../Components/store/BancoImagenesModal';

// Currency formatting function moved to CurrencyContext
// probando github actions

const ProductPage = ({ producto }) => {
    console.log("producto", producto);

    // Validación temprana para evitar errores
    if (!producto || !producto.id_producto) {
        console.error('Producto no válido:', producto);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">Producto no encontrado o datos inválidos.</p>
                    <Link href="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    const { isDarkMode } = useTheme();
    const { formatPrice } = useCurrency();
    const { addRecentlyViewed, getRecentlyViewed } = useRecentlyViewed();
    const { dispatch } = useContext(CartContext);
    const { addToCompare, isInCompare, canAddMore } = useCompare();
    const [categoriaCurrent, setCategoriaCurrent] = useState(null);
    const [subcategoriaCurrent, setSubcategoriaCurrent] = useState(null);
    const [hoveredRecentProductId, setHoveredRecentProductId] = useState(null);

    // Agregar producto a la lista de vistos recientemente cuando se carga la página
    useEffect(() => {
        if (producto && producto.id_producto) {
            const productForRecent = {
                id: producto.id_producto,
                title: producto.nombre,
                image: Array.isArray(producto.imagen) 
                    ? (producto.imagen[0]?.startsWith('http') ? producto.imagen[0] : `/${producto.imagen[0]}`)
                    : (producto.imagen?.startsWith('http') ? producto.imagen : `/${producto.imagen}`),
                price: parseFloat(producto.precio_ganancia || 0),
                priceWithoutProfit: parseFloat(producto.precio_ganancia || 0),
                priceWithProfit: parseFloat(producto.precio_ganancia || 0),
                sku: producto.sku,
                descripcion: producto.descripcion,
                marca: producto.marca || { nombre: '' },
                link: `/producto/${producto.id_producto}`
            };
            
            addRecentlyViewed(productForRecent);
        }
    }, [producto]);

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const categoriaResponse = await axios.get('/subcategoria_get/cat/' + producto.id_subcategoria);
                const subcategoriaResponse = await axios.get('/subcategoria_id/' + producto.id_subcategoria);
                setCategoriaCurrent(categoriaResponse.data);
                setSubcategoriaCurrent(subcategoriaResponse.data);
            } catch (error) {
                console.error('Error fetching category data:', error);
            }
        };
        fetchCategoryData();
    }, [producto.id_subcategoria]);
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
    const [showRecentlyViewed, setShowRecentlyViewed] = useState(false); // Estado para mostrar productos vistos recientemente
    const [isBancoImagenesOpen, setIsBancoImagenesOpen] = useState(false);

    const handleImageSelectFromBank = async (selectedImages) => {
        if (selectedImages.length === 0) return;
        
        try {
            const formData = new FormData();
            formData.append('id_producto', producto.id_producto);
            formData.append('imagenesDelBanco', JSON.stringify(selectedImages));

            const response = await axios.post('/productos/actualizar-imagen', formData, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data && response.data.imagen) {
                setProductData(prevData => ({
                    ...prevData,
                    imagen: response.data.imagen
                }));
                setIsBancoImagenesOpen(false);
                
                // Mostrar mensaje de éxito
                alert('Imágenes del banco agregadas correctamente');
            }
        } catch (error) {
            console.error('Error adding images from bank:', error);
            alert('Error al agregar imágenes del banco');
        }
    };

    // Función para añadir al carrito desde productos vistos recientemente
    const handleAddToCartRecent = useCallback((e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const cartProduct = {
                id: product.id,
                title: product.title,
                image: product.image,
                price: product.price,
                priceWithoutProfit: product.priceWithoutProfit,
                priceWithProfit: product.priceWithProfit
            };
            
            dispatch({ type: 'ADD', product: cartProduct });
            console.log('Adding to cart:', cartProduct);
            alert(`${product.title} añadido al carrito!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error al añadir al carrito');
        }
    }, [dispatch]);

    // Función para comparar desde productos vistos recientemente
    const handleCompareRecent = useCallback((e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productForCompare = {
            id: product.id,
            nombre: product.title,
            precio: product.priceWithoutProfit,
            descripcion: product.descripcion,
            imagen: product.image,
            stock: 1,
            especificaciones_tecnicas: {},
            caracteristicas: {},
            marca: product.marca || { nombre: '' }
        };
        
        if (isInCompare(product.id)) {
            alert('Este producto ya está en el comparador');
        } else if (canAddMore) {
            addToCompare(productForCompare);
            alert(`${product.title} agregado al comparador`);
        } else {
            alert('Máximo 4 productos para comparar. Elimina uno para agregar otro.');
        }
    }, [addToCompare, isInCompare, canAddMore]);

    const [productData, setProductData] = useState(() => {
        // Función helper para parsear JSON de forma segura
        const safeJsonParse = (str, fallback = {}) => {
            if (typeof str !== 'string') return str || fallback;
            try {
                return JSON.parse(str);
            } catch (error) {
                console.warn('Error parsing JSON:', error, 'String:', str);
                return fallback;
            }
        };

        return {
            ...producto,
            caracteristicas: safeJsonParse(producto.caracteristicas, {}),
            descripcion: producto.descripcion || '',
            archivos_adicionales: producto.archivos_adicionales || '',
            envio: producto.envio || '',
            soporte_tecnico: producto.soporte_tecnico || '',
            especificaciones_tecnicas: producto.especificaciones_tecnicas || '',
            relatedProducts: producto.relatedProducts || [] // Se asume que vienen desde el servidor o se inicializa con un array vacío
        };
    });

    // Función para añadir al carrito
    const handleAddToCart = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            // Solo enviar los datos necesarios: imagen, título y precios
            const cartProduct = {
                id: productData.id_producto,
                title: productData.nombre,
                image: Array.isArray(productData.imagen) ? productData.imagen[0] : productData.imagen,
                price: parseFloat(productData.precio_igv || 0),
                priceWithoutProfit: parseFloat(productData.precio_ganancia || 0),
                priceWithProfit: parseFloat(productData.precio_ganancia || 0)
            };
            
            dispatch({ type: 'ADD', product: cartProduct });
            console.log('Adding to cart:', cartProduct);
            alert(`${productData.nombre} añadido al carrito!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }, [dispatch, productData]);

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

        const isCurrentlyEditing = editMode[field];
        
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }));

        if (isCurrentlyEditing) {
            // Si se está cancelando la edición, restaurar valores originales
            setTempInputs(prev => {
                const newInputs = { ...prev };
                delete newInputs[field];
                
                // Si se cancela la edición de precio_ganancia, también restaurar precio_igv
                if (field === 'precio_ganancia') {
                    delete newInputs.precio_igv;
                    setProductData(prevData => ({
                        ...prevData,
                        precio_igv: producto.precio_igv // Restaurar valor original
                    }));
                }
                
                // Si se cancela la edición de precio_igv, también restaurar precio_ganancia
                if (field === 'precio_igv') {
                    delete newInputs.precio_ganancia;
                    setProductData(prevData => ({
                        ...prevData,
                        precio_ganancia: producto.precio_ganancia // Restaurar valor original
                    }));
                }
                
                return newInputs;
            });
        } else {
            // Si se está iniciando la edición, establecer valores actuales
            setTempInputs(prev => ({
                ...prev,
                [field]: productData[field]
            }));
        }
    };

    const handleInputChange = (field, value) => {
        setTempInputs(prev => {
            const newInputs = {
                ...prev,
                [field]: value
            };
            
            // Si se está editando precio_ganancia, calcular automáticamente precio_igv
            if (field === 'precio_ganancia' && value) {
                const precioGanancia = parseFloat(value);
                if (!isNaN(precioGanancia)) {
                    const precioConIGV = precioGanancia * 1.18;
                    newInputs.precio_igv = precioConIGV.toFixed(2);
                    
                    // Actualizar también el estado productData para reflejar el cambio visualmente
                    setProductData(prevData => ({
                        ...prevData,
                        precio_igv: precioConIGV.toFixed(2)
                    }));
                }
            }
            
            // Si se está editando precio_igv, calcular automáticamente precio_ganancia (cálculo inverso)
            if (field === 'precio_igv' && value) {
                const precioConIGV = parseFloat(value);
                if (!isNaN(precioConIGV)) {
                    const precioGanancia = precioConIGV / 1.18;
                    newInputs.precio_ganancia = precioGanancia.toFixed(2);
                    
                    // Actualizar también el estado productData para reflejar el cambio visualmente
                    setProductData(prevData => ({
                        ...prevData,
                        precio_ganancia: precioGanancia.toFixed(2)
                    }));
                }
            }
            
            return newInputs;
        });
    };

    const handleSave = async (field) => {
        try {
            let valueToSave = tempInputs[field];
            
            // Validación básica
            if (valueToSave === undefined || valueToSave === null) {
                valueToSave = '';
            }
            
            // Solo limpiar texto para campos específicos y solo si es necesario
            if ((field === 'soporte_tecnico' || field === 'envio') && valueToSave.includes('*')) {
                const originalValue = valueToSave;
                valueToSave = cleanAndFormatText(valueToSave);
                console.log('Texto antes de limpiar:', originalValue);
                console.log('Texto después de limpiar:', valueToSave);
            }
            
            // Validar que el texto no esté vacío después de la limpieza (excepto para campos de precio)
            if (field !== 'precio_ganancia' && field !== 'precio_igv' && !valueToSave.trim()) {
                alert('El contenido no puede estar vacío.');
                return;
            }
            
            // Validación especial para campos de precio
            if ((field === 'precio_ganancia' || field === 'precio_igv') && (valueToSave === '' || isNaN(parseFloat(valueToSave)) || parseFloat(valueToSave) < 0)) {
                alert('El precio debe ser un número válido mayor o igual a 0.');
                return;
            }
            
            // No hay restricciones de longitud para ningún campo
            
            // Preparar datos para enviar
            const dataToSend = {
                id_producto: producto.id_producto,
                [field]: valueToSave
            };
            
            // Si se está guardando precio_ganancia, también incluir el precio_igv calculado
            if (field === 'precio_ganancia' && tempInputs.precio_igv) {
                dataToSend.precio_igv = tempInputs.precio_igv;
            }
            
            // Si se está guardando precio_igv, también incluir el precio_ganancia calculado
            if (field === 'precio_igv' && tempInputs.precio_ganancia) {
                dataToSend.precio_ganancia = tempInputs.precio_ganancia;
            }
            
            console.log('Enviando al servidor:', dataToSend);
            
            // Enviar al servidor con timeout y mejor manejo de errores
            const response = await axios.post('/product/update', dataToSend, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 segundos de timeout
            });

            console.log('Respuesta del servidor:', response);

            // Solo actualizar el estado si todo salió bien
            if (response.status === 200) {
                // Actualizar el estado con el campo editado
                const updateData = { [field]: valueToSave };
                
                // Si se guardó precio_ganancia, también actualizar precio_igv
                if (field === 'precio_ganancia' && tempInputs.precio_igv) {
                    updateData.precio_igv = tempInputs.precio_igv;
                }
                
                // Si se guardó precio_igv, también actualizar precio_ganancia
                if (field === 'precio_igv' && tempInputs.precio_ganancia) {
                    updateData.precio_ganancia = tempInputs.precio_ganancia;
                }

                setProductData(prev => ({
                    ...prev,
                    ...updateData
                }));

                setEditMode(prev => ({
                    ...prev,
                    [field]: false
                }));

                setTempInputs(prev => {
                    const newInputs = { ...prev };
                    delete newInputs[field];
                    // También limpiar el campo relacionado si existe
                    if (field === 'precio_ganancia') {
                        delete newInputs.precio_igv;
                    }
                    if (field === 'precio_igv') {
                        delete newInputs.precio_ganancia;
                    }
                    return newInputs;
                });
                
                console.log("Guardado exitoso para el campo:", field);
            }
        } catch (error) {
            console.error("Error detallado al guardar:", error);
            
            // Manejo específico de errores
            if (error.response) {
                // Error del servidor (4xx, 5xx)
                console.error('Error del servidor:', error.response.status, error.response.data);
                alert(`Error del servidor (${error.response.status}): ${error.response.data?.message || 'Error desconocido'}`);
            } else if (error.request) {
                // Error de red
                console.error('Error de red:', error.request);
                alert('Error de conexión. Verifica tu conexión a internet.');
            } else {
                // Error en la configuración de la petición
                console.error('Error de configuración:', error.message);
                alert('Error interno. Por favor, recarga la página e intenta de nuevo.');
            }
            
            // No revertir cambios automáticamente - dejar que el usuario decida
        }
    };

   const handlePaste = (e, field) => {
        // Solo procesar si contiene asteriscos
        setTimeout(() => {
            const textarea = e.target;
            const currentValue = textarea.value;
            
            if (currentValue.includes('*')) {
                try {
                    const cleanedText = cleanAndFormatText(currentValue);
                    if (cleanedText !== currentValue) {
                        handleInputChange(field, cleanedText);
                    }
                } catch (error) {
                    console.error('Error al procesar texto pegado:', error);
                    // No hacer nada si hay error, mantener texto original
                }
            }
        }, 50);
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

        const nuevasSecciones = [...contenidoTabla.secciones, nuevaSeccion];
        const nuevoContenido = { secciones: nuevasSecciones, textoActual: "" };
        
        // Actualizar el estado local inmediatamente
        setContenidoTabla(nuevoContenido);
        
        // Preparar y enviar datos al servidor
        const dataToSend = {
            id_producto: producto.id_producto,
            especificaciones_tecnicas: JSON.stringify(nuevoContenido)
        };
        
        // Enviar al servidor
        sendToServer(dataToSend, nuevoContenido);
    };
    
    const sendToServer = async (dataToSend, nuevoContenido) => {
        try {
            console.log('Enviando al servidor:', dataToSend);
            const response = await axios.post('/product/update', dataToSend, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                },
            });

            console.log('Respuesta del servidor:', response);

            if (response.status === 200) {
                // Actualizar productData con el nuevo contenido
                setProductData(prev => ({
                    ...prev,
                    especificaciones_tecnicas: JSON.stringify(nuevoContenido)
                }));
                console.log("Guardado exitoso para especificaciones técnicas");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert('Error al guardar los cambios.');
        }
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

    const cleanAndFormatText = (text) => {
        if (!text || typeof text !== 'string') return '';
        
        try {
            return text
                // Convertir asteriscos a viñetas de forma simple
                .replace(/^\*\s+/gm, '• ')
                .replace(/\n\*\s+/g, '\n• ')
                // Limpiar caracteres problemáticos básicos
                .replace(/\u00A0/g, ' ') // Non-breaking spaces
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                // Limpiar espacios extra sin ser agresivo
                .replace(/[ \t]+/g, ' ')
                .replace(/\n\s*\n\s*\n+/g, '\n\n')
                .trim();
        } catch (error) {
            console.error('Error cleaning text:', error);
            // Si hay error en la limpieza, devolver el texto original
            return text.trim();
        }
    };

    const renderCellContent = (cell) => {
        if (cell === null || cell === undefined) {
            return '';
        }
        
        if (typeof cell === 'object') {
            try {
                if (Array.isArray(cell)) {
                    return cell.join(', ');
                }
                return JSON.stringify(cell);
            } catch (error) {
                console.error('Error rendering cell content:', error);
                return '[Error rendering content]';
            }
        }
        
        if (typeof cell === 'string') {
            return cell.replace(/\\r$/, '') || cell;
        }
        
        return String(cell);
    };

    const renderTabla = (seccion) => (
        <table style={{ width: '100%' }} className="border-collapse border border-gray-300">
            <thead>
                <tr>
                    {seccion.datos[0].map((celda, idx) => (
                        <th key={idx} style={{ padding: '8px', backgroundColor: '#f3f4f6' }} className="bg-gray-100">
                            {renderCellContent(celda)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {seccion.datos.slice(1).map((fila, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {fila.map((celda, cellIdx) => (
                            <td key={cellIdx} style={{ padding: '8px' }} className="border border-gray-300">
                                {renderCellContent(celda)}
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
                                            rows={6}
                                            placeholder="Ingrese el contenido de envío"
                                        />
                                        <div className="mt-2 text-xs">
                                            <span className="text-gray-500">
                                                Caracteres: {(tempInputs.envio || '').length}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleSave('envio')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2 disabled:opacity-50"
                                                disabled={!tempInputs.envio?.trim()}
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
                                            rows={6}
                                        />
                                        <div className="mt-2 text-xs">
                                            <span className="text-gray-500">
                                                Caracteres: {(tempInputs.envio || '').length}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleSave('envio')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2 disabled:opacity-50"
                                                disabled={!tempInputs.envio?.trim()}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Información de Soporte Técnico
                                        </label>
                                        <div className="mb-3 text-sm text-blue-600 bg-blue-50 p-3 rounded">
                                            <strong>💡 Consejos:</strong>
                                            <ul className="mt-1 ml-4 space-y-1">
                                                <li>• Puedes pegar texto con asteriscos (*) - se convertirán a viñetas (•)</li>
                                                <li>• Usa Enter para nuevas líneas</li>
                                                <li>• Usa el botón "Limpiar" si el formato se ve extraño</li>
                                            </ul>
                                        </div>
                                        
                                        <textarea
                                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={tempInputs.soporte_tecnico || ''}
                                            onChange={(e) => handleInputChange('soporte_tecnico', e.target.value)}
                                            onPaste={(e) => handlePaste(e, 'soporte_tecnico')}
                                            placeholder="Ejemplo:
                                            • GARANTÍA: Certificado por 24 meses
                                            • SERVICIO TÉCNICO: Equipo especializado
                                            • CALIBRACIÓN: Laboratorio propio
                                            • CONVENIOS: Asesoría permanente"
                                            rows={15}
                                            style={{
                                                minHeight: '300px',
                                                resize: 'vertical',
                                                fontSize: '14px',
                                                lineHeight: '1.5'
                                            }}
                                        />
                                        
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleSave('soporte_tecnico')}
                                                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 font-medium disabled:opacity-50"
                                                disabled={!tempInputs.soporte_tecnico?.trim()}
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditMode(prev => ({ ...prev, soporte_tecnico: false }));
                                                    setTempInputs(prev => {
                                                        const newInputs = { ...prev };
                                                        delete newInputs.soporte_tecnico;
                                                        return newInputs;
                                                    });
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentText = tempInputs.soporte_tecnico || '';
                                                    if (currentText.includes('*')) {
                                                        const cleanedText = cleanAndFormatText(currentText);
                                                        handleInputChange('soporte_tecnico', cleanedText);
                                                    }
                                                }}
                                                className="px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm transition-colors duration-200"
                                                disabled={!tempInputs.soporte_tecnico?.includes('*')}
                                            >
                                                Limpiar
                                            </button>
                                        </div>
                                        
                                        <div className="mt-2 text-xs">
                                            <span className="text-gray-500">
                                                Caracteres: {(tempInputs.soporte_tecnico || '').length}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div 
                                            className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border min-h-[100px]" 
                                            style={{ lineHeight: '1.6' }}
                                            dangerouslySetInnerHTML={{ 
                                                __html: productData.soporte_tecnico
                                                    .replace(/•/g, '<li style="list-style-type: disc; margin-left: 20px; margin-bottom: 4px;">')
                                                    .replace(/\n•/g, '</li>\n<li style="list-style-type: disc; margin-left: 20px; margin-bottom: 4px;">')
                                                    .replace(/^•/, '<ul style="padding-left: 0;"><li style="list-style-type: disc; margin-left: 20px; margin-bottom: 4px;">')
                                                    + (productData.soporte_tecnico.includes('•') ? '</li></ul>' : '')
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\n/g, '<br>')
                                            }} 
                                        />
                                        {auth.user && (
                                            <button
                                                onClick={() => {
                                                    setTempInputs(prev => ({
                                                        ...prev,
                                                        soporte_tecnico: productData.soporte_tecnico || ''
                                                    }));
                                                    toggleEditMode('soporte_tecnico');
                                                }}
                                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                                            >
                                                Editar Soporte
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {editMode.soporte_tecnico ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Información de Soporte Técnico
                                        </label>
                                        <textarea
                                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={tempInputs.soporte_tecnico || ''}
                                            onChange={(e) => handleInputChange('soporte_tecnico', e.target.value)}
                                            onPaste={(e) => handlePaste(e, 'soporte_tecnico')}
                                            placeholder="Ingrese la información de soporte técnico..."
                                            rows={8}
                                        />
                                        <div className="mt-2 text-xs">
                                            <span className="text-gray-500">
                                                Caracteres: {(tempInputs.soporte_tecnico || '').length}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={() => handleSave('soporte_tecnico')}
                                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                                                disabled={!tempInputs.soporte_tecnico?.trim()}
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => toggleEditMode('soporte_tecnico')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-500 mb-4">No hay información de soporte técnico disponible.</p>
                                        {auth.user && (
                                            <button
                                                onClick={() => {
                                                    setTempInputs(prev => ({
                                                        ...prev,
                                                        soporte_tecnico: ''
                                                    }));
                                                    toggleEditMode('soporte_tecnico');
                                                }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                            >
                                                ➕ Agregar
                                            </button>
                                        )}
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
        <div className={`font-sans min-h-screen transition-colors duration-300 ${
            isDarkMode 
                ? 'text-gray-100 bg-gray-900' 
                : 'text-gray-800 bg-gray-100'
        }`}>
            <Head>
                {/* Título optimizado para SEO */}
                <title>{`${producto.nombre} ${producto.marca?.nombre ? `- ${producto.marca.nombre}` : ''} | Comprar Online | SKU: ${producto.sku}`}</title>
                
                {/* Meta descripción optimizada */}
                <meta name="description" content={`${producto.descripcion?.substring(0, 145) || `Compra ${producto.nombre} ${producto.marca?.nombre ? `de ${producto.marca.nombre}` : ''} al mejor precio`}. SKU: ${producto.sku}. Precio desde ${formatPrice(producto.precio_ganancia)}.`} />
                
                {/* Meta tags básicos mejorados */}
                <meta name="keywords" content={`${producto.nombre}, ${producto.marca?.nombre || ''}, ${producto.sku}, ${categoriaCurrent?.nombre_categoria || ''}, ${subcategoriaCurrent?.nombre || ''}, comprar online, precio, oferta, equipamiento`} />
                <meta name="author" content="Mega Equipamiento" />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                <meta name="googlebot" content="index, follow" />
                <meta name="bingbot" content="index, follow" />
                
                {/* Meta tags adicionales para SEO */}
                <meta name="language" content="es" />
                <meta name="geo.region" content="PE" />
                <meta name="geo.country" content="Peru" />
                <meta name="distribution" content="global" />
                <meta name="rating" content="general" />
                <meta name="revisit-after" content="7 days" />
                
                {/* Open Graph mejorado para redes sociales */}
                <meta property="og:title" content={`${producto.nombre} ${producto.marca?.nombre ? `- ${producto.marca.nombre}` : ''} | Mega Equipamiento`} />
                <meta property="og:description" content={`${producto.descripcion?.substring(0, 155) || `Compra ${producto.nombre} al mejor precio en Mega Equipamiento`}. SKU: ${producto.sku}`} />
                <meta property="og:image" content={Array.isArray(producto.imagen) ? (producto.imagen[0]?.startsWith('http') ? producto.imagen[0] : `${window.location.origin}/${producto.imagen[0]}`) : (producto.imagen?.startsWith('http') ? producto.imagen : `${window.location.origin}/${producto.imagen}`)} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content={`${producto.nombre} - ${producto.marca?.nombre || 'Producto de calidad'}`} />
                <meta property="og:url" content={`${window.location.origin}/producto/${producto.id_producto}`} />
                <meta property="og:type" content="product" />
                <meta property="og:site_name" content="Mega Equipamiento" />
                <meta property="og:locale" content="es_PE" />
                <meta property="product:price:amount" content={producto.precio_ganancia} />
                <meta property="product:price:currency" content="PEN" />
                <meta property="product:availability" content="in stock" />
                <meta property="product:condition" content="new" />
                <meta property="product:retailer_item_id" content={producto.sku} />
                
                {/* Twitter Cards mejorado */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@MegaEquipamiento" />
                <meta name="twitter:creator" content="@MegaEquipamiento" />
                <meta name="twitter:title" content={`${producto.nombre} ${producto.marca?.nombre ? `- ${producto.marca.nombre}` : ''}`} />
                <meta name="twitter:description" content={`${producto.descripcion?.substring(0, 155) || `Compra ${producto.nombre} al mejor precio`}. SKU: ${producto.sku}`} />
                <meta name="twitter:image" content={Array.isArray(producto.imagen) ? (producto.imagen[0]?.startsWith('http') ? producto.imagen[0] : `${window.location.origin}/${producto.imagen[0]}`) : (producto.imagen?.startsWith('http') ? producto.imagen : `${window.location.origin}/${producto.imagen}`)} />
                <meta name="twitter:image:alt" content={`${producto.nombre} - ${producto.marca?.nombre || 'Producto de calidad'}`} />
                
                {/* Schema.org mejorado para productos */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": producto.nombre,
                        "image": Array.isArray(producto.imagen) 
                            ? producto.imagen.map(img => img?.startsWith('http') ? img : `${window.location.origin}/${img}`)
                            : [producto.imagen?.startsWith('http') ? producto.imagen : `${window.location.origin}/${producto.imagen}`],
                        "description": producto.descripcion || `${producto.nombre} - Producto de alta calidad disponible en Mega Equipamiento`,
                        "sku": producto.sku,
                        "mpn": producto.sku,
                        "gtin": producto.sku,
                        "brand": {
                            "@type": "Brand",
                            "name": producto.marca?.nombre || "Mega Equipamiento"
                        },
                        "manufacturer": {
                            "@type": "Organization",
                            "name": producto.marca?.nombre || "Mega Equipamiento"
                        },
                        "category": `${categoriaCurrent?.nombre_categoria || ''} > ${subcategoriaCurrent?.nombre || ''}`,
                        "offers": {
                            "@type": "Offer",
                            "url": `${window.location.origin}/producto/${producto.id_producto}`,
                            "priceCurrency": "PEN",
                            "price": producto.precio_ganancia,
                            "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            "availability": "https://schema.org/InStock",
                            "itemCondition": "https://schema.org/NewCondition",
                            "seller": {
                                "@type": "Organization",
                                "name": "Mega Equipamiento",
                                "url": window.location.origin
                            },
                            "hasMerchantReturnPolicy": {
                                "@type": "MerchantReturnPolicy",
                                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                                "merchantReturnDays": 30
                            },
                            "shippingDetails": {
                                "@type": "OfferShippingDetails",
                                "shippingRate": {
                                    "@type": "MonetaryAmount",
                                    "currency": "PEN",
                                    "value": "0"
                                },
                                "deliveryTime": {
                                    "@type": "ShippingDeliveryTime",
                                    "businessDays": {
                                        "@type": "OpeningHoursSpecification",
                                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                                    }
                                }
                            }
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.5",
                            "reviewCount": "1",
                            "bestRating": "5",
                            "worstRating": "1"
                        }
                    })}
                </script>
                
                {/* Breadcrumb Schema */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Inicio",
                                "item": window.location.origin
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": categoriaCurrent?.nombre_categoria || "Categoría",
                                "item": `${window.location.origin}/categorias/${categoriaCurrent?.id_categoria || ''}`
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": subcategoriaCurrent?.nombre || "Subcategoría",
                                "item": `${window.location.origin}/subcategoria/${producto.id_subcategoria}`
                            },
                            {
                                "@type": "ListItem",
                                "position": 4,
                                "name": producto.nombre,
                                "item": `${window.location.origin}/producto/${producto.id_producto}`
                            }
                        ]
                    })}
                </script>
                
                {/* Canonical URL */}
                <link rel="canonical" href={`${window.location.origin}/producto/${producto.id_producto}`} />
                
                {/* Preload critical resources */}
                <link rel="preload" as="image" href={Array.isArray(producto.imagen) ? (producto.imagen[0]?.startsWith('http') ? producto.imagen[0] : `/${producto.imagen[0]}`) : (producto.imagen?.startsWith('http') ? producto.imagen : `/${producto.imagen}`)} />
                
                {/* DNS prefetch for external resources */}
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />
                <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
            </Head>
            <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10" />
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
            {categoriaCurrent && subcategoriaCurrent && (
                <div className="flex items-center flex-wrap gap-1 px-4 md:px-6 py-3 ">
                    <Link 
                        href={`/categorias/${categoriaCurrent.id_categoria}`} 
                        className={`hover:text-blue-600 transition-colors duration-200 text-base md:text-lg font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                    >
                        {categoriaCurrent.nombre_categoria}
                    </Link>
                    <span className={`mx-1 text-sm font-medium ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>/</span>
                    <Link 
                        href={`/subcategoria/${producto.id_subcategoria}`}
                        className={`hover:text-blue-600 transition-colors duration-200 text-base md:text-lg font-medium ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}
                    >
                        {subcategoriaCurrent.nombre}
                    </Link>
                </div>
            )} 

            {/* Modal para características */}
            {showModal && (
                <Modal_Features
                    product={producto}
                    type={modalType}
                    onSave={handleSaveFeatures}
                    onClose={handleCloseModal}
                    initialData={productData.caracteristicas}
                />
            )}

            {isBancoImagenesOpen && (
                <BancoImagenesModal
                    isOpen={isBancoImagenesOpen}
                    onClose={() => setIsBancoImagenesOpen(false)}
                    onSelectImages={handleImageSelectFromBank}
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

            <main className="p-4 md:p-6" role="main" itemScope itemType="https://schema.org/Product">
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8" aria-label="Información del producto">
                    <ImageGallery 
                        images={productData.imagen} 
                        productId={producto.id_producto}
                        productName={producto.nombre}
                        canEdit={auth.user ? true : false}
                        onImagesUpdate={(newImages) => {
                            setProductData(prev => ({
                                ...prev,
                                imagen: newImages
                            }));
                        }}
                        onOpenBanco={() => setIsBancoImagenesOpen(true)}
                    />

                    <div className={`w-full p-4 sm:p-6 shadow-lg rounded-lg transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex flex-col space-y-4">
                            <div>
                                {editMode.nombre ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            className={`text-2xl md:text-3xl font-bold border rounded px-2 py-1 w-full transition-colors duration-300 ${
                                                isDarkMode 
                                                    ? 'text-gray-100 bg-gray-700 border-gray-600' 
                                                    : 'text-gray-900 bg-white border-gray-300'
                                            }`}
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
                                        className={`text-2xl md:text-3xl font-bold cursor-pointer transition-colors duration-300 ${
                                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                        }`}
                                        onDoubleClick={() => toggleEditMode('nombre')}
                                        itemProp="name"
                                    >
                                        {productData.nombre}
                                    </h1>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="flex text-left space-x-4 flex-col">
                                    <div className="ml-3">
                                        {editMode.precio_ganancia ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className={`text-xl md:text-2xl font-semibold text-green-600 border rounded px-2 py-1 transition-colors duration-300 ${
                                                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                                    }`}
                                                    value={tempInputs.precio_ganancia || producto.precio_ganancia}
                                                    onChange={(e) => handleInputChange('precio_ganancia', e.target.value)}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSave('precio_ganancia')}
                                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => toggleEditMode('precio_ganancia')}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <p
                                                className="text-xl md:text-2xl font-semibold text-green-600 cursor-pointer"
                                                onDoubleClick={() => toggleEditMode('precio_ganancia')}
                                                itemProp="offers" itemScope itemType="https://schema.org/Offer"
                                            >
                                                <span itemProp="price" content={productData.precio_ganancia}>
                                                    {formatPrice(productData.precio_ganancia)}
                                                </span>
                                                <meta itemProp="priceCurrency" content="PEN" />
                                                <meta itemProp="availability" content="https://schema.org/InStock" />
                                            </p>
                                        )}
                                        <p className={`text-sm transition-colors duration-300 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            (sin IGV)
                                        </p>
                                    </div>
                                    <div>
                                        {editMode.precio_igv ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className={`text-xl md:text-2xl font-semibold border rounded px-2 py-1 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'text-gray-100 bg-gray-700 border-gray-600' 
                                                            : 'text-gray-800 bg-white border-gray-300'
                                                    }`}
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
                                                className={`text-xl md:text-2xl font-semibold cursor-pointer transition-colors duration-300 ${
                                                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                                }`}
                                                onDoubleClick={() => toggleEditMode('precio_igv')}
                                            >
                                                {formatPrice(productData.precio_igv)}
                                            </p>
                                        )}
                                        <p className={`text-sm transition-colors duration-300 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            (con IGV)
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-sm flex flex-col space-y-2 transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    <div>
                                        {editMode.sku ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    className={`text-sm border rounded px-2 py-1 transition-colors duration-300 ${
                                                        isDarkMode 
                                                            ? 'text-gray-300 bg-gray-700 border-gray-600' 
                                                            : 'text-gray-600 bg-white border-gray-300'
                                                    }`}
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
                                                className={`cursor-pointer transition-colors duration-300 ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                }`}
                                                onDoubleClick={() => toggleEditMode('sku')}
                                            >
                                                <strong>SKU:</strong> <span itemProp="sku">{productData.sku}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className={`transition-colors duration-300 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            <strong>Fabricante:</strong> {productData.marca?.nombre?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <div className={`transition-colors duration-300 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            <strong>Categoría:</strong> 
                                            {categoriaCurrent && (
                                                <>
                                                    <Link 
                                                        href={`/categorias/${categoriaCurrent.id_categoria}`} 
                                                        className={`hover:text-blue-600 transition-colors duration-200 ml-1 ${
                                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {categoriaCurrent.nombre_categoria}
                                                    </Link>
                                                    <span className={`mx-1 ${
                                                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                                    }`}> - </span>
                                                </>
                                            )}
                                            {subcategoriaCurrent && (
                                                <Link 
                                                    href={`/subcategoria/${producto.id_subcategoria}`}
                                                    className={`hover:text-blue-600 transition-colors duration-200 ${
                                                        isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                                    }`}
                                                >
                                                    {subcategoriaCurrent.nombre}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <p className={`transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-800'
                                    }`}>
                                        <strong>Plazo de entrega:</strong> 1-3 días (Salvo fin Stock)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <button 
                                    className="w-full md:w-auto flex-grow bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 shadow-md"
                                    onClick={handleAddToCart}
                                >
                                    Agregar al carrito
                                </button>
                                <button 
                                    onClick={() => {
                                        const productTabsSection = document.getElementById('product-tabs');
                                        if (productTabsSection) {
                                            productTabsSection.scrollIntoView({ 
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                        }
                                    }}
                                    className={`w-full md:w-auto px-6 py-3 rounded-md shadow-md transition-colors duration-300 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}>
                                    Selecciona tus accesorios
                                </button>
                                <button 
                                    onClick={() => {
                                        const productUrl = window.location.href;
                                        const message = `Hola, estoy interesado en la compra de este producto: ${productUrl}`;
                                        const whatsappUrl = `https://wa.me/51939294882?text=${encodeURIComponent(message)}`;
                                        window.open(whatsappUrl, '_blank');
                                    }}
                                    className={`w-full md:w-auto px-6 py-3 rounded-md shadow-md transition-colors duration-300 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}>
                                    Comunícate con un asesor
                                </button>
                            </div>
                            {auth.user && (
                                <button 
                                    onClick={() => {
                                        if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                                            router.delete(`/product/delete/${producto.id_producto}`, {
                                                onSuccess: () => {
                                                    window.location.href = '/';
                                                },
                                                onError: (errors) => {
                                                    console.error('Error al eliminar:', errors);
                                                    alert('Hubo un error al eliminar el producto');
                                                },
                                                preserveState: false 
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
                                {auth.user && (
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={() => toggleEditMode('video')}
                                            className={`px-3 py-1 text-sm rounded transition-colors duration-300 ${
                                                editMode.video
                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                    : isDarkMode
                                                        ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {editMode.video ? 'Cancelar' : 'Editar Video'}
                                        </button>
                                    </div>
                                )}
                                
                                {editMode.video ? (
                                    <div className="space-y-4">
                                        <div className="flex space-x-2">
                                            <input 
                                                type="text" 
                                                value={tempInputs.video || producto.video}
                                                onChange={(e) => handleInputChange('video', e.target.value)}
                                                placeholder="Ingresa la URL del video de YouTube" 
                                                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                                autoFocus
                                            />
                                            <button 
                                                onClick={() => {
                                                    // Convertir URL de YouTube a formato de embed para previsualización
                                                    let embedUrl = tempInputs.video || producto.video;
                                                    if (embedUrl.includes('youtu.be/')) {
                                                        embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
                                                    } else if (embedUrl.includes('youtube.com/watch?v=')) {
                                                        embedUrl = embedUrl.replace("youtube.com/watch?v=", "youtube.com/embed/");
                                                    }
                                                    setVideoPreview(embedUrl);
                                                }}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                            >
                                                Previsualizar
                                            </button>
                                            <button
                                                 onClick={() => handleSave('video')}
                                                 className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                             >
                                                 Guardar
                                             </button>
                                             <button
                                                 onClick={async () => {
                                                     try {
                                                         const response = await axios.post('/product/update', {
                                                             id_producto: producto.id_producto,
                                                             video: ''
                                                         }, {
                                                             headers: {
                                                                 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                                                                 'Content-Type': 'application/json',
                                                                 'Accept': 'application/json'
                                                             }
                                                         });
                                                         
                                                         if (response.status === 200) {
                                                             setProductData(prev => ({
                                                                 ...prev,
                                                                 video: ''
                                                             }));
                                                             producto.video = '';
                                                             setEditMode(prev => ({
                                                                 ...prev,
                                                                 video: false
                                                             }));
                                                             setTempInputs(prev => {
                                                                 const newInputs = { ...prev };
                                                                 delete newInputs.video;
                                                                 return newInputs;
                                                             });
                                                             setVideoPreview('');
                                                             console.log("Video eliminado exitosamente");
                                                         }
                                                     } catch (error) {
                                                         console.error("Error al eliminar video:", error);
                                                         alert("Error al eliminar el video. Por favor, inténtalo de nuevo.");
                                                     }
                                                 }}
                                                 className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                             >
                                                 Eliminar
                                             </button>
                                        </div>
                                        
                                        {videoPreview && (
                                            <div className="mt-4">
                                                <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                                                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                                }`}>Previsualización:</h3>
                                                <iframe
                                                    className="w-full h-96 rounded-md shadow-lg"
                                                    src={videoPreview}
                                                    title="Previsualización del video"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <iframe
                                        className="w-full h-96 rounded-md shadow-lg"
                                        src={producto.video.replace("youtu.be", "www.youtube.com/embed")}
                                        title="Explora las Propiedades Texturales"
                                        allowFullScreen
                                    ></iframe>
                                )}
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
                                                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
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
                                                <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                                                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                                }`}>Previsualización:</h3>
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
                <section className={`w-full shadow-md rounded-md mt-10 transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`} id="product-tabs" aria-label="Información detallada del producto">
                    <ProductTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                    />

                    <div className="p-4">{renderContent()}</div>
                </section>
               
               
                 <section className={`w-full shadow-md rounded-md mt-5 p-6 transition-colors duration-300 ${
                     isDarkMode ? 'bg-gray-800' : 'bg-white'
                 }`} aria-label="Productos relacionados">
                 <RelatedProducts 
                                productId={producto.id_producto} 
                                currentProductSubcategoryId={producto.id_subcategoria}
                            />
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

                    {/* Productos Vistos Recientemente */}
                    <section className={`py-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} aria-label="Productos vistos recientemente">
                        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Productos Vistos Recientemente
                        </h2>
                        {(() => {
                            const recentProducts = getRecentlyViewed().filter(product => product.id !== producto.id_producto);
                            
                            if (recentProducts.length === 0) {
                                return (
                                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        No hay productos vistos recientemente.
                                    </div>
                                );
                            }
                            
                            return (
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4" role="list" aria-label="Lista de productos vistos recientemente">
                                    {recentProducts.slice(0, 6).map((product) => {
                                        const showDetails = hoveredRecentProductId === product.id;
                                        
                                        return (
                                            <article 
                                                key={product.id} 
                                                className={`${
                                                    isDarkMode 
                                                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600' 
                                                        : 'bg-white border-gray-200 shadow-lg'
                                                } rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border relative`}
                                                onMouseEnter={() => setHoveredRecentProductId(product.id)}
                                                onMouseLeave={() => setHoveredRecentProductId(null)}
                                                role="listitem"
                                                itemScope
                                                itemType="https://schema.org/Product"
                                            >
                                                <Link href={product.link}>
                                                    <div className="relative">
                                                        {/* Área de imagen con fondo adaptable */}
                                                        <div className={`h-40 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                            <img 
                                                                src={product.image ? product.image : '/img/logo2.jpg'}
                                                                alt={product.title} 
                                                                className="w-full h-full object-contain p-4"
                                                                onError={(e) => {
                                                                    if (e.target.src !== '/img/logo2.jpg') {
                                                                        e.target.src = '/img/logo2.jpg';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        
                                                        {/* Badge de marca */}
                                                        <div className="absolute top-3 left-3">
                                                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                                                                {product.marca?.nombre || 'PRODUCTO'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Área de información del producto */}
                                                    <div className={`p-5 ${
                                                        isDarkMode 
                                                            ? 'bg-slate-800 text-white' 
                                                            : 'bg-white text-gray-800'
                                                    }`}>
                                                        <h3 className="text-lg font-bold mb-2 leading-tight" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                                            {product.title}
                                                        </h3>
                                                        
                                                        {/* Fecha de visualización */}
                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Visto:</span>
                                                                <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                                                    {new Date(product.viewedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>SKU:</span>
                                                                <span className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                                                    {product.sku || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Precio y SKU */}
                                                        <div className="border-t border-slate-600 pt-3">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-2xl font-bold text-blue-400">{formatPrice(product.priceWithoutProfit)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                                
                                                {/* Overlay con información detallada para usuarios no autenticados */}
                                                {!auth.user && showDetails && (
                                                    <div 
                                                        className={`absolute inset-0 bg-opacity-95 flex flex-col justify-start z-20 p-4 cursor-pointer transition-all duration-300 ${
                                                            isDarkMode 
                                                                ? 'bg-gray-900 text-gray-100' 
                                                                : 'bg-gray-800 text-white'
                                                        }`}
                                                        onClick={(e) => {
                                                            if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'a') {
                                                                e.stopPropagation();
                                                            } else {
                                                                window.location.href = product.link;
                                                            }
                                                        }}
                                                    >
                                                        <a 
                                                            href={product.link}
                                                            className={`text-xl font-semibold mb-2 text-center transition-colors cursor-pointer ${
                                                                isDarkMode 
                                                                    ? 'hover:text-blue-300 text-gray-100' 
                                                                    : 'hover:text-blue-300 text-white'
                                                            }`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {product.title}
                                                        </a>
                                                        
                                                        {/* Contenedor con scroll */}
                                                        <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
                                                            {/* Información del producto visto recientemente */}
                                                            <div className="mb-4">
                                                                <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                                                                    isDarkMode ? 'text-blue-300' : 'text-blue-300'
                                                                }`}>Información</h3>
                                                                <div className={`text-sm space-y-2 transition-colors duration-300 ${
                                                                    isDarkMode ? 'text-gray-200' : 'text-gray-300'
                                                                }`}>
                                                                    <p><strong>SKU:</strong> {product.sku || 'N/A'}</p>
                                                                    <p><strong>Marca:</strong> {product.marca?.nombre || 'Sin marca'}</p>
                                                                    <p><strong>Visto:</strong> {new Date(product.viewedAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Descripción del producto */}
                                                            {product.descripcion && (
                                                                <div className="mb-4">
                                                                    <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                                                                        isDarkMode ? 'text-blue-300' : 'text-blue-300'
                                                                    }`}>Descripción</h3>
                                                                    <p className={`text-sm transition-colors duration-300 ${
                                                                        isDarkMode ? 'text-gray-100' : 'text-gray-200'
                                                                    }`}>{product.descripcion}</p>
                                                                </div>
                                                            )}
                                                        </div>                                                       
                                                        {/* Botones de acción */}
                                                        <div className="mt-auto space-y-2">
                                                            <button
                                                                onClick={(e) => handleAddToCartRecent(e, product)}
                                                                className={`w-full font-bold py-2 px-4 rounded-md transition-all duration-300 ${
                                                                    isDarkMode 
                                                                        ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg' 
                                                                        : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
                                                                }`}
                                                            >
                                                                Añadir al Carrito
                                                            </button>
                                                            <button 
                                                                onClick={(e) => handleCompareRecent(e, product)}
                                                                className={`w-full font-bold py-2 px-4 rounded-md transition-all duration-300 ${
                                                                    isInCompare(product.id)
                                                                        ? isDarkMode 
                                                                            ? 'bg-gray-600 hover:bg-gray-700 text-white hover:shadow-lg'  
                                                                            : 'bg-gray-900 hover:bg-gray-900 text-white hover:shadow-lg'
                                                                        : isDarkMode 
                                                                            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg' 
                                                                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                                                                } ${
                                                                    !canAddMore && !isInCompare(product.id) ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                                disabled={!canAddMore && !isInCompare(product.id)}
                                                            >
                                                                {isInCompare(product.id) ? 'En Comparador' : 'Comparar'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Botones de acción en la parte inferior */}
                                                <div className={`px-5 pb-4 space-y-2 ${
                                                    isDarkMode 
                                                        ? 'bg-slate-800' 
                                                        : 'bg-white'
                                                }`}>
                                                    {/* Botón de carrito - visible para todos */}
                                                    <button
                                                        onClick={(e) => handleAddToCartRecent(e, product)}
                                                        className={`w-full text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${
                                                            isDarkMode 
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                        }`}
                                                    >
                                                        Añadir al Carrito
                                                    </button>
                                                    
                                                    {/* Botón de comparar - visible para todos */}
                                                    <button 
                                                        onClick={(e) => handleCompareRecent(e, product)}
                                                        className={`w-full text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${
                                                            isInCompare(product.id)
                                                                ? isDarkMode 
                                                                    ? 'bg-blue-900 hover:bg-blue-900 text-white'
                                                                    : 'bg-blue-900 hover:bg-blue-900 text-white'
                                                                : isDarkMode 
                                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        } ${
                                                            !canAddMore && !isInCompare(product.id) ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                        disabled={!canAddMore && !isInCompare(product.id)}
                                                    >
                                                        {isInCompare(product.id) ? 'En Comparador' : 'Comparar'}
                                                    </button>
                                                </div>
                                                
                                                {/* CSS para el scrollbar personalizado */}
                                                <style>{`
                                                    .custom-scrollbar::-webkit-scrollbar {
                                                        width: 6px;
                                                    }
                                                    .custom-scrollbar::-webkit-scrollbar-track {
                                                        background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                                                        border-radius: 10px;
                                                    }
                                                    .custom-scrollbar::-webkit-scrollbar-thumb {
                                                        background: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
                                                        border-radius: 10px;
                                                    }
                                                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                                        background: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
                                                    }
                                                `}</style>
                                            </article>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </section>
                    
                </section>
               
            </main>
            <Footer />
            
            {/* Floating WhatsApp Button */}
            <a 
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    const productUrl = window.location.href;
                    const message = `Hola, estoy interesado en la compra de este producto: ${productUrl}`;
                    const whatsappUrl = `https://wa.me/51939294882?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                }}
                className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 animate-pulse hover:animate-none"
                aria-label="Contactar por WhatsApp"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
            </a>
        </div>
    );
};

export default ProductPage;
