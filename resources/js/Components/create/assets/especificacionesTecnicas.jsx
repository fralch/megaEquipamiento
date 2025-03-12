import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";

const EspecificacionesTecnicas = forwardRef(({ form, setForm, tableStyles }, ref) => {
  // Local state for table content
  const [contenidoTabla, setContenidoTabla] = useState({
    secciones: [],
    textoActual: ""
  });

  // Save pending text when component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (contenidoTabla.textoActual?.trim()) {
        saveText();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [contenidoTabla.textoActual]);

  // Initialize with existing value
  useEffect(() => {
    if (!form.especificaciones_tecnicas) return;
    
    try {
      const parsedValue = JSON.parse(form.especificaciones_tecnicas);
      
      if (parsedValue?.secciones && Array.isArray(parsedValue.secciones)) {
        setContenidoTabla(parsedValue);
      } else if (Array.isArray(parsedValue) && parsedValue.length > 0) {
        setContenidoTabla({
          secciones: [{ tipo: 'tabla', datos: parsedValue }],
          textoActual: ""
        });
      } else {
        setContenidoTabla({
          secciones: [{ tipo: 'texto', datos: [form.especificaciones_tecnicas] }],
          textoActual: ""
        });
      }
    } catch (e) {
      setContenidoTabla({
        secciones: [{ tipo: 'texto', datos: [form.especificaciones_tecnicas] }],
        textoActual: ""
      });
    }
  }, [form.especificaciones_tecnicas]);

  // Event handlers
  const handleTablaPaste = (event) => {
    event.preventDefault();
    const textoPegado = event.clipboardData.getData('text');
    processTableContent(textoPegado);
  };
  
  const handleTablaTextChange = (e) => {
    setContenidoTabla(prev => ({
      ...prev,
      textoActual: e.target.value
    }));
  };
  
  // Process and add content to sections
  const processTableContent = (texto) => {
    if (!texto.trim()) return;
    
    const tieneTab = texto.includes('\t');
    const tieneMultilineas = texto.trim().split('\n').length > 1;
    const tipo = tieneTab && tieneMultilineas ? 'tabla' : 'texto';
    
    let nuevaSeccion;
    if (tipo === 'tabla') {
      const filas = texto.trim().split('\n');
      const datosTabla = filas
        .filter(fila => fila.trim() !== '')
        .map(fila => fila.split('\t'));
      
      nuevaSeccion = { tipo: 'tabla', datos: datosTabla };
    } else {
      nuevaSeccion = { tipo: 'texto', datos: [texto] };
    }
    
    updateContent([...contenidoTabla.secciones, nuevaSeccion], "");
  };

  const saveText = () => {
    if (!contenidoTabla.textoActual?.trim()) return;
    
    const nuevaSeccion = { 
      tipo: 'texto', 
      datos: [contenidoTabla.textoActual.trim()] 
    };
    
    updateContent([...contenidoTabla.secciones, nuevaSeccion], "");
  };

  const updateContent = (secciones, textoActual) => {
    const nuevoContenido = { secciones, textoActual };
    
    setContenidoTabla(nuevoContenido);
    setForm(prev => ({ 
      ...prev, 
      especificaciones_tecnicas: JSON.stringify(nuevoContenido) 
    }));
  };

  const limpiarTabla = () => {
    updateContent([], "");
  };

  const eliminarSeccion = (index) => {
    const nuevasSecciones = contenidoTabla.secciones.filter((_, i) => i !== index);
    updateContent(nuevasSecciones, contenidoTabla.textoActual);
  };
  
  // Expose the saveText method to parent component
  useImperativeHandle(ref, () => ({
    saveText
  }));

  // Render components
  const renderTabla = (seccion) => (
    <table style={tableStyles.container} className="border-collapse border border-gray-300">
      <thead>
        <tr>
          {seccion.datos[0].map((celda, idx) => (
            <th key={idx} style={tableStyles.header} className="bg-gray-100">
              {celda}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {seccion.datos.slice(1).map((fila, rowIdx) => (
          <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {fila.map((celda, cellIdx) => (
              <td key={cellIdx} style={tableStyles.cell} className="border border-gray-300">
                {celda}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTexto = (seccion) => (
    <div style={tableStyles.text} className="p-3 bg-gray-50 rounded text-sm">
      <div className="whitespace-pre-wrap">
        {seccion.datos[0]}
      </div>
    </div>
  );

  return (
    <div className="mb-4 col-span-1 md:col-span-2">
      <label className="block text-sm font-medium text-gray-700">
        Especificaciones Técnicas
      </label>
      <div className="mt-1 w-full">
        <div className="mb-2 text-sm text-gray-500">
          Pega una tabla desde Excel, PDF, o de cualquier página web.  
          También puedes ingresar texto simple y combinar múltiples tablas y textos.
        </div>
        
        {/* Input for new content */}
        <div className="mb-2">
          <textarea 
            onPaste={handleTablaPaste}
            onChange={handleTablaTextChange}
            value={contenidoTabla.textoActual}
            placeholder="Pega el contenido aquí (tabla o texto)" 
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            style={{ minHeight: '100px' }}
          />
          
          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={saveText}
              disabled={!contenidoTabla.textoActual?.trim()}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar como texto
            </button>
            
            {contenidoTabla.secciones.length > 0 && (
              <button 
                type="button"
                onClick={limpiarTabla}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
              >
                Limpiar todo
              </button>
            )}
          </div>
        </div>

        {/* Display existing sections */}
        {contenidoTabla.secciones.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Contenido actual:</h3>
            
            {contenidoTabla.secciones.map((seccion, index) => (
              <div key={index} style={tableStyles.seccion} className="mb-6 border-b pb-4 pt-2">
                {/* Section header */}
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Sección {index + 1}: {seccion.tipo === 'tabla' ? 'Tabla' : 'Texto'}
                  </h4>
                  <button 
                    type="button"
                    onClick={() => eliminarSeccion(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
                
                {/* Content based on type */}
                {seccion.tipo === 'tabla' 
                  ? renderTabla(seccion) 
                  : renderTexto(seccion)
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default EspecificacionesTecnicas;