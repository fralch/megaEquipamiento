import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useTheme } from '../../../storage/ThemeContext';

const URL_API = import.meta.env.VITE_API_URL;

const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

const Steps = {
  UPLOAD: 'upload',
  RESOLVE: 'resolve',
  CONFIRM: 'confirm',
  DONE: 'done',
};

const norm = (s) => (s == null ? '' : String(s).trim().toLowerCase().replace(/\s+/g, ' '));
const catEffective = (s) => {
  const n = norm(s);
  return n === '' ? 'sin categoría' : n;
};

const PendingRow = ({ label, value, onCreate, busy, error }) => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-md ${
        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex-1">
        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {label}
        </div>
        {value && (
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{value}</div>
        )}
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onCreate}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px] ${
          busy
            ? 'bg-gray-400 text-white cursor-wait'
            : isDarkMode
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-indigo-500 text-white hover:bg-indigo-600'
        }`}
      >
        {busy ? 'Creando…' : 'Crear'}
      </button>
    </div>
  );
};

const CsvImportWizard = ({ open, onClose, onImported, categorias, subcategorias, marcas }) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(Steps.UPLOAD);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [cacheKey, setCacheKey] = useState(null);
  const [pending, setPending] = useState({
    categorias: [],
    subcategorias: [],
    marcas: [],
  });
  const [newCategorias, setNewCategorias] = useState([]);
  const [newSubcategorias, setNewSubcategorias] = useState([]);
  const [newMarcas, setNewMarcas] = useState([]);
  const allCategorias = [...(categorias || []), ...newCategorias];
  const allSubcategorias = [...(subcategorias || []), ...newSubcategorias];
  const allMarcas = [...(marcas || []), ...newMarcas];
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [overrides, setOverrides] = useState({});
  const inputRef = useRef(null);

  const reset = () => {
    setStep(Steps.UPLOAD);
    setFiles([]);
    setPreview(null);
    setCacheKey(null);
    setPending({ categorias: [], subcategorias: [], marcas: [] });
    setNewCategorias([]);
    setNewSubcategorias([]);
    setNewMarcas([]);
    setBusyKey(null);
    setError(null);
    setInfoMessage(null);
    setImporting(false);
    setResult(null);
    setSelected(new Set());
    setOverrides({});
    if (inputRef.current) inputRef.current.value = '';
  };

  const resetWithInfo = (msg) => {
    reset();
    setInfoMessage(msg);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFile = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const invalid = selected.filter((f) => {
      const name = f.name.toLowerCase();
      return !name.endsWith('.csv') && !name.endsWith('.txt');
    });
    if (invalid.length > 0) {
      setError(
        `Solo se aceptan archivos .csv o .txt. Archivos inválidos: ${invalid.map((f) => f.name).join(', ')}`
      );
      e.target.value = '';
      return;
    }
    setFiles(selected);
    setError(null);
  };

  const upload = async () => {
    if (files.length === 0) return;
    setBusyKey('upload');
    setError(null);
    setInfoMessage(null);
    try {
      const fd = new FormData();
      if (files.length === 1) {
        fd.append('archivo', files[0]);
      } else {
        files.forEach((f) => fd.append('archivo[]', f));
      }
      const { data } = await axios.post(`${URL_API}/admin/products/preview-csv`, fd, {
        headers: { 'X-CSRF-TOKEN': csrf() },
      });
      if (!data.success) {
        setError(data.errors ? Object.values(data.errors).flat().join(' ') : 'Error al parsear el CSV');
        return;
      }
      setPreview(data.data);
      setCacheKey(data.cache_key);
      setPending({
        categorias: data.data.categorias_pendientes || [],
        subcategorias: data.data.subcategorias_pendientes || [],
        marcas: data.data.marcas_pendientes || [],
      });
      const all = new Set((data.data.productos || []).map((p) => p.sku));
      setSelected(all);
      if (
        (data.data.categorias_pendientes || []).length > 0 ||
        (data.data.subcategorias_pendientes || []).length > 0 ||
        (data.data.marcas_pendientes || []).length > 0
      ) {
        setStep(Steps.RESOLVE);
      } else {
        setStep(Steps.CONFIRM);
      }
    } catch (e) {
      const data = e?.response?.data;
      let msg = 'Error al subir el CSV';
      if (data?.errors?.archivo) {
        msg = Array.isArray(data.errors.archivo) ? data.errors.archivo.join(' · ') : data.errors.archivo;
      } else if (data?.message) {
        msg = data.message;
      } else if (e.message) {
        msg = e.message;
      }
      setError(msg);
    } finally {
      setBusyKey(null);
    }
  };

  const updateFromPreview = (previewData, createdEntities = null) => {
    setPreview(previewData);
    setPending({
      categorias: previewData.categorias_pendientes || [],
      subcategorias: previewData.subcategorias_pendientes || [],
      marcas: previewData.marcas_pendientes || [],
    });

    // Reconstruir listas locales de entidades recién resueltas en la BD
    const existingCatIds = new Set((categorias || []).map((c) => c.id_categoria));
    const existingSubIds = new Set((subcategorias || []).map((s) => s.id_subcategoria));
    const existingMarcaIds = new Set((marcas || []).map((m) => m.id_marca));

    const newCats = [];
    const newSubs = [];
    const newMs = [];

    for (const p of previewData.productos || []) {
      if (p.id_categoria && !existingCatIds.has(p.id_categoria)) {
        if (!newCats.find((c) => c.id_categoria === p.id_categoria)) {
          newCats.push({ id_categoria: p.id_categoria, nombre: p.categoria_nombre || '' });
        }
      }
      if (p.id_subcategoria && !existingSubIds.has(p.id_subcategoria)) {
        if (!newSubs.find((s) => s.id_subcategoria === p.id_subcategoria)) {
          newSubs.push({
            id_subcategoria: p.id_subcategoria,
            nombre: p.subcategoria_nombre || '',
            id_categoria: p.id_categoria,
          });
        }
      }
      if (p.marca_id && !existingMarcaIds.has(p.marca_id)) {
        if (!newMs.find((m) => m.id_marca === p.marca_id)) {
          newMs.push({ id_marca: p.marca_id, nombre: p.marca_nombre || '' });
        }
      }
    }

    // Incluir explícitamente entidades creadas en esta acción (por si el
    // preview aún no las refleja o no tienen productos asociados).
    if (createdEntities) {
      if (createdEntities.categoria && !existingCatIds.has(createdEntities.categoria.id_categoria)) {
        if (!newCats.find((c) => c.id_categoria === createdEntities.categoria.id_categoria)) {
          newCats.push(createdEntities.categoria);
        }
      }
      if (createdEntities.subcategoria && !existingSubIds.has(createdEntities.subcategoria.id_subcategoria)) {
        if (!newSubs.find((s) => s.id_subcategoria === createdEntities.subcategoria.id_subcategoria)) {
          newSubs.push(createdEntities.subcategoria);
        }
      }
      if (createdEntities.marca && !existingMarcaIds.has(createdEntities.marca.id_marca)) {
        if (!newMs.find((m) => m.id_marca === createdEntities.marca.id_marca)) {
          newMs.push(createdEntities.marca);
        }
      }
    }

    setNewCategorias(newCats);
    setNewSubcategorias(newSubs);
    setNewMarcas(newMs);
  };

  const refreshPreview = async (createdEntities = null) => {
    if (!cacheKey) return null;
    setBusyKey('refresh');
    setError(null);
    setInfoMessage(null);
    try {
      const { data } = await axios.post(
        `${URL_API}/admin/products/refresh-preview`,
        { cache_key: cacheKey },
        { headers: { 'X-CSRF-TOKEN': csrf() } }
      );
      if (data.success) {
        updateFromPreview(data.data, createdEntities);
        return data.data;
      }
      setError(data.error || 'No se pudo actualizar la vista previa.');
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e.message);
    } finally {
      setBusyKey(null);
    }
    return null;
  };

  const createCategoria = async (idx) => {
    const item = pending.categorias[idx];
    setBusyKey(`cat-${idx}`);
    setError(null);
    setInfoMessage(null);
    try {
      const { data } = await axios.post(
        `${URL_API}/admin/categorias/quick`,
        { nombre: item.nombre },
        { headers: { 'X-CSRF-TOKEN': csrf() } },
      );
      if (data.success) {
        if (data.created) {
          setNewCategorias((prev) => [...prev, data.categoria]);
        }
        setInfoMessage(`Categoría "${item.nombre}" ${data.created ? 'creada' : 'ya existía'}.`);
        await refreshPreview(data.created ? { categoria: data.categoria } : null);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const createMarca = async (idx) => {
    const item = pending.marcas[idx];
    setBusyKey(`marca-${idx}`);
    setError(null);
    setInfoMessage(null);
    try {
      const { data } = await axios.post(
        `${URL_API}/admin/marcas/quick`,
        { nombre: item.nombre },
        { headers: { 'X-CSRF-TOKEN': csrf() } },
      );
      if (data.success) {
        if (data.created) {
          setNewMarcas((prev) => [...prev, data.marca]);
        }
        setInfoMessage(`Marca "${item.nombre}" ${data.created ? 'creada' : 'ya existía'}.`);
        await refreshPreview(data.created ? { marca: data.marca } : null);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const createSubcategoria = async (idx) => {
    const item = pending.subcategorias[idx];
    setBusyKey(`sub-${idx}`);
    setError(null);
    setInfoMessage(null);
    try {
      const idCategoria = allCategorias.find(
        (c) => norm(c.nombre) === catEffective(item.categoria),
      )?.id_categoria;
      if (!idCategoria) {
        setError(`Primero crea la categoría "${item.categoria}".`);
        return;
      }
      const { data } = await axios.post(
        `${URL_API}/admin/subcategorias/quick`,
        { nombre: item.nombre, id_categoria: idCategoria },
        { headers: { 'X-CSRF-TOKEN': csrf() } },
      );
      if (data.success) {
        if (data.created) {
          setNewSubcategorias((prev) => [...prev, data.subcategoria]);
        }
        setInfoMessage(`Subcategoría "${item.nombre}" ${data.created ? 'creada' : 'ya existía'}.`);
        await refreshPreview(data.created ? { subcategoria: data.subcategoria } : null);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const createAllPending = async () => {
    if (!cacheKey) return;
    setBusyKey('create-all');
    setError(null);
    setInfoMessage(null);
    try {
      const { data } = await axios.post(
        `${URL_API}/admin/products/create-pending-dependencies`,
        { cache_key: cacheKey },
        { headers: { 'X-CSRF-TOKEN': csrf() } }
      );
      if (data.success) {
        updateFromPreview(data.data);
        setInfoMessage(data.message || 'Dependencias creadas correctamente.');
        const sinPendientes =
          (data.data.categorias_pendientes || []).length === 0 &&
          (data.data.subcategorias_pendientes || []).length === 0 &&
          (data.data.marcas_pendientes || []).length === 0;
        if (sinPendientes) {
          setStep(Steps.CONFIRM);
        }
      } else {
        setError(data.error || 'Ocurrió un error al crear las dependencias.');
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const goToConfirm = () => {
    if (pending.categorias.length || pending.subcategorias.length || pending.marcas.length) {
      setError('Aún quedan dependencias por crear.');
      return;
    }
    setError(null);
    setStep(Steps.CONFIRM);
  };

  const doImport = async () => {
    setImporting(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${URL_API}/admin/products/import-csv`,
        {
          cache_key: cacheKey,
          skus: Array.from(selected),
          mapping: overrides,
        },
        { headers: { 'X-CSRF-TOKEN': csrf() } },
      );
      setResult(data);
      setStep(Steps.DONE);
      if (onImported) onImported(data);
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e.message);
    } finally {
      setImporting(false);
    }
  };

  const toggleSelected = (sku) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  };

  const setOverride = (sku, field, value) => {
    const normalizedValue = value === '' ? null : value;
    setOverrides((prev) => ({
      ...prev,
      [sku]: { ...(prev[sku] || {}), [field]: normalizedValue },
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50">
      <div
        className={`w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-lg shadow-2xl flex flex-col ${
          isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h2 className="text-lg font-semibold">Importar productos desde CSV</h2>
          <button
            type="button"
            onClick={close}
            className={`text-2xl leading-none px-2 ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 text-red-800 text-sm">{error}</div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm">{infoMessage}</div>
          )}

          {step === Steps.UPLOAD && (
            <div className="space-y-4">
              <p className="text-sm">
                Sube uno o varios archivos CSV con las cabeceras: <code>SKU, Nombre, Precio Base, % Ganancia,
                Video YouTube, Descripción, Attribute 1..6 name/value, Especificaciones Técnicas,
                  Contenido de Envío, Soporte Técnico, Categorías, SubCategorías</code>.
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".csv,.txt,text/csv"
                onChange={handleFile}
                className={`block w-full text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                } file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-indigo-500 file:text-white hover:file:bg-indigo-600`}
              />
              {files.length > 0 && (
                <div className={`text-xs space-y-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {files.map((f, i) => (
                    <div key={i}>📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)</div>
                  ))}
                </div>
              )}
              <button
                type="button"
                disabled={files.length === 0 || busyKey === 'upload'}
                onClick={upload}
                className={`w-full sm:w-auto px-4 py-2 rounded-md font-medium text-white min-h-[44px] ${
                  files.length === 0 || busyKey === 'upload'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {busyKey === 'upload'
                  ? 'Procesando…'
                  : files.length > 1
                  ? `Subir ${files.length} archivos y previsualizar`
                  : 'Subir y previsualizar'}
              </button>
            </div>
          )}

          {step === Steps.RESOLVE && preview && (
            <div className="space-y-6">
              <div className={`p-3 rounded-md text-sm ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <strong>{preview.resumen?.productos ?? 0}</strong> productos detectados
                {preview.archivos_origen?.length > 1 && (
                  <span> en <strong>{preview.archivos_origen.length}</strong> archivos</span>
                )}
                .
                {preview.errores?.length > 0 && (
                  <span className="text-red-500 ml-2">
                    ({preview.errores.length} fila(s) con error)
                  </span>
                )}
              </div>

              {pending.categorias.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Categorías a crear ({pending.categorias.length})</h3>
                  <div className="space-y-2">
                    {pending.categorias.map((c, idx) => (
                      <PendingRow
                        key={`cat-${idx}-${c.nombre}`}
                        label={c.nombre}
                        value={`${c.ocurrencias} producto(s) la necesitan`}
                        busy={busyKey !== null}
                        onCreate={() => createCategoria(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pending.subcategorias.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">
                    Subcategorías a crear ({pending.subcategorias.length})
                  </h3>
                  <div className="space-y-2">
                    {pending.subcategorias.map((s, idx) => (
                      <PendingRow
                        key={`sub-${idx}-${s.nombre}`}
                        label={s.nombre}
                        value={`Categoría: ${s.categoria} · ${s.ocurrencias} producto(s)`}
                        busy={busyKey !== null}
                        onCreate={() => createSubcategoria(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pending.marcas.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Marcas a crear ({pending.marcas.length})</h3>
                  <div className="space-y-2">
                    {pending.marcas.map((m, idx) => (
                      <PendingRow
                        key={`marca-${idx}-${m.nombre}`}
                        label={m.nombre}
                        value={`${m.ocurrencias} producto(s) la necesitan`}
                        busy={busyKey !== null}
                        onCreate={() => createMarca(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pending.categorias.length === 0 &&
                pending.subcategorias.length === 0 &&
                pending.marcas.length === 0 && (
                  <div className="p-3 rounded-md bg-green-100 text-green-800 text-sm">
                    Todas las dependencias resueltas. Puedes continuar.
                  </div>
                )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStep(Steps.UPLOAD)}
                  className={`px-4 py-2 rounded-md text-sm font-medium min-h-[40px] ${
                    isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Volver
                </button>
                {(pending.categorias.length > 0 ||
                  pending.subcategorias.length > 0 ||
                  pending.marcas.length > 0) && (
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={createAllPending}
                    className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 min-h-[40px]"
                  >
                    {busyKey === 'create-all' ? 'Creando todo...' : 'Crear todo'}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyKey !== null}
                  onClick={() => refreshPreview()}
                  className={`px-4 py-2 rounded-md text-sm font-medium min-h-[40px] ${
                    busyKey !== null
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {busyKey === 'refresh' ? 'Actualizando…' : 'Actualizar vista previa'}
                </button>
                <button
                  type="button"
                  disabled={busyKey !== null || pending.categorias.length > 0 || pending.subcategorias.length > 0 || pending.marcas.length > 0}
                  onClick={goToConfirm}
                  className={`px-4 py-2 rounded-md text-white text-sm font-medium min-h-[40px] ${
                    busyKey !== null || pending.categorias.length > 0 || pending.subcategorias.length > 0 || pending.marcas.length > 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  Continuar a previsualización
                </button>
              </div>
            </div>
          )}

          {step === Steps.CONFIRM && preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <strong>{selected.size}</strong> de {preview.productos.length} productos
                  seleccionados.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelected(new Set(preview.productos.map((p) => p.sku)))
                    }
                    className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Ninguno
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className={`min-w-full text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <tr>
                      <th className="px-2 py-1 text-left">SKU</th>
                      <th className="px-2 py-1 text-left">Nombre</th>
                      <th className="px-2 py-1 text-left">Subcategoría</th>
                      <th className="px-2 py-1 text-left">Marca</th>
                      <th className="px-2 py-1 text-right">Precio IGV</th>
                      {preview.archivos_origen?.length > 1 && (
                        <th className="px-2 py-1 text-left">Archivo</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.productos.map((p) => (
                      <tr
                        key={p.sku}
                        className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <td className="px-2 py-1">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selected.has(p.sku)}
                              onChange={() => toggleSelected(p.sku)}
                            />
                            <span className="font-mono">{p.sku}</span>
                          </label>
                        </td>
                        <td className="px-2 py-1 max-w-xs truncate" title={p.nombre}>
                          {p.nombre}
                        </td>
                        <td className="px-2 py-1">
                          <select
                            value={overrides[p.sku]?.id_subcategoria ?? p.id_subcategoria ?? ''}
                            onChange={(e) => setOverride(p.sku, 'id_subcategoria', e.target.value)}
                            className={`w-full text-xs rounded ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            } border px-1 py-0.5`}
                          >
                            <option value="">(sin resolver)</option>
                            {p.id_subcategoria && !allSubcategorias.some((s) => String(s.id_subcategoria) === String(p.id_subcategoria)) && (
                              <option value={p.id_subcategoria}>{p.subcategoria_nombre || 'Subcategoría resuelta'}</option>
                            )}
                            {(allSubcategorias || []).map((s) => (
                              <option key={s.id_subcategoria} value={s.id_subcategoria}>
                                {s.nombre}
                              </option>
                            ))}
                          </select>
                          {p.subcategoria_nombre && (
                            <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              CSV: {p.subcategoria_nombre}
                              {!p.id_subcategoria && (
                                <span className="ml-1 text-red-500 font-medium">(no resuelta)</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1">
                          <select
                            value={overrides[p.sku]?.marca_id ?? p.marca_id ?? ''}
                            onChange={(e) => setOverride(p.sku, 'marca_id', e.target.value)}
                            className={`w-full text-xs rounded ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            } border px-1 py-0.5`}
                          >
                            <option value="">(sin marca)</option>
                            {p.marca_id && !allMarcas.some((m) => String(m.id_marca) === String(p.marca_id)) && (
                              <option value={p.marca_id}>{p.marca_nombre || 'Marca resuelta'}</option>
                            )}
                            {(allMarcas || []).map((m) => (
                              <option key={m.id_marca} value={m.id_marca}>
                                {m.nombre}
                              </option>
                            ))}
                          </select>
                          {p.marca_nombre && (
                            <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              CSV: {p.marca_nombre}
                              {!p.marca_id && (
                                <span className="ml-1 text-red-500 font-medium">(no resuelta)</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1 text-right font-mono">
                          {Number(p.precio_igv).toFixed(2)}
                        </td>
                        {preview.archivos_origen?.length > 1 && (
                          <td className="px-2 py-1">
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full ${
                              isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {p.archivo_origen || '—'}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === Steps.DONE && result && (
            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-md bg-green-100 text-green-900">
                <strong>Importación completada.</strong>
                <div className="mt-2">
                  Insertados: {result.insertados} · Actualizados: {result.actualizados} ·
                  Omitidos: {result.omitidos?.length || 0}
                </div>
              </div>
              {result.omitidos?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Omitidos:</h3>
                  <ul className="list-disc pl-5 text-xs">
                    {result.omitidos.map((o, i) => (
                      <li key={i}>
                        {o.sku}: {o.motivo}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex justify-end gap-2 p-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          {step === Steps.CONFIRM && (
            <>
              <button
                type="button"
                onClick={() => setStep(Steps.RESOLVE)}
                className={`px-4 py-2 rounded-md text-sm font-medium min-h-[40px] ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Volver
              </button>
              <button
                type="button"
                disabled={selected.size === 0 || importing}
                onClick={doImport}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white min-h-[40px] ${
                  selected.size === 0 || importing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {importing ? 'Importando…' : `Importar ${selected.size} producto(s)`}
              </button>
            </>
          )}
          {step === Steps.DONE && (
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 min-h-[40px]"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvImportWizard;
