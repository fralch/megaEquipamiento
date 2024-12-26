import React from 'react';
import '../../../css/ClientSlider.css'; // Importamos el archivo CSS para las animaciones

const ClientSlider = () => {
  const clients = [
    { image: './img/cajahuancayo.jpg', name: 'Cajahuancayo' },
    { image: './img/DIMEXA.png', name: 'DIMEXA' },
    { image: './img/FLORES.png', name: 'FLORES' },
    { image: './img/GALAXIA.png', name: 'GALAXIA' },
    { image: './img/GRANDE.jpg', name: 'GRANDE' },
    { image: './img/PRAXIS.png', name: 'PRAXIS' },
    { image: './img/PRUCIL.png', name: 'PRUCIL' },
    { image: './img/1.jpg', name: 'Client 1' },
    { image: './img/2.jpg', name: 'Client 2' },
    { image: './img/3.jpg', name: 'Client 3' },
    { image: './img/4.jpg', name: 'Client 4' },
    { image: './img/5.jpg', name: 'Client 5' },
    { image: './img/6.jpg', name: 'Client 6' },
    { image: './img/7.jpg', name: 'Client 7' },
    { image: './img/8.jpg', name: 'Client 8' },
  ];

  return (
    <div className="client-slider bg-white shadow-lg h-24 mx-auto overflow-hidden relative">
      <div className="client-slide-track flex">
        {clients.map((client, index) => (
          <div key={index} className="client-slide h-24 w-64">
            <img src={client.image} className="h-24 w-64" alt={client.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientSlider;
