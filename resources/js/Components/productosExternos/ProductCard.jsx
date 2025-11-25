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


    const headingArray = useMemo(() => {
        const heading = producto.heading;
        if (Array.isArray(heading)) {
            return heading;
        }
        if (typeof heading === 'string' && heading.trim()) {
            return [heading.trim()];
        }
        return [];
    }, [producto.heading]);

    const headingText = useMemo(() => (
        headingArray.length > 0 ? headingArray.join(' ') : ''
    ), [headingArray]);

    const productName = useMemo(() => (
        (headingArray[0] ?? '').toString().trim()
    ), [headingArray]);

    const paragraphsArray = useMemo(() => {
        const paragraphs = producto.paragraphs;
        if (Array.isArray(paragraphs)) {
            return paragraphs;
        }
        if (typeof paragraphs === 'string') {
            return paragraphs.split(/\r?\n/).filter(p => p && p.trim());
        }
        return [];
    }, [producto.paragraphs]);

    // Procesar imágenes
    const imagesArray = useMemo(() => (
        Array.isArray(producto.images) ? producto.images : []
    ), [producto.images]);

    const tables = useMemo(() => {
        const tablesToUse = producto.tables;
        return Array.isArray(tablesToUse) ? tablesToUse : [];
    }, [producto.tables]);

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
