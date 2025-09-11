import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from '../storage/ThemeContext';

const TagInput = ({ 
    selectedTags = [], 
    onChange, 
    placeholder = "Buscar y seleccionar tags...",
    maxTags = null,
    className = ""
}) => {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [tagParents, setTagParents] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        loadTags();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadTags = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/tags');
            setAvailableTags(response.data.tags || []);
            setTagParents(response.data.tagParents || []);
        } catch (error) {
            console.error('Error loading tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTags = () => {
        return availableTags.filter(tag => {
            const matchesSearch = !searchTerm || 
                tag.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const notSelected = !selectedTags.some(selected => selected.id_tag === tag.id_tag);
            return matchesSearch && notSelected;
        });
    };

    const handleTagSelect = (tag) => {
        if (maxTags && selectedTags.length >= maxTags) {
            return;
        }

        const newSelectedTags = [...selectedTags, tag];
        onChange(newSelectedTags);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleTagRemove = (tagToRemove) => {
        const newSelectedTags = selectedTags.filter(tag => tag.id_tag !== tagToRemove.id_tag);
        onChange(newSelectedTags);
    };

    const getTagColor = (tag) => {
        if (tag.tag_parent?.color) {
            return tag.tag_parent.color;
        }
        return tag.color || '#3B82F6';
    };

    const getTagsByParent = () => {
        const filteredTags = getFilteredTags();
        const tagsByParent = {};
        const independentTags = [];

        filteredTags.forEach(tag => {
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

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                        <span
                            key={tag.id_tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getTagColor(tag) }}
                        >
                            {tag.nombre}
                            <button
                                type="button"
                                onClick={() => handleTagRemove(tag)}
                                className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                    } ${maxTags && selectedTags.length >= maxTags ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={maxTags && selectedTags.length >= maxTags}
                />
                
                {maxTags && (
                    <div className="absolute right-2 top-2 text-xs text-gray-500">
                        {selectedTags.length}/{maxTags}
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && !loading && (
                <div className={`absolute z-50 w-full mt-1 max-h-64 overflow-y-auto rounded-lg border shadow-lg ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                    {Object.keys(tagsByParent).length === 0 && independentTags.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                            {searchTerm ? 'No se encontraron tags' : 'No hay tags disponibles'}
                        </div>
                    ) : (
                        <>
                            {/* Tags by Parent */}
                            {Object.values(tagsByParent).map(({ parent, tags }) => (
                                <div key={parent.id_tag_parent}>
                                    <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider sticky top-0 ${
                                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        <span
                                            className="inline-block w-2 h-2 rounded-full mr-2"
                                            style={{ backgroundColor: parent.color || '#3B82F6' }}
                                        ></span>
                                        {parent.nombre}
                                    </div>
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id_tag}
                                            type="button"
                                            onClick={() => handleTagSelect(tag)}
                                            className={`w-full px-4 py-2 text-left hover:bg-opacity-10 hover:bg-blue-500 flex items-center justify-between ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}
                                        >
                                            <span>{tag.nombre}</span>
                                            <span
                                                className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                                                style={{ backgroundColor: tag.color || parent.color || '#3B82F6' }}
                                            >
                                                {tag.nombre}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ))}

                            {/* Independent Tags */}
                            {independentTags.length > 0 && (
                                <div>
                                    <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider sticky top-0 ${
                                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        Tags Independientes
                                    </div>
                                    {independentTags.map(tag => (
                                        <button
                                            key={tag.id_tag}
                                            type="button"
                                            onClick={() => handleTagSelect(tag)}
                                            className={`w-full px-4 py-2 text-left hover:bg-opacity-10 hover:bg-blue-500 flex items-center justify-between ${
                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}
                                        >
                                            <span>{tag.nombre}</span>
                                            <span
                                                className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                                                style={{ backgroundColor: tag.color || '#3B82F6' }}
                                            >
                                                {tag.nombre}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {loading && (
                <div className={`absolute z-50 w-full mt-1 px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}>
                    Cargando tags...
                </div>
            )}
        </div>
    );
};

export default TagInput;