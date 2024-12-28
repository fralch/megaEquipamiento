import React from "react";

const Footer = () => {
  return (
    <footer className="relative bg-cover bg-center bg-no-repeat bg-blue-900 text-white p-6" style={{ backgroundImage: 'url("/img/footer.jpg")' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-6">
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
        <div className="md:col-span-2 lg:col-span-1 xl:col-span-1">
          <h4 className="font-bold border-b border-white pb-2 mb-4">Ubícanos</h4>
          <iframe
            title="mapa"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.5434744929966!2d-77.08142328503174!3d-12.006693491424473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cf441e4b9bc3%3A0xe06a0030338de733!2sEQUINLAB%20SAC!5e0!3m2!1ses-419!2spe!4v1633084269747!5m2!1ses-419!2spe"
            className="w-full h-40 border-0 rounded"
            loading="lazy"
          ></iframe>
        </div>

        {/* Síguenos */}
        <div className="hidden xl:block">
          <h4 className="font-bold border-b border-white pb-2 mb-4">Síguenos</h4>
          <div className="flex space-x-4">
            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-brand-youtube"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 3a5 5 0 0 1 5 5v8a5 5 0 0 1 -5 5h-12a5 5 0 0 1 -5 -5v-8a5 5 0 0 1 5 -5zm-9 6v6a1 1 0 0 0 1.514 .857l5 -3a1 1 0 0 0 0 -1.714l-5 -3a1 1 0 0 0 -1.514 .857z" /></svg>
            </a>
            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-brand-linkedin"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 2a5 5 0 0 1 5 5v10a5 5 0 0 1 -5 5h-10a5 5 0 0 1 -5 -5v-10a5 5 0 0 1 5 -5zm-9 8a1 1 0 0 0 -1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0 -1 -1m6 0a3 3 0 0 0 -1.168 .236l-.125 .057a1 1 0 0 0 -1.707 .707v5a1 1 0 0 0 2 0v-3a1 1 0 0 1 2 0v3a1 1 0 0 0 2 0v-3a3 3 0 0 0 -3 -3m-6 -3a1 1 0 0 0 -.993 .883l-.007 .127a1 1 0 0 0 1.993 .117l.007 -.127a1 1 0 0 0 -1 -1" /></svg>
            </a>
            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-brand-facebook"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 2a1 1 0 0 1 .993 .883l.007 .117v4a1 1 0 0 1 -.883 .993l-.117 .007h-3v1h3a1 1 0 0 1 .991 1.131l-.02 .112l-1 4a1 1 0 0 1 -.858 .75l-.113 .007h-2v6a1 1 0 0 1 -.883 .993l-.117 .007h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-6h-2a1 1 0 0 1 -.993 -.883l-.007 -.117v-4a1 1 0 0 1 .883 -.993l.117 -.007h2v-1a6 6 0 0 1 5.775 -5.996l.225 -.004h3z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
