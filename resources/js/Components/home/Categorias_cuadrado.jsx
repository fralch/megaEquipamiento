import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
// Importar todas las imágenes de la carpeta "public/img/categorias"
const images = import.meta.glob('/public/img/categorias/**/*.{jpg,png}');

// Procesar las rutas para eliminar "public"
const processedImages = Object.keys(images).reduce((acc, path) => {
  // Quitar "/public" del inicio de la ruta
  const adjustedPath = path.replace('/public', '');
  acc[adjustedPath] = images[path];
  return acc;
}, {});

const getCategoryImages = (categoryName) => {
  const folderName = categoryName.toLowerCase().replace(/\s+/g, '-');
  return Object.keys(processedImages).filter((path) =>
    path.includes(`/img/categorias/${folderName}/`)
  );
};

const CategoryCard = ({ title, items }) => {
  const categoryImages = getCategoryImages(title);

  // Estado para manejar la imagen activa
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cambia la imagen activa cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % categoryImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categoryImages.length]);

  return (
    <div className="relative group w-full h-96 rounded-lg overflow-hidden shadow-lg m-4">
      {/* Imagen de fondo que rota */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${categoryImages[activeImageIndex] || 'https://aringenieriaa.com/storage/servicio/125456545.jpg'})`,
        }}
      ></div>

      {/* Título visible por defecto pero desaparece con hover */}
      <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white text-xl font-bold py-2 px-4 rounded-md z-10 transition-opacity duration-300 group-hover:opacity-0">
        {title}
      </div>

      {/* Contenido oculto que aparece con hover */}
      <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white flex flex-col justify-center items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>

        {/* Lista desplazable */}
        <div className="space-y-2 h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
          {items.map((item) => (
            <Link
              key={item.id_subcategoria}
              href={`/subcategoria/${item.id_subcategoria}`}
              className="block hover:bg-gray-700 p-2 rounded-md cursor-pointer"
            >
              {item.nombre}
            </Link>
          ))}
        </div>

        {/* Botón */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-4">
          Ver más
        </button>
      </div>
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Verifica si los datos ya están en el localStorage
    const storedData = localStorage.getItem('categoriasCompleta');

    if (storedData) {
      // Si los datos están en el localStorage, úsalos
      setCategories(JSON.parse(storedData));
    } else {
      // Si no están en el localStorage, haz la solicitud a la API
      fetch('http://127.0.0.1:8000/categorias-completa')
        .then((response) => response.json())
        .then((data) => {
          setCategories(data);
          localStorage.setItem('categoriasCompleta', JSON.stringify(data)); // Guarda en localStorage
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6 bg-white min-h-screen">
      {categories.map((category) => (
        <div key={category.id_categoria} className="m-4">
          <CategoryCard title={category.nombre} items={category.subcategorias} />
        </div>
      ))}
    </div>
  );
};

export default Categories;
