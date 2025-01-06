import { Head } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import Header from "../Components/home/Header";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import ZoomImage from "../Components/store/ZoomImage";

const ProductPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const imageSrc = "https://megaequipamiento.com/wp-content/uploads/2023/08/Lector-de-codigo-de-barras-para-soporte-y-cable-Lamy-Rheology.webp";
  const toggleMenu = () => {
    setIsOpen(!isOpen);
};



  return (
    <div className="font-sans text-gray-800">
      <Head title="Producto" />
       <Header />
            <Menu toggleMenu={toggleMenu} className="mt-10"/>
            <NavVertical isOpen={isOpen} onClose={toggleMenu} />
      {/* Main Content */}
      <main className="p-6">
        {/* Product Section */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <ZoomImage imageSrc={imageSrc}  />



          {/* Product Details */}
          <div>
            <h1 className="text-2xl font-bold mb-4">
              Analizador de texturas TX-700 - 50 N - Lamy Rheology
            </h1>
            <p className="text-lg font-semibold text-blue-700 mb-2">
              $14,370.83
            </p>
            <button className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 mb-4">
              Agregar al carrito
            </button>
            <div>
              <ul className="flex space-x-4 border-b mb-4">
                <li className="border-b-2 border-blue-700 pb-2">Descripción</li>
                <li className="cursor-pointer hover:border-b-2 hover:border-gray-300">
                  Características
                </li>
                <li className="cursor-pointer hover:border-b-2 hover:border-gray-300">
                  Soporte Técnico
                </li>
              </ul>
              <p>
              El Analizador de texturas TX-700 - 50 N - Lamy Rheology es una herramienta avanzada y versátil diseñada para brindar un análisis preciso y completo de texturas en diversas aplicaciones. Con su amplia gama de sondas y celdas, este equipo se posiciona como el compañero ideal para satisfacer sus necesidades en laboratorio y área de producción. ¡Descubra por qué el TX-700 es la elección preferida de expertos y profesionales!
              <br />
              Características destacadas del Analizador de Texturas TX-700 - 50 N Lamy Rheology:
              <br />
              1. Pantalla táctil con visualización directa de curvas: Gracias a su pantalla táctil, el TX-700 le permite visualizar directamente las curvas de textura, lo que facilita la interpretación y análisis de los resultados obtenidos.
              <br />
              2. Programación y guardado de métodos: Con la capacidad de programar y guardar métodos, el TX-700 asegura una configuración personalizada y eficiente para sus pruebas de textura, agilizando el proceso y garantizando resultados consistentes.
              <br />
              3. Memoria y transferencia de datos: El equipo cuenta con funciones de memorización y transferencia de datos, lo que le permite acceder rápidamente a mediciones anteriores y transferir información importante para un análisis más completo.
              <br />
              4. Amplia variedad de sondas y celdas: Con una selección diversa de sondas y celdas, el TX-700 se adapta a diferentes tipos de muestras y aplicaciones, brindando una flexibilidad excepcional en sus análisis de textura.
              <br />
              5. Sensores de fuerza intercambiables: El equipo está equipado con sensores de fuerza intercambiables que facilitan el ajuste y la adaptación según las necesidades específicas de cada prueba.
              <br />
              6. Sonda de temperatura PT 100 integrada: La sonda de temperatura PT 100 integrada permite monitorear con precisión las condiciones térmicas durante las pruebas, lo que es esencial para ciertas aplicaciones sensibles a la temperatura.
              <br />  
              7. Bandeja regulable en altura: El Analizador de Texturas TX-700 ofrece una bandeja regulable en altura, lo que le permite analizar muestras de diferentes tamaños con facilidad y comodidad.
              <br />
              8. Función LIMS: La función LIMS (Laboratory Information Management System) facilita la integración del TX-700 con su sistema de gestión de laboratorio, mejorando la eficiencia y organización de los datos.
              <br />
              Con el Analizador de Texturas TX-700 - 50 N Lamy Rheology, obtendrá resultados precisos y confiables en sus análisis de textura. Ya sea que trabaje en la industria alimentaria, farmacéutica o cosmética, este equipo se adapta perfectamente a sus requerimientos, brindando un rendimiento excepcional y simplificando sus tareas diarias de laboratorio y producción. No pierda la oportunidad de mejorar sus procesos y elevar la calidad de sus productos con el TX-700. ¡Haga de él su aliado imprescindible en el análisis de texturas!
              </p>
            </div>
          </div>
        </section>

        {/* Accessories Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-6">Accesorios</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 hover:shadow-lg transition"
              >
                <img
                  src="/accessory-image.png"
                  alt="Accesorio"
                  className="w-full mb-4"
                />
                <h3 className="font-bold text-center">Sonda Esférica (Ø 18 mm)</h3>
                <p className="text-center text-gray-500 mt-2">$400.00</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 hover:shadow-lg transition"
              >
                <img
                  src="/related-product.png"
                  alt="Producto relacionado"
                  className="w-full mb-4"
                />
                <h3 className="font-bold text-center">
                  Analizador de texturas TX-700
                </h3>
                <p className="text-center text-gray-500 mt-2">$14,370.83</p>
              </div>
            ))}
          </div>
        </section>
      </main>

     
    </div>
  );
};

export default ProductPage;
