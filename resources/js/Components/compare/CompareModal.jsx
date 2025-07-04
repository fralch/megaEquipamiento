import React, { useContext } from 'react';
import { CompareContext } from '../../storage/CompareContext';
import { useTheme } from '../../storage/ThemeContext';

const CompareModal = ({ isOpen, onClose }) => {
  const { compareList, dispatch } = useContext(CompareContext);
  const { isDarkMode } = useTheme();

  const removeFromCompare = (productId) => {
    dispatch({ type: 'REMOVE_FROM_COMPARE', id: productId });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_COMPARE' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
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
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
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
                  {/* Precio */}
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

                  {/* Características dinámicas */}
                  {(() => {
                    // DEBUG: Log completo de cada producto
                    console.log('=== DEBUG COMPARE MODAL ===');
                    compareList.forEach((product, index) => {
                      console.log(`🔍 Producto ${index + 1}:`, {
                        id: product.id,
                        nombre: product.nombre,
                        caracteristicas: product.caracteristicas,
                        tipo_caracteristicas: typeof product.caracteristicas,
                        keys_caracteristicas: product.caracteristicas ? Object.keys(product.caracteristicas) : 'No tiene características'
                      });
                    });
                    
                    // Obtener todas las características únicas
                    const allCharacteristics = new Set();
                    const characteristicsByProduct = {};
                    
                    compareList.forEach((product, productIndex) => {
                      characteristicsByProduct[product.id] = {};
                      
                      if (product.caracteristicas && typeof product.caracteristicas === 'object') {
                        Object.keys(product.caracteristicas).forEach(key => {
                          // Normalizar la clave (lowercase, sin espacios al inicio/final, y reemplazar espacios internos con _)
                          const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
                          
                          // Limpiar el valor: convertir a minúsculas y eliminar espacios adelante y atrás
                          const cleanValue = typeof product.caracteristicas[key] === 'string' 
                            ? product.caracteristicas[key].trim().toLowerCase()
                            : product.caracteristicas[key];
                          
                          // Clave original limpia para mostrar (mantener capitalización para display)
                          const cleanOriginalKey = key.trim();
                          
                          console.log(`🧹 Normalizando: "${key}" -> "${normalizedKey}"`);
                          console.log(`🧹 Limpiando valor: "${product.caracteristicas[key]}" -> "${cleanValue}"`);
                          
                          allCharacteristics.add(normalizedKey);
                          characteristicsByProduct[product.id][normalizedKey] = {
                            originalKey: cleanOriginalKey,
                            value: cleanValue
                          };
                        });
                      }
                    });

                    console.log('🎯 Características únicas encontradas:', Array.from(allCharacteristics));
                    console.log('📊 Características por producto:', characteristicsByProduct);

                    // Filtrar características que no deben mostrarse aquí (evitar duplicados)
                    const excludedCharacteristics = ['marca', 'procedencia'];
                    const filteredCharacteristics = Array.from(allCharacteristics).filter(
                      char => !excludedCharacteristics.includes(char)
                    );

                    console.log('✅ Características a mostrar (filtradas):', filteredCharacteristics);

                    // Verificar si hay características para mostrar
                    if (filteredCharacteristics.length === 0) {
                      console.log('⚠️ No hay características dinámicas para mostrar');
                      return null;
                    }

                    return filteredCharacteristics.map(normalizedCharacteristic => {
                      // Obtener el nombre original de la característica del primer producto que la tenga
                      let displayName = normalizedCharacteristic;
                      for (const productId in characteristicsByProduct) {
                        if (characteristicsByProduct[productId][normalizedCharacteristic]) {
                          displayName = characteristicsByProduct[productId][normalizedCharacteristic].originalKey;
                          break;
                        }
                      }

                      console.log(`🏷️ Renderizando característica: ${normalizedCharacteristic} -> ${displayName}`);

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
                            
                            console.log(`  🔍 Product ${product.nombre}: ${normalizedCharacteristic} = "${value}"`);
                            
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
                  })()}

                  {/* Marca */}
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

                  {/* Procedencia */}
                  <tr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                    <td className={`p-4 border-b font-medium ${
                      isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
                    }`}>
                      Procedencia
                    </td>
                    {compareList.map((product) => {
                      // Buscar procedencia en características o como campo directo
                      let procedencia = 'No especificada';
                      if (product.procedencia) {
                        procedencia = product.procedencia;
                      } else if (product.caracteristicas && product.caracteristicas.procedencia) {
                        procedencia = product.caracteristicas.procedencia;
                      } else if (product.caracteristicas && product.caracteristicas.Procedencia) {
                        procedencia = product.caracteristicas.Procedencia;
                      }
                      
                      return (
                        <td key={product.id} className={`p-4 border-b text-center ${
                          isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                        }`}>
                          {procedencia}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;