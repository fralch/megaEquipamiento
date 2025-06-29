import React, { useState } from 'react';
import { Phone, Mail, MapPin, Star, CheckCircle, Users, Award, MessageCircle } from 'lucide-react';
import { Head, usePage } from '@inertiajs/react';
import Header from "../Components/home/Header";
import Footer from "../Components/home/Footer";
import Menu from "../Components/home/Menu";
import NavVertical from "../Components/home/NavVertical";
import { useTheme } from '../storage/ThemeContext';

// Componente principal ContactPage con Header y Footer
const ContactPage = () => {
  const { isDarkMode } = useTheme();
  const { auth } = usePage().props;
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const galleryImages = [
    'https://megaequipamiento.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-04-at-12.29.40-PM-600x450.jpeg',
    'https://megaequipamiento.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-04-at-12.30.46-PM-600x450.jpeg',
    'https://megaequipamiento.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-04-at-12.31.40-PM-600x450.jpeg',
    'https://megaequipamiento.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-04-at-12.32.18-PM-600x450.jpeg',
    'https://megaequipamiento.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-04-at-12.33.49-PM-600x450.jpeg',
    'https://megaequipamiento.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-04-at-12.34.11-PM-600x450.jpeg',
    'https://megaequipamiento.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-04-at-12.47.33-PM-600x450.jpeg',
    'https://megaequipamiento.com/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-04-at-12.46.38-PM-600x450.jpeg'
  ];

  const services = [
    {
      title: "Venta de Equipos",
      description: "Amplia gama de equipos de laboratorio de las mejores marcas del mercado",
      icon: <Star className="w-6 h-6" />
    },
    {
      title: "Mantenimiento",
      description: "Servicio preventivo y correctivo 24/7 para garantizar el funcionamiento óptimo",
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: "Calibración",
      description: "Calibración acreditada según normas internacionales con resultados precisos",
      icon: <Award className="w-6 h-6" />
    }
  ];

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <Head title="Contacto - MEGA EQUIPAMIENTO" />
      
      {/* Header */}
      <Header />
      
      {/* Menu */}
      <Menu toggleMenu={toggleMenu} className="mt-0" />
      
      {/* Navegación Vertical */}
      <NavVertical isOpen={isOpen} onClose={toggleMenu} />

      {/* Contenido Principal */}
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              MEGA EQUIPAMIENTO
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Su socio para la venta, mantenimiento y calibración de equipos de laboratorio
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex items-center">
                <Users className="w-6 h-6 mr-2" />
                <span>20+ años de experiencia</span>
              </div>
              <div className="flex items-center">
                <Award className="w-6 h-6 mr-2" />
                <span>Calibración acreditada</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
             
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Megaequipamiento es una empresa perteneciente al Grupo EQUINLAB SAC, líder en la venta, 
                  mantenimiento y calibración de equipos de laboratorio en Perú.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {services.map((service, index) => (
                  <div key={index} className={`p-6 rounded-xl hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-blue-600 mb-4">{service.icon}</div>
                    <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{service.title}</h3>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{service.description}</p>
                  </div>
                ))}
              </div>

              <div className={`prose max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="text-lg leading-relaxed mb-6">
                  Con un equipo de más de 20 años de experiencia en el sector, nos dedicamos a ofrecer 
                  a nuestros clientes las mejores soluciones para sus necesidades de laboratorio.
                </p>
                <p className="text-lg leading-relaxed">
                  Nuestro equipo de expertos está formado por ingenieros y técnicos altamente cualificados, 
                  que están en constante formación para mantenerse al día de las últimas novedades del sector.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Map Section */}
        <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Contact Info */}
              <div>
                <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Información de Contacto</h2>
                
                <div className="space-y-6">
                  <div className={`flex items-start space-x-4 p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <MapPin className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dirección</h3>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        Av. Angelica Gamarra 1521 - Los Olivos - Lima - Perú
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-4 p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Phone className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Teléfonos</h3>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>01 336 4583</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>+51 939 294 882</p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-4 p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Mail className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Correos</h3>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>ventas@megaequipamiento.com</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>info@megaequipamiento.com</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a 
                    href="https://wa.me/51939294882" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>

              {/* Map */}
              <div className={`rounded-xl shadow-md overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15610.137128397255!2d-77.0792346!3d-12.0066935!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cf441e4b9bc3%3A0xe06a0030338de733!2sEQUINLAB%20SAC!5e0!3m2!1ses!2spe!4v1693919874450!5m2!1ses!2spe" 
                  width="100%" 
                  height="400" 
                  style={{border: 0}} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-96"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`}>
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Nuestras Instalaciones
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <div 
                  key={index} 
                  className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow group"
                >
                  <img 
                    src={image} 
                    alt={`Instalación ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Detail Section */}
        <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className={`p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="text-blue-600 mb-4">
                    <Star className="w-12 h-12" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Venta de equipos de laboratorio</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    En Megaequipamiento ofrecemos una amplia gama de equipos de laboratorio de las mejores marcas del mercado. 
                    Contamos con equipos para todos los laboratorios, desde los más básicos hasta los más avanzados.
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Nuestros equipos están diseñados para satisfacer las necesidades de los laboratorios más exigentes. 
                    Ofrecen un rendimiento óptimo, una gran durabilidad y facilidad de uso.
                  </p>
                </div>

                <div className={`p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="text-green-600 mb-4">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Mantenimiento de equipos de laboratorio</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    En Megaequipamiento llevamos a cabo el mantenimiento preventivo y correctivo de equipos de laboratorio de todo tipo.
                  </p>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Nuestro servicio de mantenimiento preventivo está diseñado para evitar averías y garantizar el correcto funcionamiento de sus equipos.
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Nuestro servicio de mantenimiento correctivo está disponible las 24 horas del día, los 7 días de la semana.
                  </p>
                </div>

                <div className={`p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="text-purple-600 mb-4">
                    <Award className="w-12 h-12" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Laboratorio de Calibración</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    En Megaequipamiento llevamos a cabo la calibración de equipos de laboratorio de todo tipo, 
                    según las normas internacionales.
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Nuestro servicio de calibración está acreditado nacional e internacionalmente, 
                    lo que garantiza que nuestros resultados son precisos y confiables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;