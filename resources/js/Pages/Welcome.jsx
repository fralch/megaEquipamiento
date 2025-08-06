import { Head, usePage, router, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FiLogIn, FiUser, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "@/Components/home/Slider";
import Sectores from "@/Components/home/Sectores";
import Categorias_cuadrado from "@/Components/home/Categorias_cuadrado";
import NavVertical from "@/Components/home/NavVertical";
import Menu from "@/Components/home/Menu";
import ClientSlider from "@/Components/home/ClientSlider";
import BrandSection from "@/Components/home/BrandSection";
import Footer from "@/Components/home/Footer";
import Header from "@/Components/home/Header";
import LabEquipmentSection from "@/Components/home/LabEquipmentSection";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useTheme } from "@/storage/ThemeContext";

export default function Welcome() {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();
    const [showUIElements, setShowUIElements] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

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

            const userButton = document.getElementById("user-menu-button");
            const userMenu = document.getElementById("user-menu");
            if (
                userButton &&
                !userButton.contains(event.target) &&
                userMenu &&
                !userMenu.contains(event.target)
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        router.post("/logout");
    };

    const shouldHideButton = isOpen;

    return (
        <>
            <Head title="MegaEquipamiento" />

            <div>
                <Header />

                <AnimatePresence>
                    {!shouldHideButton && (
                        <motion.div
                            id="user-menu-button"
                            className="fixed bottom-5 left-5 z-50"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            {auth.user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className={`p-3 rounded-full shadow-lg transition-all ${
                                            isDarkMode
                                                ? "bg-[#1e3a8a] hover:bg-gray-700"
                                                : "bg-[#1e3a8a] hover:bg-gray-600"
                                        } text-white`}
                                    >
                                        <FiUser size={20} />
                                    </button>

                                    {showUserMenu && (
                                        <motion.div
                                            id="user-menu"
                                            className={`absolute bottom-16 left-0 w-44 rounded-xl ${
                                                isDarkMode
                                                    ? "bg-gray-800 text-white shadow-xl border border-gray-700"
                                                    : "bg-white text-gray-800 shadow-2xl border border-gray-200"
                                            } p-3 space-y-1`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className={`text-xs font-medium mb-2 px-2 ${
                                                isDarkMode ? "text-gray-400" : "text-gray-500"
                                            }`}>
                                                {auth.user?.name || "Usuario"}
                                            </div>
                                            
                                            <Link
                                                href="/profile"
                                                className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                                                    isDarkMode
                                                        ? "hover:bg-gray-700 hover:text-white"
                                                        : "hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm"
                                                }`}
                                            >
                                                <FiUser size={16} />
                                                Mi Perfil
                                            </Link>
                                            
                                            <hr className={`my-2 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`} />
                                            
                                            <button
                                                onClick={handleLogout}
                                                className={`w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                                                    isDarkMode
                                                        ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                                                        : "text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-sm"
                                                }`}
                                            >
                                                <FiLogOut size={16} />
                                                Cerrar Sesión
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${
                                        isDarkMode
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : "bg-blue-500 hover:bg-blue-600"
                                    } text-white text-sm font-medium`}
                                >
                                    <FiLogIn size={18} />
                                    <span className="hidden sm:inline">Iniciar Sesión</span>
                                </Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    className={`min-w-screen min-h-screen ${
                        isDarkMode ? "bg-gray-900" : "bg-gray-200"
                    } transition-colors duration-300`}
                    style={{ marginTop: "-20px" }}
                >
                    <Menu toggleMenu={toggleMenu} />
                    <ErrorBoundary>
                        <NavVertical isOpen={isOpen} onClose={toggleMenu} />
                    </ErrorBoundary>
                    <main className="mt-0 w-full">
                        <ErrorBoundary>
                            <Slider />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <LabEquipmentSection />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <Sectores />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <Categorias_cuadrado />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <BrandSection />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <ClientSlider />
                        </ErrorBoundary>
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    );
}
