import React, { createContext, useReducer, useEffect } from 'react';

export const CompareContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_COMPARE':
      // Verificar si el producto ya existe en la comparación
      const existingItemIndex = state.findIndex(item => item.id === action.product.id);
      if (existingItemIndex >= 0) {
        // Si ya existe, no hacer nada (evitar duplicados)
        return state;
      } else {
        // Limitar a máximo 4 productos para comparar
        if (state.length >= 4) {
          // Remover el primer producto y agregar el nuevo
          return [...state.slice(1), action.product];
        }
        // Si hay espacio, agregar el producto
        return [...state, action.product];
      }
    case 'REMOVE_FROM_COMPARE':
      return state.filter(p => p.id !== action.id);
    case 'CLEAR_COMPARE':
      return [];
    default:
      return state;
  }
};

export const CompareProvider = ({ children }) => {
  const [compareList, dispatch] = useReducer(reducer, [], () => {
    const stored = localStorage.getItem('compareList');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  return (
    <CompareContext.Provider value={{ compareList, dispatch }}>
      {children}
    </CompareContext.Provider>
  );
};