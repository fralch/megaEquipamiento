import React, { useState, useRef } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

const ZoomImage = ({ imageSrc, productId, imageSize = 100 }) => {
  const { auth } = usePage().props;
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileData = useRef(null);

  const handleMouseEnter = () => {
    if (!isEditing) {
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isEditing) {
      setIsZoomed(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!isEditing) {
      const { left, top, width, height } = imgRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width * 100;
      const y = (e.clientY - top) / height * 100;
      setZoomPosition({ x, y });
    }
  };

  const handleImageClick = () => {
    // Solo permitir edición si el usuario está autenticado
    if (auth && auth.user) {
      setIsEditing(true);
      setIsZoomed(false);
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      fileData.current = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!fileData.current) {
      setError('No se ha seleccionado ninguna imagen');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('id_producto', productId);
      formData.append('imagen', fileData.current);

      const response = await axios.post('/productos/actualizar-imagen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Imagen actualizada:', response.data);
      setSuccess(true);
      setIsEditing(false);
      // Si el servidor devuelve la URL de la imagen actualizada, puedes actualizar imageSrc
      // Por ahora, mantenemos la imagen editada en el estado local
    } catch (error) {
      console.error('Error al actualizar la imagen:', error);
      setError('Error al guardar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedImage(null);
    setIsEditing(false);
    setError(null);
    setSuccess(false);
    fileData.current = null;
  };

  return (
    <div className="relative">
      <div
        className="flex justify-center items-center overflow-hidden relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={!isEditing ? handleImageClick : undefined}
        style={{ 
          width: `${imageSize}%`,
          aspectRatio: '1/1',
          position: 'relative'
        }}
      >
        <img
          src={editedImage || imageSrc}  
          className={`${!isEditing && auth && auth.user ? 'cursor-pointer' : ''} object-cover w-full h-full`}
          ref={imgRef}
          alt="Imagen del producto"
        />
        {isZoomed && !isEditing && (
          <div
            className="absolute inset-0 bg-white opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundImage: `url('${editedImage || imageSrc}')`,
              backgroundSize: '200%',
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        )}
      </div>

      {/* Input oculto para seleccionar archivo */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* Controles de edición */}
      {isEditing && auth && auth.user && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-2 flex flex-col justify-center">
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          {success && <p className="text-green-500 text-center mb-2">¡Imagen guardada con éxito!</p>}
          <div className="flex justify-center space-x-2">
            <button 
              className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSaveEdit}
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomImage;
