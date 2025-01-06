import React, { useState, useRef } from 'react';

const ZoomImage = ({ imageSrc }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width * 100;
    const y = (e.clientY - top) / height * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div
      className="flex justify-center items-center overflow-hidden relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        src={imageSrc}  
        className="w-full"
        ref={imgRef}
      />
      {isZoomed && (
        <div
          className="absolute inset-0 bg-white opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            backgroundImage: `url('${imageSrc}')`,
            backgroundSize: '200%',
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
        />
      )}
    </div>
  );
};

export default ZoomImage;
