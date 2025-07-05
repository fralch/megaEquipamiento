import React from 'react';

const EmptyCart = ({ isDarkMode }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            {/* Contenedor principal con animación sutil */}
            <div className="max-w-md mx-auto text-center">
                {/* Icono animado del carrito vacío */}
                <div className="relative mb-8">
                    <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                    } transition-all duration-300 hover:scale-105`}>
                        <svg 
                            className={`w-16 h-16 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            } transition-colors duration-300`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={1.5} 
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" 
                            />
                        </svg>
                    </div>
                    {/* Líneas decorativas */}
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${
                        isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    } animate-pulse`}></div>
                    <div className={`absolute -bottom-2 -left-2 w-4 h-4 rounded-full ${
                        isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                    } animate-pulse delay-300`}></div>
                </div>

                {/* Título principal */}
                <h2 className={`text-3xl font-bold mb-3 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                } transition-colors duration-300`}>
                    ¡Ups! No encontramos nada
                </h2>

                {/* Subtítulo */}
                <p className={`text-lg mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                } transition-colors duration-300`}>
                    Tu carrito está vacío
                </p>

                {/* Descripción */}
                <p className={`text-sm mb-8 leading-relaxed ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                } transition-colors duration-300`}>
                    Parece que aún no has agregado ningún producto a tu carrito.<br/>
                    ¡Explora nuestro catálogo y encuentra lo que necesitas!
                </p>

                {/* Botones de acción */}
                <div className="space-y-3">
                    <button className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                        isDarkMode 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    }`}>
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Explorar productos
                        </span>
                    </button>
                    
                    <button className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 border-2 ${
                        isDarkMode 
                            ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-gray-200 hover:bg-gray-800/50' 
                            : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50'
                    }`}>
                        Ver categorías
                    </button>
                </div>

                {/* Elementos decorativos adicionales */}
                <div className="mt-12 flex justify-center space-x-8 opacity-60">
                    <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    } animate-bounce`}></div>
                    <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    } animate-bounce delay-100`}></div>
                    <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    } animate-bounce delay-200`}></div>
                </div>
            </div>
        </div>
    );
};

export default EmptyCart;