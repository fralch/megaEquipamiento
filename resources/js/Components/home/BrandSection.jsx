// BrandSection.jsx
import React from 'react';

const BrandSection = () => {
    const brands = [
        { name: "IKA", logo: "url-del-logo-ika", description: "Descripción de IKA" },
        { name: "2mag", logo: "url-del-logo-2mag", description: "Descripción de 2mag" },
        { name: "A&D", logo: "url-del-logo-and", description: "Descripción de A&D" },
        { name: "Accumax", logo: "url-del-logo-accumax", description: "Descripción de Accumax" },
        { name: "Aczet", logo: "url-del-logo-aczet", description: "Descripción de Aczet" },
        { name: "Adam", logo: "url-del-logo-adam", description: "Descripción de Adam" },
        { name: "ALP Co., Ltd.", logo: "url-del-logo-alp", description: "Descripción de ALP Co., Ltd." },
        { name: "Aralab", logo: "url-del-logo-aralab", description: "Descripción de Aralab" },
        { name: "Asecos", logo: "url-del-logo-asecos", description: "Descripción de Asecos" },
        { name: "Axis", logo: "url-del-logo-axis", description: "Descripción de Axis" },
    ];

    return (
        <div className="p-8 bg-white" id="marcas">
            <h1 className="text-2xl font-bold mb-8 text-center">Marcas</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {brands.map((brand, index) => (
                    <div
                        key={index}
                        className="relative flex flex-col items-center text-center p-4 group"
                    >
                        {/* Logo */}
                        <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 border-blue-500">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="object-contain w-16 h-16"
                            />
                        </div>

                        {/* Name */}
                        <h2 className="mt-4 text-lg font-semibold">{brand.name}</h2>

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
