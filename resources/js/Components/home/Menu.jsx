// Menu.jsx
import React, { useState } from "react";
import { mdiChevronDown, mdiGauge, mdiLayersOutline, mdiWidgetsOutline, mdiPlus } from "@mdi/js";
import { Link, usePage } from "@inertiajs/react";
import { useTheme } from '../../storage/ThemeContext';
import { useCurrency } from '../../storage/CurrencyContext';
import { useCompare } from '../../hooks/useCompare';
import CompareModal from '../compare/CompareModal';

const Menu = ({ toggleMenu }) => {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();
    const { changeCurrency } = useCurrency();
    const { compareCount } = useCompare();
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const openCompareModal = () => {
        setIsCompareModalOpen(true);
    };

    const closeCompareModal = () => {
        setIsCompareModalOpen(false);
    };

    return (
        <div className={`rounded px-5 py-3 shadow-xl pb-5 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`} id="menu">
            <div className="-mx-1 flex flex-col md:flex-row items-center justify-between">
                <ul className="flex flex-col md:flex-row h-10 w-full flex-wrap items-center">
                    <li className="relative block w-full md:w-auto mb-2 md:mb-0">
                        <a
                            href="#"
                            className="mx-1 flex h-12 md:h-10 cursor-pointer items-center justify-center md:justify-start rounded bg-[#1e3a8a] px-6 md:px-4 leading-10 text-white no-underline transition-colors duration-100 hover:no-underline text-lg md:text-base"
                            onClick={toggleMenu}
                            id="category-button"
                        >
                            <span className="mr-3 text-2xl md:text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 md:w-5 md:h-5 fill-white" >
                                    <path d={mdiLayersOutline} />
                                </svg>
                            </span>
                            <span className="font-medium">Categorias</span>
                            <span className="ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 md:w-5 md:h-5  fill-white">
                                    <path d={mdiChevronDown} />
                                </svg>
                            </span>
                        </a>
                    </li>
                    <li className="relative hidden md:block w-full md:w-auto mb-2 md:mb-0 mt-2 md:mt-0">
                        <a
                            href="/"
                            className={`mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:no-underline ${
                                isDarkMode 
                                    ? 'text-gray-200 hover:bg-gray-700' 
                                    : 'text-black hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-3 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d={mdiGauge} />
                                </svg>
                            </span>
                            <span>Inicio</span>
                            <span className="ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d={mdiChevronDown} />
                                </svg>
                            </span>
                        </a>
                    </li>
                    {auth.user && auth.user.nombre_usuario === 'Admin' && (
                        <li className="relative hidden md:block w-full md:w-auto mb-2 md:mb-0">
                            <Link
                                href="/crear"
                                className={`mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:no-underline ${
                                    isDarkMode 
                                        ? 'text-gray-200 hover:bg-gray-700' 
                                        : 'text-black hover:bg-gray-100'
                                }`}
                            >
                                <span className="mr-3 text-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d={mdiPlus} />
                                    </svg>
                                </span>
                                <span>Crear</span>
                            </Link>
                        </li>
                    )}
                    {auth.user && (
                        <li className="relative hidden md:block w-full md:w-auto mb-2 md:mb-0">
                            <Link
                                href="/crm"
                                className={`mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:no-underline ${
                                    isDarkMode 
                                        ? 'text-gray-200 hover:bg-gray-700' 
                                        : 'text-black hover:bg-gray-100'
                                }`}
                            >
                                <span className="mr-3 text-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path d={mdiPlus} />
                                    </svg>
                                </span>
                                <span>CRM</span>
                            </Link>
                        </li>
                    )}
                    <li className="relative hidden md:block w-full md:w-auto mb-2 md:mb-0">
                        <a
                            href="/productos-externos"
                            className={`mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:no-underline ${
                                isDarkMode 
                                    ? 'text-gray-200 hover:bg-gray-700' 
                                    : 'text-black hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-3 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d={mdiWidgetsOutline} />
                                </svg>
                            </span>
                            <span>Productos Externos</span>
                        </a>
                    </li>
                    <li className="relative hidden md:block w-full md:w-auto mb-2 md:mb-0">
                        <a
                            href="/contacto"
                            className={`mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:no-underline ${
                                isDarkMode 
                                    ? 'text-gray-200 hover:bg-gray-700' 
                                    : 'text-black hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-3 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d={mdiWidgetsOutline} />
                                </svg>
                            </span>
                            <span>Contactenos</span>
                        </a>
                    </li>
                    
                </ul>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto mt-5 md:mt-0">
                    {/* Redes Sociales */}
                    <div className="hidden md:flex items-center gap-3" id="redes-sociales">
                        {/* Facebook */}
                        <a 
                            href="https://www.facebook.com/megaequipamiento.equimlab" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="hover:scale-110 transition-transform duration-200"
                        >
                            <svg 
                                viewBox="0 0 512 512" 
                                width={"20px"} 
                                height={"20px"} 
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white hover:fill-blue-400' : 'fill-black hover:fill-blue-600'}`}
                            >
                                <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z" />
                            </svg>
                        </a>
                        
                        {/* LinkedIn */}
                        <a 
                            href="https://www.linkedin.com/company/mega-equipamiento-equimlab-s-a-c/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="hover:scale-110 transition-transform duration-200"
                        >
                            <svg 
                                viewBox="0 0 448 512" 
                                width={"20px"} 
                                height={"20px"} 
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white hover:fill-blue-400' : 'fill-black hover:fill-blue-700'}`}
                            >
                                <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                            </svg>
                        </a>
                        
                        {/* YouTube */}
                        <a 
                            href="https://www.youtube.com/@megaequipamiento.oficial" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="YouTube"
                            className="hover:scale-110 transition-transform duration-200"
                        >
                            <svg 
                                viewBox="0 0 576 512" 
                                width={"20px"} 
                                height={"20px"} 
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white hover:fill-red-400' : 'fill-black hover:fill-red-600'}`}
                            >
                                <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
                            </svg>
                        </a>
                        
                        {/* Email */}
                        <a 
                            href="mailto:ventas@megaequipamiento.com" 
                            target="_blank"
                            aria-label="Contactanos por correo"
                            className="hover:scale-110 transition-transform duration-200"
                        >
                            <svg 
                                viewBox="0 0 512 512" 
                                width={"20px"} 
                                height={"20px"} 
                                className={`transition-colors duration-200 ${isDarkMode ? 'fill-white hover:fill-gray-400' : 'fill-black hover:fill-gray-600'}`}
                            >
                                <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L322.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                            </svg>
                        </a>
                    </div>
                    <div className="w-full md:w-28 xl:w-32">
                        <select
                            name="moneda"
                            id="moneda"
                            onChange={(e) => changeCurrency(e.target.value)}
                            className={`text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors duration-200 ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="dollar">Dolares</option>
                            <option value="sol">Soles</option>
                            <option value="euro">Euros</option>
                        </select>
                    </div>
                    
                    
                    
                    <button
                        onClick={openCompareModal}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border w-full md:w-auto transition-colors duration-200 hover:scale-105 relative ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}
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
                            className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                            <path d="M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                            <path d="M11 6h5a2 2 0 0 1 2 2v8" />
                            <path d="M14 9l-3 -3l3 -3" />
                            <path d="M13 18h-5a2 2 0 0 1 -2 -2v-8" />
                            <path d="M10 15l3 3l-3 3" />
                        </svg>
                        <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>Comparador</span>
                        {compareCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {compareCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Modal de Comparación */}
            <CompareModal 
                isOpen={isCompareModalOpen} 
                onClose={closeCompareModal} 
            />
        </div>
    );
};

export default Menu;
