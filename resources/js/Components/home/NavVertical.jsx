import React, { useState, useEffect } from 'react';

const NavVertical = ({ isOpen, onClose }) => {
  const [categoriasArray, setCategoriasArray] = useState([]);

  useEffect(() => {
    // Verifica si los datos ya están en el localStorage
    const storedData = localStorage.getItem('categoriasCompleta');

    if (storedData) {
      // Si los datos están en el localStorage, úsalos
      setCategoriasArray(JSON.parse(storedData));
    } else {
      // Si no están en el localStorage, haz la solicitud a la API
      fetch('http://127.0.0.1:8000/categorias-completa')
        .then((response) => response.json())
        .then((data) => {
          setCategoriasArray(data);
          localStorage.setItem('categoriasCompleta', JSON.stringify(data)); // Guarda en localStorage
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, []);

  const [openCategories, setOpenCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleCategory = (categoriaNombre) => {
    setOpenCategories((prevState) => ({
      ...prevState,
      [categoriaNombre]: !prevState[categoriaNombre],
    }));
    setActiveCategory(categoriaNombre);
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
          {categoriasArray.map((categoria) => (
            <div key={categoria.id_categoria}>
              <button
                onClick={() => toggleCategory(categoria.nombre)}
                className={`block w-full text-left p-2 rounded ${
                  activeCategory === categoria.nombre
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                {categoria.nombre}
                <span className="float-right">
                  {openCategories[categoria.nombre] ? '-' : '+'}
                </span>
              </button>
              {openCategories[categoria.nombre] &&
                categoria.subcategorias &&
                categoria.subcategorias.map((subcategoria) => (
                  <a
                    key={subcategoria.id_subcategoria}
                    href="#"
                    className="block p-2 pl-6 hover:bg-blue-50 rounded"
                  >
                    {subcategoria.nombre}
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
