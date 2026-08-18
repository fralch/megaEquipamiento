import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useTheme } from "../../storage/ThemeContext";

const GestionarSecciones = () => {
    const { isDarkMode } = useTheme();

    const [secciones, setSecciones] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOnlyActivos, setShowOnlyActivos] = useState(false);
    const itemsPerPage = 10;

    const [editingSeccion, setEditingSeccion] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const [generalForm, setGeneralForm] = useState({
        nombre: "",
        descripcion: "",
        imagen: "",
        activo: true,
        orden: 0,
    });

    const [categoriaIds, setCategoriaIds] = useState([]);
    const [syncLoading, setSyncLoading] = useState(false);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 3500);
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/admin/secciones");
            setSecciones(res.data.secciones || []);
            setCategorias(res.data.categorias || []);
        } catch (error) {
            console.error("Error al cargar secciones:", error);
            showMessage("error", "Error al cargar las secciones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const seccionNombreById = useMemo(() => {
        const map = {};
        secciones.forEach((s) => {
            map[s.id_seccion] = s.nombre;
        });
        return map;
    }, [secciones]);

    const filteredSecciones = useMemo(() => {
        let list = secciones;
        if (showOnlyActivos) {
            list = list.filter((s) => s.activo);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(
                (s) =>
                    (s.nombre || "").toLowerCase().includes(term) ||
                    (s.slug || "").toLowerCase().includes(term)
            );
        }
        return list;
    }, [secciones, searchTerm, showOnlyActivos]);

    const totalPages = Math.ceil(filteredSecciones.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSecciones = filteredSecciones.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, showOnlyActivos]);

    const openNew = () => {
        setEditingSeccion(null);
        setGeneralForm({
            nombre: "",
            descripcion: "",
            imagen: "",
            activo: true,
            orden: 0,
        });
        setCategoriaIds([]);
        setActiveTab("general");
        setShowModal(true);
    };

    const openEdit = (seccion) => {
        setEditingSeccion(seccion);
        setGeneralForm({
            nombre: seccion.nombre || "",
            descripcion: seccion.descripcion || "",
            imagen: seccion.imagen || "",
            activo: !!seccion.activo,
            orden: seccion.orden ?? 0,
        });
        setCategoriaIds(seccion.categoria_ids || []);
        setActiveTab("general");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSeccion(null);
        setActiveTab("general");
    };

    const handleSubmitGeneral = async (e) => {
        e.preventDefault();
        if (!generalForm.nombre.trim()) {
            showMessage("error", "El nombre de la sección es obligatorio");
            return;
        }
        setLoading(true);
        try {
            if (editingSeccion) {
                await axios.post(
                    `/admin/secciones/${editingSeccion.id_seccion}`,
                    generalForm
                );
                showMessage("success", "Sección actualizada exitosamente");
            } else {
                await axios.post("/admin/secciones", generalForm);
                showMessage("success", "Sección creada exitosamente");
            }
            await fetchAll();
            closeModal();
        } catch (error) {
            console.error("Error:", error);
            showMessage(
                "error",
                error.response?.data?.message || "Error al guardar la sección"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (seccion) => {
        if (
            !confirm(
                `¿Eliminar la sección "${seccion.nombre}"? Sus categorías quedarán sin sección.`
            )
        ) {
            return;
        }
        setLoading(true);
        try {
            await axios.delete(`/admin/secciones/${seccion.id_seccion}`);
            showMessage("success", "Sección eliminada exitosamente");
            await fetchAll();
        } catch (error) {
            console.error("Error:", error);
            showMessage("error", "Error al eliminar la sección");
        } finally {
            setLoading(false);
        }
    };

    const handleSyncCategorias = async () => {
        if (!editingSeccion) return;
        setSyncLoading(true);
        try {
            await axios.post(
                `/admin/secciones/${editingSeccion.id_seccion}/categorias`,
                { categoria_ids: categoriaIds }
            );
            showMessage("success", "Categorías sincronizadas");
            await fetchAll();
        } catch (error) {
            console.error("Error:", error);
            showMessage("error", "Error al sincronizar categorías");
        } finally {
            setSyncLoading(false);
        }
    };

    const toggleCategoria = (id) => {
        setCategoriaIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const inputClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        isDarkMode
            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900"
    }`;

    const labelClass = `block text-sm font-medium mb-2 ${
        isDarkMode ? "text-gray-200" : "text-gray-700"
    }`;

    const cardClass = `p-6 rounded-lg shadow-lg transition-colors duration-300 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
    }`;

    const tabs = [
        { key: "general", label: "General" },
        { key: "categorias", label: "Categorías", requiresEdit: true },
    ];

    return (
        <div className={cardClass}>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Gestión de Secciones
                        </h1>
                        <p
                            className={`text-sm mt-1 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            Las secciones agrupan categorías. Las subcategorías
                            y productos se heredan automáticamente.
                        </p>
                    </div>
                    <button
                        onClick={openNew}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isDarkMode
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-500 hover:bg-blue-600"
                        } text-white`}
                    >
                        + Nueva Sección
                    </button>
                </div>

                {message.text && (
                    <div
                        className={`p-4 rounded-lg mb-4 ${
                            message.type === "success"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-red-100 text-red-700 border border-red-300"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={inputClass}
                    />
                    <label
                        className={`flex items-center gap-2 px-3 ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={showOnlyActivos}
                            onChange={(e) =>
                                setShowOnlyActivos(e.target.checked)
                            }
                        />
                        <span className="text-sm">Solo activos</span>
                    </label>
                </div>
            </div>

            {loading && secciones.length === 0 ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Cargando secciones...</p>
                </div>
            ) : currentSecciones.length > 0 ? (
                <>
                    <div
                        className={`overflow-x-auto rounded-lg border ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                    >
                        <table className="w-full">
                            <thead
                                className={
                                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                                }
                            >
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Orden
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Categorías
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody
                                className={`divide-y ${
                                    isDarkMode
                                        ? "divide-gray-700"
                                        : "divide-gray-200"
                                }`}
                            >
                                {currentSecciones.map((s) => (
                                    <tr
                                        key={s.id_seccion}
                                        className={
                                            isDarkMode
                                                ? "bg-gray-800"
                                                : "bg-white"
                                        }
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {s.nombre}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm opacity-75">
                                            {s.slug}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    s.activo
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {s.activo
                                                    ? "Activo"
                                                    : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {s.orden}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${
                                                    isDarkMode
                                                        ? "bg-purple-900 text-purple-200"
                                                        : "bg-purple-100 text-purple-800"
                                                }`}
                                            >
                                                {(s.categoria_ids || []).length}{" "}
                                                asignadas
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                onClick={() => openEdit(s)}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                    isDarkMode
                                                        ? "bg-yellow-600 hover:bg-yellow-700"
                                                        : "bg-yellow-500 hover:bg-yellow-600"
                                                } text-white`}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(s)
                                                }
                                                disabled={loading}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                    isDarkMode
                                                        ? "bg-red-600 hover:bg-red-700 disabled:bg-red-800"
                                                        : "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
                                                } text-white disabled:cursor-not-allowed`}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center space-x-2">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        currentPage === page
                                            ? isDarkMode
                                                ? "bg-blue-600 text-white"
                                                : "bg-blue-500 text-white"
                                            : isDarkMode
                                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div
                    className={`text-center py-8 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                >
                    <p className="text-gray-500">
                        {searchTerm || showOnlyActivos
                            ? "No hay secciones que coincidan con los filtros"
                            : "No hay secciones creadas aún"}
                    </p>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                        }`}
                    >
                        <div
                            className={`p-6 border-b flex justify-between items-center ${
                                isDarkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                            }`}
                        >
                            <h2 className="text-xl font-bold">
                                {editingSeccion
                                    ? "Editar Sección"
                                    : "Nueva Sección"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className={`p-2 rounded-md ${
                                    isDarkMode
                                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div
                            className={`flex border-b overflow-x-auto ${
                                isDarkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                            }`}
                        >
                            {tabs.map((tab) => {
                                const disabled =
                                    tab.requiresEdit && !editingSeccion;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() =>
                                            !disabled && setActiveTab(tab.key)
                                        }
                                        disabled={disabled}
                                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                                            activeTab === tab.key
                                                ? isDarkMode
                                                    ? "border-b-2 border-blue-400 text-blue-400"
                                                    : "border-b-2 border-blue-500 text-blue-600"
                                                : disabled
                                                ? isDarkMode
                                                    ? "text-gray-600 cursor-not-allowed"
                                                    : "text-gray-400 cursor-not-allowed"
                                                : isDarkMode
                                                ? "text-gray-400 hover:text-gray-200"
                                                : "text-gray-600 hover:text-gray-800"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-6">
                            {activeTab === "general" && (
                                <form
                                    onSubmit={handleSubmitGeneral}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className={labelClass}>
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            value={generalForm.nombre}
                                            onChange={(e) =>
                                                setGeneralForm({
                                                    ...generalForm,
                                                    nombre: e.target.value,
                                                })
                                            }
                                            placeholder="Ej: Destacados, Ofertas, Novedades..."
                                            className={inputClass}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Descripción
                                        </label>
                                        <textarea
                                            value={generalForm.descripcion}
                                            onChange={(e) =>
                                                setGeneralForm({
                                                    ...generalForm,
                                                    descripcion: e.target.value,
                                                })
                                            }
                                            rows="3"
                                            placeholder="Descripción opcional"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            URL de Imagen
                                        </label>
                                        <input
                                            type="text"
                                            value={generalForm.imagen}
                                            onChange={(e) =>
                                                setGeneralForm({
                                                    ...generalForm,
                                                    imagen: e.target.value,
                                                })
                                            }
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            className={inputClass}
                                        />
                                        {generalForm.imagen && (
                                            <img
                                                src={generalForm.imagen}
                                                alt="preview"
                                                className="mt-2 h-20 rounded"
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>
                                                Orden
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={generalForm.orden}
                                                onChange={(e) =>
                                                    setGeneralForm({
                                                        ...generalForm,
                                                        orden:
                                                            parseInt(
                                                                e.target.value
                                                            ) || 0,
                                                    })
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className={`flex items-center gap-2 h-full px-3 ${
                                                    isDarkMode
                                                        ? "text-gray-200"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        generalForm.activo
                                                    }
                                                    onChange={(e) =>
                                                        setGeneralForm({
                                                            ...generalForm,
                                                            activo:
                                                                e.target
                                                                    .checked,
                                                        })
                                                    }
                                                />
                                                <span className="text-sm font-medium">
                                                    Activo
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                                isDarkMode
                                                    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
                                                    : "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
                                            } text-white disabled:cursor-not-allowed`}
                                        >
                                            {loading
                                                ? "Guardando..."
                                                : editingSeccion
                                                ? "Actualizar Sección"
                                                : "Crear Sección"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                                isDarkMode
                                                    ? "bg-gray-600 hover:bg-gray-700"
                                                    : "bg-gray-500 hover:bg-gray-600"
                                            } text-white`}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === "categorias" && editingSeccion && (
                                <div className="space-y-4">
                                    <p
                                        className={`text-sm ${
                                            isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        Las categorías marcadas pasarán a
                                        pertenecer a esta sección (una
                                        categoría solo puede estar en una
                                        sección). Sus subcategorías y productos
                                        se heredan automáticamente.
                                    </p>
                                    <div
                                        className={`max-h-96 overflow-y-auto border rounded-lg p-3 space-y-1 ${
                                            isDarkMode
                                                ? "border-gray-700 bg-gray-900"
                                                : "border-gray-200 bg-gray-50"
                                        }`}
                                    >
                                        {categorias.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                Sin categorías
                                            </p>
                                        ) : (
                                            categorias.map((c) => {
                                                const otraSeccion =
                                                    c.id_seccion &&
                                                    c.id_seccion !==
                                                        editingSeccion.id_seccion
                                                        ? seccionNombreById[
                                                              c.id_seccion
                                                          ]
                                                        : null;
                                                return (
                                                    <label
                                                        key={c.id_categoria}
                                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                                            isDarkMode
                                                                ? "hover:bg-gray-800"
                                                                : "hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={categoriaIds.includes(
                                                                c.id_categoria
                                                            )}
                                                            onChange={() =>
                                                                toggleCategoria(
                                                                    c.id_categoria
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm">
                                                            {c.nombre}
                                                            {otraSeccion && (
                                                                <span
                                                                    className={`ml-1 text-xs ${
                                                                        isDarkMode
                                                                            ? "text-yellow-400"
                                                                            : "text-yellow-600"
                                                                    }`}
                                                                >
                                                                    (en:{" "}
                                                                    {
                                                                        otraSeccion
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                        </span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSyncCategorias}
                                            disabled={syncLoading}
                                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                                isDarkMode
                                                    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
                                                    : "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
                                            } text-white disabled:cursor-not-allowed`}
                                        >
                                            {syncLoading
                                                ? "Sincronizando..."
                                                : `Guardar Categorías (${categoriaIds.length})`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionarSecciones;
