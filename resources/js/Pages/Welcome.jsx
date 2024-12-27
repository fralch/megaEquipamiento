import { Head } from "@inertiajs/react";
import {
    mdiChevronDown,
    mdiChevronRight,
    mdiGauge,
    mdiLayersOutline,
    mdiWidgetsOutline,
} from "@mdi/js";
import { useEffect, useState } from "react";
import CartIcon from "@/Components/home/CartIcon ";
import Slider from "@/Components/home/Slider";
import Sectores from "@/Components/home/Sectores";
import Categorias_cuadrado from "@/Components/home/Categorias_cuadrado";
import NavVertical from "@/Components/home/NavVertical";
import ClientSlider from "@/Components/home/ClientSlider";

export default function Welcome() {
    const [showUIElements, setShowUIElements] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState(null); // New state to track active submenu
    const [isOpen, setIsOpen] = useState(false);

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



    useEffect(() => {
        const handleClickOutside = (event) => {
            const categoryButton = document.getElementById("category-button");
            const dropdown = document.getElementById("dropdown");
            if (
                categoryButton &&
                !categoryButton.contains(event.target) &&
                dropdown &&
                !dropdown.contains(event.target)
            ) {
                setShowUIElements(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

 
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    return (
        <>
            <Head title="EquinLab" />

            <div>
                <header className="bg-white">
                    <div className="container mx-auto flex items-center px-8 py-8 md:px-12 max-w-full">
                        {/* Logo */}
                        <div className="mr-auto w-2/12 flex-shrink-0 sm:w-1/12 md:w-1/6 pr-4 ml-10">
                            <img
                                className="w-full object-contain"
                                src="/img/logo2.jpg"
                                alt="EquinLab Logo"
                            />
                        </div>

                        {/* Input de búsqueda centrado */}
                        <div className="mx-auto flex w-full max-w-lg items-center rounded-md bg-gray-100 xl:max-w-2xl">
                            <input
                                className="w-full border-l border-gray-300 bg-transparent py-2 pl-4 text-sm font-semibold"
                                type="text"
                                placeholder="Buscar ..."
                            />
                            <svg
                                className="ml-auto h-5 px-4 text-gray-500"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="far"
                                data-icon="search"
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                            >
                                <path
                                    fill="currentColor"
                                    d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"
                                ></path>
                            </svg>
                        </div>

                        {/* Contacto */}
                        <div
                            className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52 pl-4 mr-20"
                            id="contactos"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icon-tabler-phone"
                            >
                                <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                />
                                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                            </svg>

                            <div className="flex flex-col">
                                <div
                                    className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52"
                                    id="redes-sociales"
                                >
                                    <svg
                                        viewBox="0 0 512 512"
                                        width={"24px"}
                                        height={"24px"}
                                    >
                                        <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z" />
                                    </svg>
                                    <svg
                                        viewBox="0 0 448 512"
                                        width={"26px"}
                                        height={"26px"}
                                    >
                                        <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                                    </svg>
                                    <svg
                                        viewBox="0 0 576 512"
                                        width={"26px"}
                                        height={"26px"}
                                    >
                                        <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
                                    </svg>
                                    <svg
                                        viewBox="0 0 512 512"
                                        width={"26px"}
                                        height={"26px"}
                                    >
                                        <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                                    </svg>
                                    <svg
                                        viewBox="0 0 512 512"
                                        width={"26px"}
                                        height={"26px"}
                                    >
                                        <path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <CartIcon />
                    </div>
                </header>

                <div
                    className="min-w-screen min-h-screen bg-gray-200"
                    style={{ marginTop: "-20px" }}
                >
                    <div className="rounded bg-white px-5 py-3 shadow-xl pb-5">
                        <div className="-mx-1 flex items-center justify-between">
                            <ul className="flex h-10 w-full flex-wrap items-center">
                                <li className="relative block">
                                    <a
                                        href="#"
                                        className="mx-1 flex h-10 cursor-pointer items-center rounded bg-[#0c2249] px-4 leading-10 text-white no-underline transition-colors duration-100 hover:no-underline"
                                        onClick={toggleMenu}
                                        id="category-button"
                                    >
                                        <span className="mr-3 text-xl">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiLayersOutline} />
                                            </svg>
                                        </span>
                                        <span>Categorias</span>
                                        <span className="ml-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiChevronDown} />
                                            </svg>
                                        </span>
                                    </a>
                                  
                                </li>
                                <li className="relative hidden md:block ">
                                    <a
                                        href="#"
                                        className="mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:bg-gray-100 hover:no-underline"
                                    >
                                        <span className="mr-3 text-xl">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiGauge} />
                                            </svg>
                                        </span>
                                        <span>Inicio</span>
                                        <span className="ml-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiChevronDown} />
                                            </svg>
                                        </span>
                                    </a>
                                </li>

                                <li className="relative  hidden md:block">
                                    <a
                                        href="#"
                                        className="mx-1 flex h-10 cursor-pointer items-center rounded px-4 leading-10 no-underline transition-colors duration-100 hover:bg-gray-100 hover:no-underline"
                                    >
                                        <span className="mr-3 text-xl">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d={mdiWidgetsOutline} />
                                            </svg>
                                        </span>
                                        <span>Contactenos</span>
                                    </a>
                                </li>
                            </ul>
                            <div className="ml-10 flex flex-row items-center gap-4 sm:flex md:w-28 xl:w-32">
                                <select
                                    name="moneda"
                                    id="moneda"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                >
                                    <option value="sol">Soles</option>
                                    <option value="dollar">Dolares</option>
                                    <option value="euro">Euros</option>
                                </select>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "5px",
                                    marginLeft: "20px",
                                    borderColor: "#d1d5db",
                                    border: "1px solid",
                                    padding: "5px",
                                    borderRadius: "5px",
                                    backgroundColor: "#f3f4f6",
                                    alignItems: "center",
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="30"
                                    height="30"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="icon icon-tabler icons-tabler-outline icon-tabler-git-compare"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                    <path d="M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                    <path d="M11 6h5a2 2 0 0 1 2 2v8" />
                                    <path d="M14 9l-3 -3l3 -3" />
                                    <path d="M13 18h-5a2 2 0 0 1 -2 -2v-8" />
                                    <path d="M10 15l3 3l-3 3" />
                                </svg>
                                <h4>Comparador</h4>
                            </div>
                        </div>
                    </div>
                    <NavVertical isOpen={isOpen} onClose={toggleMenu} />
                    <main className="mt-0 w-full">
                        <Slider />

                        <section className="flex flex-col md:flex-row relative">
                            <div className="bg-[#0c2249] md:w-1/2 p-4 md:p-8 flex flex-col gap-4 mt-10 text-white relative z-0">
                                <h3 className="text-3xl font-bold pt-12">
                                    Equipos de laboratorio
                                </h3>
                                <p className="text-xl pr-36 pb-24">
                                    Los equipos de laboratorio son instrumentos
                                    utilizados para llevar a cabo experimentos,
                                    análisis y estudios en diferentes
                                    disciplinas científicas. Algunos equipos de
                                    laboratorio incluyen microscopios,
                                    espectrofotómetros, balanzas de laboratorio,
                                    centrífugas, autoclaves, agitadores
                                    magnéticos, incubadoras, pipetas, y sistemas
                                    de cromatografía, entre muchos otros. Cada
                                    equipo tiene su propia utilidad y está
                                    diseñado para manipular muestras y realizar
                                    mediciones con precisión. Estos instrumentos
                                    son esenciales para la investigación
                                    científica, el desarrollo de productos, el
                                    control de calidad y el análisis en una
                                    amplia gama de campos, como la biología, la
                                    química, la física, la medicina, la
                                    ingeniería y las ciencias ambientales.
                                </p>
                            </div>
                            <div
                                id="image"
                                className="md:w-7/12 absolute top-32 right-0 z-10"
                            >
                                <img
                                    src="https://megaequipamiento.com/wp-content/uploads/2023/09/desarrollo-de-proyectos-2.webp"
                                    alt="Equipos de laboratorio"
                                />
                            </div>
                        </section>
                      {/* ------------- */}
                      <Sectores />
                   
                      {/* ------------- */}
                      <Categorias_cuadrado />
                      <div className="p-8 bg-[#f3f4f6]" id="marcas">
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
                    <ClientSlider />
                    </main>
                    <footer className="py-16 text-center text-sm text-black dark:text-white/70"></footer>
                </div>
                
                
            </div>
        </>
    );
}
