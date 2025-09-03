import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CartIcon from "./CartIcon";
import { useTheme } from "../../storage/ThemeContext";

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    productos: [],
    marcas: [],
    categorias: [],
    subcategorias: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Filtros y navegación por teclado (desktop)
  const [activeFilter, setActiveFilter] = useState("todos");
  const [kbdIndex, setKbdIndex] = useState(-1);
  const resultsRef = useRef(null); // desktop

  const fmtPEN = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

  // Resalta coincidencias
  const highlight = (text, term) => {
    if (!term) return text;
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = String(text).split(new RegExp(`(${safe})`, "ig"));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="px-0.5 rounded bg-yellow-200 dark:bg-yellow-600/40">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // Construye una lista plana (headers, items y "more")
  const buildFlatItems = () => {
    if (!searchResults || typeof searchResults !== "object") return [];
    const groups = [
      { key: "productos", label: "Productos", kind: "producto" },
      { key: "marcas", label: "Marcas", kind: "marca" },
      { key: "categorias", label: "Categorías", kind: "categoria" },
      { key: "subcategorias", label: "Subcategorías", kind: "subcategoria" },
    ];

    const flat = [];
    groups.forEach((g) => {
      const list = searchResults[g.key] || [];
      if (!list.length) return;

      if (activeFilter === "todos" || activeFilter === g.key) {
        flat.push({ type: "header", groupKey: g.key, label: g.label });

        const limit = activeFilter === "todos" ? (g.key === "productos" ? 8 : 6) : list.length;
        list.slice(0, limit).forEach((item) =>
          flat.push({ type: "item", groupKey: g.key, kind: g.kind, data: item })
        );

        if (activeFilter === "todos" && list.length > limit) {
          flat.push({
            type: "more",
            groupKey: g.key,
            label:
              g.key === "productos"
                ? `Ver todos los ${g.label.toLowerCase()} (${list.length})`
                : `Ver todas las ${g.label.toLowerCase()} (${list.length})`,
          });
        }
      }
    });
    return flat;
  };
  const flatItems = buildFlatItems();

  const selectItem = (entry) => {
    if (!entry) return;
    if (entry.type === "more") {
      setActiveFilter(entry.groupKey);
      requestAnimationFrame(() => resultsRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
      return;
    }
    if (entry.type !== "item") return;
    const { kind, data } = entry;
    if (kind === "producto") return handleProductClick(data);
    if (kind === "marca") return handleMarcaClick(data);
    if (kind === "categoria") return handleCategoriaClick(data);
    if (kind === "subcategoria") return handleSubcategoriaClick(data);
  };

  const handleKeyDown = (e) => {
    if (!showResults) return;
    const selectable = flatItems.filter((i) => i.type === "item");
    if (!selectable.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKbdIndex((prev) => {
        const next = (prev + 1) % selectable.length;
        const node = resultsRef.current?.querySelector(`[data-kbd="${next}"]`);
        if (node) node.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKbdIndex((prev) => {
        const next = (prev - 1 + selectable.length) % selectable.length;
        const node = resultsRef.current?.querySelector(`[data-kbd="${next}"]`);
        if (node) node.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = selectable[Math.max(0, kbdIndex)];
      selectItem(item);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  useEffect(() => setKbdIndex(-1), [activeFilter, searchResults]);

  // Búsqueda
  const searchProducts = async (term) => {
    if (term.trim().length < 2) {
      setSearchResults({ productos: [], marcas: [], categorias: [], subcategorias: [] });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/productos/buscar",
        { producto: term },
        {
          headers: {
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          },
        }
      );
      if (response.data && typeof response.data === "object") {
        setSearchResults({
          productos: response.data.productos || [],
          marcas: response.data.marcas || [],
          categorias: response.data.categorias || [],
          subcategorias: response.data.subcategorias || [],
        });
      } else {
        setSearchResults({ productos: [], marcas: [], categorias: [], subcategorias: [] });
      }
    } catch (e) {
      console.error(e);
      setSearchResults({ productos: [], marcas: [], categorias: [], subcategorias: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => searchProducts(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Navegación
  const handleProductClick = (p) => { window.location.href = `/producto/${p.id_producto}`; setIsModalOpen(false); };
  const handleMarcaClick = (m) => { window.location.href = `/marcas/${m.id_marca}`; setIsModalOpen(false); };
  const handleCategoriaClick = (c) => { window.location.href = `/categorias/${c.id_categoria}`; setIsModalOpen(false); };
  const handleSubcategoriaClick = (s) => { window.location.href = `/subcategoria/${s.id_subcategoria}`; setIsModalOpen(false); };

  const handleFocus = () => { if (searchTerm.length >= 2) setShowResults(true); };

  const hasResults = () =>
    (searchResults.productos?.length || 0) > 0 ||
    (searchResults.marcas?.length || 0) > 0 ||
    (searchResults.categorias?.length || 0) > 0 ||
    (searchResults.subcategorias?.length || 0) > 0;

  // Cerrar resultados al click fuera (desktop)
  useEffect(() => {
    const handleClickOutside = (e) => { if (!e.target.closest(".search-container")) setShowResults(false); };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ESC para modal
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setIsModalOpen(false); };
    if (isModalOpen) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isModalOpen]);

  const openSearchModal = () => {
    setIsModalOpen(true);
    setSearchTerm("");
    setSearchResults({ productos: [], marcas: [], categorias: [], subcategorias: [] });
    setShowResults(false);
    setActiveFilter("todos");
  };
  const closeSearchModal = () => {
    setIsModalOpen(false);
    setSearchTerm("");
    setSearchResults({ productos: [], marcas: [], categorias: [], subcategorias: [] });
    setShowResults(false);
    setActiveFilter("todos");
  };

  // --- Render ---
  return (
    <header className={`transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      {/* Desktop */}
      <div className="hidden lg:flex container mx-auto items-center px-8 py-8 md:px-12 max-w-full">
        <a href="/" className="mr-auto w-1/5 flex-shrink-0 pr-4 ml-10">
          <img className="w-full object-contain" src="/img/logo2.jpg" alt="EquinLab Logo" />
        </a>

        <div className={`flex mx-auto w-full max-w-3xl items-center rounded-md xl:max-w-4xl search-container relative ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
          <input
            className={`w-full border-l bg-transparent py-2 pl-4 text-sm font-semibold ${
              isDarkMode ? "border-gray-600 text-white placeholder-gray-400" : "border-gray-300 text-black placeholder-gray-500"
            }`}
            type="text"
            placeholder="Buscar ..."
            value={searchTerm}
            onChange={(e) => {
              const v = e.target.value;
              setSearchTerm(v);
              setActiveFilter("todos");
              setShowResults(v.length >= 2);
            }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            aria-expanded={showResults}
            aria-controls="search-results"
          />

          {/* Lupa clickable (desktop) */}
          <button
            onClick={() => {
              setActiveFilter("todos");
              setShowResults(searchTerm.trim().length >= 2);
              searchProducts(searchTerm);
            }}
            className={`ml-auto h-5 px-4 ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"}`}
            title="Buscar"
            aria-label="Buscar"
          >
            <svg className="h-5 w-5" viewBox="0 0 512 512" fill="currentColor">
              <path d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"/>
            </svg>
          </button>

          {/* Resultados (desktop) */}
          {showResults && (hasResults() || isLoading || searchTerm.length >= 2) && (
            <div
              id="search-results"
              role="listbox"
              aria-label="Resultados de búsqueda"
              className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border z-50 max-h-[520px] overflow-hidden backdrop-blur-sm ${
                isDarkMode ? "bg-gray-800/95 border-gray-600 shadow-gray-900/50" : "bg-white/95 border-gray-200 shadow-gray-500/20"
              }`}
            >
              {/* Tabs */}
              <div className={`px-3 py-2 border-b sticky top-0 z-10 ${isDarkMode ? "bg-gray-800/95 border-gray-700" : "bg-white/95 border-gray-200"}`}>
                <div className="flex items-center gap-2">
                  <div id="tabs-container" className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1"
                       style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {[
                      { key: "todos", label: "Todos" },
                      { key: "productos", label: "Productos", count: searchResults?.productos?.length || 0 },
                      { key: "marcas", label: "Marcas", count: searchResults?.marcas?.length || 0 },
                      { key: "categorias", label: "Categorías", count: searchResults?.categorias?.length || 0 },
                      { key: "subcategorias", label: "Subcategorías", count: searchResults?.subcategorias?.length || 0 },
                    ].map((tab) => {
                      const isActive = activeFilter === tab.key;
                      const disabled = tab.key !== "todos" && (tab.count || 0) === 0;
                      return (
                        <button
                          key={tab.key}
                          disabled={disabled}
                          onClick={() => setActiveFilter(tab.key)}
                          className={[
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                            disabled
                              ? isDarkMode ? "text-gray-500 bg-gray-700 cursor-not-allowed" : "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : isActive
                              ? "bg-blue-600 text-white shadow"
                              : isDarkMode
                              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                          ].join(" ")}
                        >
                          {tab.label}{tab.key !== "todos" && <span className="ml-1 opacity-80">({tab.count})</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs opacity-80 whitespace-nowrap">
                    ↑/↓ y <kbd className="px-1 py-0.5 border rounded">Enter</kbd>
                  </div>
                </div>
              </div>

              {/* Lista con scroll (desktop) */}
              <div ref={resultsRef} className="max-h-[460px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg animate-pulse ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className={`w-10 h-10 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`} />
                        <div className="flex-1 space-y-2">
                          <div className={`h-3 w-1/3 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`} />
                          <div className={`h-3 w-2/3 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !hasResults() && searchTerm.length >= 2 ? (
                  <div className={`p-10 text-center ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>No se encontraron resultados</div>
                ) : (
                  <div className="py-2">
                    {flatItems.map((entry, idx) => {
                      if (entry.type === "header") {
                        return (
                          <div key={`h-${entry.groupKey}-${idx}`}
                               className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider sticky top-0 ${isDarkMode ? "text-gray-300 bg-gray-800/95" : "text-gray-600 bg-white/95"}`}>
                            {entry.label}
                          </div>
                        );
                      }
                      if (entry.type === "more") {
                        return (
                          <button key={`more-${entry.groupKey}-${idx}`} onClick={() => selectItem(entry)}
                                  className={`w-full text-left px-4 py-3 text-sm font-medium ${isDarkMode ? "text-blue-300 hover:bg-gray-700/70" : "text-blue-700 hover:bg-blue-50/50"}`}>
                            {entry.label}
                          </button>
                        );
                      }

                      const { kind, data } = entry;
                      const selectable = flatItems.filter((i) => i.type === "item");
                      const mySelectableIndex = selectable.findIndex((i) => i === entry);
                      const isActive = kbdIndex === mySelectableIndex;

                      const title = data?.nombre || "";
                      const subInfo =
                        kind === "producto"
                          ? [data.sku ? `SKU: ${data.sku}` : null, data.marca?.nombre || null].filter(Boolean).join(" • ")
                          : kind === "subcategoria"
                          ? data.categoria_nombre || data.categoria?.nombre ? `en ${data.categoria_nombre || data.categoria?.nombre}` : ""
                          : "";

                      const keyId = data.id_producto ?? data.id_marca ?? data.id_categoria ?? data.id_subcategoria ?? idx;

                      return (
                        <div
                          key={`${kind}-${keyId}`}
                          role="option"
                          aria-selected={isActive}
                          data-kbd={mySelectableIndex}
                          onMouseEnter={() => setKbdIndex(mySelectableIndex)}
                          onClick={() => selectItem(entry)}
                          className={[
                            "px-4 py-3 cursor-pointer transition-all group flex items-start gap-3 border-b",
                            isDarkMode ? "border-gray-700 hover:bg-gray-700/70" : "border-gray-100 hover:bg-blue-50/50",
                          ].join(" ")}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} ${isActive ? "ring-2 ring-blue-500" : ""}`}>
                            {kind === "producto" ? (
                              data.imagen_url ? (
                                <img src={data.imagen_url} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                              ) : (
                                <svg className={isDarkMode ? "w-5 h-5 text-gray-400" : "w-5 h-5 text-gray-500"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              )
                            ) : kind === "marca" ? (
                              <svg className={isDarkMode ? "w-5 h-5 text-orange-400" : "w-5 h-5 text-orange-600"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            ) : kind === "categoria" ? (
                              <svg className={isDarkMode ? "w-5 h-5 text-green-400" : "w-5 h-5 text-green-600"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            ) : (
                              <svg className={isDarkMode ? "w-5 h-5 text-purple-400" : "w-5 h-5 text-purple-600"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-semibold mb-0.5 ${isDarkMode ? "text-white" : "text-gray-900"} group-hover:underline`}>
                              {highlight(title, searchTerm)}
                            </div>

                            {subInfo && <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{highlight(subInfo, searchTerm)}</div>}

                            {kind === "producto" && data.precio_igv && (
                              <div className={`mt-1 text-sm font-bold ${isDarkMode ? "text-green-400" : "text-green-700"}`}>
                                {fmtPEN.format(Number(data.precio_igv))}
                              </div>
                            )}
                          </div>

                          <div className={`mt-0.5 text-[10px] px-2 py-1 rounded-full self-start ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                            {entry.groupKey}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contacto + Dark mode + Cart */}
        <div className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52 pl-4 mr-20" id="contactos">
          {/* ... (redes tal como lo tenías) ... */}
        </div>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors duration-200 mr-4 ${isDarkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
          : <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>}
        </button>
        <CartIcon />
      </div>

      {/* Móvil */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <a href="/" className="flex-shrink-0 w-32"><img className="w-full object-contain" src="/img/logo2.jpg" alt="EquinLab Logo" /></a>

          <div className="flex items-center gap-2">
            <button
              onClick={openSearchModal}
              className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              title="Buscar productos"
            >
              <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor"><path d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"/></svg>
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
              : <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>}
            </button>
            <CartIcon />
          </div>
        </div>
      </div>

      {/* Modal de búsqueda (MÓVIL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-3 lg:hidden animate-in fade-in duration-200">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSearchModal}></div>

          {/* Contenido */}
          <div className={`relative w-full max-w-lg mx-auto mt-8 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            {/* Header modal */}
            <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
              <div className="flex items-center space-x-3">
                <div className={`${isDarkMode ? "bg-blue-900/30" : "bg-blue-50"} p-2 rounded-full`}>
                  <svg className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} w-5 h-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Buscar productos</h3>
              </div>
              <button onClick={closeSearchModal} className={`p-2 rounded-full transition-all duration-200 ${isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Input + lupa clickable (móvil) */}
            <div className="p-5 pb-3">
              <div className={`relative group ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} rounded-xl border-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 ${isDarkMode ? "border-gray-600 focus-within:border-blue-500" : "border-gray-200 focus-within:border-blue-400"}`}>
                <input
                  className={`w-full bg-transparent py-4 pl-5 pr-12 text-base font-medium outline-none ${isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
                  type="text"
                  placeholder="¿Qué producto estás buscando?"
                  value={searchTerm}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchTerm(v);
                    setActiveFilter("todos");
                    setShowResults(v.length >= 2);
                  }}
                  onFocus={handleFocus}
                />
                <button
                  onClick={() => {
                    setActiveFilter("todos");
                    setShowResults(searchTerm.trim().length >= 2);
                    searchProducts(searchTerm);
                  }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg ${isDarkMode ? "text-gray-300 hover:text-white hover:bg-gray-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}`}
                  aria-label="Buscar"
                  title="Buscar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </div>

            {/* Tabs con scroll (móvil) */}
            <div className={`px-5 pb-2 sticky top-[64px] z-10 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              <div id="tabs-container-mobile" className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {[
                  { key: "todos", label: "Todos" },
                  { key: "productos", label: "Productos", count: searchResults?.productos?.length || 0 },
                  { key: "marcas", label: "Marcas", count: searchResults?.marcas?.length || 0 },
                  { key: "categorias", label: "Categorías", count: searchResults?.categorias?.length || 0 },
                  { key: "subcategorias", label: "Subcategorías", count: searchResults?.subcategorias?.length || 0 },
                ].map((tab) => {
                  const isActive = activeFilter === tab.key;
                  const disabled = tab.key !== "todos" && (tab.count || 0) === 0;
                  return (
                    <button
                      key={`m-${tab.key}`}
                      disabled={disabled}
                      onClick={() => setActiveFilter(tab.key)}
                      className={[
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0",
                        disabled
                          ? isDarkMode ? "text-gray-500 bg-gray-700" : "text-gray-400 bg-gray-100"
                          : isActive
                          ? "bg-blue-600 text-white"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-700",
                      ].join(" ")}
                    >
                      {tab.label}{tab.key !== "todos" && <span className="ml-1 opacity-80">({tab.count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resultados con scroll (móvil) – reutiliza flatItems + “Ver todas” */}
            {showResults && (hasResults() || isLoading) && (
              <div className={`px-5 pb-5 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className={`rounded-xl border ${isDarkMode ? "bg-gray-700/40 border-gray-600" : "bg-gray-50/80 border-gray-200"} max-h-[65vh] overflow-y-auto`}>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-3">
                        <div className={`animate-spin rounded-full h-5 w-5 border-2 border-t-transparent ${isDarkMode ? "border-blue-400" : "border-blue-500"}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Buscando…</span>
                      </div>
                    </div>
                  ) : !hasResults() && searchTerm.length >= 2 ? (
                    <div className="py-10 text-center text-sm">No encontramos coincidencias.</div>
                  ) : (
                    <div className="py-2">
                      {flatItems.map((entry, idx) => {
                        if (entry.type === "header") {
                          return (
                            <div key={`mh-${entry.groupKey}-${idx}`} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider sticky top-0 ${isDarkMode ? "text-gray-300 bg-gray-700/80" : "text-gray-600 bg-gray-50/90"}`}>
                              {entry.label}
                            </div>
                          );
                        }
                        if (entry.type === "more") {
                          return (
                            <button key={`mmore-${entry.groupKey}-${idx}`} onClick={() => selectItem(entry)}
                                    className={`w-full text-left px-4 py-3 text-sm font-medium ${isDarkMode ? "text-blue-300 hover:bg-gray-600/50" : "text-blue-700 hover:bg-white/80"}`}>
                              {entry.label}
                            </button>
                          );
                        }

                        const { kind, data } = entry;
                        const title = data?.nombre || "";
                        const subInfo =
                          kind === "producto"
                            ? [data.sku ? `SKU: ${data.sku}` : null, data.marca?.nombre || null].filter(Boolean).join(" • ")
                            : kind === "subcategoria"
                            ? data.categoria_nombre || data.categoria?.nombre ? `en ${data.categoria_nombre || data.categoria?.nombre}` : ""
                            : "";

                        const keyId = data.id_producto ?? data.id_marca ?? data.id_categoria ?? data.id_subcategoria ?? idx;

                        return (
                          <div
                            key={`m-${kind}-${keyId}`}
                            onClick={() => selectItem(entry)}
                            className={`px-4 py-3 cursor-pointer transition-all flex items-start gap-3 border-b ${isDarkMode ? "border-gray-600 hover:bg-gray-600/40" : "border-gray-200 hover:bg-white/80"}`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-gray-600" : "bg-gray-100"}`}>
                              {kind === "producto" ? (
                                data.imagen_url ? (
                                  <img src={data.imagen_url} alt="" className="w-9 h-9 rounded-lg object-cover" loading="lazy" />
                                ) : (
                                  <svg className={isDarkMode ? "w-4 h-4 text-gray-300" : "w-4 h-4 text-gray-500"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                )
                              ) : kind === "marca" ? (
                                <svg className={isDarkMode ? "w-4 h-4 text-orange-300" : "w-4 h-4 text-orange-600"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                              ) : kind === "categoria" ? (
                                <svg className={isDarkMode ? "w-4 h-4 text-green-300" : "w-4 h-4 text-green-600"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              ) : (
                                <svg className={isDarkMode ? "w-4 h-4 text-purple-300" : "w-4 h-4 text-purple-600"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{highlight(title, searchTerm)}</div>
                              {subInfo && <div className={`text-[11px] ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{highlight(subInfo, searchTerm)}</div>}
                              {kind === "producto" && data.precio_igv && (
                                <div className={`mt-0.5 text-sm font-bold ${isDarkMode ? "text-green-300" : "text-green-700"}`}>{fmtPEN.format(Number(data.precio_igv))}</div>
                              )}
                            </div>

                            <div className={`mt-0.5 text-[10px] px-2 py-1 rounded-full self-start ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                              {entry.groupKey}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sin resultados (móvil) */}
            {showResults && !isLoading && !hasResults() && searchTerm.length >= 2 && (
              <div className={`px-5 pb-6`}>
                <div className={`p-6 text-center rounded-xl border-2 border-dashed ${isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-300 bg-gray-50"}`}>
                  <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} text-sm font-medium`}>No encontramos productos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
