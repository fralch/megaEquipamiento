import React, { useState, useEffect } from 'react';

const NavVertical = ({ isOpen, onClose }) => {
    const [categoriasArray, setCategoriasArray] = useState([]);
    const [subcategoriasArray, setSubcategoriasArray] = useState({});

    useEffect(() => {
        fetch('http://127.0.0.1:8000/categorias-all')
            .then((response) => response.json())
            .then((data) => {
                setCategoriasArray(data);
                fetch('http://127.0.0.1:8000/subcategorias-all')
                    .then((response) => response.json())
                    .then((data) => {
                        setSubcategoriasArray(data);
                    });
            });
    }, []);

 

    const [openCategories, setOpenCategories] = useState({});
    const [activeCategory, setActiveCategory] = useState(null); // Estado para la categoría activa

    const toggleCategory = (categoria) => {
        setOpenCategories((prevState) => ({
            ...prevState,
            [categoria]: !prevState[categoria],
        }));
        setActiveCategory(categoria); // Establece la categoría activa
    };

    return (
        <div
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-lg z-10 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ height: '100vh' }}
    >
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4">
                <img
                    className="w-1/2 object-contain"
                    src="/img/logo2.jpg"
                    alt="EquinLab Logo"
                />
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg focus:outline-none focus:ring"
                >
                    <svg
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
                {categoriasArray.map((categoria, index) => (
                    <div key={index}>
                        <button
                            onClick={() => toggleCategory(categoria)}
                            className={`block w-full text-left p-2 rounded ${
                                activeCategory === categoria
                                    ? 'bg-blue-200 text-blue-800' // Estilos de la categoría activa
                                    : 'bg-white hover:bg-gray-200'
                            }`}
                        >
                            {categoria}
                            <span className="float-right">
                                {openCategories[categoria] ? '-' : '+'}
                            </span>
                        </button>
                        {openCategories[categoria] &&
                            subcategoriasArray[categoria] &&
                            subcategoriasArray[categoria].map((subcategoria, subIndex) => (
                                <a
                                    key={subIndex}
                                    href="#"
                                    className="block p-2 pl-6 hover:bg-blue-50 rounded"
                                >
                                    {subcategoria}
                                </a>
                            ))}
                    </div>
                ))}
            </nav>
            <div className="p-4"></div>
        </div>
    </div>
    );
};

export default NavVertical;
