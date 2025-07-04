// Importación de módulos necesarios de React y contextos personalizados
import React, { useContext, useMemo } from 'react';
import { CompareContext } from '../../storage/CompareContext';
import { useTheme } from '../../storage/ThemeContext';

// Características que se excluirán de la comparación
const EXCLUDED_CHARACTERISTICS = ['marca', 'procedencia'];

// Estilos basados en el tema (oscuro o claro)
const THEME_STYLES = {
  modal: {
    dark: 'bg-gray-800',
    light: 'bg-white'
  },
  overlay: 'fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75',
  border: {
    dark: 'border-gray-700',
    light: 'border-gray-200'
  },
  text: {
    primary: {
      dark: 'text-white',
      light: 'text-gray-900'
    },
    secondary: {
      dark: 'text-gray-300',
      light: 'text-gray-700'
    },
    muted: {
      dark: 'text-gray-500',
      light: 'text-gray-500'
    },
    icon: {
      dark: 'text-gray-600',
      light: 'text-gray-400'
    }
  },
  background: {
    table: {
      dark: 'bg-gray-750',
      light: 'bg-gray-50'
    }
  },
  button: {
    close: {
      dark: 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
      light: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }
  }
};

// Función para obtener la clase de estilo basada en el tema actual
const getThemeClass = (styleKey, isDarkMode) => {
  const styleObj = styleKey.split('.').reduce((obj, key) => obj[key], THEME_STYLES);
  return isDarkMode ? styleObj.dark : styleObj.light;
};

// Componente principal del modal de comparación
const CompareModal = ({ isOpen, onClose }) => {
  // Uso de contextos para acceder al estado global
  const { compareList, dispatch } = useContext(CompareContext);
  const { isDarkMode } = useTheme();

  // Función para eliminar un producto de la lista de comparación
  const removeFromCompare = (productId) => {
    dispatch({ type: 'REMOVE_FROM_COMPARE', id: productId });
  };

  // Función para limpiar toda la lista de comparación
  const clearAll = () => {
    dispatch({ type: 'CLEAR_COMPARE' });
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Capa de superposición para el modal */}
        <div
          className={THEME_STYLES.overlay}
          onClick={onClose}
        ></div>
        {/* Contenido del modal */}
        <div className={`inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl ${getThemeClass('modal', isDarkMode)}`}>
          {/* Encabezado del modal */}
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold ${getThemeClass('text.primary', isDarkMode)}`}>
              Comparador de Productos ({compareList.length}/4)
            </h3>
            <div className="flex gap-2">
              {compareList.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Limpiar Todo
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${getThemeClass('button.close', isDarkMode)}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/* Contenido del modal */}
          {compareList.length === 0 ? (
            <div className="text-center py-12">
              <svg className={`mx-auto h-12 w-12 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className={`mt-2 text-lg font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                No hay productos para comparar
              </h3>
              <p className={`mt-1 text-sm ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Agrega productos a la comparación para ver sus características lado a lado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <thead>
                  <tr>
                    <th className={`p-4 text-left border-b font-semibold ${
                      isDarkMode
                        ? 'border-gray-700 text-gray-300 bg-gray-750'
                        : 'border-gray-200 text-gray-700 bg-gray-50'
                    }`}>
                      Característica
                    </th>
                    {compareList.map((product) => (
                      <th key={product.id} className={`p-4 text-center border-b relative ${
                        isDarkMode
                          ? 'border-gray-700 bg-gray-750'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="flex flex-col items-center">
                          {product.imagen && (
                            <img
                              src={product.imagen}
                              alt={product.nombre}
                              className="w-16 h-16 object-cover rounded-lg mb-2"
                            />
                          )}
                          <h4 className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {product.nombre}
                          </h4>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Fila para mostrar precios */}
                  <tr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                    <td className={`p-4 border-b font-medium ${
                      isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
                    }`}>
                      Precio
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className={`p-4 border-b text-center ${
                        isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                      }`}>
                        <span className="text-lg font-bold text-green-600">
                          $ {product.precio}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Componente para mostrar características dinámicas */}
                  <DynamicCharacteristics
                    compareList={compareList}
                    isDarkMode={isDarkMode}
                  />
                  {/* Fila para mostrar marcas */}
                  <tr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                    <td className={`p-4 border-b font-medium ${
                      isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
                    }`}>
                      Marca
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className={`p-4 border-b text-center ${
                        isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                      }`}>
                        {product.marca?.nombre || 'No especificada'}
                      </td>
                    ))}
                  </tr>
                  {/* Componente para mostrar procedencia */}
                  <ProcedenciaRow
                    compareList={compareList}
                    isDarkMode={isDarkMode}
                  />
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar características dinámicas de los productos
const DynamicCharacteristics = ({ compareList, isDarkMode }) => {
  // Memoización para optimizar el rendimiento
  const processedData = useMemo(() => {
    const allCharacteristics = new Set();
    const characteristicsByProduct = {};

    compareList.forEach((product) => {
      characteristicsByProduct[product.id] = {};

      if (product.caracteristicas && typeof product.caracteristicas === 'object') {
        Object.keys(product.caracteristicas).forEach(key => {
          const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
          const cleanValue = typeof product.caracteristicas[key] === 'string'
            ? product.caracteristicas[key].trim()
            : product.caracteristicas[key];
          const cleanOriginalKey = key.trim();

          allCharacteristics.add(normalizedKey);
          characteristicsByProduct[product.id][normalizedKey] = {
            originalKey: cleanOriginalKey,
            value: cleanValue
          };
        });
      }
    });
    const filteredCharacteristics = Array.from(allCharacteristics).filter(
      char => !EXCLUDED_CHARACTERISTICS.includes(char)
    );
    return { filteredCharacteristics, characteristicsByProduct };
  }, [compareList]);

  const { filteredCharacteristics, characteristicsByProduct } = processedData;

  // Si no hay características para mostrar, no renderizar nada
  if (filteredCharacteristics.length === 0) {
    return null;
  }

  return filteredCharacteristics.map(normalizedCharacteristic => {
    let displayName = normalizedCharacteristic;
    for (const productId in characteristicsByProduct) {
      if (characteristicsByProduct[productId][normalizedCharacteristic]) {
        displayName = characteristicsByProduct[productId][normalizedCharacteristic].originalKey;
        break;
      }
    }
    return (
      <tr key={normalizedCharacteristic} className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
        <td className={`p-4 border-b font-medium ${
          isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
        }`}>
          {displayName.charAt(0).toUpperCase() + displayName.slice(1).replace(/_/g, ' ')}
        </td>
        {compareList.map((product) => {
          const productChar = characteristicsByProduct[product.id][normalizedCharacteristic];
          const value = productChar ? productChar.value : 'No especificado';

          return (
            <td key={product.id} className={`p-4 border-b text-center text-sm ${
              isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'
            }`}>
              {value}
            </td>
          );
        })}
      </tr>
    );
  });
};

// Componente para mostrar la fila de procedencia
const ProcedenciaRow = ({ compareList, isDarkMode }) => {
  // Función para obtener la procedencia de un producto
  const getProcedencia = (product) => {
    if (product.procedencia) return product.procedencia;
    if (product.caracteristicas?.procedencia) return product.caracteristicas.procedencia;
    if (product.caracteristicas?.Procedencia) return product.caracteristicas.Procedencia;
    return 'No especificada';
  };

  return (
    <tr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
      <td className={`p-4 border-b font-medium ${
        isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
      }`}>
        Procedencia
      </td>
      {compareList.map((product) => (
        <td key={product.id} className={`p-4 border-b text-center ${
          isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
        }`}>
          {getProcedencia(product)}
        </td>
      ))}
    </tr>
  );
};

// Exportación del componente principal
export default CompareModal;
