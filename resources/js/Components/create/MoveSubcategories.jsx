import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../../storage/ThemeContext';

const MoveSubcategories = () => {
    const { isDarkMode } = useTheme();
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [categoriaOrigen, setCategoriaOrigen] = useState('');
    const [categoriaDestino, setCategoriaDestino] = useState('');
    const [subcategoriasSeleccionadas, setSubcategoriasSeleccionadas] = useState(new Set());
    const [draggedItem, setDraggedItem] = useState(null);
    const [seleccionandoTodo, setSeleccionandoTodo] = useState(false);

    // Paleta mejorada para modo oscuro
    const darkColors = {
        bg: 'bg-slate-900',
        container: 'bg-slate-800',
        containerHover: 'hover:bg-slate-700',
        border: 'border-slate-700',
        text: 'text-slate-100',
        textSecondary: 'text-slate-400',
        accent: 'text-blue-400',
        success: 'text-green-400',
        inputBg: 'bg-slate-700',
        inputBorder: 'border-slate-600',
        inputFocus: 'focus:border-blue-500',
        cardBg: 'bg-slate-800/90',
        cardBorder: 'border-slate-600/50',
        shadow: 'shadow-xl shadow-black/20',
        button: 'bg-blue-600 hover:bg-blue-700',
        selected: 'bg-blue-900/30 border-blue-500',
        dropZone: 'border-dashed border-slate-500 bg-slate-800/50'
    };

    const lightColors = {
        bg: 'bg-gray-50',
        container: 'bg-white',
        containerHover: 'hover:bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        accent: 'text-blue-600',
        success: 'text-green-600',
        inputBg: 'bg-white',
        inputBorder: 'border-gray-300',
        inputFocus: 'focus:border-blue-500',
        cardBg: 'bg-white',
        cardBorder: 'border-gray-200',
        shadow: 'shadow-lg shadow-gray-200/50',
        button: 'bg-blue-600 hover:bg-blue-700',
        selected: 'bg-blue-50 border-blue-500',
        dropZone: 'border-dashed border-gray-300 bg-gray-50'
    };

    const colors = isDarkMode ? darkColors : lightColors;

    useEffect(() => {
        axios.get('/categorias-all')
            .then(response => {
                setCategorias(response.data);
            })
            .catch(error => {
                console.error('Error al obtener las categorías:', error);
            });
    }, []);

    useEffect(() => {
        if (categoriaOrigen) {
            axios.get(`/categoria/${categoriaOrigen}/subcategorias`)
                .then(response => {
                    setSubcategorias(response.data);
                    setSubcategoriasSeleccionadas(new Set());
                })
                .catch(error => {
                    console.error('Error al obtener las subcategorías:', error);
                });
        } else {
            setSubcategorias([]);
            setSubcategoriasSeleccionadas(new Set());
        }
    }, [categoriaOrigen]);

    const handleMoverSubcategorias = () => {
        axios.post('/subcategorias/mover', {
            subcategorias: Array.from(subcategoriasSeleccionadas),
            categoria_destino_id: categoriaDestino
        })
        .then(response => {
            console.log('Subcategorías movidas con éxito:', response.data);
            axios.get(`/categoria/${categoriaOrigen}/subcategorias`)
                .then(response => {
                    setSubcategorias(response.data);
                    setSubcategoriasSeleccionadas(new Set());
                })
                .catch(error => {
                    console.error('Error al refrescar las subcategorías:', error);
                });
        })
        .catch(error => {
            console.error('Error al mover las subcategorías:', error);
        });
    };

    const handleSubcategoriaChange = (subcategoriaId) => {
        setSubcategoriasSeleccionadas(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subcategoriaId)) {
                newSet.delete(subcategoriaId);
            } else {
                newSet.add(subcategoriaId);
            }
            return newSet;
        });
    };

    const handleSeleccionarTodo = () => {
        if (subcategoriasSeleccionadas.size === subcategorias.length) {
            setSubcategoriasSeleccionadas(new Set());
            setSeleccionandoTodo(false);
        } else {
            const todosLosIds = subcategorias.map(sub => sub.id_subcategoria);
            setSubcategoriasSeleccionadas(new Set(todosLosIds));
            setSeleccionandoTodo(true);
        }
    };

    useEffect(() => {
        setSeleccionandoTodo(subcategoriasSeleccionadas.size === subcategorias.length && subcategorias.length > 0);
    }, [subcategoriasSeleccionadas, subcategorias]);

    const handleDragStart = (e, subcategoria) => {
        setDraggedItem(subcategoria);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (draggedItem && categoriaDestino) {
            const newSelected = new Set(subcategoriasSeleccionadas);
            newSelected.add(draggedItem.id_subcategoria);
            setSubcategoriasSeleccionadas(newSelected);
        }
        setDraggedItem(null);
    };

    const selectedCategoriaOrigen = categorias.find(cat => cat.id_categoria.toString() === categoriaOrigen);
    const selectedCategoriaDestino = categorias.find(cat => cat.id_categoria.toString() === categoriaDestino);

    return (
        <div className={`min-h-screen p-6 ${colors.bg} transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto">
                {/* Header mejorado */}
                <div className="text-center mb-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-4xl font-bold mb-3 ${colors.text}`}
                    >
                        Mover Subcategorías
                    </motion.h1>
                    <p className={`text-lg ${colors.textSecondary}`}>
                        Gestiona tus subcategorías de forma intuitiva y visual
                    </p>
                </div>

                {/* Selectores de categorías con mejor diseño */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                    {[{
                        label: 'Categoría Origen',
                        icon: 'bg-blue-500',
                        color: 'blue',
                        value: categoriaOrigen,
                        setter: setCategoriaOrigen,
                        selected: selectedCategoriaOrigen
                    }, {
                        label: 'Categoría Destino',
                        icon: 'bg-green-500',
                        color: 'green',
                        value: categoriaDestino,
                        setter: setCategoriaDestino,
                        selected: selectedCategoriaDestino
                    }].map((selector, idx) => (
                        <div key={idx} className={`${colors.cardBg} ${colors.shadow} rounded-xl border ${colors.border} overflow-hidden`}>
                            <div className="p-5">
                                <label className={`block text-lg font-semibold mb-3 ${colors.text}`}>
                                    <span className="flex items-center">
                                        <span className={`w-3 h-3 ${selector.icon} rounded-full mr-3`}></span>
                                        {selector.label}
                                    </span>
                                </label>
                                <select 
                                    value={selector.value} 
                                    onChange={e => selector.setter(e.target.value)}
                                    className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${colors.inputBg} ${colors.border} ${colors.text} ${colors.inputFocus} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-blue-500/50' : 'focus:ring-blue-500/20'}`}
                                >
                                    <option value="" className={isDarkMode ? 'bg-slate-700' : 'bg-white'}>
                                        Seleccione una categoría
                                    </option>
                                    {categorias.map(categoria => (
                                        <option key={categoria.id_categoria} value={categoria.id_categoria} 
                                            className={isDarkMode ? 'bg-slate-700' : 'bg-white'}
                                        >
                                            {categoria.nombre}
                                        </option>
                                    ))}
                                </select>
                                {selector.selected && (
                                    <p className={`text-sm mt-2 ${colors.textSecondary}`}>
                                        {selector.label === 'Categoría Origen' ? 'Contiene' : 'Recibirá'}: 
                                        <span className="font-medium"> {selector.selected.nombre}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Contenido principal con animaciones mejoradas */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Columna izquierda - Subcategorías */}
                    <motion.div 
                        layout
                        className={`${colors.cardBg} ${colors.shadow} rounded-xl border ${colors.border} overflow-hidden`}
                    >
                        <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-blue-500 to-blue-600'} p-5`}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    Subcategorías Disponibles
                                </h3>
                                {subcategorias.length > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSeleccionarTodo}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                            seleccionandoTodo
                                                ? 'bg-white/20 text-white hover:bg-white/30'
                                                : 'bg-white/90 text-blue-600 hover:bg-white'
                                        }`}
                                    >
                                        {seleccionandoTodo ? 'Deseleccionar' : 'Seleccionar'} todo
                                    </motion.button>
                                )}
                            </div>
                            {selectedCategoriaOrigen && (
                                <p className="text-blue-100 mt-1 text-sm">
                                    {subcategorias.length} subcategoría{subcategorias.length !== 1 ? 's' : ''} disponible{subcategorias.length !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                        
                        <div className="p-5 max-h-96 overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {subcategorias.length === 0 && categoriaOrigen ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="text-center py-12"
                                    >
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} flex items-center justify-center`}>
                                            <svg className={`w-8 h-8 ${colors.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <p className={`font-medium ${colors.text}`}>Sin subcategorías</p>
                                        <p className={`text-sm mt-1 ${colors.textSecondary}`}>Esta categoría está vacía</p>
                                    </motion.div>
                                ) : !categoriaOrigen ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="text-center py-12"
                                    >
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} flex items-center justify-center`}>
                                            <svg className={`w-8 h-8 ${colors.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <p className={`font-medium ${colors.text}`}>Selecciona una categoría</p>
                                        <p className={`text-sm mt-1 ${colors.textSecondary}`}>Para ver las subcategorías disponibles</p>
                                    </motion.div>
                                ) : (
                                    <motion.div layout>
                                        {subcategoriasSeleccionadas.size > 0 && (
                                            <div className={`mb-4 text-sm ${colors.textSecondary} font-medium`}>
                                                {subcategoriasSeleccionadas.size} de {subcategorias.length} seleccionada{subcategoriasSeleccionadas.size !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                        {subcategorias.map((subcategoria) => (
                                            <motion.div
                                                key={subcategoria.id_subcategoria}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                whileHover={{ scale: 1.02 }}
                                                className={`p-4 mb-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${colors.containerHover} ${
                                                    subcategoriasSeleccionadas.has(subcategoria.id_subcategoria)
                                                        ? colors.selected
                                                        : colors.border
                                                }`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, subcategoria)}
                                                onClick={() => handleSubcategoriaChange(subcategoria.id_subcategoria)}
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={subcategoriasSeleccionadas.has(subcategoria.id_subcategoria)}
                                                        onChange={() => {}}
                                                        className={`w-4 h-4 mr-3 rounded transition-all ${colors.inputBg} ${colors.border} ${colors.inputFocus}`}
                                                    />
                                                    <span className={`flex-1 font-medium ${colors.text}`}>
                                                        {subcategoria.nombre}
                                                    </span>
                                                    <svg className={`w-4 h-4 cursor-grab ${colors.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Columna derecha - Zona de destino */}
                    <motion.div 
                        layout
                        className={`${colors.cardBg} ${colors.shadow} rounded-xl border ${colors.border} overflow-hidden`}
                    >
                        <div className={`${isDarkMode ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-green-500 to-green-600'} p-5`}>
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                Zona de Destino
                            </h3>
                            {selectedCategoriaDestino && (
                                <p className="text-green-100 mt-1 text-sm">
                                    Destino: {selectedCategoriaDestino.nombre}
                                </p>
                            )}
                        </div>

                        <div
                            className={`p-5 min-h-96 border-4 border-dashed transition-all duration-300 ${
                                categoriaDestino 
                                    ? `${colors.dropZone} ${isDarkMode ? 'border-green-500/30 bg-green-900/10' : 'border-green-300 bg-green-50'}` 
                                    : colors.dropZone
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <AnimatePresence mode="wait">
                                {!categoriaDestino ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="text-center py-16"
                                    >
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} flex items-center justify-center`}>
                                            <svg className={`w-8 h-8 ${colors.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                            </svg>
                                        </div>
                                        <p className={`font-medium ${colors.text}`}>Esperando destino</p>
                                        <p className={`text-sm mt-1 ${colors.textSecondary}`}>Selecciona una categoría destino</p>
                                    </motion.div>
                                ) : subcategoriasSeleccionadas.size === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`text-center py-16 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                                    >
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} flex items-center justify-center`}>
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                            </svg>
                                        </div>
                                        <p className="font-medium">Listo para recibir</p>
                                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-500' : 'text-green-500'}`}>Arrastra o selecciona elementos</p>
                                    </motion.div>
                                ) : (
                                    <motion.div layout>
                                        <motion.div layout className="flex items-center justify-between mb-4">
                                            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                                                Subcategorías seleccionadas
                                            </h4>
                                            <motion.span 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}
                                            >
                                                {subcategoriasSeleccionadas.size}
                                            </motion.span>
                                        </motion.div>
                                        {subcategorias
                                            .filter(sub => subcategoriasSeleccionadas.has(sub.id_subcategoria))
                                            .map((subcategoria) => (
                                                <motion.div
                                                    key={subcategoria.id_subcategoria}
                                                    layout
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className={`flex items-center justify-between p-4 mb-3 rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'} shadow-sm`}
                                                >
                                                    <div className="flex items-center">
                                                        <span className={`w-2 h-2 rounded-full mr-3 ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`}></span>
                                                        <span className={`font-medium ${colors.text}`}>
                                                            {subcategoria.nombre}
                                                        </span>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleSubcategoriaChange(subcategoria.id_subcategoria)}
                                                        className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </motion.button>
                                                </motion.div>
                                            ))
                                        }
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Botón de acción mejorado */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 text-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMoverSubcategorias}
                        disabled={!categoriaOrigen || !categoriaDestino || subcategoriasSeleccionadas.size === 0}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                            !categoriaOrigen || !categoriaDestino || subcategoriasSeleccionadas.size === 0
                                ? `${isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                                : `${colors.button} text-white shadow-lg hover:shadow-xl`
                        }`}
                    >
                        <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Mover Subcategorías
                            {subcategoriasSeleccionadas.size > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm"
                                >
                                    {subcategoriasSeleccionadas.size}
                                </motion.span>
                            )}
                        </span>
                    </motion.button>
                    
                    <AnimatePresence>
                        {categoriaOrigen && categoriaDestino && subcategoriasSeleccionadas.size > 0 && (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`text-sm mt-3 ${colors.textSecondary}`}
                            >
                                Moviendo {subcategoriasSeleccionadas.size} subcategoría{subcategoriasSeleccionadas.size > 1 ? 's' : ''} 
                                {' '}de <span className={`font-semibold ${colors.accent}`}>{selectedCategoriaOrigen?.nombre}</span>
                                {' '}a <span className={`font-semibold ${colors.success}`}>{selectedCategoriaDestino?.nombre}</span>
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default MoveSubcategories;