import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const Slider = () => {
    return (
        <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }}
            pagination={{ 
                clickable: true,
                dynamicBullets: true,
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
            }}
            scrollbar={{ draggable: true }}
            autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            }}
            loop={true}
            grabCursor={true}
            touchRatio={1}
            touchAngle={45}
            threshold={10}
            style={{ 
                width: "100%", 
                height: "85vh",
                minHeight: "400px",
                maxHeight: "100vh"
            }}
        >
            {/* Slide con iframe */}
            <SwiperSlide>
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <iframe
                        src="https://www.youtube.com/embed/F8pMhuLK7nE?mute=1&autoplay=1&loop=1&playlist=F8pMhuLK7nE&vq=hd1080&controls=0&modestbranding=1&showinfo=0&rel=0"
                        title="YouTube video"
                        style={{ 
                            width: "100%", 
                            height: "100%",
                            border: "none",
                            objectFit: "cover"
                        }}
                        allow="autoplay; encrypted-media"
                        loading="lazy"
                    ></iframe>
                    {/* Div que cubre el iframe, con z-index bajo */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo transparente
                            zIndex: 0, // Asegúrate de que esté debajo del enlace
                        }}
                    ></div>
                </div>

                {/* Contenido para desktop */}
                <div
                    className="hidden md:block"
                    style={{
                        position: "absolute",
                        top: "47%",
                        left: "20%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        textAlign: "left",
                        zIndex: 2,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#fff",
                        }}
                    >
                        Líder en Ventas de
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#fff",
                            marginTop: -10,
                        }}
                    >
                        Equipos de
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#fff",
                            marginTop: -20,
                        }}
                    >
                        Laboratorio
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1rem",
                            fontFamily: "",
                            fontWeight: "bold",
                            color: "#fff",
                        }}
                    >
                        En todas las regiones del Peru
                    </h2>
                    <a
                        href="https://wa.me/51999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
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
                        }}
                    >
                        Ver más
                    </a>
                </div>

                {/* Contenido para móviles */}
                <div
                    className="block md:hidden"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        textAlign: "center",
                        zIndex: 2,
                        padding: "0 1rem",
                        width: "90%",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#fff",
                            lineHeight: "1.2",
                        }}
                    >
                        Líder en Ventas de
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#fff",
                            marginTop: "0.2rem",
                            lineHeight: "1.2",
                        }}
                    >
                        Equipos de Laboratorio
                    </h2>
                    <h3
                        style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                            color: "#fff",
                            marginTop: "0.5rem",
                        }}
                    >
                        En todas las regiones del Perú
                    </h3>
                    <a
                        href="https://wa.me/51999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
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
                        }}
                    >
                        Ver más
                    </a>
                </div>
            </SwiperSlide>

            {/* Slide con imagen */}
            <SwiperSlide>
                <img
                    src="img/slider-img1.webp"
                    alt="Imagen 1"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
                {/* Contenido para desktop */}
                <div
                    className="hidden md:block"
                    style={{
                        position: "absolute",
                        top: "47%",
                        left: "20%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        textAlign: "left",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#777",
                            textShadow: "2px 2px 4px rgba(255, 255, 255, 0.9)",
                        }}
                    >
                        Líder en Ventas de
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#1e3a8a",
                            marginTop: -10,
                        }}
                    >
                        Equipos de
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#1e3a8a",
                            marginTop: -20,
                        }}
                    >
                        Laboratorio
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1rem",
                            fontFamily: "",
                            fontWeight: "bold",
                            color: "#777",
                        }}
                    >
                        En todas las regiones del Peru
                    </h2>
                    <a
                        href="https://wa.me/51999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
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
                        }}
                    >
                        Ver más
                    </a>
                </div>

                {/* Contenido para móviles */}
                <div
                    className="block md:hidden"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        textAlign: "center",
                        zIndex: 2,
                        padding: "0 1rem",
                        width: "90%",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        borderRadius: "10px",
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#fff",
                            lineHeight: "1.2",
                        }}
                    >
                        Líder en Ventas de
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1.5rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#fff",
                            marginTop: "0.2rem",
                            lineHeight: "1.2",
                        }}
                    >
                        Equipos de Laboratorio
                    </h2>
                    <h3
                        style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                            color: "#fff",
                            marginTop: "0.5rem",
                        }}
                    >
                        En todas las regiones del Perú
                    </h3>
                    <a
                        href="https://wa.me/51999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
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
                        }}
                    >
                        Ver más
                    </a>
                </div>
            </SwiperSlide>

            {/* Slide con otra imagen */}
            <SwiperSlide>
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <img
                        src="img/slider-img2.webp"
                        alt="Imagen 2"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                    {/* Contenido para desktop */}
                    <div
                        className="hidden md:block"
                        style={{
                            position: "absolute",
                            top: "45%",
                            left: "20%",
                            transform: "translate(-50%, -50%)",
                            color: "#fff",
                            textAlign: "left",
                        }}
                    >
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "2.5rem",
                                fontFamily: "verdana, sans-serif, serif, arial",
                                fontWeight: "bold",
                                color: "#777",
                            }}
                        >
                            Líder en Ventas de
                        </h2>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "2.5rem",
                                fontFamily: "verdana, sans-serif, serif, arial",
                                fontWeight: "bold",
                                color: "#1e3a8a",
                                marginTop: -10,
                            }}
                        >
                            Equipos de
                        </h2>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "2.5rem",
                                fontFamily: "verdana, sans-serif, serif, arial",
                                fontWeight: "bold",
                                color: "#1e3a8a",
                                marginTop: -20,
                            }}
                        >
                            Laboratorio
                        </h2>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "1rem",
                                fontFamily: "",
                                fontWeight: "bold",
                                color: "#777",
                            }}
                        >
                            En todas las regiones del Peru
                        </h2>
                        <a
                            href="https://wa.me/51999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
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
                            }}
                        >
                            Ver más
                        </a>
                    </div>

                    {/* Contenido para móviles */}
                    <div
                        className="block md:hidden"
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "#fff",
                            textAlign: "center",
                            zIndex: 2,
                            padding: "0 1rem",
                            width: "90%",
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            borderRadius: "10px",
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                        }}
                    >
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "1.5rem",
                                fontFamily: "verdana, sans-serif, serif, arial",
                                fontWeight: "bold",
                                color: "#fff",
                                lineHeight: "1.2",
                            }}
                        >
                            Líder en Ventas de
                        </h2>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "1.5rem",
                                fontFamily: "verdana, sans-serif, serif, arial",
                                fontWeight: "bold",
                                color: "#fff",
                                marginTop: "0.2rem",
                                lineHeight: "1.2",
                            }}
                        >
                            Equipos de Laboratorio
                        </h2>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: "0.9rem",
                                fontWeight: "bold",
                                color: "#fff",
                                marginTop: "0.5rem",
                            }}
                        >
                            En todas las regiones del Perú
                        </h3>
                        <a
                            href="https://wa.me/51999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
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
                            }}
                        >
                            Ver más
                        </a>
                    </div>
                </div>
            </SwiperSlide>

            {/* Flechas de navegación */}
            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
        </Swiper>
    );
};

export default Slider;