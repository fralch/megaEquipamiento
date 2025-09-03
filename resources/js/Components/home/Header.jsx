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

  // --- NUEVO: estado filtro, teclado y ref del dropdown ---
  const [activeFilter, setActiveFilter] = useState("todos"); // 'todos' | 'productos' | 'marcas' | 'categorias' | 'subcategorias'
  const [kbdIndex, setKbdIndex] = useState(-1);
  const resultsRef = useRef(null);
  const fmtPEN = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  });

  // --- Utilidad: resaltar coincidencias ---
  const highlight = (text, term) => {
    if (!term) return text;
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = String(text).split(new RegExp(`(${safe})`, "ig"));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark
          key={i}
          className="px-0.5 rounded bg-yellow-200 dark:bg-yellow-600/40"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // --- Construir lista plana navegable ---
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
        list
          .slice(0, g.key === "productos" ? 8 : 6)
          .forEach((item) => flat.push({ type: "item", groupKey: g.key, kind: g.kind, data: item }));
      }
    });
    return flat;
  };
  const flatItems = buildFlatItems();

  const selectItem = (entry) => {
    if (!entry || entry.type !== "item") return;
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

  useEffect(() => {
    setKbdIndex(-1);
  }, [activeFilter, searchResults]);

  // --- Búsqueda de productos ---
  const searchProducts = async (term) => {
    if (term.trim().length < 2) {
      setSearchResults({
        productos: [],
        marcas: [],
        categorias: [],
        subcategorias: [],
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/productos/buscar",
        { producto: term },
        {
          headers: {
            "X-CSRF-TOKEN":
              document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "",
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
        console.error("La respuesta no tiene el formato esperado:", response.data);
        setSearchResults({
          productos: [],
          marcas: [],
          categorias: [],
          subcategorias: [],
        });
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setSearchResults({
        productos: [],
        marcas: [],
        categorias: [],
        subcategorias: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Navegación
  const handleProductClick = (product) => {
    window.location.href = `/producto/${product.id_producto}`;
    setIsModalOpen(false);
  };
  const handleMarcaClick = (marca) => {
    window.location.href = `/marcas/${marca.id_marca}`;
    setIsModalOpen(false);
  };
  const handleCategoriaClick = (categoria) => {
    window.location.href = `/categorias/${categoria.id_categoria}`;
    setIsModalOpen(false);
  };
  const handleSubcategoriaClick = (subcategoria) => {
    window.location.href = `/subcategoria/${subcategoria.id_subcategoria}`;
    setIsModalOpen(false);
  };

  // Foco input
  const handleFocus = () => {
    if (searchTerm.length >= 2) setShowResults(true);
  };

  // ¿Hay resultados?
  const hasResults = () => {
    if (!searchResults || typeof searchResults !== "object") return false;
    return (
      (searchResults.productos && searchResults.productos.length > 0) ||
      (searchResults.marcas && searchResults.marcas.length > 0) ||
      (searchResults.categorias && searchResults.categorias.length > 0) ||
      (searchResults.subcategorias && searchResults.subcategorias.length > 0)
    );
  };

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setShowResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    return () => document.removeEventListener("keydown", handleEscKey);
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

  return (
    <header
      className={`transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Desktop Header */}
      <div className="hidden lg:flex container mx-auto items-center px-8 py-8 md:px-12 max-w-full">
        {/* Logo */}
        <a href="/" className="mr-auto w-1/5 flex-shrink-0 pr-4 ml-10">
          <img className="w-full object-contain" src="/img/logo2.jpg" alt="EquinLab Logo" />
        </a>

        {/* Input de búsqueda */}
        <div
          className={`flex mx-auto w-full max-w-3xl items-center rounded-md xl:max-w-4xl search-container relative ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <input
            className={`w-full border-l bg-transparent py-2 pl-4 text-sm font-semibold ${
              isDarkMode
                ? "border-gray-600 text-white placeholder-gray-400"
                : "border-gray-300 text-black placeholder-gray-500"
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
          <svg
            className={`ml-auto h-5 px-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            data-icon="search"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"
            ></path>
          </svg>

          {/* Resultados de búsqueda (MEJORADO) */}
          {showResults && (hasResults() || isLoading || searchTerm.length >= 2) && (
            <div
              id="search-results"
              ref={resultsRef}
              role="listbox"
              aria-label="Resultados de búsqueda"
              className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border z-50 max-h-[520px] overflow-hidden backdrop-blur-sm
                ${
                  isDarkMode
                    ? "bg-gray-800/95 border-gray-600 shadow-gray-900/50"
                    : "bg-white/95 border-gray-200 shadow-gray-500/20"
                }`}
            >
              {/* Header con filtros */}
              <div
                className={`px-3 py-2 border-b sticky top-0 z-10 ${
                  isDarkMode ? "bg-gray-800/95 border-gray-700" : "bg-white/95 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Botón scroll izquierda */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('tabs-container');
                      container.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      isDarkMode 
                        ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200" 
                        : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Container de tabs con scroll */}
                  <div 
                    id="tabs-container"
                    className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
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
                              ? isDarkMode
                                ? "text-gray-500 bg-gray-700 cursor-not-allowed"
                                : "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : isActive
                              ? "bg-blue-600 text-white shadow"
                              : isDarkMode
                              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                          ].join(" ")}
                        >
                          {tab.label}
                          {tab.key !== "todos" && <span className="ml-1 opacity-80">({tab.count})</span>}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Botón scroll derecha */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('tabs-container');
                      container.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      isDarkMode 
                        ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200" 
                        : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className="text-xs opacity-80 whitespace-nowrap">
                    Presiona <kbd className="px-1 py-0.5 border rounded">↑</kbd>/<kbd className="px-1 py-0.5 border rounded">↓</kbd> y{" "}
                    <kbd className="px-1 py-0.5 border rounded">Enter</kbd>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="max-h-[460px] overflow-y-auto">
                {isLoading ? (
                  // Skeleton
                  <div className="p-4 space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg animate-pulse ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`} />
                        <div className="flex-1 space-y-2">
                          <div className={`h-3 w-1/3 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`} />
                          <div className={`h-3 w-2/3 rounded ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !hasResults() && searchTerm.length >= 2 ? (
                  // Estado vacío
                  <div className={`p-10 text-center ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    <div className="flex flex-col items-center space-y-4">
                      <svg
                        className={`w-16 h-16 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        No se encontraron resultados
                      </h3>
                      <p className="text-sm max-w-sm">
                        No encontramos coincidencias para{" "}
                        <span className={isDarkMode ? "text-blue-400 font-medium" : "text-blue-600 font-medium"}>“{searchTerm}”</span>.
                      </p>
                      <ul className={isDarkMode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                        <li>• Verifica la ortografía</li>
                        <li>• Usa términos más generales</li>
                        <li>• Prueba con sinónimos</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  // Lista plana
                  <div className="py-2">
                    {flatItems.map((entry, idx) => {
                      if (entry.type === "header") {
                        return (
                          <div
                            key={`h-${entry.groupKey}-${idx}`}
                            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider sticky top-0 ${
                              isDarkMode ? "text-gray-300 bg-gray-800/95" : "text-gray-600 bg-white/95"
                            }`}
                          >
                            {entry.label}
                          </div>
                        );
                      }

                      const { kind, data } = entry;
                      const selectable = flatItems.filter((i) => i.type === "item");
                      const mySelectableIndex = selectable.findIndex((i) => i === entry);
                      const isActive = kbdIndex === mySelectableIndex;

                      const title = data?.nombre || "";
                      const subInfo =
                        kind === "producto"
                          ? [data.sku ? `SKU: ${data.sku}` : null, data.marca?.nombre || null]
                              .filter(Boolean)
                              .join(" • ")
                          : kind === "subcategoria"
                          ? data.categoria_nombre || data.categoria?.nombre
                            ? `en ${data.categoria_nombre || data.categoria?.nombre}`
                            : ""
                          : "";

                      const keyId =
                        data.id_producto ?? data.id_marca ?? data.id_categoria ?? data.id_subcategoria ?? idx;

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
                          {/* Icono / thumbnail */}
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isDarkMode ? "bg-gray-700" : "bg-gray-100"
                            } ${isActive ? "ring-2 ring-blue-500" : ""}`}
                          >
                            {kind === "producto" ? (
                              data.imagen_url ? (
                                <img
                                  src={data.imagen_url}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <svg
                                  className={isDarkMode ? "w-5 h-5 text-gray-400" : "w-5 h-5 text-gray-500"}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                              )
                            ) : kind === "marca" ? (
                              <svg
                                className={isDarkMode ? "w-5 h-5 text-orange-400" : "w-5 h-5 text-orange-600"}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                            ) : kind === "categoria" ? (
                              <svg
                                className={isDarkMode ? "w-5 h-5 text-green-400" : "w-5 h-5 text-green-600"}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                              </svg>
                            ) : (
                              <svg
                                className={isDarkMode ? "w-5 h-5 text-purple-400" : "w-5 h-5 text-purple-600"}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Contenido */}
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-sm font-semibold mb-0.5 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              } group-hover:underline`}
                            >
                              {highlight(title, searchTerm)}
                            </div>

                            {subInfo && (
                              <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {highlight(subInfo, searchTerm)}
                              </div>
                            )}

                            {kind === "producto" && data.precio_igv && (
                              <div className={`mt-1 text-sm font-bold ${isDarkMode ? "text-green-400" : "text-green-700"}`}>
                                {fmtPEN.format(Number(data.precio_igv))}
                              </div>
                            )}
                          </div>

                          {/* Chip del grupo */}
                          <div
                            className={`mt-0.5 text-[10px] px-2 py-1 rounded-full self-start ${
                              isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {entry.groupKey}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              {hasResults() && (
                <div className={`px-3 py-2 border-t text-right ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contacto y redes */}
        <div className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52 pl-4 mr-20" id="contactos">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icon-tabler-phone"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
          </svg>

          <div className="flex flex-col">
            <div className="hidden flex-row items-center gap-4 sm:flex md:w-44 xl:w-52" id="redes-sociales">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/megaequipamiento.equimlab"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg
                  viewBox="0 0 512 512"
                  width={"24px"}
                  height={"24px"}
                  className={`transition-colors duration-200 ${isDarkMode ? "fill-white" : "fill-black"}`}
                >
                  <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/mega-equipamiento-equimlab-s-a-c/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 448 512"
                  width={"26px"}
                  height={"26px"}
                  className={`transition-colors duration-200 ${isDarkMode ? "fill-white" : "fill-black"}`}
                >
                  <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@megaequipamiento.oficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <svg
                  viewBox="0 0 576 512"
                  width={"26px"}
                  height={"26px"}
                  className={`transition-colors duration-200 ${isDarkMode ? "fill-white" : "fill-black"}`}
                >
                  <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
                </svg>
              </a>

              {/* Email */}
              <a
                className="header-correo"
                href="mailto:ventas@megaequipamiento.com"
                target="_blank"
                aria-label="Contactanos por correo"
              >
                <svg
                  viewBox="0 0 512 512"
                  width={"26px"}
                  height={"26px"}
                  className={`transition-colors duration-200 ${isDarkMode ? "fill-white" : "fill-black"}`}
                >
                  <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L322.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Toggle dark mode */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors duration-200 mr-4 ${
            isDarkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        <CartIcon />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <a href="/" className="flex-shrink-0 w-32">
            <img className="w-full object-contain" src="/img/logo2.jpg" alt="EquinLab Logo" />
          </a>

          <div className="flex items-center gap-2">
            {/* Botón de búsqueda */}
            <button
              onClick={openSearchModal}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Buscar productos"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="far"
                data-icon="search"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M508.5 468.9L387.1 347.5c-2.3-2.3-5.3-3.5-8.5-3.5h-13.2c31.5-36.5 50.6-84 50.6-136C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c52 0 99.5-19.1 136-50.6v13.2c0 3.2 1.3 6.2 3.5 8.5l121.4 121.4c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17zM208 368c-88.4 0-160-71.6-160-160S119.6 48 208 48s160 71.6 160 160-71.6 160-160 160z"
                ></path>
              </svg>
            </button>

            {/* Toggle dark mode */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <CartIcon />
          </div>
        </div>
      </div>

      {/* Modal de búsqueda para móviles */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-3 lg:hidden animate-in fade-in duration-200">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSearchModal}></div>

          {/* Contenido */}
          <div
            className={`relative w-full max-w-lg mx-auto mt-8 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            {/* Header modal */}
            <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isDarkMode ? "bg-blue-900/30" : "bg-blue-50"}`}>
                  <svg
                    className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Buscar productos</h3>
              </div>
              <button
                onClick={closeSearchModal}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Input modal */}
            <div className="p-5">
              <div
                className={`relative group ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} rounded-xl border-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 ${
                  isDarkMode ? "border-gray-600 focus-within:border-blue-500" : "border-gray-200 focus-within:border-blue-400"
                }`}
              >
                <input
                  className={`w-full bg-transparent py-4 pl-5 pr-12 text-base font-medium outline-none ${
                    isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"
                  }`}
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
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <div
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } group-focus-within:text-blue-500 transition-colors duration-200`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Resultados en modal (mantiene layout móvil existente) */}
              {showResults && (hasResults() || isLoading) && (
                <div
                  className={`mt-4 rounded-xl border max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
                    isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50/80 border-gray-200"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`animate-spin rounded-full h-5 w-5 border-2 border-t-transparent ${
                            isDarkMode ? "border-blue-400" : "border-blue-500"
                          }`}
                        ></div>
                        <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                          Buscando productos...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Productos */}
                      {searchResults.productos?.length > 0 && (
                        <div>
                          <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Productos ({searchResults.productos.length})
                          </h4>
                          <div className="divide-y divide-gray-200 dark:divide-gray-600">
                            {searchResults.productos.map((product) => (
                              <div
                                key={product.id_producto}
                                className={`p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                  isDarkMode ? "hover:bg-gray-600/50" : "hover:bg-white/80 hover:shadow-sm"
                                }`}
                                onClick={() => handleProductClick(product)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isDarkMode ? "bg-gray-600" : "bg-gray-100"
                                    }`}
                                  >
                                    <svg
                                      className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} w-4 h-4`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                      />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`${isDarkMode ? "text-white" : "text-gray-900"} font-medium text-sm leading-tight mb-1`}>
                                      {highlight(product.nombre, searchTerm)}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      {product.sku && (
                                        <span className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-xs`}>SKU: {product.sku}</span>
                                      )}
                                      {product.marca?.nombre && (
                                        <span className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} text-xs`}>
                                          {highlight(product.marca.nombre, searchTerm)}
                                        </span>
                                      )}
                                    </div>
                                    {product.precio_igv && (
                                      <span className={`${isDarkMode ? "text-green-400" : "text-green-600"} text-sm font-bold`}>
                                        {fmtPEN.format(Number(product.precio_igv))}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Marcas */}
                      {searchResults.marcas?.length > 0 && (
                        <div>
                          <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Marcas ({searchResults.marcas.length})
                          </h4>
                          <div className="divide-y divide-gray-200 dark:divide-gray-600">
                            {searchResults.marcas.map((marca) => (
                              <div
                                key={marca.id_marca}
                                className={`p-3 cursor-pointer transition-all duration-200 ${
                                  isDarkMode ? "hover:bg-gray-600/50" : "hover:bg-white/80 hover:shadow-sm"
                                }`}
                                onClick={() => handleMarcaClick(marca)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isDarkMode ? "bg-orange-900/30" : "bg-orange-50"
                                    }`}
                                  >
                                    <svg
                                      className={`${isDarkMode ? "text-orange-400" : "text-orange-600"} w-4 h-4`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      />
                                    </svg>
                                  </div>
                                  <span className={`${isDarkMode ? "text-white" : "text-gray-900"} font-medium text-sm`}>
                                    {highlight(marca.nombre, searchTerm)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Categorías */}
                      {searchResults.categorias?.length > 0 && (
                        <div>
                          <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Categorías ({searchResults.categorias.length})
                          </h4>
                          <div className="divide-y divide-gray-200 dark:divide-gray-600">
                            {searchResults.categorias.map((categoria) => (
                              <div
                                key={categoria.id_categoria}
                                className={`p-3 cursor-pointer transition-all duration-200 ${
                                  isDarkMode ? "hover:bg-gray-600/50" : "hover:bg-white/80 hover:shadow-sm"
                                }`}
                                onClick={() => handleCategoriaClick(categoria)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isDarkMode ? "bg-green-900/30" : "bg-green-50"
                                    }`}
                                  >
                                    <svg
                                      className={`${isDarkMode ? "text-green-400" : "text-green-600"} w-4 h-4`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                      />
                                    </svg>
                                  </div>
                                  <span className={`${isDarkMode ? "text-white" : "text-gray-900"} font-medium text-sm`}>
                                    {highlight(categoria.nombre, searchTerm)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Subcategorías */}
                      {searchResults.subcategorias?.length > 0 && (
                        <div>
                          <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Subcategorías ({searchResults.subcategorias.length})
                          </h4>
                          <div className="divide-y divide-gray-200 dark:divide-gray-600">
                            {searchResults.subcategorias.map((subcategoria) => (
                              <div
                                key={subcategoria.id_subcategoria}
                                className={`p-3 cursor-pointer transition-all duration-200 ${
                                  isDarkMode ? "hover:bg-gray-600/50" : "hover:bg-white/80 hover:shadow-sm"
                                }`}
                                onClick={() => handleSubcategoriaClick(subcategoria)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isDarkMode ? "bg-purple-900/30" : "bg-purple-50"
                                    }`}
                                  >
                                    <svg
                                      className={`${isDarkMode ? "text-purple-400" : "text-purple-600"} w-4 h-4`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <span className={`${isDarkMode ? "text-white" : "text-gray-900"} font-medium text-sm block`}>
                                      {highlight(subcategoria.nombre, searchTerm)}
                                    </span>
                                    {(subcategoria.categoria_nombre || subcategoria.categoria?.nombre) && (
                                      <span className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-xs`}>
                                        en {highlight(subcategoria.categoria_nombre || subcategoria.categoria?.nombre, searchTerm)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje sin resultados */}
              {showResults && !isLoading && !hasResults() && searchTerm.length >= 2 && (
                <div
                  className={`mt-4 p-6 text-center rounded-xl border-2 border-dashed ${
                    isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      isDarkMode ? "bg-gray-600" : "bg-gray-200"
                    }`}
                  >
                    <svg
                      className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} w-6 h-6`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                      />
                    </svg>
                  </div>
                  <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} text-sm font-medium mb-1`}>
                    No encontramos productos
                  </p>
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-xs`}>Intenta con otros términos de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
