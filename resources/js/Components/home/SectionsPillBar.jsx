import React, { memo } from "react";
import { Link } from "@inertiajs/react";
import { useTheme } from "@/storage/ThemeContext";

const SectionsPillBar = memo(function SectionsPillBar({ secciones }) {
    const { isDarkMode } = useTheme();

    if (!secciones || secciones.length === 0) return null;

    return (
        <nav
            className={`sticky top-0 z-30 transition-shadow duration-300 ${
                isDarkMode
                    ? "bg-gray-800/95 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    : "bg-white/95 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            }`}
            aria-label="Secciones"
        >
            <div className="px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {secciones.map((seccion) => (
                        <Link
                            key={seccion.id_seccion}
                            href={`/seccion/${seccion.slug}`}
                            className={`group flex-shrink-0 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] ${
                                isDarkMode
                                    ? "bg-gray-700/40 text-gray-200 border-gray-600/60 hover:bg-[#1e3a8a] hover:text-white hover:border-[#1e3a8a] hover:shadow-md focus:ring-blue-500 focus:ring-offset-gray-800"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-[#1e3a8a] hover:text-white hover:border-[#1e3a8a] hover:shadow-md focus:ring-blue-600 focus:ring-offset-white"
                            }`}
                            aria-label={seccion.nombre}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full mr-2 transition-colors ${
                                    isDarkMode
                                        ? "bg-blue-400 group-hover:bg-white"
                                        : "bg-[#1e3a8a] group-hover:bg-white"
                                }`}
                                aria-hidden="true"
                            />
                            {seccion.nombre}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
});

export default SectionsPillBar;
