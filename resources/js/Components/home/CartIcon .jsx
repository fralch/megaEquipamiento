import React, { useState } from 'react';

const CartIcon = () => {
  const [isOpen, setIsOpen] = useState(false);

  const cartItems = [
    { id: 1, name: 'Cabina de luz PCE-CIC', price: 30520.00, quantity: 1 },
    { id: 2, name: 'Cabina de luz PCE-CIC Mini', price: 6962.00, quantity: 1 }
  ];

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
        3
      </div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '60px',
            width: '350px',
            backgroundColor: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '10px',
            zIndex: 1000,
          }}
        >
          {cartItems.map(item => (
            <div key={item.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: 'bold' }}>{item.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cantidad: {item.quantity}x</span>
                <span>S/ {item.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            style={{
              backgroundColor: '#005dad',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              width: '100%',
              marginTop: '10px',
              cursor: 'pointer',
            }}
          >
            TERMINAR PEDIDO
          </button>
        </div>
      )}
    </div>
  );
};

export default CartIcon;
