import React from 'react';

const ProductCategoryEdit = ({
    categorias,
    subcategorias,
    marcas,
    countryOptions,
    productData,
    editMode,
    tempInputs,
    handleInputChange,
    handleSave,
    toggleEditMode
}) => {
    return (
        <div className="p-4">
            {editMode.categoria ? (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select
                                id="id_categoria"
                                name="id_categoria"
                                value={tempInputs.id_categoria || ''}
                                onChange={(e) => handleInputChange('id_categoria', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias?.map(categoria => (
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
                                {subcategorias?.map(subcategoria => (
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
                                {marcas?.map(marca => (
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
                            onClick={() => handleSave('categoria')}
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
                            <p className="mt-1">{productData.categoria?.nombre || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Subcategoría</p>
                            <p className="mt-1">{productData.subcategoria?.nombre || 'No especificado'}</p>
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