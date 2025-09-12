import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";

const Carrusel = () => {
    const [tagParents, setTagParents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTagParents = async () => {
            try {
                const response = await axios.get('/api/tag-parents');
                setTagParents(response.data);
            } catch (error) {
                console.error('Error loading tag parents:', error);
                // Keep the hardcoded data as fallback
                setTagParents(getHardcodedSectors());
            } finally {
                setLoading(false);
            }
        };

        loadTagParents();
    }, []);

    const getHardcodedSectors = () => [
        {
            id_tag_parent: 1,
            nombre: "Manufactura",
            color: "#1e3a8a",
            imagen: "https://megaequipamiento.com/wp-content/uploads/2023/09/MANUFACTURA-GIF-OF.gif",
            tags: [
                { nombre: "Textil" },
                { nombre: "Quimica" },
                { nombre: "Papelería" },
                { nombre: "Pintura" },
                { nombre: "Metalurgia" }
            ]
        },
        {
            id_tag_parent: 2,
            nombre: "Extracción",
            color: "#059669",
            imagen: "https://megaequipamiento.com/wp-content/uploads/2023/09/EXTRACCION-GIF-OF.gif",
            tags: [
                { nombre: "Gas Natural" },
                { nombre: "Petróleo" },
                { nombre: "Mineria" },
                { nombre: "Pesca" },
                { nombre: "Agua" }
            ]
        },
        {
            id_tag_parent: 3,
            nombre: "Educación",
            color: "#7c3aed",
            imagen: "https://megaequipamiento.com/wp-content/uploads/2023/09/EDUCACION-GIF-OF.gif",
            tags: [
                { nombre: "Universidades" },
                { nombre: "Institutos" },
                { nombre: "Colegios" },
                { nombre: "Escuelas" },
                { nombre: "Centros de investigación" }
            ]
        },
        {
            id_tag_parent: 4,
            nombre: "Ind. Alimentaria",
            color: "#dc2626",
            imagen: "https://megaequipamiento.com/wp-content/uploads/2023/09/ALIMENTOS-GIF-OF.gif",
            tags: [
                { nombre: "Lacteos" },
                { nombre: "Cárnicos" },
                { nombre: "Aceites" },
                { nombre: "Agroindustria" },
                { nombre: "Haria y derivados" }
            ]
        },
        {
            id_tag_parent: 5,
            nombre: "Sector Salud",
            color: "#059669",
            imagen: "https://megaequipamiento.com/wp-content/uploads/2023/09/SALUD-GIF-OF.gif",
            tags: [
                { nombre: "Hospitales" },
                { nombre: "Clínicas" },
                { nombre: "Centros Médicos" },
                { nombre: "Ocupacionales" },
                { nombre: "Dentales" }
            ]
        },
        {
            id_tag_parent: 6,
            nombre: "Farmacéutica",
            color: "#7c2d12",
            imagen: "https://megaequipamiento.com/wp-content/uploads/2023/09/FARMACIA-GIF-OF.gif",
            tags: [
                { nombre: "Perfumerias" },
                { nombre: "Cosméticos" },
                { nombre: "Joyas" },
                { nombre: "Vacunas" },
                { nombre: "Encapsulados" }
            ]
        }
    ];

    const sectorsToShow = tagParents.length > 0 ? tagParents : getHardcodedSectors();

    if (loading) {
        return (
            <div className="w-full p-4 flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

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
                {sectorsToShow.map((sector) => (
                    <SwiperSlide key={sector.id_tag_parent}>
                        <div
                            className="relative bg-cover bg-center text-white rounded-lg shadow-lg overflow-hidden min-h-[400px]"
                            style={{
                                backgroundImage: sector.imagen ? `url('${sector.imagen}')` : `linear-gradient(135deg, ${sector.color || '#3B82F6'}, ${sector.color || '#1E40AF'})`,
                            }}
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                            <div className="relative p-10">
                                <h2 className="text-4xl font-bold text-center mb-6">
                                    {sector.nombre}
                                </h2> 
                                <ul className="space-y-4 text-xl">
                                    {sector.tags && sector.tags.slice(0, 5).map((tag, index) => (
                                        <li key={index} className="flex items-center">
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
                                            {tag.nombre}
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-center mt-6">
                                    <Link 
                                        href={`/sector/${sector.id_tag_parent}`}
                                        className="inline-block bg-[#1e3a8a] text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300"
                                    >
                                        Ver productos
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Carrusel;