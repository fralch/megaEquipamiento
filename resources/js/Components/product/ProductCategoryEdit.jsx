import React, { useState, useEffect } from 'react';
import { countryOptions } from '../countrys';
import axios from 'axios';

const ProductCategoryEdit = ({
    id_subcategoria,
    marcas,
    countryCurrent,
    productData,
    editMode,
    tempInputs,
    handleInputChange,
    handleSave,
    toggleEditMode
}) => {
    const [subcategoriasAll, setSubcategoriasAll] = useState([]);
    const [categoriasAll, setCategoriasAll] = useState([]);
    const [categoriaCurrent, setCategoria] = useState([]);
    const [subcategoriaCurrent, setSubcategoria] = useState([id_subcategoria]);
    const [marcasAll, setMarcasAll] = useState([]);
    const [filteredSubcategorias, setFilteredSubcategorias] = useState([]);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchCatAndSubcatCurrent = async () => {
            try {
                // Ejecutar todas las peticiones en paralelo usando un único Promise.all
                const [
                    categoriaResponse, 
                    subcategoriaResponse, 
                    subcategoriasResponse, 
                    categoriasResponse, 
                    marcasResponse
                ] = await Promise.all([
                    axios.get('/subcategoria_get/cat/' + id_subcategoria),
                    axios.get('/subcategoria_id/' + id_subcategoria),
                    axios.get('/subcategoria-all'),
                    axios.get('/categorias-all'),
                    axios.get('/marca/all')
                ]);
                
                // Actualizar todos los estados con las respuestas
                setCategoria(categoriaResponse.data);
                setSubcategoria(subcategoriaResponse.data);
                setSubcategoriasAll(subcategoriasResponse.data);
                setCategoriasAll(categoriasResponse.data);
                setMarcasAll(marcasResponse.data);
                
                // Inicializar las subcategorías filtradas si ya hay una categoría seleccionada
                if (tempInputs.id_categoria) {
                    const filtered = subcategoriasResponse.data.filter(
                        subcategoria => subcategoria.id_categoria === parseInt(tempInputs.id_categoria)
                    );
                    setFilteredSubcategorias(filtered);
                } else {
                    // Si no hay categoría seleccionada, mostrar todas las subcategorías
                    setFilteredSubcategorias(subcategoriasResponse.data);
                }
                
                console.log("Datos cargados correctamente");
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchCatAndSubcatCurrent();
    }, [id_subcategoria]);

    // Efecto para filtrar subcategorías cuando cambia la categoría seleccionada
    useEffect(() => {
        if (tempInputs.id_categoria) {
            const filtered = subcategoriasAll.filter(
                subcategoria => subcategoria.id_categoria === parseInt(tempInputs.id_categoria)
            );
            setFilteredSubcategorias(filtered);
        } else {
            // Si no hay categoría seleccionada, mostrar todas las subcategorías
            setFilteredSubcategorias(subcategoriasAll);
        }
    }, [tempInputs.id_categoria, subcategoriasAll]);

    // Manejador personalizado para el cambio de categoría
    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        
        // Actualizar la categoría seleccionada
        handleInputChange('id_categoria', categoryId);
        
        // Resetear la subcategoría seleccionada cuando se cambia la categoría
        handleInputChange('id_subcategoria', '');
    };
    
    // Efecto para limpiar automáticamente los mensajes de estado después de 3 segundos
    useEffect(() => {
        if (statusMessage.text) {
            const timer = setTimeout(() => {
                setStatusMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);
    
    // Función para actualizar la categoría del producto usando el endpoint updateProductCategory
    const updateProductCategory = async () => {
        try {
            // Verificar que los campos requeridos estén presentes
            if (!tempInputs.id_subcategoria || !tempInputs.marca_id) {
                setStatusMessage({ 
                    type: 'error', 
                    text: 'Por favor, seleccione una subcategoría y una marca' 
                });
                return;
            }
            
            // Preparar los datos para enviar al servidor
            const data = {
                id_producto: productData.id_producto,
                id_subcategoria: tempInputs.id_subcategoria,
                marca_id: tempInputs.marca_id,
                pais: tempInputs.pais || null
            };
            
            // Realizar la petición POST al endpoint
            const response = await axios.post('/productos/actualizar-categoria', data, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            // Si la respuesta es exitosa, actualizar los datos del producto
            if (response.data) {
                console.log('Categorización actualizada correctamente:', response.data);
                // Mostrar mensaje de éxito
                setStatusMessage({ 
                    type: 'success', 
                    text: 'Categorización actualizada correctamente' 
                });
                // Actualizar los datos del producto con la respuesta del servidor
                handleSave('categoria');
            }
        } catch (error) {
            console.error('Error al actualizar la categorización:', error);
            setStatusMessage({ 
                type: 'error', 
                text: 'Error al actualizar la categorización. Por favor, inténtelo de nuevo.' 
            });
        }
    };
    
    return (
        <div className="p-4">
            {/* Mostrar mensajes de estado */}
            {statusMessage.text && (
                <div className={`mb-4 p-3 rounded ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {statusMessage.text}
                </div>
            )}
            {editMode.categoria ? (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select
                                id="id_categoria"
                                name="id_categoria"
                                value={tempInputs.id_categoria || ''}
                                onChange={handleCategoryChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Seleccione una categoría</option>
                                {categoriasAll?.map(categoria => (
                                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="id_subcategoria" className="block text-sm font-medium text-gray-700">Subcategoría</label>
                            <select
                                id="id_subcategoria"
                                name="id_subcategoria"
                                value={tempInputs.id_subcategoria || ''}
                                onChange={(e) => handleInputChange('id_subcategoria', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Seleccione una subcategoría</option>
                                {filteredSubcategorias.map(subcategoria => (
                                    <option key={subcategoria.id_subcategoria} value={subcategoria.id_subcategoria}>
                                        {subcategoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="marca_id" className="block text-sm font-medium text-gray-700">Marca</label>
                            <select
                                id="marca_id"
                                name="marca_id"
                                value={tempInputs.marca_id || ''}
                                onChange={(e) => handleInputChange('marca_id', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Seleccione una marca</option>
                                {marcasAll?.map(marca => (
                                    <option key={marca.id} value={marca.id}>
                                        {marca.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="pais" className="block text-sm font-medium text-gray-700">País</label>
                            <select
                                id="pais"
                                name="pais"
                                value={tempInputs.pais || ''}
                                onChange={(e) => handleInputChange('pais', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Seleccione un país</option>
                                {countryOptions?.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={updateProductCategory}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => toggleEditMode('categoria')}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Información de Categorización</h3>
                        <button
                            onClick={() => toggleEditMode('categoria')}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Editar
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Categoría</p>
                            <p className="mt-1">{categoriaCurrent?.nombre_categoria || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Subcategoría</p>
                            <p className="mt-1">{subcategoriaCurrent?.nombre || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Marca</p>
                            <p className="mt-1">{productData.marca?.nombre || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">País</p>
                            <p className="mt-1">{productData.pais || 'No especificado'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCategoryEdit;