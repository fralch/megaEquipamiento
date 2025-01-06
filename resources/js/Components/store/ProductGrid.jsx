import React from 'react';

const products = [
  {
    id: 1,
    title: "1/2 Sonda Esférica – Lamy Rheology (Ø 30 mm)",
    diameter: "30 mm",
    material: "Acero inoxidable 316L",
    brand: "Lamy Rheology",
    origin: "Francia",
    price: 359.60,
    image: "https://megaequipamiento.com/wp-content/uploads/2023/07/12-Sonda-Esferica-O-40-mm-Lamy-Rheology-1-1.webp",
    flag: "https://flagcdn.com/w320/fr.png"
  },
  {
    id: 2,
    title: "Sonda Cilíndrica – RheoTech (Ø 25 mm)",
    diameter: "25 mm",
    material: "Titanio Grado 5",
    brand: "RheoTech",
    origin: "Alemania",
    price: 420.00,
    image: "https://megaequipamiento.com/wp-content/uploads/2024/06/Agitador-de-helice-ZZ-1000S-Eyela-1024x1024.webp",
    flag: "https://flagcdn.com/w320/de.png"
  },
  {
    id: 3,
    title: "Sonda Cónica – FlowMaster (Ø 40 mm)",
    diameter: "40 mm",
    material: "Aluminio 6061",
    brand: "FlowMaster",
    origin: "Estados Unidos",
    price: 299.99,
    image: "https://your-image-url.com/image3.png",
    flag: "https://flagcdn.com/w320/us.png"
  },
  {
    id: 4,
    title: "Sonda Plana – ViscoTech (Ø 50 mm)",
    diameter: "50 mm",
    material: "Acero inoxidable 304",
    brand: "ViscoTech",
    origin: "Japón",
    price: 380.50,
    image: "https://your-image-url.com/image4.png",
    flag: "https://flagcdn.com/w320/jp.png"
  },
  {
    id: 5,
    title: "Sonda Esférica – RheoFlow (Ø 35 mm)",
    diameter: "35 mm",
    material: "Acero inoxidable 316",
    brand: "RheoFlow",
    origin: "Italia",
    price: 320.75,
    image: "https://your-image-url.com/image5.png",
    flag: "https://flagcdn.com/w320/it.png"
  },
  {
    id: 6,
    title: "Sonda Cilíndrica – ViscoMaster (Ø 20 mm)",
    diameter: "20 mm",
    material: "Acero inoxidable 316L",
    brand: "ViscoMaster",
    origin: "España",
    price: 280.00,
    image: "https://your-image-url.com/image6.png",
    flag: "https://flagcdn.com/w320/es.png"
  },
  {
    id: 7,
    title: "Sonda Cónica – RheoSense (Ø 45 mm)",
    diameter: "45 mm",
    material: "Titanio Grado 2",
    brand: "RheoSense",
    origin: "Reino Unido",
    price: 399.99,
    image: "https://your-image-url.com/image7.png",
    flag: "https://flagcdn.com/w320/gb.png"
  },
  {
    id: 8,
    title: "Sonda Plana – FlowTech (Ø 55 mm)",
    diameter: "55 mm",
    material: "Aluminio 7075",
    brand: "FlowTech",
    origin: "Canadá",
    price: 410.50,
    image: "https://your-image-url.com/image8.png",
    flag: "https://flagcdn.com/w320/ca.png"
  },
  {
    id: 9,
    title: "Sonda Esférica – ViscoSense (Ø 32 mm)",
    diameter: "32 mm",
    material: "Acero inoxidable 304L",
    brand: "ViscoSense",
    origin: "Australia",
    price: 330.75,
    image: "https://your-image-url.com/image9.png",
    flag: "https://flagcdn.com/w320/au.png"
  },
  {
    id: 10,
    title: "Sonda Cilíndrica – RheoMaster (Ø 22 mm)",
    diameter: "22 mm",
    material: "Titanio Grado 5",
    brand: "RheoMaster",
    origin: "Suecia",
    price: 430.00,
    image: "https://your-image-url.com/image10.png",
    flag: "https://flagcdn.com/w320/se.png"
  },
  {
    id: 11,
    title: "Sonda Cónica – FlowSense (Ø 42 mm)",
    diameter: "42 mm",
    material: "Aluminio 6061",
    brand: "FlowSense",
    origin: "Noruega",
    price: 309.99,
    image: "https://your-image-url.com/image11.png",
    flag: "https://flagcdn.com/w320/no.png"
  },
  {
    id: 12,
    title: "Sonda Plana – ViscoFlow (Ø 52 mm)",
    diameter: "52 mm",
    material: "Acero inoxidable 316L",
    brand: "ViscoFlow",
    origin: "Dinamarca",
    price: 390.50,
    image: "https://your-image-url.com/image12.png",
    flag: "https://flagcdn.com/w320/dk.png"
  },
  {
    id: 13,
    title: "Sonda Esférica – RheoSense (Ø 34 mm)",
    diameter: "34 mm",
    material: "Titanio Grado 2",
    brand: "RheoSense",
    origin: "Finlandia",
    price: 340.75,
    image: "https://your-image-url.com/image13.png",
    flag: "https://flagcdn.com/w320/fi.png"
  },
  {
    id: 14,
    title: "Sonda Cilíndrica – FlowMaster (Ø 24 mm)",
    diameter: "24 mm",
    material: "Aluminio 7075",
    brand: "FlowMaster",
    origin: "Países Bajos",
    price: 440.00,
    image: "https://your-image-url.com/image14.png",
    flag: "https://flagcdn.com/w320/nl.png"
  },
  {
    id: 15,
    title: "Sonda Cónica – ViscoTech (Ø 44 mm)",
    diameter: "44 mm",
    material: "Acero inoxidable 304",
    brand: "ViscoTech",
    origin: "Bélgica",
    price: 319.99,
    image: "https://your-image-url.com/image15.png",
    flag: "https://flagcdn.com/w320/be.png"
  },
  {
    id: 16,
    title: "Sonda Plana – RheoFlow (Ø 54 mm)",
    diameter: "54 mm",
    material: "Titanio Grado 5",
    brand: "RheoFlow",
    origin: "Suiza",
    price: 400.50,
    image: "https://your-image-url.com/image16.png",
    flag: "https://flagcdn.com/w320/ch.png"
  },
  {
    id: 17,
    title: "Sonda Esférica – FlowSense (Ø 36 mm)",
    diameter: "36 mm",
    material: "Aluminio 6061",
    brand: "FlowSense",
    origin: "Austria",
    price: 350.75,
    image: "https://your-image-url.com/image17.png",
    flag: "https://flagcdn.com/w320/at.png"
  },
  {
    id: 18,
    title: "Sonda Cilíndrica – ViscoMaster (Ø 26 mm)",
    diameter: "26 mm",
    material: "Acero inoxidable 316L",
    brand: "ViscoMaster",
    origin: "Portugal",
    price: 450.00,
    image: "https://your-image-url.com/image18.png",
    flag: "https://flagcdn.com/w320/pt.png"
  },
  {
    id: 19,
    title: "Sonda Cónica – RheoSense (Ø 46 mm)",
    diameter: "46 mm",
    material: "Titanio Grado 2",
    brand: "RheoSense",
    origin: "Grecia",
    price: 329.99,
    image: "https://your-image-url.com/image19.png",
    flag: "https://flagcdn.com/w320/gr.png"
  },
  {
    id: 20,
    title: "Sonda Plana – FlowTech (Ø 56 mm)",
    diameter: "56 mm",
    material: "Aluminio 7075",
    brand: "FlowTech",
    origin: "Irlanda",
    price: 420.50,
    image: "https://your-image-url.com/image20.png",
    flag: "https://flagcdn.com/w320/ie.png"
  }
];


const Card = ({ product }) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden border min-h-[400px] relative group">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-64 object-contain p-4"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{product.title}</h2>
        <p className="text-sm text-gray-600">
          <strong>Diámetro:</strong> {product.diameter}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Material:</strong> {product.material}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Marca:</strong> {product.brand}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Procedencia:</strong> {product.origin}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <img
            src={product.flag}
            alt="Bandera"
            className="w-6 h-4 object-cover"
          />
        </div>
      </div>

      {/* Contenido oculto que aparece con hover */}
      <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white flex flex-col justify-center items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">{product.title}</h2>
        <p className="text-sm text-gray-300 mb-2">
          <strong>Diámetro:</strong> {product.diameter}
        </p>
        <p className="text-sm text-gray-300 mb-2">
          <strong>Material:</strong> {product.material}
        </p>
        <p className="text-sm text-gray-300 mb-2">
          <strong>Marca:</strong> {product.brand}
        </p>
        <p className="text-sm text-gray-300 mb-2">
          <strong>Procedencia:</strong> {product.origin}
        </p>
        <p className="text-sm text-gray-300 mb-4">{product.description}</p>

        {/* Botones */}
        <div className="flex space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Añadir al carrito
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
            Comparar
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      {products.map((product) => (
        <Card key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;





