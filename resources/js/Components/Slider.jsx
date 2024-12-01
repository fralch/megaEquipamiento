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
            style={{ width: "99vw", height: "85vh" }} // Tamaño del contenedor
        >
            {/* Slide con iframe */}
            <SwiperSlide>
                <iframe
                    src="https://www.youtube.com/embed/F8pMhuLK7nE?mute=1&autoplay=1&loop=1&playlist=F8pMhuLK7nE&vq=hd1080&controls=0&modestbranding=1&showinfo=0&rel=0"
                    title="YouTube video"
                    style={{ width: "100%", height: "100%" }}
                    allow="autoplay; encrypted-media"
                ></iframe>
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
                            top: "40%",
                            left: "10%",
                            transform: "translate(-50%, -50%)",
                            color: "#fff",
                            textAlign: "left",
                            textShadow: "0px 2px 4px rgba(0, 0, 0, 0.7)",
                        }}
                    >
                        <h2 style={{ margin: 0, fontSize: "2rem" }}>Líder en Ventas de</h2>
                        <h2 style={{ margin: 0, fontSize: "1rem" }}>Equipos de Laboratorio</h2>
                        <h2 style={{ margin: 0, fontSize: "1rem" }}>En todas las regiones del Peru</h2>
                        <a  href="https://wa.me/51999999999" target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: "1rem", fontSize: "1.5rem", color: "#fff", textDecoration: "none" }}>Contactanos</a>
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>
    );
};

export default Slider;
