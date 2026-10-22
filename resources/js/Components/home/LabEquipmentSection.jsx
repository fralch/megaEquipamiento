import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";

const LabEquipmentSection = () => {
    const images = [
        {
            src: "https://megaequipamiento.com/wp-content/uploads/2023/09/capacitaciion-y-asesorias-2.webp",
            alt: "Capacitación y asesorías"
        },
        {
            src: "https://megaequipamiento.com/wp-content/uploads/2023/09/servicio-de-mantenimiento-y-calibracion-2.webp",
            alt: "Servicio de mantenimiento y calibración"
        },
        {
            src: "https://megaequipamiento.com/wp-content/uploads/2023/09/desarrollo-de-proyectos-2.webp",
            alt: "Desarrollo de proyectos"
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef(null);

    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl">
                <Swiper
                    modules={[Autoplay, A11y]}
                    slidesPerView={1}
                    loop={true}
                    speed={650}
                    grabCursor={true}
                    autoplay={{
                        delay: 4500,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    onSlideChange={(swiper) => {
                        setActiveIndex(swiper.realIndex);
                    }}
                    className="w-full h-full"
                >
                    {images.map((image, index) => (
                        <SwiperSlide key={index}>
                            <div className="w-full select-none overflow-hidden">
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-auto block select-none pointer-events-none transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                                    loading={index === 0 ? "eager" : "lazy"}
                                    decoding="async"
                                    draggable={false}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Botón Navegación Izquierda */}
                <button
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="absolute left-3 sm:left-5 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 opacity-80 sm:opacity-0 sm:-translate-x-2 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 focus:opacity-100 focus:translate-x-0"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </button>

                {/* Botón Navegación Derecha */}
                <button
                    onClick={() => swiperRef.current?.slideNext()}
                    className="absolute right-3 sm:right-5 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 opacity-80 sm:opacity-0 sm:translate-x-2 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 focus:opacity-100 focus:translate-x-0"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </button>

                {/* Indicadores / Dots */}
                <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md shadow-md">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => swiperRef.current?.slideToLoop(index)}
                            className={`transition-all duration-300 rounded-full h-2 sm:h-2.5 ${
                                index === activeIndex
                                    ? "w-7 sm:w-9 bg-white shadow-sm"
                                    : "w-2 sm:w-2.5 bg-white/45 hover:bg-white/80"
                            }`}
                            aria-label={`Ir al slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LabEquipmentSection;
