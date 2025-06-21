import React, { createContext, useReducer, useEffect } from 'react';

export const CartContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      // Verificar si el producto ya existe en el carrito
      const existingItemIndex = state.findIndex(item => item.id === action.product.id);
      if (existingItemIndex >= 0) {
        // Si existe, incrementar la cantidad
        return state.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        // Si no existe, agregarlo con cantidad 1
        return [...state, { ...action.product, quantity: 1 }];
      }
    case 'REMOVE':
      return state.filter(p => p.id !== action.id);
    case 'REMOVE_ITEM':
      return state.filter(p => p.id !== action.payload.id);
    case 'UPDATE_QUANTITY':
      return state.map(item => {
        if (item.id === action.payload.id) {
          const newQuantity = (item.quantity || 1) + action.payload.change;
          // No permitir cantidades menores a 1
          if (newQuantity <= 0) {
            return null; // Marcar para eliminación
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item !== null); // Eliminar items marcados como null
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
