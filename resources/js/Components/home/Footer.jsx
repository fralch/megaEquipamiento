import React from "react";

const Footer = () => {
  return (
    <footer className="relative bg-cover bg-center bg-no-repeat bg-blue-900 text-white p-6" style={{ backgroundImage: 'url("/img/footer.jpg")' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 p-6">
        {/* Sobre megaequipamiento */}
        <div>
          <h4 className="font-bold border-b border-white pb-2 mb-4">Sobre megaequipamiento.com</h4>
          <ul className="space-y-2">
            <li>✔ Inicio</li>
            <li>✔ Nuestro equipo</li>
            <li>✔ Sobre nosotros</li>
            <li>✔ Nuestros clientes</li>
          </ul>
        </div>

        {/* Qué ofrecemos */}
        <div>
          <h4 className="font-bold border-b border-white pb-2 mb-4">¿Qué ofrecemos?</h4>
          <ul className="space-y-2">
            <li>✔ Venta de equipos de laboratorio</li>
            <li>✔ Calibración de equipos de laboratorio</li>
            <li>✔ Mantenimiento de equipos de laboratorio</li>
          </ul>
        </div>

        {/* Información de contacto */}
        <div>
          <h4 className="font-bold border-b border-white pb-2 mb-4">Información de contacto</h4>
          <ul className="space-y-2">
            <li>📞 +51 939 294 882</li>
            <li>📧 ventas@megaequipamiento.com</li>
            <li>📧 ventas1@megaequipamiento.com</li>
            <li>📧 operaciones@megaequipamiento.com</li>
          </ul>
        </div>

        {/* Ubícanos */}
        <div>
          <h4 className="font-bold border-b border-white pb-2 mb-4">Ubícanos</h4>
          <iframe
            title="mapa"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.5434744929966!2d-77.08142328503174!3d-12.006693491424473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cf441e4b9bc3%3A0xe06a0030338de733!2sEQUINLAB%20SAC!5e0!3m2!1ses-419!2spe!4v1633084269747!5m2!1ses-419!2spe"
            className="w-full h-40 border-0 rounded"
            loading="lazy"
          ></iframe>

        </div>

        {/* Síguenos */}
        <div>
          <h4 className="font-bold border-b border-white pb-2 mb-4">Síguenos</h4>
          <div className="flex space-x-4">
            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
              <img src="/icons/youtube.svg" alt="YouTube" className="w-6 h-6" />
            </a>
            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
              <img src="/icons/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
            </a>
            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
              <img src="/icons/facebook.svg" alt="Facebook" className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
