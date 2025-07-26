// LabEquipmentSection.jsx
import React, { useState, useEffect } from "react";

const ImageCarousel = () => {
    const images = [
        {
            src: "/img/2sliderhome/capacitaciion-y-asesorias-2.webp",
            alt: "Capacitación y asesorías"
        },
        {
            src: "/img/2sliderhome/servicio-de-mantenimiento-y-calibracion-2.webp",
            alt: "Servicio de mantenimiento y calibración"
        },
        {
            src: "/img/2sliderhome/desarrollo-de-proyectos-2.webp",
            alt: "Desarrollo de proyectos"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance carousel every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    };

    return (
        <div className="relative w-full h-auto overflow-hidden">
            {/* Main image */}
            <div className="relative">
                <img
                    src={images[currentIndex].src}
                    alt={images[currentIndex].alt}
                    className="w-full h-auto transition-opacity duration-500"
                />
                
                {/* Navigation arrows */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
                    aria-label="Imagen anterior"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
                    aria-label="Siguiente imagen"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            
            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            index === currentIndex 
                                ? 'bg-white' 
                                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                        aria-label={`Ir a imagen ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

const LabEquipmentSection = () => {
    return (
        <section className="flex flex-col md:flex-row relative">
            <div className="bg-[#0c2249] w-full md:w-1/2 p-4 md:p-8 flex flex-col gap-4 mt-10 text-white relative z-0">
                <h3 className="text-2xl md:text-3xl font-bold pt-6 md:pt-12">
                    Equipos de laboratorio
                </h3>
                <p className="text-base md:text-xl pr-4 md:pr-36 pb-12 md:pb-24">
                    Los equipos de laboratorio son instrumentos
                    utilizados para llevar a cabo experimentos,
                    análisis y estudios en diferentes
                    disciplinas científicas. Algunos equipos de
                    laboratorio incluyen microscopios,
                    espectrofotómetros, balanzas de laboratorio,
                    centrífugas, autoclaves, agitadores
                    magnéticos, incubadoras, pipetas, y sistemas
                    de cromatografía, entre muchos otros. Cada
                    equipo tiene su propia utilidad y está
                    diseñado para manipular muestras y realizar
                    mediciones con precisión. Estos instrumentos
                    son esenciales para la investigación
                    científica, el desarrollo de productos, el
                    control de calidad y el análisis en una
                    amplia gama de campos, como la biología, la
                    química, la física, la medicina, la
                    ingeniería y las ciencias ambientales.
                </p>
            </div>
            <div
                id="image"
                className="w-full md:w-7/12 relative md:absolute md:top-32 md:right-0 z-10"
            >
                <ImageCarousel />
            </div>
        </section>
    );
};

export default LabEquipmentSection;
