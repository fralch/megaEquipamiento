import React, { useState, useEffect } from "react";
import axios from 'axios';
import CartIcon from "./CartIcon ";
import { useTheme } from '../../storage/ThemeContext';

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const { isDarkMode, toggleDarkMode } = useTheme();

    // Búsqueda de productos
    const searchProducts = async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/productos/buscar', {
                producto: term
            });

            // Verifica que la respuesta sea un array
            if (Array.isArray(response.data)) {
                setSearchResults(response.data);
            } else {
                console.error('La respuesta no es un array:', response.data);
                setSearchResults([]);
            }

        } catch (error) {
            console.error('Error en la búsqueda:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Manejar clic en un producto
    const handleProductClick = (product) => {
        // Redirigir a la página del producto
        window.location.href = `/producto/${product.id_producto}`;
    };

    // Manejar foco en el input
    const handleFocus = () => {
        if (searchTerm.length >= 2) {
            setShowResults(true);
        }
    };

    // Cerrar resultados al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.search-container')) {
                setShowResults(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <header className={`transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
            <div className="container mx-auto flex items-center px-8 py-8 md:px-12 max-w-full" id="">
                {/* Logo - Modified for larger size */}
                <a href="/" className="mr-auto w-7/12 flex-shrink-0 sm:w-2/12 md:w-1/5 pr-4 ml-10">
                    <img
                        className="w-full object-contain"
                        src="/img/logo2.jpg"
                        alt="EquinLab Logo"
                    />
                </a>

                {/* Input de búsqueda centrado - oculto en móvil */}
                <div className={`hidden sm:flex mx-auto w-full max-w-lg items-center rounded-md xl:max-w-2xl search-container relative ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                    <input
                        className={`w-full border-l bg-transparent py-2 pl-4 text-sm font-semibold ${
                            isDarkMode 
                                ? 'border-gray-600 text-white placeholder-gray-400' 
                                : 'border-gray-300 text-black placeholder-gray-500'
                        }`}
                        type="text"
                        placeholder="Buscar ..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (e.target.value.length >= 2) {
                                setShowResults(true);
                            } else {
                                setShowResults(false);
                            }
                        }}
                        onFocus={handleFocus}
                    />
                    <svg
                        className={`ml-auto h-5 px-4 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="far"
                        data-icon="search"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                    >
                        <path
                            fill="currentColor"
                            d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"
                        ></path>
                    </svg>
                    
                    {/* Resultados de búsqueda */}
                    {showResults && (searchResults.length > 0 || isLoading) && (
                        <div className={`absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            {isLoading ? (
                                <div className={`p-3 text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>Buscando...</div>
                            ) : (
                                searchResults.map(product => (
                                    <div
                                        key={product.id_producto}
                                        className={`p-3 cursor-pointer border-b ${
                                            isDarkMode 
                                                ? 'hover:bg-gray-700 border-gray-700' 
                                                : 'hover:bg-gray-100 border-gray-200'
                                        }`}
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <div className={`font-medium ${
                                            isDarkMode ? 'text-white' : 'text-black'
                                        }`}>{product.nombre}</div>
                                        <div className={`text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            SKU: {product.sku}
                                            {product.marca && (
                                                <span className="ml-2">
                                                    | Marca: {product.marca.nombre}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`text-sm ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            Precio: S/. {product.precio_igv}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Contacto */}
                <div
                    className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52 pl-4 mr-20"
                    id="contactos"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icon-tabler-phone"
                    >
                        <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                        />
                        <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                    </svg>

                    <div className="flex flex-col">
                        <div
                            className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52"
                            id="redes-sociales"
                        >
                            <svg
                                viewBox="0 0 512 512"
                                width={"24px"}
                                height={"24px"}
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white' : 'fill-black'}`}
                            >
                                <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z" />
                            </svg>
                            <svg
                                viewBox="0 0 448 512"
                                width={"26px"}
                                height={"26px"}
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white' : 'fill-black'}`}
                            >
                                <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                            </svg>
                            <svg
                                viewBox="0 0 576 512"
                                width={"26px"}
                                height={"26px"}
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white' : 'fill-black'}`}
                            >
                                <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
                            </svg>
                            <svg
                                viewBox="0 0 512 512"
                                width={"26px"}
                                height={"26px"}
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white' : 'fill-black'}`}
                            >
                                <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L322.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                            </svg>
                            <svg
                                viewBox="0 0 512 512"
                                width={"26px"}
                                height={"26px"}
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white' : 'fill-black'}`}
                            >
                                <path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Botón de toggle modo oscuro */}
                <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg transition-colors duration-200 mr-4 ${
                        isDarkMode 
                            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                    {isDarkMode ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                    )}
                </button>

                <CartIcon />
            </div>
        </header>
    );
};

export default Header;