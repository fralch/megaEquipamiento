import { useEffect, useState, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTheme } from "../../storage/ThemeContext";
import TableModal from "./TableModal";

export default function ProductCard({ producto }) {
    const { isDarkMode } = useTheme();
    const cardRef = useRef(null);
    const [inView, setInView] = useState(false);
    const [isTablesOpen, setIsTablesOpen] = useState(false);
    const [translatedData, setTranslatedData] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Lazy loading con Intersection Observer
    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Lazy translation - translate when card becomes visible
    useEffect(() => {
        if (!inView || isTranslating || translatedData) return;

        const translateProduct = async () => {
            setIsTranslating(true);
            try {
                console.log(`[Producto ${producto.id}] Iniciando traducción...`);
                const response = await fetch(`/api/productos-externos/${producto.id}/translate?lang=es`);

                if (!response.ok) {
                    console.error(`[Producto ${producto.id}] Error HTTP: ${response.status}`);
                    const errorText = await response.text();
                    console.error(`[Producto ${producto.id}] Error details:`, errorText);
                    // Aún así, usar los datos originales si falla la traducción
                    setTranslatedData({
                        heading: producto.heading,
                        paragraphs: producto.paragraphs,
                        tables: producto.tables
                    });
                    return;
                }

                const data = await response.json();
                console.log(`[Producto ${producto.id}] Traducción completada`, data);
                setTranslatedData(data);
            } catch (error) {
                console.error(`[Producto ${producto.id}] Error de red o excepción:`, error);
                // Usar datos originales en caso de error
                setTranslatedData({
                    heading: producto.heading,
                    paragraphs: producto.paragraphs,
                    tables: producto.tables
                });
            } finally {
                setIsTranslating(false);
            }
        };

        // Añadir un pequeño delay aleatorio para evitar sobrecarga
        const delay = Math.random() * 500;
        const timeoutId = setTimeout(translateProduct, delay);
        return () => clearTimeout(timeoutId);
    }, [inView, producto.id, isTranslating, translatedData, producto.heading, producto.paragraphs, producto.tables]);

    // Procesar headings (usar traducción si está disponible)
    const headingArray = useMemo(() => {
        const heading = translatedData?.heading ?? producto.heading;
        if (Array.isArray(heading)) {
            return heading;
        }
        if (typeof heading === 'string' && heading.trim()) {
            return [heading.trim()];
        }
        return [];
    }, [producto.heading, translatedData]);

    const headingText = useMemo(() => (
        headingArray.length > 0 ? headingArray.join(' ') : ''
    ), [headingArray]);

    const productName = useMemo(() => (
        (headingArray[0] ?? '').toString().trim()
    ), [headingArray]);

    // Procesar párrafos (usar traducción si está disponible)
    const paragraphsArray = useMemo(() => {
        const paragraphs = translatedData?.paragraphs ?? producto.paragraphs;
        if (Array.isArray(paragraphs)) {
            return paragraphs;
        }
        if (typeof paragraphs === 'string') {
            return paragraphs.split(/\r?\n/).filter(p => p && p.trim());
        }
        return [];
    }, [producto.paragraphs, translatedData]);

    // Procesar imágenes
    const imagesArray = useMemo(() => (
        Array.isArray(producto.images) ? producto.images : []
    ), [producto.images]);

    // Procesar tablas (usar traducción si está disponible)
    const tables = useMemo(() => {
        const tablesToUse = translatedData?.tables ?? producto.tables;
        return Array.isArray(tablesToUse) ? tablesToUse : [];
    }, [producto.tables, translatedData]);

    // Filtrar imágenes no deseadas
    const filterImage = (img) => {
        const src = typeof img === 'string' ? img : img?.src;
        if (!src) return false;
        const lower = src.toLowerCase();
        return !lower.includes('nice.gif') && !lower.includes('imgdet.png');
    };

    // Normalizar src de imagen
    const normalizeImageSrc = (img) => {
        const rawSrc = typeof img === 'string' ? img : img?.src;
        return String(rawSrc || '')
            .trim()
            .replace(/^`+|`+$/g, '')
            .replace(/^"+|"+$/g, '')
            .replace(/^'+|'+$/g, '');
    };

    // Obtener alt de imagen
    const getImageAlt = (img) => {
        return typeof img === 'object' && img?.alt ? img.alt : '';
    };

    // Handler de carga de imagen
    const handleImageLoad = (e) => {
        const imgEl = e.currentTarget;
        const { naturalWidth, naturalHeight } = imgEl;

        if (naturalWidth < 100 || naturalHeight < 100) {
            const fig = imgEl.closest('figure');
            if (fig) fig.style.display = 'none';
        } else {
            imgEl.classList.add('opacity-100');
        }
    };

    // Handler de error de imagen
    const handleImageError = (e) => {
        const imgEl = e.currentTarget;
        imgEl.style.display = 'none';
        const fig = imgEl.closest('figure');
        if (fig) fig.style.display = 'none';
    };

    const filteredImages = imagesArray.filter(filterImage);
    const hasMultipleImages = filteredImages.length > 1;

    return (
        <>
            <article
                ref={cardRef}
                className={`group border rounded-xl overflow-hidden break-inside-avoid mb-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 relative ${
                    isDarkMode
                        ? 'border-gray-700 bg-gray-800'
                        : 'border-gray-300 bg-white'
                }`}
            >
                {/* Indicador de traducción */}
                {isTranslating && (
                    <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                        isDarkMode ? 'bg-blue-900/80 text-blue-200' : 'bg-blue-100/80 text-blue-800'
                    }`}>
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traduciendo...
                    </div>
                )}

                {/* Header */}
                {headingText && (
                    <div className="p-6 pb-4">
                        <h2 className={`text-lg font-semibold tracking-tight ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            {headingText}
                        </h2>
                    </div>
                )}

                {/* Imágenes */}
                {inView && filteredImages.length > 0 && (
                    <div className="w-full">
                        {hasMultipleImages ? (
                            <Swiper
                                modules={[Navigation, Pagination, A11y]}
                                navigation
                                pagination={{ clickable: true }}
                                slidesPerView={1}
                                className="w-full"
                            >
                                {filteredImages.map((img, idx) => {
                                    const src = normalizeImageSrc(img);
                                    const alt = getImageAlt(img);

                                    return (
                                        <SwiperSlide key={idx}>
                                            <figure
                                                className={`overflow-hidden ${
                                                    isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                                                }`}
                                            >
                                                <img
                                                    src={src}
                                                    alt={alt}
                                                    className="w-full h-auto object-contain transition-opacity duration-300 opacity-0"
                                                    loading="lazy"
                                                    decoding="async"
                                                    sizes="100vw"
                                                    onLoad={handleImageLoad}
                                                    onError={handleImageError}
                                                />
                                                {alt && (
                                                    <figcaption className={`px-4 py-2 text-xs ${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        {alt}
                                                    </figcaption>
                                                )}
                                            </figure>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        ) : (
                            (() => {
                                const img = filteredImages[0];
                                const src = normalizeImageSrc(img);
                                const alt = getImageAlt(img);

                                return (
                                    <figure className={isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}>
                                        <img
                                            src={src}
                                            alt={alt}
                                            className="w-full h-auto object-contain transition-opacity duration-300 opacity-0"
                                            loading="lazy"
                                            decoding="async"
                                            sizes="100vw"
                                            onLoad={handleImageLoad}
                                            onError={handleImageError}
                                        />
                                        {alt && (
                                            <figcaption className={`px-4 py-2 text-xs ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {alt}
                                            </figcaption>
                                        )}
                                    </figure>
                                );
                            })()
                        )}
                    </div>
                )}

                {/* Contenido */}
                <div className="p-6 flex flex-col gap-3">
                    {/* Headings adicionales */}
                    {headingArray.length > 1 && (
                        <ul className={`list-disc list-inside space-y-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {headingArray.slice(1).map((h, idx) => (
                                <li key={idx} className="text-sm">{h}</li>
                            ))}
                        </ul>
                    )}

                    {/* Párrafos */}
                    {paragraphsArray.length > 0 && (
                        <div className="space-y-2">
                            {paragraphsArray.map((paragraph, idx) => (
                                <p
                                    key={idx}
                                    className={`text-sm leading-relaxed ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}

                    <div className="mt-2 flex gap-2">
                        {tables.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsTablesOpen(true)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2`}
                                aria-label="Ver tablas del producto"
                            >
                                Ver tabla
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                const message = productName
                                    ? `Estoy interesado en este producto ${productName}`
                                    : 'Estoy interesado en este producto';
                                const whatsappUrl = `https://wa.me/51939294882?text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, '_blank');
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isDarkMode
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            } focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2`}
                            aria-label="Contactar por WhatsApp"
                        >
                            Contactar por WhatsApp
                        </button>
                    </div>

                    {/* Footer con fecha */}
                    <div className={`pt-3 border-t text-xs ${
                        isDarkMode
                            ? 'border-gray-700 text-gray-500'
                            : 'border-gray-300 text-gray-500'
                    }`}>
                        Creado: {new Date(producto.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            </article>

            {/* Modal de tablas */}
            <TableModal
                isOpen={isTablesOpen}
                onClose={() => setIsTablesOpen(false)}
                tables={tables}
                title={headingText || "Tablas del producto"}
            />
        </>
    );
}
