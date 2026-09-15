import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FiSettings } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

// Fallback estático: idéntico al slider hardcodeado previo (usado solo si la API falla o BD vacía)
const FALLBACK_SLIDES = [
    {
        id_slider: "fallback-1",
        tipo: "video",
        titulo: "Líder en Ventas de",
        subtitulo: "Equipos de",
        subtitulo_2: "Laboratorio",
        subtitulo_pie: "En todas las regiones del Perú",
        texto_boton: "Ver más",
        url_boton: "https://wa.me/51999999999",
        video_youtube_id: "F8pMhuLK7nE",
        video_thumbnail: "https://i.ytimg.com/vi/F8pMhuLK7nE/hqdefault.jpg",
        imagen: null,
        imagen_url: null,
    },
    {
        id_slider: "fallback-2",
        tipo: "imagen",
        titulo: "Líder en Ventas de",
        subtitulo: "Equipos de",
        subtitulo_2: "Laboratorio",
        subtitulo_pie: "En todas las regiones del Perú",
        texto_boton: "Ver más",
        url_boton: "https://wa.me/51999999999",
        imagen: "img/slider-img1.webp",
        imagen_url: "img/slider-img1.webp",
    },
    {
        id_slider: "fallback-3",
        tipo: "imagen",
        titulo: "Líder en Ventas de",
        subtitulo: "Equipos de",
        subtitulo_2: "Laboratorio",
        subtitulo_pie: "En todas las regiones del Perú",
        texto_boton: "Ver más",
        url_boton: "https://wa.me/51999999999",
        imagen: "img/slider-img2.webp",
        imagen_url: "img/slider-img2.webp",
    },
];

function SlideMedia({ slide, loadVideo, onLoadVideo }) {
    if (slide.tipo === "video" && slide.video_youtube_id) {
        return (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                {loadVideo ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${slide.video_youtube_id}?mute=1&autoplay=1&loop=1&playlist=${slide.video_youtube_id}&vq=hd720&controls=0&modestbranding=1&showinfo=0&rel=0`}
                        title="YouTube video"
                        style={{ width: "100%", height: "100%", border: "none", objectFit: "cover" }}
                        allow="autoplay; encrypted-media"
                        loading="lazy"
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#0c2249",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            backgroundImage: slide.video_thumbnail ? `url(${slide.video_thumbnail})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                        onClick={onLoadVideo}
                    >
                        {!slide.video_thumbnail && (
                            <button
                                style={{
                                    fontSize: "4rem",
                                    color: "white",
                                    background: "rgba(255,255,255,0.2)",
                                    borderRadius: "50%",
                                    width: "100px",
                                    height: "100px",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                                aria-label="Reproducir video"
                            >
                                ▶
                            </button>
                        )}
                    </div>
                )}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 0,
                    }}
                />
            </div>
        );
    }

    return (
        <img
            src={slide.imagen_url || slide.imagen}
            alt={slide.titulo || "slide"}
            fetchPriority={slide.id_slider === "fallback-1" || slide.orden === 1 ? "high" : "auto"}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
    );
}

function SlideOverlay({ slide, isFirstVideo }) {
    // Video: texto blanco + botón. Imagen: texto gris/azul.
    const isVideo = slide.tipo === "video";

    const desktopColor1 = isVideo ? "#fff" : "#777";
    const desktopColor2 = isVideo ? "#fff" : "#1e3a8a";
    const desktopColorPie = isVideo ? "#fff" : "#777";

    const desktopTextShadow = isVideo
        ? "none"
        : "2px 2px 4px rgba(255, 255, 255, 0.9)";

    const desktopStyle = {
        position: "absolute",
        top: "47%",
        left: "20%",
        transform: "translate(-50%, -50%)",
        color: "#fff",
        textAlign: "left",
        zIndex: 2,
    };

    const desktopHeadingBase = {
        margin: 0,
        fontSize: "2.5rem",
        fontFamily: "verdana, sans-serif, serif, arial",
        fontWeight: "bold",
        textShadow: desktopTextShadow,
    };

    const desktopHeadingSmall = {
        ...desktopHeadingBase,
        fontSize: "1rem",
    };

    const buttonStyle = {
        display: "block",
        marginTop: "1rem",
        fontSize: "1.2rem",
        color: "#fff",
        textDecoration: "none",
        backgroundColor: "#1e3a8a",
        padding: "0.5rem 1rem",
        borderRadius: "5px",
        transition: "background-color 0.3s ease",
        width: "fit-content",
    };

    const mobileStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#fff",
        textAlign: "center",
        zIndex: 2,
        padding: "0 1rem",
        width: "90%",
        backgroundColor: isVideo ? "transparent" : "rgba(0, 0, 0, 0.6)",
        borderRadius: isVideo ? "0" : "10px",
        paddingTop: isVideo ? "0" : "1rem",
        paddingBottom: isVideo ? "0" : "1rem",
    };

    const mobileHeading = {
        margin: 0,
        fontSize: "1.5rem",
        fontFamily: "verdana, sans-serif, serif, arial",
        fontWeight: "bold",
        color: "#fff",
        lineHeight: "1.2",
    };

    const mobileHeadingSmall = {
        ...mobileHeading,
        fontSize: "0.9rem",
        marginTop: "0.5rem",
    };

    const mobileButtonStyle = {
        display: "inline-block",
        marginTop: "1rem",
        fontSize: "1rem",
        color: "#fff",
        textDecoration: "none",
        backgroundColor: "#1e3a8a",
        padding: "0.7rem 1.5rem",
        borderRadius: "5px",
        transition: "background-color 0.3s ease",
        fontWeight: "bold",
    };

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block" style={desktopStyle}>
                {slide.titulo && (
                    <h2 style={{ ...desktopHeadingBase, color: desktopColor1 }}>{slide.titulo}</h2>
                )}
                {slide.subtitulo && (
                    <h2 style={{ ...desktopHeadingBase, color: desktopColor2, marginTop: -10 }}>
                        {slide.subtitulo}
                    </h2>
                )}
                {slide.subtitulo_2 && (
                    <h2 style={{ ...desktopHeadingBase, color: desktopColor2, marginTop: -20 }}>
                        {slide.subtitulo_2}
                    </h2>
                )}
                {slide.subtitulo_pie && (
                    <h2 style={{ ...desktopHeadingSmall, color: desktopColorPie }}>
                        {slide.subtitulo_pie}
                    </h2>
                )}
                {slide.url_boton && (
                    <a
                        href={slide.url_boton}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={buttonStyle}
                    >
                        {slide.texto_boton || "Ver más"}
                    </a>
                )}
            </div>

            {/* Mobile */}
            <div className="block md:hidden" style={mobileStyle}>
                {slide.titulo && <h2 style={mobileHeading}>{slide.titulo}</h2>}
                {(slide.subtitulo || slide.subtitulo_2) && (
                    <h2 style={{ ...mobileHeading, marginTop: "0.2rem" }}>
                        {[slide.subtitulo, slide.subtitulo_2].filter(Boolean).join(" ")}
                    </h2>
                )}
                {slide.subtitulo_pie && <h3 style={mobileHeadingSmall}>{slide.subtitulo_pie}</h3>}
                {slide.url_boton && (
                    <a
                        href={slide.url_boton}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={mobileButtonStyle}
                    >
                        {slide.texto_boton || "Ver más"}
                    </a>
                )}
            </div>
        </>
    );
}

const Slider = () => {
    const [loadVideo, setLoadVideo] = useState(false);
    const [slides, setSlides] = useState(FALLBACK_SLIDES);
    const [usingFallback, setUsingFallback] = useState(true);
    const { auth } = usePage().props;
    const isAdmin =
        !!auth?.user?.rol &&
        String(auth.user.rol.nombre_rol || "").toLowerCase() === "admin";

    useEffect(() => {
        let cancelled = false;
        axios
            .get("/api/slider")
            .then(({ data }) => {
                if (cancelled) return;
                if (Array.isArray(data) && data.length > 0) {
                    setSlides(data);
                    setUsingFallback(false);
                }
            })
            .catch(() => {
                // Silencioso: mantenemos fallback
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const slidesToRender = useMemo(() => slides, [slides]);

    if (slidesToRender.length === 0) {
        return null;
    }

    return (
        <div style={{ position: "relative" }}>
            {isAdmin && (
                <Link
                    href="/crear?section=slider"
                    className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all bg-white/90 hover:bg-white text-gray-800 hover:text-blue-700 text-sm font-medium backdrop-blur-sm border border-gray-200"
                    title="Gestionar slider"
                >
                    <FiSettings className="w-4 h-4" />
                    Gestionar slider
                </Link>
            )}
            <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }}
            pagination={{
                clickable: true,
                dynamicBullets: true,
                bulletClass: "swiper-pagination-bullet",
                bulletActiveClass: "swiper-pagination-bullet-active",
            }}
            scrollbar={{ draggable: true }}
            autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            loop={slidesToRender.length > 1}
            grabCursor={true}
            touchRatio={1}
            touchAngle={45}
            threshold={10}
            style={{
                width: "100%",
                height: "85vh",
                minHeight: "400px",
                maxHeight: "100vh",
            }}
            onSlideChange={(swiper) => {
                if (swiper.realIndex === 0) {
                    setLoadVideo(true);
                }
            }}
        >
            {slidesToRender.map((slide) => (
                <SwiperSlide key={slide.id_slider}>
                    <SlideMedia
                        slide={slide}
                        loadVideo={loadVideo && slide.tipo === "video"}
                        onLoadVideo={() => setLoadVideo(true)}
                    />
                    <SlideOverlay slide={slide} isFirstVideo={false} />
                </SwiperSlide>
            ))}

            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
        </Swiper>
        </div>
    );
};

export default Slider;
