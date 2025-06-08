import React, { useState, useEffect } from 'react';
import { countryOptions } from '../countrys';
import { useTheme } from '../../storage/ThemeContext';
import axios from 'axios';

const ProductCategoryEdit = ({
    id_producto,
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
    const { isDarkMode } = useTheme();
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
                setStatusMessage({ 
                    type: 'error', 
                    text: 'Error al cargar los datos. Por favor, intente nuevamente.' 
                });
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
            // Preparar los datos para enviar al servidor
            const formData = new FormData();
            
            // Añadir campos al FormData
            formData.append('id_producto', productData.id_producto);
            
            // Añadir campos opcionales sólo si tienen valor
            if (tempInputs.id_subcategoria) {
                formData.append('id_subcategoria', tempInputs.id_subcategoria);
            }
            
            if (tempInputs.marca_id) {
                formData.append('marca_id', tempInputs.marca_id);
            }
            
            if (tempInputs.pais) {
                formData.append('pais', tempInputs.pais);
            }
            
            console.log('Enviando datos:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Obtener el token CSRF
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                console.error('No se encontró el token CSRF');
                setStatusMessage({ 
                    type: 'error', 
                    text: 'Error de seguridad: No se encontró el token CSRF' 
                });
                return;
            }
            console.log(tempInputs.marca_id);
            // Realizar la petición POST al endpoint usando FormData
            const response = await axios.post('/productos/actualizar-categoria', formData, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'multipart/form-data', // Importante para FormData
                }
            });
            
            // Si la respuesta es exitosa, actualizar los datos del producto
            if (response.data) {
                console.log('Categorización actualizada correctamente:', response.data);
                // Mostrar mensaje de éxito
                setStatusMessage({ 
                    type: 'success', 
                    text: 'Información de categorización actualizada correctamente' 
                });
                // Actualizar los datos del producto con la respuesta del servidor
                handleSave('categoria');
            }
        } catch (error) {
            console.error('Error al actualizar la categorización:', error);
            
            // Mostrar mensaje de error detallado si está disponible
            if (error.response && error.response.data) {
                console.error('Detalles del error:', error.response.data);
                
                // Si hay errores de validación específicos
                if (error.response.data.errors) {
                    const errorMessages = Object.values(error.response.data.errors)
                        .flat()
                        .join(', ');
                    setStatusMessage({ 
                        type: 'error', 
                        text: `Error de validación: ${errorMessages}` 
                    });
                } else if (error.response.data.message) {
                    setStatusMessage({ 
                        type: 'error', 
                        text: `Error: ${error.response.data.message}` 
                    });
                } else {
                    setStatusMessage({ 
                        type: 'error', 
                        text: 'Error al actualizar la información de categorización.' 
                    });
                }
            } else {
                setStatusMessage({ 
                    type: 'error', 
                    text: 'Error al actualizar la información de categorización. Por favor, intente nuevamente.' 
                });
            }
        }
    };
    
    return (
        <div className="p-4">
            {/* Mostrar mensajes de estado */}
            {statusMessage.text && (
                <div className={`mb-4 p-3 rounded transition-colors duration-200 ${
                    statusMessage.type === 'success' 
                        ? isDarkMode 
                            ? 'bg-green-900 text-green-300 border border-green-700' 
                            : 'bg-green-100 text-green-700'
                        : isDarkMode 
                            ? 'bg-red-900 text-red-300 border border-red-700' 
                            : 'bg-red-100 text-red-700'
                }`}>
                    {statusMessage.text}
                </div>
            )}
            {editMode.categoria ? (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="id_categoria" className={`block text-sm font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Categoría</label>
                            <select
                                id="id_categoria"
                                name="id_categoria"
                                value={tempInputs.id_categoria || ''}
                                onChange={handleCategoryChange}
                                className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400' 
                                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
                                }`}
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
                            <label htmlFor="id_subcategoria" className={`block text-sm font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Subcategoría (Opcional)</label>
                            <select
                                id="id_subcategoria"
                                name="id_subcategoria"
                                value={tempInputs.id_subcategoria || ''}
                                onChange={(e) => handleInputChange('id_subcategoria', e.target.value)}
                                className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400' 
                                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
                                }`}
                            >
                                <option value="">Sin subcategoría (opcional)</option>
                                {filteredSubcategorias.map(subcategoria => (
                                    <option key={subcategoria.id_subcategoria} value={subcategoria.id_subcategoria}>
                                        {subcategoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="marca_id" className={`block text-sm font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Marca (Opcional)</label>
                            <select
                                id="marca_id"
                                name="marca_id"
                                value={tempInputs.marca_id || ''}
                                onChange={(e) => handleInputChange('marca_id', e.target.value)}
                                className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400' 
                                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
                                }`}
                            >
                                <option value="">Sin marca (opcional)</option>
                                {marcasAll?.map(marca => (
                                    <option key={marca.id_marca} value={marca.id_marca}>
                                        {marca.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="pais" className={`block text-sm font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>País (Opcional)</label>
                            <select
                                id="pais"
                                name="pais"
                                value={tempInputs.pais || ''}
                                onChange={(e) => handleInputChange('pais', e.target.value)}
                                className={`mt-1 block w-full rounded-md shadow-sm transition-colors duration-200 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400' 
                                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
                                }`}
                            >
                                <option value="">Sin país (opcional)</option>
                                {countryOptions?.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={updateProductCategory}
                            className={`px-4 py-2 rounded transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => toggleEditMode('categoria')}
                            className={`px-4 py-2 rounded transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                    : 'bg-gray-500 text-white hover:bg-gray-600'
                            }`}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className={`rounded-lg shadow p-4 transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Información de Categorización</h3>
                        <button
                            onClick={() => toggleEditMode('categoria')}
                            className={`transition-colors duration-200 ${
                                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                            }`}
                        >
                            Editar
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className={`text-sm font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Categoría</p>
                            <p className={`mt-1 transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>{categoriaCurrent?.nombre_categoria || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className={`text-sm font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Subcategoría</p>
                            <p className={`mt-1 transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>{subcategoriaCurrent?.nombre || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className={`text-sm font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Marca</p>
                            <p className={`mt-1 transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>{productData.marca?.nombre || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className={`text-sm font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>País</p>
                            <p className={`mt-1 transition-colors duration-200 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>{productData.pais || 'No especificado'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCategoryEdit;