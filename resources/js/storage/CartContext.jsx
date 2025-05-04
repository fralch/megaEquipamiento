// Importa las funciones necesarias de React: createContext para crear el contexto,
// useReducer para manejar el estado con un reducer, y useEffect para efectos secundarios (como guardar en localStorage).
import { createContext, useReducer, useEffect } from 'react';

// Crea el Contexto del Carrito. Este objeto permitirá compartir el estado del carrito
// y la función dispatch entre componentes sin pasar props manualmente.
export const CartContext = createContext();

// Define la función reducer. Esta función pura toma el estado actual y una acción,
// y devuelve el nuevo estado basado en el tipo de acción.
const reducer = (state, action) => {
  switch (action.type) {
    // Caso 'ADD': Añade un producto al estado actual.
    // Devuelve un nuevo array con todos los elementos anteriores (...state) más el nuevo producto (action.product).
    case 'ADD':
      return [...state, action.product];
    // Caso 'REMOVE': Filtra el estado para eliminar el producto con el id especificado.
    // Devuelve un nuevo array que excluye el producto cuyo 'id' coincide con 'action.id'.
    case 'REMOVE':
      return state.filter(p => p.id !== action.id);
    // Caso 'CLEAR': Vacía el carrito.
    // Devuelve un array vacío.
    case 'CLEAR':
      return [];
    // Caso por defecto: Si la acción no coincide con ninguna de las anteriores,
    // devuelve el estado sin cambios.
    default:
      return state;
  }
};

// Define el componente Provider del Carrito. Este componente envolverá
// las partes de la aplicación que necesitan acceso al estado del carrito.
export const CartProvider = ({ children }) => {
  // Inicializa el estado del carrito ('cart') y la función para despachar acciones ('dispatch') usando useReducer.
  // El reducer definido arriba manejará las actualizaciones del estado.
  // El estado inicial se establece como un array vacío ([]).
  // La tercera función (lazy initializer) se ejecuta solo una vez al montar el componente:
  // Intenta cargar el carrito guardado desde localStorage. Si existe ('stored'), lo parsea (JSON.parse).
  // Si no existe, devuelve un array vacío.
  const [cart, dispatch] = useReducer(reducer, [], () => { 
    const stored = localStorage.getItem('cart'); // Obtiene el item 'cart' de localStorage
    return stored ? JSON.parse(stored) : []; // Si existe, lo parsea; si no, devuelve []
  });

  // Usa useEffect para ejecutar un efecto secundario cada vez que el estado 'cart' cambie.
  // Este efecto guarda el estado actual del carrito en localStorage.
  // JSON.stringify convierte el array del carrito en una cadena JSON para poder guardarlo.
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]); // El efecto se ejecuta solo si 'cart' ha cambiado desde la última renderización.

  // Retorna el Provider del Contexto.
  // El 'value' prop contiene el estado del carrito ('cart') y la función 'dispatch',
  // haciéndolos disponibles para cualquier componente hijo que consuma este contexto.
  // '{children}' representa los componentes hijos que serán envueltos por este Provider.
  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
