import { Head, usePage, router, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
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
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

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

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            <Head title="MegaEquipamiento"  />

            <div>
                <Header />

                {auth.user ? (
                    <button
                        onClick={handleLogout}
                        className={`fixed top-4 right-4 ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white px-4 py-2 rounded-md shadow-md transition duration-300 ease-in-out z-50`}
                    >
                        Cerrar Sesión
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className={`fixed top-4 right-4 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#184f96] hover:bg-[#123d75]'} text-white px-4 py-2 rounded-md shadow-md transition duration-300 ease-in-out z-50`}
                    >
                        Iniciar Sesión
                    </Link>
                )}

                <div
                    className={`min-w-screen min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} transition-colors duration-300`}
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

                        {/* ------------- */}
                        <ErrorBoundary>
                            <Sectores />
                        </ErrorBoundary>

                        {/* ------------- */}
                        <ErrorBoundary>
                            <Categorias_cuadrado />
                        </ErrorBoundary>

                        {/* ------------- */}
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
