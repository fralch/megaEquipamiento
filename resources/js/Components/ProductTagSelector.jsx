import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../storage/ThemeContext';

const ProductTagSelector = ({ producto, tags, tagParents, onClose, onSave }) => {
    const { isDarkMode } = useTheme();
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState('');

    useEffect(() => {
        // Initialize selected tags from product
        if (producto.tags) {
            setSelectedTags(producto.tags.map(tag => tag.id_tag));
        }
    }, [producto]);

    const handleTagToggle = (tagId) => {
        setSelectedTags(prev => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/productos/${producto.id_producto}/tags/sync`, {
                tag_ids: selectedTags
            });

            onSave(response.data.producto);
        } catch (error) {
            console.error('Error saving tags:', error);
            alert('Error al guardar los tags');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTags = () => {
        let filteredTags = tags;

        // Filter by search term
        if (searchTerm) {
            filteredTags = filteredTags.filter(tag => 
                tag.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by sector
        if (selectedSector) {
            if (selectedSector === 'independientes') {
                filteredTags = filteredTags.filter(tag => !tag.id_tag_parent);
            } else {
                filteredTags = filteredTags.filter(tag => tag.id_tag_parent == selectedSector);
            }
        }

        return filteredTags;
    };

    const getTagsByParent = () => {
        const tagsByParent = {};
        const independentTags = [];

        getFilteredTags().forEach(tag => {
            if (tag.id_tag_parent) {
                const parent = tagParents.find(p => p.id_tag_parent === tag.id_tag_parent);
                if (parent) {
                    if (!tagsByParent[parent.id_tag_parent]) {
                        tagsByParent[parent.id_tag_parent] = {
                            parent: parent,
                            tags: []
                        };
                    }
                    tagsByParent[parent.id_tag_parent].tags.push(tag);
                }
            } else {
                independentTags.push(tag);
            }
        });

        return { tagsByParent, independentTags };
    };

    const { tagsByParent, independentTags } = getTagsByParent();

    const getTagColor = (tag) => {
        if (tag.tag_parent?.color) {
            return tag.tag_parent.color;
        }
        return tag.color || '#3B82F6';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold">Gestionar Tags</h3>
                        <p className="text-sm opacity-75">
                            Producto: {producto.nombre} ({producto.sku})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`px-3 py-1 rounded ${
                            isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'
                        } text-white`}
                    >
                        ✕
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Buscar Tags
                        </label>
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Filtrar por Sector
                        </label>
                        <select
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <option value="">Todos los sectores</option>
                            {tagParents.map(parent => (
                                <option key={parent.id_tag_parent} value={parent.id_tag_parent}>
                                    {parent.nombre}
                                </option>
                            ))}
                            <option value="independientes">Tags Independientes</option>
                        </select>
                    </div>
                </div>

                {/* Selected Tags Summary */}
                <div className="mb-6">
                    <h4 className="text-lg font-medium mb-2">Tags Seleccionados ({selectedTags.length})</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.length > 0 ? (
                            selectedTags.map(tagId => {
                                const tag = tags.find(t => t.id_tag === tagId);
                                if (!tag) return null;
                                return (
                                    <span
                                        key={tagId}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                                        style={{ backgroundColor: getTagColor(tag) }}
                                    >
                                        {tag.nombre}
                                        <button
                                            onClick={() => handleTagToggle(tagId)}
                                            className="ml-2 hover:bg-black hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-gray-500 italic">No hay tags seleccionados</span>
                        )}
                    </div>
                </div>

                {/* Tags by Sector */}
                <div className="space-y-6 mb-6">
                    {/* Tags by Parent */}
                    {Object.values(tagsByParent).map(({ parent, tags: parentTags }) => (
                        <div key={parent.id_tag_parent}>
                            <h4 className="text-lg font-medium mb-3 flex items-center">
                                <span
                                    className="inline-block w-4 h-4 rounded-full mr-2"
                                    style={{ backgroundColor: parent.color || '#3B82F6' }}
                                ></span>
                                {parent.nombre} ({parentTags.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {parentTags.map(tag => (
                                    <label
                                        key={tag.id_tag}
                                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedTags.includes(tag.id_tag)
                                                ? (isDarkMode ? 'border-blue-400 bg-blue-900' : 'border-blue-500 bg-blue-50')
                                                : (isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300')
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTags.includes(tag.id_tag)}
                                            onChange={() => handleTagToggle(tag.id_tag)}
                                            className="mr-2"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{tag.nombre}</div>
                                            <div
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white mt-1"
                                                style={{ backgroundColor: tag.color || parent.color || '#3B82F6' }}
                                            >
                                                Preview
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Independent Tags */}
                    {independentTags.length > 0 && (
                        <div>
                            <h4 className="text-lg font-medium mb-3">
                                Tags Independientes ({independentTags.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {independentTags.map(tag => (
                                    <label
                                        key={tag.id_tag}
                                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedTags.includes(tag.id_tag)
                                                ? (isDarkMode ? 'border-blue-400 bg-blue-900' : 'border-blue-500 bg-blue-50')
                                                : (isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300')
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTags.includes(tag.id_tag)}
                                            onChange={() => handleTagToggle(tag.id_tag)}
                                            className="mr-2"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{tag.nombre}</div>
                                            <div
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white mt-1"
                                                style={{ backgroundColor: tag.color || '#3B82F6' }}
                                            >
                                                Preview
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            isDarkMode
                                ? 'bg-gray-600 hover:bg-gray-700'
                                : 'bg-gray-500 hover:bg-gray-600'
                        } text-white`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800'
                                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300'
                        } text-white disabled:cursor-not-allowed`}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductTagSelector;