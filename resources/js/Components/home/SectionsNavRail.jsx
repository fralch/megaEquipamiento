import React, { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid, FiX, FiCheck } from "react-icons/fi";
import { useTheme } from "@/storage/ThemeContext";

/**
 * Nav vertical flotante de secciones.
 * - Desktop (lg+): rail de vidrio en el borde izquierdo que se expande al hover.
 * - Mobile: pestaña vertical en el borde izquierdo que abre un panel lateral.
 */

function SectionAvatar({ seccion, activo, isDarkMode }) {
    const [imgError, setImgError] = useState(false);
    const showImage = Boolean(seccion?.imagen) && !imgError;

    return (
        <span
            className={`relative flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden transition-shadow duration-200 ${
                activo ? "ring-2 ring-blue-500" : ""
            }`}
        >
            {showImage ? (
                <img
                    src={seccion.imagen}
                    alt=""
                    loading="lazy"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span
                    className={`flex w-full h-full items-center justify-center text-sm font-bold transition-colors duration-200 ${
                        activo
                            ? "bg-[#1e3a8a] text-white"
                            : isDarkMode
                              ? "bg-gray-700 text-blue-300"
                              : "bg-blue-100 text-[#1e3a8a]"
                    }`}
                    aria-hidden="true"
                >
                    {seccion?.nombre?.charAt(0)?.toUpperCase() || "?"}
                </span>
            )}
        </span>
    );
}

function GridAvatar({ activo, isDarkMode }) {
    return (
        <span
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                activo
                    ? "bg-[#1e3a8a] text-white ring-2 ring-blue-500"
                    : isDarkMode
                      ? "bg-gray-700 text-blue-300"
                      : "bg-blue-100 text-[#1e3a8a]"
            }`}
            aria-hidden="true"
        >
            <FiGrid size={17} />
        </span>
    );
}

const SectionsNavRail = memo(function SectionsNavRail({ secciones, onSelect, selectedId }) {
    const { isDarkMode } = useTheme();
    const [panelOpen, setPanelOpen] = useState(false);

    // Bloquear el scroll del body mientras el panel móvil está abierto
    useEffect(() => {
        if (!panelOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [panelOpen]);

    // Cerrar el panel con Escape
    useEffect(() => {
        if (!panelOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setPanelOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [panelOpen]);

    if (!secciones || secciones.length === 0) return null;

    const isActive = (id) => id === selectedId;
    const hasSelection = selectedId != null;

    const handleSelect = (seccion) => {
        onSelect?.(seccion);
        setPanelOpen(false);
    };

    /* ---------- Desktop: rail flotante expansible ---------- */

    const railItem = (seccion) => {
        const esTodas = seccion === null;
        const activo = esTodas ? !hasSelection : isActive(seccion.id_seccion);
        const nombre = esTodas ? "Todas" : seccion.nombre;

        return (
            <button
                key={esTodas ? "todas" : seccion.id_seccion}
                type="button"
                onClick={() => onSelect?.(seccion)}
                aria-pressed={activo}
                aria-label={nombre}
                title={nombre}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activo
                        ? isDarkMode
                            ? "bg-blue-500/15"
                            : "bg-blue-600/10"
                        : isDarkMode
                          ? "hover:bg-white/10"
                          : "hover:bg-gray-900/5"
                }`}
            >
                {activo && (
                    <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-blue-500"
                        aria-hidden="true"
                    />
                )}

                {esTodas ? (
                    <GridAvatar activo={activo} isDarkMode={isDarkMode} />
                ) : (
                    <SectionAvatar
                        seccion={seccion}
                        activo={activo}
                        isDarkMode={isDarkMode}
                    />
                )}

                <span
                    className={`flex-1 whitespace-nowrap text-sm opacity-0 -translate-x-1 transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0 ${
                        activo
                            ? `font-semibold ${isDarkMode ? "text-blue-300" : "text-[#1e3a8a]"}`
                            : isDarkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                    }`}
                >
                    {nombre}
                </span>
            </button>
        );
    };

    /* ---------- Móvil: fila del panel ---------- */

    const panelItem = (seccion) => {
        const esTodas = seccion === null;
        const activo = esTodas ? !hasSelection : isActive(seccion.id_seccion);
        const nombre = esTodas ? "Todas" : seccion.nombre;

        return (
            <button
                key={esTodas ? "todas" : seccion.id_seccion}
                type="button"
                onClick={() => handleSelect(seccion)}
                aria-pressed={activo}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activo
                        ? isDarkMode
                            ? "bg-blue-500/15"
                            : "bg-blue-600/10"
                        : isDarkMode
                          ? "hover:bg-white/10"
                          : "hover:bg-gray-900/5"
                }`}
            >
                {esTodas ? (
                    <GridAvatar activo={activo} isDarkMode={isDarkMode} />
                ) : (
                    <SectionAvatar
                        seccion={seccion}
                        activo={activo}
                        isDarkMode={isDarkMode}
                    />
                )}

                <span
                    className={`flex-1 text-sm ${
                        activo
                            ? `font-semibold ${isDarkMode ? "text-blue-300" : "text-[#1e3a8a]"}`
                            : isDarkMode
                              ? "text-gray-200"
                              : "text-gray-700"
                    }`}
                >
                    {nombre}
                </span>

                {activo && (
                    <FiCheck
                        size={16}
                        className={isDarkMode ? "text-blue-300" : "text-[#1e3a8a]"}
                        aria-hidden="true"
                    />
                )}
            </button>
        );
    };

    return (
        <>
            {/* ===== Desktop rail (lg+) ===== */}
            <motion.nav
                aria-label="Secciones"
                className="fixed left-4 top-1/2 z-40 hidden lg:block"
                initial={{ x: -100, y: "-50%", opacity: 0 }}
                animate={{ x: 0, y: "-50%", opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.2 }}
            >
                <div
                    className={`group w-[3.75rem] hover:w-64 transition-[width] duration-300 ease-in-out overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl ${
                        isDarkMode
                            ? "bg-gray-900/85 border-gray-700/60 shadow-black/40"
                            : "bg-white/85 border-gray-200/80 shadow-slate-900/10"
                    }`}
                >
                    <div className="w-64 p-2">
                        {/* Cabecera del rail */}
                        <div className="flex items-center gap-3 px-3 pt-1.5 pb-2">
                            <span
                                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                                    isDarkMode
                                        ? "bg-blue-500/20 text-blue-300"
                                        : "bg-[#1e3a8a]/10 text-[#1e3a8a]"
                                }`}
                                aria-hidden="true"
                            >
                                <FiGrid size={17} />
                            </span>
                            <span
                                className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap opacity-0 -translate-x-1 transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0 ${
                                    isDarkMode ? "text-gray-300" : "text-gray-500"
                                }`}
                            >
                                Secciones
                            </span>
                        </div>

                        <div
                            className={`mx-3 mb-1 h-px ${
                                isDarkMode ? "bg-gray-700/70" : "bg-gray-200"
                            }`}
                            aria-hidden="true"
                        />

                        {/* Lista con scroll interno */}
                        <div className="max-h-[min(56vh,26rem)] overflow-y-auto scrollbar-hide flex flex-col gap-0.5 pb-1">
                            {railItem(null)}
                            {secciones.map((seccion) => railItem(seccion))}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* ===== Móvil: pestaña en el borde (menor a lg) ===== */}
            <motion.button
                type="button"
                onClick={() => setPanelOpen(true)}
                aria-label="Abrir menú de secciones"
                className="fixed left-0 top-1/2 z-40 lg:hidden flex flex-col items-center gap-2 rounded-r-2xl bg-gradient-to-b from-blue-600 to-[#1e3a8a] px-2.5 py-4 text-white shadow-lg shadow-blue-900/30 active:scale-95 transition-transform"
                initial={{ x: -60, y: "-50%", opacity: 0 }}
                animate={{ x: 0, y: "-50%", opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.2 }}
            >
                <FiGrid size={16} aria-hidden="true" />
                <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ writingMode: "vertical-rl" }}
                >
                    Secciones
                </span>
                {hasSelection && (
                    <span
                        className="w-2 h-2 rounded-full bg-emerald-400"
                        aria-hidden="true"
                    />
                )}
            </motion.button>

            {/* ===== Móvil: panel lateral ===== */}
            <AnimatePresence>
                {panelOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPanelOpen(false)}
                            aria-hidden="true"
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Secciones"
                            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col shadow-2xl lg:hidden ${
                                isDarkMode ? "bg-gray-900" : "bg-white"
                            }`}
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        >
                            <div
                                className={`flex items-center justify-between px-4 py-4 border-b ${
                                    isDarkMode ? "border-gray-800" : "border-gray-100"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                            isDarkMode
                                                ? "bg-blue-500/20 text-blue-300"
                                                : "bg-[#1e3a8a]/10 text-[#1e3a8a]"
                                        }`}
                                        aria-hidden="true"
                                    >
                                        <FiGrid size={17} />
                                    </span>
                                    <div>
                                        <p
                                            className={`text-sm font-bold ${
                                                isDarkMode ? "text-white" : "text-gray-900"
                                            }`}
                                        >
                                            Secciones
                                        </p>
                                        <p
                                            className={`text-xs ${
                                                isDarkMode ? "text-gray-400" : "text-gray-500"
                                            }`}
                                        >
                                            Explora nuestras líneas
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen(false)}
                                    aria-label="Cerrar menú de secciones"
                                    className={`p-2 rounded-lg transition-colors ${
                                        isDarkMode
                                            ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                    }`}
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 flex flex-col gap-0.5">
                                {panelItem(null)}
                                {secciones.map((seccion) => panelItem(seccion))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
});

export default SectionsNavRail;
