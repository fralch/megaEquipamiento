// Menu.jsx
import React from "react";
import { mdiChevronDown, mdiGauge, mdiLayersOutline, mdiWidgetsOutline } from "@mdi/js";

const Menu = ({ toggleMenu }) => {
    return (
        <div className="rounded bg-white px-5 py-3 shadow-xl pb-5" id="menu">
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
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d={mdiLayersOutline} />
                                </svg>
                            </span>
                            <span>Categorias</span>
                            <span className="ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d={mdiGauge} />
                                </svg>
                            </span>
                            <span>Inicio</span>
                            <span className="ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
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
    );
};

export default Menu;
