import React, { useState } from 'react';

function TablaPegada() {
  const [contenido, setContenido] = useState({
    tipo: null, // 'tabla' o 'texto'
    datos: []
  });
  
  const detectarTipoContenido = (texto) => {
    // Verifica si hay tabulaciones y múltiples líneas
    const tieneTab = texto.includes('\t');
    const tieneMultilineas = texto.trim().split('\n').length > 1;
    
    return tieneTab && tieneMultilineas ? 'tabla' : 'texto';
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const textoPegado = event.clipboardData.getData('text');
    const tipo = detectarTipoContenido(textoPegado);
    
    if (tipo === 'tabla') {
      const filas = textoPegado.split('\n');
      const datosTabla = filas.map((fila) => fila.split('\t'));
      setContenido({
        tipo: 'tabla',
        datos: datosTabla
      });
    } else {
      setContenido({
        tipo: 'texto',
        datos: [textoPegado]
      });
    }
  };
  
  
  // Estilo CSS para la tabla
  const estiloTabla = {
    border: '1px solid black',
    borderCollapse: 'collapse'
  };
  
  const estiloCelda = {
    border: '1px solid black',
    padding: '5px'
  };

  const estiloTexto = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  };
  
  return (
    <div>
      <textarea 
        onPaste={handlePaste} 
        placeholder="Pega el contenido aquí (tabla o texto)" 
        style={{ width: '100%', height: '100px', marginBottom: '10px' }}
      />
      {contenido.tipo === 'tabla' && contenido.datos.length > 0 && (
        <table style={estiloTabla}>
          <tbody>
            {contenido.datos.map((fila, indexFila) => (
              <tr key={indexFila}>
                {fila.map((celda, indexCelda) => (
                  <td key={indexCelda} style={estiloCelda}>{celda}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {contenido.tipo === 'texto' && contenido.datos.length > 0 && (
        <div style={estiloTexto}>
          {contenido.datos[0]}
        </div>
      )}
    </div>
  );
}

export default TablaPegada;