import { Head, usePage, router, Link } from "@inertiajs/react";
import { useEffect, useState, lazy, Suspense } from "react";
import { FiLogIn, FiUser, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { useTheme } from "@/storage/ThemeContext";

// Componentes críticos (above the fold) - Carga inmediata
import Slider from "@/Components/home/Slider";
import Menu from "@/Components/home/Menu";
import Header from "@/Components/home/Header";

// Componentes no críticos (below the fold) - Lazy loading
const NavVertical = lazy(() => import("@/Components/home/NavVertical"));
const LabEquipmentSection = lazy(() => import("@/Components/home/LabEquipmentSection"));
const Sectores = lazy(() => import("@/Components/home/Sectores"));
const Categorias_cuadrado = lazy(() => import("@/Components/home/Categorias_cuadrado"));
const BrandSection = lazy(() => import("@/Components/home/BrandSection"));
const ClientSlider = lazy(() => import("@/Components/home/ClientSlider"));
const Footer = lazy(() => import("@/Components/home/Footer"));
const UserProfileModal = lazy(() => import("@/Components/UserProfileModal"));

export default function Welcome() {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();
    const [showUIElements, setShowUIElements] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

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
                                            
                                            <button
                                                onClick={() => {
                                                    setShowProfileModal(true);
                                                    setShowUserMenu(false);
                                                }}
                                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                                                    isDarkMode
                                                        ? "hover:bg-gray-700 hover:text-white"
                                                        : "hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm"
                                                }`}
                                            >
                                                <FiUser size={16} />
                                                Mi Perfil
                                            </button>
                                            
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
                        <Suspense fallback={<div />}>
                            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
                        </Suspense>
                    </ErrorBoundary>
                    <main className="mt-0 w-full">
                        <ErrorBoundary>
                            <Slider />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <Suspense fallback={
                                <div className={`w-full h-96 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                            }>
                                <LabEquipmentSection />
                            </Suspense>
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <Suspense fallback={
                                <div className={`w-full h-64 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                            }>
                                <Sectores />
                            </Suspense>
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <Suspense fallback={
                                <div className={`w-full h-96 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                            }>
                                <Categorias_cuadrado />
                            </Suspense>
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <Suspense fallback={
                                <div className={`w-full h-64 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                            }>
                                <BrandSection />
                            </Suspense>
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <Suspense fallback={
                                <div className={`w-full h-48 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                            }>
                                <ClientSlider />
                            </Suspense>
                        </ErrorBoundary>
                    </main>
                    <Suspense fallback={<div className="w-full h-32 bg-gray-900"></div>}>
                        <Footer />
                    </Suspense>
                </div>

                {/* User Profile Modal - Lazy loaded */}
                {showProfileModal && (
                    <Suspense fallback={null}>
                        <UserProfileModal
                            isOpen={showProfileModal}
                            onClose={() => setShowProfileModal(false)}
                            user={auth.user}
                        />
                    </Suspense>
                )}
            </div>
        </>
    );
}
