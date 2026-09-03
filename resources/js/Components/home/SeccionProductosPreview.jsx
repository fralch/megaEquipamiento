import React, { useState, useEffect, useCallback } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import { useTheme } from "@/storage/ThemeContext";
import { CategoryCard } from "@/Components/home/Categorias_cuadrado";

const URL_API = import.meta.env.VITE_API_URL || "";
const cacheRef = {};

const ArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

function SectionHeader({ seccion, isDarkMode }) {
    return (
        <div
            className={`px-4 sm:px-6 lg:px-8 pt-10 pb-4 ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <h2
                    className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                >
                    {seccion.nombre}
                </h2>
                <Link
                    href={`/seccion/${seccion.slug}`}
                    className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                        isDarkMode
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-[#1e3a8a] hover:text-blue-700"
                    }`}
                >
                    Ver sección
                    <ArrowIcon />
                </Link>
            </div>
            {seccion.descripcion && (
                <p
                    className={`max-w-7xl mx-auto mt-1 text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                    {seccion.descripcion}
                </p>
            )}
        </div>
    );
}

function LoadingState({ isDarkMode }) {
    return (
        <div
            className={`w-full min-h-[400px] flex items-center justify-center ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
        >
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
    );
}

function ErrorState({ isDarkMode, onRetry }) {
    return (
        <div
            className={`w-full min-h-[300px] flex flex-col items-center justify-center gap-4 ${
                isDarkMode ? "bg-gray-900 text-gray-300" : "bg-gray-50 text-gray-700"
            }`}
        >
            <p className="text-sm">Error al cargar las categorías.</p>
            <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1e3a8a] text-white hover:bg-blue-700 transition-colors"
            >
                Reintentar
            </button>
        </div>
    );
}

function EmptyState({ isDarkMode }) {
    return (
        <div
            className={`w-full min-h-[300px] flex items-center justify-center ${
                isDarkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-500"
            }`}
        >
            <p className="text-sm">No hay categorías disponibles en esta sección.</p>
        </div>
    );
}

function SectionContent({ seccion }) {
    const { isDarkMode } = useTheme();
    const cached = cacheRef[seccion.id_seccion];
    const [categorias, setCategorias] = useState(cached || null);
    const [loading, setLoading] = useState(!cached);
    const [error, setError] = useState(null);

    const doRetry = useCallback(() => {
        delete cacheRef[seccion.id_seccion];
        setError(null);
        setLoading(true);
        setCategorias(null);
    }, [seccion.id_seccion]);

    useEffect(() => {
        if (cacheRef[seccion.id_seccion]) {
            setCategorias(cacheRef[seccion.id_seccion]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(
                    `${URL_API}/api/secciones/${seccion.id_seccion}/categorias`,
                    { signal: controller.signal }
                );
                if (cancelled) return;
                const raw = response.data || [];
                cacheRef[seccion.id_seccion] = raw;
                setCategorias(raw);
            } catch (err) {
                if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                    console.error("Error fetching section categories:", err);
                    if (!cancelled) setError(err);
                }
            } finally {
                if (!cancelled && !controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [seccion.id_seccion]);

    return (
        <div className="w-full">
            <SectionHeader seccion={seccion} isDarkMode={isDarkMode} />

            {loading && !error && !categorias && (
                <LoadingState isDarkMode={isDarkMode} />
            )}

            {!loading && error && (
                <ErrorState isDarkMode={isDarkMode} onRetry={doRetry} />
            )}

            {!loading && !error && categorias && categorias.length === 0 && (
                <EmptyState isDarkMode={isDarkMode} />
            )}

            {!loading && !error && categorias && categorias.length > 0 && (
                <div className={isDarkMode ? "bg-gray-900" : "bg-gray-50"}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {categorias.map((categoria) => (
                                <CategoryCard
                                    key={`category-${categoria.id_categoria}`}
                                    title={categoria.nombre}
                                    items={categoria.subcategorias || []}
                                    categoryId={categoria.id_categoria}
                                    categoryImages={categoria.img}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SeccionProductosPreview({ seccion }) {
    if (!seccion) return null;
    return <SectionContent seccion={seccion} />;
}
