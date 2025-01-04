import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const Slider = () => {
    return (
        <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={0} // Sin espacio entre slides
            slidesPerView={1} // Un slide visible a la vez
            navigation
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            autoplay={{
                delay: 3000, // Tiempo en milisegundos entre cada deslizamiento
            }}
            style={{ width: "100vw", height: "85vh" }} // Tamaño del contenedor
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
                        style={{ width: "100%", height: "100%" }}
                        allow="autoplay; encrypted-media"
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

                {/* Contenido adicional (incluyendo el enlace) */}
                <div
                    style={{
                        position: "absolute",
                        top: "47%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        textAlign: "center",
                        zIndex: 2, // Asegura que el contenido esté por encima del iframe
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2rem",
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
                            fontSize: "2rem",
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
                            fontSize: "2rem",
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
                            backgroundColor: "#0c2249",
                            padding: "0.5rem 1rem",
                            borderRadius: "5px",
                            transition: "background-color 0.3s ease",
                            width: "fit-content",
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
                <div
                    style={{
                        position: "absolute",
                        top: "47%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        textAlign: "center",
                    }}
                >
                    {/* ponle una fuerte de letra como el impact  */}
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2rem",
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
                            fontSize: "2rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#0c2249",
                            marginTop: -10,
                        }}
                    >
                        Equipos de
                    </h2>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "2rem",
                            fontFamily: "verdana, sans-serif, serif, arial",
                            fontWeight: "bold",
                            color: "#0c2249",
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
                            backgroundColor: "#0c2249",
                            padding: "0.5rem 1rem",
                            borderRadius: "5px",
                            transition: "background-color 0.3s ease",
                            width: "fit-content",
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
                    <div
                        style={{
                            position: "absolute",
                            top: "45%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "#fff",
                            textAlign: "center",
                        }}
                    >
                        {/* ponle una fuerte de letra como el impact  */}
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "2rem",
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
                                fontSize: "2rem",
                                fontFamily: "verdana, sans-serif, serif, arial",
                                fontWeight: "bold",
                                color: "#0c2249",
                                marginTop: -10,
                            }}
                        >
                            Equipos de
                        </h2>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "2rem",
                                fontFamily: "verdana, sans-serif, serif, arial",
                                fontWeight: "bold",
                                color: "#0c2249",
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
                                backgroundColor: "#0c2249",
                                padding: "0.5rem 1rem",
                                borderRadius: "5px",
                                transition: "background-color 0.3s ease",
                                width: "fit-content",
                            }}
                        >
                            Ver más
                        </a>
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>
    );
};

export default Slider;
