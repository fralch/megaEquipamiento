import React, { memo, useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { useTheme } from "@/storage/ThemeContext";

const SectionsPillBar = memo(function SectionsPillBar({ secciones, onSelect, selectedId }) {
    const { isDarkMode } = useTheme();
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        let timeoutId;
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setIsScrolling(false), 300);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    if (!secciones || secciones.length === 0) return null;

    const isActive = (id) => id === selectedId;

    const baseClasses = (activo) => {
        if (isScrolling) {
            return `group flex-shrink-0 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 border focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] ${
                isDarkMode
                    ? "bg-gray-200 text-gray-900 border-gray-300"
                    : "bg-gray-700 text-white border-gray-700"
            }`;
        }
        return `group flex-shrink-0 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 border focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] ${
            activo
                ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                : isDarkMode
                  ? "bg-gray-700/40 text-gray-200 border-gray-600/60"
                  : "bg-gray-50 text-gray-700 border-gray-200"
        }`;
    };

    const dotClasses = (activo) =>
        `w-1.5 h-1.5 rounded-full mr-2 transition-colors duration-300 ${
            activo
                ? "bg-white"
                : isDarkMode
                  ? "bg-blue-400 group-hover:bg-white"
                  : "bg-[#1e3a8a] group-hover:bg-white"
        }`;

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
                    {secciones.map((seccion) => {
                        const activo = isActive(seccion.id_seccion);

                        if (onSelect) {
                            return (
                                <button
                                    key={seccion.id_seccion}
                                    type="button"
                                    onClick={() => onSelect(seccion)}
                                    className={baseClasses(activo)}
                                    aria-label={seccion.nombre}
                                    aria-pressed={activo}
                                >
                                    <span
                                        className={dotClasses(activo)}
                                        aria-hidden="true"
                                    />
                                    {seccion.nombre}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={seccion.id_seccion}
                                href={`/seccion/${seccion.slug}`}
                                className={baseClasses(false)}
                                aria-label={seccion.nombre}
                            >
                                <span
                                    className={dotClasses(false)}
                                    aria-hidden="true"
                                />
                                {seccion.nombre}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
});

export default SectionsPillBar;
