import React, { useState, useEffect } from 'react';
import '../../../css/ClientSlider.css';

const ClientSlider = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const images = import.meta.glob('/public/img/nuestros_clientes/**/*.{jpg,png}');
    const clientsData = Object.keys(images).map((path) => {
      const name = path.split('/').pop().split('.').shift();
      const adjustedPath = path.replace('/public', '');
      console.log(adjustedPath); // Verifica las rutas en la consola
      return {
        image: adjustedPath,
        name,
      };
    });

    setClients(clientsData);
  }, []);

  return (
    <div className="client-slider pt-5 shadow-lg h-24 mx-auto overflow-hidden relative bg-white">
      <h2 className="text-2xl font-bold text-center">Nuestro Clientes</h2>
      <div className="client-slide-track flex space-x-6 animate-scroll">
        {clients.map((client, index) => (
          <div key={index} className="client-slide flex-shrink-0 w-40 h-24 flex items-center justify-center">
            <img
              src={client.image}
              className="h-full w-auto max-w-full object-contain"
              alt={client.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientSlider;
