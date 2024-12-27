// BrandSection.jsx
import React, { useState, useEffect } from "react";

const BrandSection = () => {
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        const images = import.meta.glob("/public/img/marcas/**/*.{jpg,png}");
        const brandsData = Object.keys(images).map((path) => {
            const name = path.split("/").pop().split(".").shift();
            const adjustedPath = path.replace("/public", "");
            console.log(adjustedPath); // Verifica las rutas en la consola
            return {
                image: adjustedPath,
                name,
                description: `Descripción de ${name}`, // Puedes ajustar esto según tus necesidades
            };
        });

        setBrands(brandsData);
    }, []);

    return (
        <div className="p-8 bg-white" id="marcas">
            <h2 className="text-2xl font-bold mb-8 text-center">Marcas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {brands.map((brand, index) => (
                    <div
                        key={index}
                        className="relative flex flex-col items-center text-center p-4 group"
                    >
                        <div className="w-36 h-36 flex items-center justify-center rounded-full border-2 border-blue-500">
                            <img
                                src={brand.image}
                                alt={brand.name}
                                className="object-contain w-32 h-32"
                            />
                        </div>

                        {/* Name */}
                        <h2 className="mt-4 text-lg font-semibold">
                            {brand.name}
                        </h2>

                        {/* Button */}
                        <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Ver Productos
                        </button>

                        {/* Tooltip */}
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 hidden group-hover:flex flex-col items-center w-40 p-2 bg-gray-700 text-white text-sm rounded-full shadow-lg z-10">
                            <div className="w-full h-full flex items-center justify-center">
                                {brand.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
        </div>
    );
};

export default BrandSection;
