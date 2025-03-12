import { Head, usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Slider from "@/Components/home/Slider";
import Sectores from "@/Components/home/Sectores";
import Categorias_cuadrado from "@/Components/home/Categorias_cuadrado";
import NavVertical from "@/Components/home/NavVertical";
import Menu from "@/Components/home/Menu";
import ClientSlider from "@/Components/home/ClientSlider";
import BrandSection from "@/Components/home/BrandSection";
import Footer from "@/Components/home/Footer";
import Header from "@/Components/home/Header"; // Import the new Header component
import LabEquipmentSection from "@/Components/home/LabEquipmentSection"; // Import the new LabEquipmentSection component
import ErrorBoundary from "@/Components/ErrorBoundary";

export default function Welcome() {
    const { auth } = usePage().props;
    const [showUIElements, setShowUIElements] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // Verificar si el usuario está autenticado
    useEffect(() => {
        if (!auth.user) {
            // El usuario no está autenticado
            window.location.href = '/login';
        }
    }, [auth]);

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
                <Header /> {/* Use the new Header component */}

                {auth.user && (
                    <button
                        onClick={handleLogout}
                        className="fixed top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition duration-300 ease-in-out z-50"
                    >
                        Cerrar Sesión
                    </button>
                )}

                {auth.user ? (
                    <div
                        className="min-w-screen min-h-screen bg-gray-200"
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
                                <LabEquipmentSection /> {/* Use the new LabEquipmentSection component */}
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
                ) : null}
            </div>
        </>
    );
}
