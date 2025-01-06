import React, { useState } from 'react';

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
  },
  {
    id: 21,
    title: "Sonda Esférica – TechFlow (Ø 38 mm)",
    diameter: "38 mm",
    material: "Acero inoxidable 316L",
    brand: "TechFlow",
    origin: "Brasil",
    price: 370.00,
    image: "https://your-image-url.com/image21.png",
    flag: "https://flagcdn.com/w320/br.png"
  },
  {
    id: 22,
    title: "Sonda Cilíndrica – MasterRheo (Ø 28 mm)",
    diameter: "28 mm",
    material: "Titanio Grado 5",
    brand: "MasterRheo",
    origin: "México",
    price: 460.00,
    image: "https://your-image-url.com/image22.png",
    flag: "https://flagcdn.com/w320/mx.png"
  },
  {
    id: 23,
    title: "Sonda Cónica – FlowTech (Ø 48 mm)",
    diameter: "48 mm",
    material: "Aluminio 6061",
    brand: "FlowTech",
    origin: "Argentina",
    price: 319.99,
    image: "https://your-image-url.com/image23.png",
    flag: "https://flagcdn.com/w320/ar.png"
  },
  {
    id: 24,
    title: "Sonda Plana – ViscoMaster (Ø 58 mm)",
    diameter: "58 mm",
    material: "Acero inoxidable 304",
    brand: "ViscoMaster",
    origin: "Chile",
    price: 430.50,
    image: "https://your-image-url.com/image24.png",
    flag: "https://flagcdn.com/w320/cl.png"
  },
  {
    id: 25,
    title: "Sonda Esférica – RheoSense (Ø 31 mm)",
    diameter: "31 mm",
    material: "Titanio Grado 2",
    brand: "RheoSense",
    origin: "Colombia",
    price: 360.75,
    image: "https://your-image-url.com/image25.png",
    flag: "https://flagcdn.com/w320/co.png"
  },
  {
    id: 26,
    title: "Sonda Cilíndrica – FlowMaster (Ø 21 mm)",
    diameter: "21 mm",
    material: "Aluminio 7075",
    brand: "FlowMaster",
    origin: "Perú",
    price: 470.00,
    image: "https://your-image-url.com/image26.png",
    flag: "https://flagcdn.com/w320/pe.png"
  },
  {
    id: 27,
    title: "Sonda Cónica – ViscoTech (Ø 41 mm)",
    diameter: "41 mm",
    material: "Acero inoxidable 316L",
    brand: "ViscoTech",
    origin: "Ecuador",
    price: 329.99,
    image: "https://your-image-url.com/image27.png",
    flag: "https://flagcdn.com/w320/ec.png"
  },
  {
    id: 28,
    title: "Sonda Plana – RheoFlow (Ø 51 mm)",
    diameter: "51 mm",
    material: "Titanio Grado 5",
    brand: "RheoFlow",
    origin: "Venezuela",
    price: 440.50,
    image: "https://your-image-url.com/image28.png",
    flag: "https://flagcdn.com/w320/ve.png"
  },
  {
    id: 29,
    title: "Sonda Esférica – FlowSense (Ø 33 mm)",
    diameter: "33 mm",
    material: "Aluminio 6061",
    brand: "FlowSense",
    origin: "Uruguay",
    price: 380.75,
    image: "https://your-image-url.com/image29.png",
    flag: "https://flagcdn.com/w320/uy.png"
  },
  {
    id: 30,
    title: "Sonda Cilíndrica – ViscoMaster (Ø 23 mm)",
    diameter: "23 mm",
    material: "Acero inoxidable 304",
    brand: "ViscoMaster",
    origin: "Paraguay",
    price: 490.00,
    image: "https://your-image-url.com/image30.png",
    flag: "https://flagcdn.com/w320/py.png"
  },
  {
    id: 31,
    title: "Sonda Cónica – RheoSense (Ø 43 mm)",
    diameter: "43 mm",
    material: "Titanio Grado 2",
    brand: "RheoSense",
    origin: "Bolivia",
    price: 339.99,
    image: "https://your-image-url.com/image31.png",
    flag: "https://flagcdn.com/w320/bo.png"
  },
  {
    id: 32,
    title: "Sonda Plana – FlowTech (Ø 53 mm)",
    diameter: "53 mm",
    material: "Aluminio 7075",
    brand: "FlowTech",
    origin: "Guatemala",
    price: 450.50,
    image: "https://your-image-url.com/image32.png",
    flag: "https://flagcdn.com/w320/gt.png"
  },
  {
    id: 33,
    title: "Sonda Esférica – ViscoSense (Ø 37 mm)",
    diameter: "37 mm",
    material: "Acero inoxidable 316L",
    brand: "ViscoSense",
    origin: "Costa Rica",
    price: 390.75,
    image: "https://your-image-url.com/image33.png",
    flag: "https://flagcdn.com/w320/cr.png"
  },
  {
    id: 34,
    title: "Sonda Cilíndrica – RheoMaster (Ø 27 mm)",
    diameter: "27 mm",
    material: "Titanio Grado 5",
    brand: "RheoMaster",
    origin: "Panamá",
    price: 500.00,
    image: "https://your-image-url.com/image34.png",
    flag: "https://flagcdn.com/w320/pa.png"
  },
  {
    id: 35,
    title: "Sonda Cónica – FlowSense (Ø 47 mm)",
    diameter: "47 mm",
    material: "Aluminio 6061",
    brand: "FlowSense",
    origin: "Honduras",
    price: 349.99,
    image: "https://your-image-url.com/image35.png",
    flag: "https://flagcdn.com/w320/hn.png"
  },
  {
    id: 36,
    title: "Sonda Plana – ViscoMaster (Ø 57 mm)",
    diameter: "57 mm",
    material: "Acero inoxidable 304",
    brand: "ViscoMaster",
    origin: "El Salvador",
    price: 460.50,
    image: "https://your-image-url.com/image36.png",
    flag: "https://flagcdn.com/w320/sv.png"
  },
  {
    id: 37,
    title: "Sonda Esférica – RheoSense (Ø 39 mm)",
    diameter: "39 mm",
    material: "Titanio Grado 2",
    brand: "RheoSense",
    origin: "Nicaragua",
    price: 370.75,
    image: "https://your-image-url.com/image37.png",
    flag: "https://flagcdn.com/w320/ni.png"
  },
  {
    id: 38,
    title: "Sonda Cilíndrica – FlowMaster (Ø 29 mm)",
    diameter: "29 mm",
    material: "Aluminio 7075",
    brand: "FlowMaster",
    origin: "República Dominicana",
    price: 510.00,
    image: "https://your-image-url.com/image38.png",
    flag: "https://flagcdn.com/w320/do.png"
  },
  {
    id: 39,
    title: "Sonda Cónica – ViscoTech (Ø 49 mm)",
    diameter: "49 mm",
    material: "Acero inoxidable 316L",
    brand: "ViscoTech",
    origin: "Cuba",
    price: 359.99,
    image: "https://your-image-url.com/image39.png",
    flag: "https://flagcdn.com/w320/cu.png"
  },
  {
    id: 40,
    title: "Sonda Plana – RheoFlow (Ø 59 mm)",
    diameter: "59 mm",
    material: "Titanio Grado 5",
    brand: "RheoFlow",
    origin: "Haití",
    price: 470.50,
    image: "https://your-image-url.com/image40.png",
    flag: "https://flagcdn.com/w320/ht.png"
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
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {currentProducts.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;




