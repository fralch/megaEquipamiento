// Welcome.jsx
import { Head } from "@inertiajs/react";
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

export default function Welcome() {
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

    return (
        <>
            <Head title="EquinLab" />

            <div>
                <Header /> {/* Use the new Header component */}

                <div
                    className="min-w-screen min-h-screen bg-gray-200"
                    style={{ marginTop: "-20px" }}
                >
                    <Menu toggleMenu={toggleMenu} />
                    <NavVertical isOpen={isOpen} onClose={toggleMenu} />
                    <main className="mt-0 w-full">
                        <Slider />

                        <LabEquipmentSection /> {/* Use the new LabEquipmentSection component */}

                        {/* ------------- */}
                        <Sectores />

                        {/* ------------- */}
                        <Categorias_cuadrado />

                        {/* ------------- */}
                        <BrandSection />

                        <ClientSlider />
                    </main>
                    <Footer />
                </div>
            </div>
        </>
    );
}
