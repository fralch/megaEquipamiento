import React, { useState, useEffect } from 'react';
import '../../../css/ClientSlider.css'; // Importamos el archivo CSS para las animaciones

const ClientSlider = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Usar import.meta.glob para importar todas las imágenes desde la carpeta public/img/marcas
    const images = import.meta.glob('/public/img/marcas/**/*.{jpg,png}');
    const clientsData = Object.keys(images).map((path) => {
      const name = path.split('/').pop().split('.').shift(); // Obtener el nombre del archivo sin extensión
      return {
        image: path.replace('/public', ''), // Ajustar la ruta para que sea accesible
        name,
      };
    });

    setClients(clientsData);
  }, []);

  return (
    <div className="client-slider pt-10 shadow-lg h-24 mx-auto overflow-hidden relative bg-[#f3f4f6]">
      <div className="client-slide-track flex space-x-6 animate-scroll">
        {clients.map((client, index) => (
          <div key={index} className="client-slide flex-shrink-0 h-24 w-64">
            <img
              src={client.image}
              className="h-full w-full object-contain"
              alt={client.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientSlider;
