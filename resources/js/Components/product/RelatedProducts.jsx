import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";

const ModalRelatedProducts = ({ productId, relatedProductId, initialRelated = [], onSave, onClose, isPendingRelation = false }) => {
    const [relatedProducts, setRelatedProducts] = useState(initialRelated);
    const [selectedType, setSelectedType] = useState('accesorio');
    const [relationTypes, setRelationTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Obtener tipos de relaciones
    useEffect(() => {
        const fetchRelationTypes = async () => {
            try {
                const response = await axios.get('/tipos-relacion-productos');
                setRelationTypes(response.data);
                if (response.data.length > 0) {
                    setSelectedType(response.data[0].nombre);
                }
            } catch (error) {
                console.error('Error al obtener tipos de relaciones:', error);
            }
        };

        fetchRelationTypes();
    }, []);

    const handleAddRelation = async () => {
        if (!relatedProductId) {
            alert('No se ha especificado un producto para relacionar');
            return;
        }
        
        setIsLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };
              
            const response = await axios.post('/product/agregar-relacion', {
                id: productId,
                relacionado_id: relatedProductId,
                tipo: selectedType
            }, config);
            // Si la operación fue exitosa, actualizamos la lista local
            const relatedProductInfo = response.data.producto || {
                id: relatedProductId,
                nombre: response.data.nombre || 'Producto relacionado',
                sku: response.data.sku || ''
            };

            setRelatedProducts(prev => [...prev, {
                ...relatedProductInfo,
                tipo: selectedType
            }]);
            
            onSave && onSave(relatedProductInfo, selectedType);
        } catch (error) {
            console.error('Error al relacionar productos:', error);
            alert('Error al relacionar los productos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveProduct = async (relatedProduct) => {
        // Confirmar antes de eliminar
        if (!window.confirm(`¿Estás seguro de eliminar la relación con el producto "${relatedProduct.nombre}"?`)) {
            return;
        }

        setLoading(true); // Asumiendo que tienes un estado de carga 'loading'
        setError(null);   // Asumiendo que tienes un estado de error 'error'

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json', // Cambiado a application/json ya que no enviamos archivos
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };

            // Llamar al endpoint para eliminar la relación
            const response = await axios.post('/product/eliminar-relacion', {
                id: productId, // ID del producto principal
                relacionado_id: relatedProduct.id_producto || relatedProduct.id // ID del producto relacionado
            }, config);

            console.log('Respuesta del servidor:', response.data.message);

            // Actualizar la lista local de productos relacionados
            setRelatedProducts(prev =>
                prev.filter(p => (p.id_producto || p.id) !== (relatedProduct.id_producto || relatedProduct.id))
            );

            // Opcional: Mostrar mensaje de éxito
            alert('Relación eliminada correctamente');

        } catch (err) {
            console.error('Error al eliminar relación:', err);
            setError('Error al eliminar la relación. Por favor, inténtalo de nuevo.'); // Actualiza el estado de error
            alert('Error al eliminar la relación'); // Muestra alerta al usuario
        } finally {
            setLoading(false); // Finaliza el estado de carga
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg z-50 max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">
                    {isPendingRelation ? 'Establecer Relación Pendiente' : 'Agregar Relación de Producto'}
                </h3>
                
                <div className="mb-4">
                    {isPendingRelation && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-700">
                                Este producto tiene una relación pendiente. Seleccione el tipo de relación para establecer la conexión inversa.
                            </p>
                        </div>
                    )}

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de relación
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-3"
                    >
                        {relationTypes.map(type => (
                            <option key={type.id} value={type.nombre}>
                                {type.nombre.charAt(0).toUpperCase() + type.nombre.slice(1)}
                            </option>
                        ))}
                    </select>
                    
                    <button
                        onClick={handleAddRelation}
                        disabled={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300"
                    >
                        {isLoading ? 'Agregando...' : isPendingRelation ? 'Establecer Relación' : 'Agregar Relación'}
                    </button>
                </div>

                {!isPendingRelation && (
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Productos relacionados:</h4>
                        {relatedProducts.length > 0 ? (
                            <div className="divide-y">
                                {relatedProducts.map((product) => (
                                    <div key={product.id} className="py-2 flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{product.nombre}</div>
                                            <div className="text-sm text-gray-600">
                                                SKU: {product.sku} | Tipo: {product.tipo}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveProduct(product)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No hay productos relacionados.</p>
                        )}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const RelatedProducts = ({ productId }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relationTypes, setRelationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingRelations, setPendingRelations] = useState([]);
    const [loadingPending, setLoadingPending] = useState(true);
    // Estado para controlar la visibilidad del modal
    const [showModal, setShowModal] = useState(false);
    // Estado para almacenar el ID del producto a relacionar
    const [selectedProductId, setSelectedProductId] = useState(null);
    // Estado para indicar si es una relación pendiente
    const [isPendingRelation, setIsPendingRelation] = useState(false);
    // Estado para almacenar información del producto pendiente
    const [pendingProduct, setPendingProduct] = useState(null);
    // Estado para manejar la carga durante la eliminación
    const [isDeleting, setIsDeleting] = useState(false);

    // Obtener tipos de relaciones y agrupar productos
    const groupedProducts = relationTypes.reduce((acc, type) => {
        acc[type.nombre] = relatedProducts.filter(
            product => product.pivot?.tipo === type.nombre
        );
        return acc;
    }, {});

    useEffect(() => {
        const fetchRelationTypes = async () => {
            try {
                const response = await axios.get('/tipos-relacion-productos');
                setRelationTypes(response.data);
            } catch (err) {
                console.error("Error fetching relation types:", err);
            }
        };

        fetchRelationTypes();
    }, []);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/product/relacion/${productId}`);
                setRelatedProducts(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching related products:", err);
                setError("No se pudieron cargar los productos relacionados.");
                setLoading(false);
            }
        };

        if (productId) {
            fetchRelatedProducts();
        }
    }, [productId]);

    // Efecto para obtener relaciones pendientes
    useEffect(() => {
        const fetchPendingRelations = async () => {
            try {
                setLoadingPending(true);
                const response = await axios.get(`/product/con-relacion/${productId}`);
                setPendingRelations(response.data);
                setLoadingPending(false);
            } catch (err) {
                console.error("Error fetching pending relations:", err);
                setLoadingPending(false);
            }
        };

        if (productId) {
            fetchPendingRelations();
        }
    }, [productId]);

    // Filtrar las relaciones pendientes para excluir productos que ya están en relatedProducts
    const filteredPendingRelations = pendingRelations.filter(pendingProduct => {
        // Verificar si este producto pendiente ya existe en la lista de productos relacionados
        return !relatedProducts.some(relatedProduct => 
            relatedProduct.id_producto === pendingProduct.id_producto
        );
    });

    const openRelationModal = (relatedProductId, isPending = false, product = null) => {
        setSelectedProductId(relatedProductId);
        setIsPendingRelation(isPending);
        setPendingProduct(product);
        setShowModal(true);
    };

    // Función para manejar el guardado de una nueva relación
    const handleSaveRelation = (relatedProduct, relationType) => {
        // Actualizar la lista de productos relacionados
        setRelatedProducts(prevProducts => {
            // Verificar si el producto ya existe en la lista
            const exists = prevProducts.some(p => p.id_producto === relatedProduct.id);
            if (exists) {
                return prevProducts.map(p => 
                    p.id_producto === relatedProduct.id 
                        ? { ...p, pivot: { ...p.pivot, tipo: relationType } } 
                        : p
                );
            } else {
                // Agregar el nuevo producto a la lista
                return [...prevProducts, {
                    ...relatedProduct,
                    pivot: { tipo: relationType }
                }];
            }
        });
        
        // Si era una relación pendiente, actualizar la lista de relaciones pendientes
        if (isPendingRelation) {
            setPendingRelations(prev => 
                prev.filter(p => p.id_producto !== relatedProduct.id)
            );
        }
        
        // Cerrar el modal
        setShowModal(false);
    };

    // Nueva función para manejar la eliminación directa de la relación
    const handleRemoveRelationDirectly = async (productToRemove) => {
        if (!window.confirm(`¿Estás seguro de eliminar la relación con el producto "${productToRemove.nombre}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json', // Cambiado a application/json si no envías archivos
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };
            // Llamar al endpoint para eliminar la relación
            await axios.post('/product/eliminar-relacion', {
                id: productId,
                relacionado_id: productToRemove.id_producto || productToRemove.id // Asegúrate de usar el ID correcto
            }, config);

            // Actualizar la lista local de productos relacionados (opcional antes de recargar)
            setRelatedProducts(prev =>
                prev.filter(p => (p.id_producto || p.id) !== (productToRemove.id_producto || productToRemove.id))
            );

            alert('Relación eliminada correctamente');
            // Añadir recarga de página aquí
            window.location.reload();

        } catch (error) {
            console.error('Error al eliminar relación:', error);
            alert('Error al eliminar la relación');
        } finally {
            setIsDeleting(false);
        }
    };


    const renderProductCard = (product, isPending = false) => (
        <div key={product.id_producto} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <Link href={`/producto/${product.id_producto}`}>
                <div className="h-48 overflow-hidden">
                    <img 
                        src={product.imagen?.startsWith('http') ? product.imagen : `/${product.imagen}`}
                        alt={product.nombre} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{product.nombre}</h3>
                    <div className="mt-2 flex justify-between items-center">
                        <p className="text-lg font-semibold text-green-600">S/ {product.precio_sin_ganancia}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                </div>
            </Link>
            <div className="p-2 bg-gray-100">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (isPending) {
                            openRelationModal(product.id_producto, true, product);
                        } else {
                            // Llamar a la función de eliminación directa si no es pendiente
                            handleRemoveRelationDirectly(product);
                        }
                    }}
                    // Deshabilitar si se está eliminando
                    disabled={isDeleting && !isPending}
                    className={`w-full text-sm ${
                        isPending
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-blue-500 hover:bg-blue-600' // Cambiar a color rojo para eliminar 
                    } text-white py-1 px-2 rounded disabled:opacity-50`}
                >
                    {/* Cambiar texto a 'Eliminar Relación' si no es pendiente */}
                    {isPending ? 'Establecer Relación' : (isDeleting ? 'Eliminando...' : 'Eliminar Relación')}
                </button>
            </div>
        </div>
    );

    const renderProductGroup = (type, products) => {
        if (!products || products.length === 0) return null;
        
        return (
            <div key={type} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => renderProductCard(product))}
                </div>
            </div>
        );
    };

    const renderPendingRelations = () => {
        if (loadingPending) return null;
        if (!filteredPendingRelations || filteredPendingRelations.length === 0) return null;

        return (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h2 className="text-xl font-bold text-yellow-700 mb-4">
                    Relaciones Pendientes
                </h2>
                <p className="mb-4 text-yellow-600">
                    Los siguientes productos tienen relación con este producto, pero no existe la relación inversa:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPendingRelations.map(product => renderProductCard(product, true))}
                </div>
                <div className="mt-4 text-sm text-yellow-600">
                    <p>Haga clic en "Establecer Relación" para crear la relación inversa.</p>
                </div>
            </div>
        );
    };

    return (
        <div className="py-6">
            {renderPendingRelations()}
            
            {loading ? (
                <div className="text-center py-8">Cargando productos relacionados...</div>
            ) : relatedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay productos relacionados disponibles.</div>
            ) : (
                relationTypes.map(type => (
                    renderProductGroup(type.nombre, groupedProducts[type.nombre])
                ))
            )}

            {/* Modal para agregar/editar relaciones */}
            {showModal && (
                <ModalRelatedProducts 
                    productId={productId}
                    relatedProductId={selectedProductId}
                    initialRelated={relatedProducts.filter(p => p.id_producto === selectedProductId)}
                    onSave={handleSaveRelation}
                    onClose={() => setShowModal(false)}
                    isPendingRelation={isPendingRelation}
                />
            )}
        </div>
    );
};

export default RelatedProducts;

const ModalSearchRelatedProducts = ({ productId, initialRelated, onSave, onClose }) => {
    // ... Lógica del modal de búsqueda y adición ...
    // Similar a tu ModalRelatedProducts original pero enfocado en buscar y agregar

    const [localRelated, setLocalRelated] = useState(initialRelated);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [selectedType, setSelectedType] = useState('accesorio'); // O el tipo por defecto
    const [relationTypes, setRelationTypes] = useState([]);

    // Fetch relation types (similar a tu otro modal)
    useEffect(() => {
        const fetchRelationTypes = async () => {
            try {
                const response = await axios.get('/tipos-relacion-productos');
                setRelationTypes(response.data);
                if (response.data.length > 0) {
                    setSelectedType(response.data[0].nombre);
                }
            } catch (error) {
                console.error('Error al obtener tipos de relaciones:', error);
            }
        };
        fetchRelationTypes();
    }, []);


    // Search products function (similar a tu otro modal)
    const searchProducts = async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSearch(true);
        try {
            const response = await axios.post('/productos/buscar', { producto: term });
            if (Array.isArray(response.data)) {
                // Filtrar el producto actual y los ya relacionados
                const relatedIds = localRelated.map(p => p.id_producto || p.id);
                const filteredResults = response.data.filter(p =>
                    p.id_producto !== productId && !relatedIds.includes(p.id_producto)
                );
                setSearchResults(filteredResults);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

     // Debounce search
     useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, localRelated]); // Re-buscar si cambian los relacionados locales


    // Handle adding a product relation
    const handleAddProduct = async (selectedProduct) => {
         try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            };
            await axios.post('/product/agregar-relacion', {
                id: productId,
                relacionado_id: selectedProduct.id_producto,
                tipo: selectedType
            }, config);

            // Actualizar estado local en este modal
            setLocalRelated(prev => [...prev, {
                ...selectedProduct,
                pivot: { tipo: selectedType } // Simular la estructura pivot
            }]);

            setSearchTerm(''); // Limpiar búsqueda
            setSearchResults([]); // Limpiar resultados

        } catch (error) {
            console.error('Error al agregar relación:', error);
            alert('Error al agregar la relación');
        }
    };


    // Handle saving changes (pasar la lista actualizada al componente padre)
    const handleSaveChanges = () => {
        onSave(localRelated); // Llama a la función onSave del padre con la lista actualizada
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg z-50 max-w-lg w-full p-6 max-h-[80vh] flex flex-col">
                <h3 className="text-lg font-bold mb-4">Buscar y Agregar Productos Relacionados</h3>

                 {/* Selector de Tipo */}
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de relación:</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    >
                        {relationTypes.map(type => (
                            <option key={type.id} value={type.nombre}>
                                {type.nombre.charAt(0).toUpperCase() + type.nombre.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Input de Búsqueda */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar productos por nombre o SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Resultados de Búsqueda */}
                <div className="flex-grow overflow-y-auto mb-4 border rounded-md">
                    {isLoadingSearch ? (
                        <p className="p-3 text-gray-500">Buscando...</p>
                    ) : searchResults.length > 0 ? (
                        <ul>
                            {searchResults.map(product => (
                                <li key={product.id_producto} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-medium">{product.nombre}</span>
                                        <span className="text-sm text-gray-600 ml-2">(SKU: {product.sku})</span>
                                    </div>
                                    <button
                                        onClick={() => handleAddProduct(product)}
                                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                    >
                                        Agregar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : searchTerm.length >= 2 ? (
                        <p className="p-3 text-gray-500">No se encontraron resultados.</p>
                    ) : (
                         <p className="p-3 text-gray-400">Ingrese al menos 2 caracteres para buscar.</p>
                    )}
                </div>


                {/* Botones de Acción */}
                <div className="flex justify-end space-x-3">
                     <button
                        onClick={onClose} // Usar onClose directamente para cancelar
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        Cerrar
                    </button>
                    {/* El botón de guardar ahora solo cierra el modal,
                        ya que la adición se hace directamente */}
                    {/* <button
                        onClick={handleSaveChanges}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Guardar Cambios
                    </button> */}
                </div>
            </div>
        </div>
    );
};