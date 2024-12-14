import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Carrusel = () => {
    return (
        <div className="w-full p-4">
            <Swiper
                modules={[Navigation, Pagination, A11y]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 }, // Mostrar 4 diapositivas en pantallas muy grandes
                }}
                className="bg-blue-50"
            >
                <SwiperSlide>
                    <div
                        className="relative bg-cover bg-center text-white rounded-lg shadow-lg overflow-hidden min-h-[400px]"
                        style={{
                            backgroundImage:
                                "url('https://megaequipamiento.com/wp-content/uploads/2023/09/MANUFACTURA-GIF-OF.gif')", // Reemplaza esta URL con la de tu imagen de fondo
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="relative p-10">
                            <h2 className="text-4xl font-bold text-center mb-6">
                                Manufactura
                            </h2> 
                            <ul className="space-y-4 text-xl">
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    
                                    Textil
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Quimica
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Papelería
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Pintura
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Metalurgia
                                </li>
                            </ul>
                            <div className="text-center mt-6">
                                <button className="bg-[#0c2249] text-white px-6 py-3 rounded-full hover:bg-blue-700">
                                    Ver productos
                                </button>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div
                        className="relative bg-cover bg-center text-white rounded-lg shadow-lg overflow-hidden min-h-[400px]"
                        style={{
                            backgroundImage:
                                "url('https://megaequipamiento.com/wp-content/uploads/2023/09/EXTRACCION-GIF-OF.gif')", // Reemplaza esta URL con la de tu imagen de fondo
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="relative p-10">
                            <h2 className="text-4xl font-bold text-center mb-6">
                                Extracción
                            </h2>
                            <ul className="space-y-4 text-xl">
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    
                                    Gas Natural
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Petróleo
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Mineria
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Pesca
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Agua
                                </li>
                            </ul>
                            <div className="text-center mt-6">
                                <button className="bg-[#0c2249] text-white px-6 py-3 rounded-full hover:bg-blue-700">
                                    Ver productos
                                </button>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div
                        className="relative bg-cover bg-center text-white rounded-lg shadow-lg overflow-hidden min-h-[400px]"
                        style={{
                            backgroundImage:
                                "url('https://megaequipamiento.com/wp-content/uploads/2023/09/EDUCACION-GIF-OF.gif')", // Reemplaza esta URL con la de tu imagen de fondo
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="relative p-10">
                            <h2 className="text-4xl font-bold text-center mb-6">
                                Educación
                            </h2>
                            <ul className="space-y-4 text-xl">
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Universidades
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Institutos
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Colegios
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Escuelas
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Centros de investigación
                                </li>
                            </ul>
                            <div className="text-center mt-6">
                                <button className="bg-[#0c2249] text-white px-6 py-3 rounded-full hover:bg-blue-700">
                                    Ver productos
                                </button>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div
                        className="relative bg-cover bg-center text-white rounded-lg shadow-lg overflow-hidden min-h-[400px]"
                        style={{
                            backgroundImage:
                                "url('https://megaequipamiento.com/wp-content/uploads/2023/09/ALIMENTOS-GIF-OF.gif')", // Reemplaza esta URL con la de tu imagen de fondo
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="relative p-10">
                            <h2 className="text-4xl font-bold text-center mb-6">
                                Ind. Alimentaria
                            </h2>
                            <ul className="space-y-4 text-xl">
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Lacteos
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Cárnicos
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Aceites
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Agroindustria
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Haria y derivados
                                </li>
                            </ul>
                            <div className="text-center mt-6">
                                <button className="bg-[#0c2249] text-white px-6 py-3 rounded-full hover:bg-blue-700">
                                    Ver productos
                                </button>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div
                        className="relative bg-cover bg-center text-white rounded-lg shadow-lg overflow-hidden min-h-[400px]"
                        style={{
                            backgroundImage:
                                "url('https://megaequipamiento.com/wp-content/uploads/2023/09/SALUD-GIF-OF.gif')", // Reemplaza esta URL con la de tu imagen de fondo
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="relative p-10">
                            <h2 className="text-4xl font-bold text-center mb-6">
                                Sector Salud
                            </h2>
                            <ul className="space-y-4 text-xl">
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Hospitales
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Clínicas
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Centros Médicos
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Ocupacionales
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Dentales
                                </li>
                            </ul>
                            <div className="text-center mt-6">
                                <button className="bg-[#0c2249] text-white px-6 py-3 rounded-full hover:bg-blue-700">
                                    Ver productos
                                </button>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div
                        className="relative bg-cover bg-center text-white rounded-lg shadow-lg overflow-hidden min-h-[400px]"
                        style={{
                            backgroundImage:
                                "url('https://megaequipamiento.com/wp-content/uploads/2023/09/FARMACIA-GIF-OF.gif')", // Reemplaza esta URL con la de tu imagen de fondo
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="relative p-10">
                            <h2 className="text-4xl font-bold text-center mb-6">
                                Farmacéutica
                            </h2>
                            <ul className="space-y-4 text-xl">
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Perfumerias
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Cosméticos
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Joyas
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Vacunas
                                </li>
                                <li className="flex items-center">
                                    <svg
                                        className="w-6 h-6 text-green-500 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 110-20 10 10 0 010 20zm-1-13a1 1 0 112 0v6a1 1 0 11-2 0V7zm0 10a1 1 0 112 0v-4a1 1 0 11-2 0v4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Encapsulados
                                </li>
                            </ul>
                            <div className="text-center mt-6">
                                <button className="bg-[#0c2249] text-white px-6 py-3 rounded-full hover:bg-blue-700">
                                    Ver productos
                                </button>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
               

               

                {/* Añade más SwiperSlide según sea necesario */}
            </Swiper>
        </div>
    );
};

export default Carrusel;
