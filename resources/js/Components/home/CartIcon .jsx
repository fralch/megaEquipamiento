import React, { useState, useContext, useEffect } from 'react'; // Importa useContext
import { useTheme } from '../../storage/ThemeContext';
import { CartContext } from '../../storage/CartContext'; // Importa tu CartContext
import { router } from '@inertiajs/react';

const CartIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, dispatch } = useContext(CartContext); // Accede al estado del carrito y dispatch desde el contexto
  const { isDarkMode } = useTheme(); // Obtiene el estado del tema
  const [total, setTotal] = useState(0); // Creamos un estado para el total
  const [totalItems, setTotalItems] = useState(0); // Creamos un estado para la cantidad total de items


  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleRemoveItem = (itemId) => {
    dispatch({ type: 'REMOVE', id: itemId });
  };

  useEffect(() => {
    setTotal(cart.reduce((acc, item) => acc + item.price, 0));
    setTotalItems(cart.length);
  }, [cart]);

  return (
    <div 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        cursor: 'pointer' 
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div
        style={{
          backgroundColor: '#005dad',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
       <svg   width="24"  height="24"  viewBox="0 0 24 24"  fill="white"  className="icon icon-tabler icons-tabler-filled icon-tabler-shopping-cart"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 2a1 1 0 0 1 .993 .883l.007 .117v1.068l13.071 .935a1 1 0 0 1 .929 1.024l-.01 .114l-1 7a1 1 0 0 1 -.877 .853l-.113 .006h-12v2h10a3 3 0 1 1 -2.995 3.176l-.005 -.176l.005 -.176c.017 -.288 .074 -.564 .166 -.824h-5.342a3 3 0 1 1 -5.824 1.176l-.005 -.176l.005 -.176a3.002 3.002 0 0 1 1.995 -2.654v-12.17h-1a1 1 0 0 1 -.993 -.883l-.007 -.117a1 1 0 0 1 .883 -.993l.117 -.007h2zm0 16a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm11 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2z" /></svg>
      </div>
      <div
        style={{
          backgroundColor: 'red',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: '0',
          right: '-5px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {totalItems} {/* Muestra la cantidad total de items del carrito */}
      </div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '60px',
            width: '350px',
            backgroundColor: isDarkMode ? '#2d3748' : 'white',
            color: isDarkMode ? 'white' : 'black',
            boxShadow: isDarkMode ? '0 2px 5px rgba(0,0,0,0.5)' : '0 2px 5px rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '10px',
            zIndex: 1000,
          }}
        >
          {/* Mapea sobre el 'cart' del contexto */}
          {cart.length === 0 ? (
             <div style={{ padding: '10px', textAlign: 'center', color: isDarkMode ? '#a0aec0' : '#666' }}>Tu carrito está vacío.</div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ padding: '10px', borderBottom: isDarkMode ? '1px solid #4a5568' : '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {/* Cambia item.name a item.title */}
                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                      <span>Cantidad: {item.quantity}x</span>
                      {/* Asegúrate que 'item.price' existe y es un número */}
                      <span>S/ {item.price ? item.price.toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: '10px',
                      flexShrink: 0
                    }}
                    title="Eliminar producto"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
          {/* Muestra el total solo si hay items */}
          {cart.length > 0 && (
            <div style={{ padding: '10px', borderTop: isDarkMode ? '1px solid #4a5568' : '1px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.visit('/carrito');
            }}
            style={{
              backgroundColor: '#005dad',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              width: '100%',
              marginTop: '10px',
              cursor: 'pointer',
              // Deshabilita el botón si el carrito está vacío
              opacity: cart.length === 0 ? 0.5 : 1,
              pointerEvents: cart.length === 0 ? 'none' : 'auto',
            }}
            // Deshabilita el botón si el carrito está vacío
            disabled={cart.length === 0}
          >
            TERMINAR PEDIDO
          </button>
        </div>
      )}
    </div>
  );
};

export default CartIcon;
