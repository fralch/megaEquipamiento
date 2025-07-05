import React, { createContext, useReducer, useEffect, useContext } from 'react';

export const RecentlyViewedContext = createContext();

const MAX_RECENT_ITEMS = 10;

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_RECENTLY_VIEWED':
      const product = action.product;
      
      // Verificar si el producto ya existe en la lista
      const existingIndex = state.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Si existe, moverlo al principio de la lista (actualizar timestamp)
        const updatedList = [...state];
        const [existingProduct] = updatedList.splice(existingIndex, 1);
        return [{ ...existingProduct, viewedAt: Date.now() }, ...updatedList];
      } else {
        // Si no existe, agregarlo al principio
        const newList = [{ ...product, viewedAt: Date.now() }, ...state];
        
        // Si ya tenemos 10 o más productos, eliminar los más antiguos (del final)
        if (newList.length > MAX_RECENT_ITEMS) {
          return newList.slice(0, MAX_RECENT_ITEMS);
        }
        
        return newList;
      }
      
    case 'REMOVE_RECENTLY_VIEWED':
      return state.filter(item => item.id !== action.id);
      
    case 'CLEAR_RECENTLY_VIEWED':
      return [];
      
    case 'LOAD_FROM_STORAGE':
      return action.data || [];
      
    default:
      return state;
  }
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, dispatch] = useReducer(reducer, [], () => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filtrar productos que tienen más de 30 días
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const filtered = parsed.filter(item => 
          item.viewedAt && item.viewedAt > thirtyDaysAgo
        );
        return filtered.slice(0, MAX_RECENT_ITEMS);
      }
      return [];
    } catch (error) {
      console.error('Error loading recently viewed from localStorage:', error);
      return [];
    }
  });

  // Guardar en localStorage cada vez que cambie el estado
  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error('Error saving recently viewed to localStorage:', error);
    }
  }, [recentlyViewed]);

  // Función para agregar un producto a la lista de vistos recientemente
  // Funciona como una cola FIFO: siempre mantiene los 10 productos más recientes
  // Si un producto ya existe, lo mueve al principio
  // Si no existe y ya hay 10 productos, elimina el más antiguo (del final)
  const addRecentlyViewed = (product) => {
    // Validar que el producto tenga los campos requeridos
    if (!product || !product.id) {
      console.warn('Product must have an id to be added to recently viewed');
      return;
    }

    const productToAdd = {
      id: product.id || product.id_producto,
      title: product.title || product.nombre,
      image: product.image || product.imagen,
      price: product.price || product.precio_sin_ganancia,
      priceWithoutProfit: product.priceWithoutProfit || product.precio_sin_ganancia,
      priceWithProfit: product.priceWithProfit || product.precio_ganancia,
      sku: product.sku,
      descripcion: product.descripcion,
      marca: product.marca || { nombre: product.nombre_marca },
      link: product.link || `/producto/${product.id || product.id_producto}`
    };

    dispatch({ type: 'ADD_RECENTLY_VIEWED', product: productToAdd });
  };

  // Función para remover un producto específico
  const removeRecentlyViewed = (productId) => {
    dispatch({ type: 'REMOVE_RECENTLY_VIEWED', id: productId });
  };

  // Función para limpiar toda la lista
  const clearRecentlyViewed = () => {
    dispatch({ type: 'CLEAR_RECENTLY_VIEWED' });
  };

  // Función para obtener productos recientes (útil para componentes)
  const getRecentlyViewed = () => {
    return recentlyViewed;
  };

  // Función para verificar si un producto está en la lista
  const isRecentlyViewed = (productId) => {
    return recentlyViewed.some(item => item.id === productId);
  };

  // Función para obtener productos recientes limitados
  const getRecentlyViewedLimited = (limit = MAX_RECENT_ITEMS) => {
    return recentlyViewed.slice(0, limit);
  };

  const value = {
    recentlyViewed,
    addRecentlyViewed,
    removeRecentlyViewed,
    clearRecentlyViewed,
    getRecentlyViewed,
    isRecentlyViewed,
    getRecentlyViewedLimited,
    dispatch
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

// Hook personalizado para usar el contexto más fácilmente
export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export default RecentlyViewedProvider;