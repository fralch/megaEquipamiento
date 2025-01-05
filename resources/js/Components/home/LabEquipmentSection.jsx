// LabEquipmentSection.jsx
import React from "react";

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
                <img
                    src="https://megaequipamiento.com/wp-content/uploads/2023/09/desarrollo-de-proyectos-2.webp"
                    alt="Equipos de laboratorio"
                    className="w-full h-auto"
                />
            </div>
        </section>
    );
};

export default LabEquipmentSection;
