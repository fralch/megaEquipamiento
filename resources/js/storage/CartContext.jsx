import { createContext, useReducer, useEffect } from 'react';

export const CartContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return [...state, action.product];
    case 'REMOVE':
      return state.filter(p => p.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, [], () => { 
    const stored = localStorage.getItem('cart'); // Obtiene el item 'cart' de localStorage
    return stored ? JSON.parse(stored) : []; // Si existe, lo parsea; si no, devuelve []
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]); // El efecto se ejecuta solo si 'cart' ha cambiado desde la última renderización.

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
